"use server";

import { db } from "@/db";
import { commentaryTable } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

export type AnalyticsData = {
  latestCommentaries: { commentary: string; timestamp: Date }[];
  totalCommentaries: number;
  latestLatency: { timestamp: Date; latency: number }[];
  commentariesOverTime: { date: Date; count: number }[];
  scoresOverTime: {
    gameTime: string;
    warriorsScore: number;
    cavaliersScore: number;
  }[];
  warriorsProbabilityOverTime: {
    gameTime: string;
    warriorsWinProbability: number;
  }[];
};

type AnalyticsQuery = {
  timeRange: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsData | { error: string }>
) {
  if (req.method === "GET") {
    try {
      const { timeRange } = req.query as AnalyticsQuery;

      //const commentaryTableClient = await initializeDatabase();
      console.log("Fetching analytics data from SingleStore...");

      const now = Date.now();
      let timeDiff = 0;
      switch (timeRange) {
        case "30s":
          // typescript version of DATE_SUB(NOW(), INTERVAL 30 SECOND)
          timeDiff = 30000;
          break;
        case "1min":
          timeDiff = 60000;
          break;
        case "5min":
          timeDiff = 300000;
          break;
        case "10min":
          timeDiff = 600000;
          break;
        default:
          timeDiff = 0;
      }

      const timeFilter = new Date(now - timeDiff);

      // Fetch commentaries over time
      const commentariesOverTime = await db
        .select({
          date: commentaryTable.timestamp,
          count: db.$count(commentaryTable),
        })
        .from(commentaryTable)
        .groupBy(commentaryTable.timestamp)
        .orderBy(asc(commentaryTable.timestamp));

      // Fetch the last 10 commentary entries
      const latestCommentaries = await db
        .select({
          commentary: commentaryTable.commentary,
          timestamp: commentaryTable.timestamp,
        })
        .from(commentaryTable)
        .orderBy(asc(commentaryTable.timestamp))
        .limit(5);

      // Fetch the latest 10 latency entries
      const latestLatency = await db
        .select({
          timestamp: commentaryTable.timestamp,
          latency: commentaryTable.latency ?? 0,
        })
        .from(commentaryTable)
        .orderBy(asc(commentaryTable.timestamp))
        .limit(10);

      // Calculate total commentaries
      const totalCommentaries = await db
        .select({
          total: db.$count(commentaryTable),
        })
        .from(commentaryTable);

      // Fetch scores over time
      const scoresOverTime = await db
        .select({
          gameTime: commentaryTable.game_clock,
          warriorsScore: commentaryTable.warriors_score,
          cavaliersScore: commentaryTable.cavaliers_score,
        })
        .from(commentaryTable)
        .orderBy(asc(commentaryTable.timestamp));

      // Fetch win probability over time
      const warriorsProbabilityOverTime = await db
        .select({
          gameTime: commentaryTable.game_clock,
          warriorsWinProbability: commentaryTable.warriors_win_probability,
        })
        .from(commentaryTable)
        .orderBy(asc(commentaryTable.timestamp));

      const analyticsData: AnalyticsData = {
        latestCommentaries,
        totalCommentaries: totalCommentaries[0]?.total || 0,
        latestLatency,
        commentariesOverTime,
        scoresOverTime,
        warriorsProbabilityOverTime,
      };

      res.status(200).json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ error: "Error fetching analytics data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
