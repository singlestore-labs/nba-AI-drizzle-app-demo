"use server";

import { db } from "@/db";
import { commentaryTable } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";

export type AnalyticsData = {
  latestCommentaries: { commentary: string; timestamp: Date }[];
  totalCommentaries: number;
  latestLatency: { timestamp: Date; latency: number }[];
  commentariesOverTime: { date: Date; count: number }[];
  scoresOverTime: {
    gameTime: string | null;
    warriorsScore: number;
    cavaliersScore: number;
  }[];
  warriorsProbabilityOverTime: {
    gameTime: string | null;
    warriorsWinProbability: number;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsData | { error: string }>
) {
  if (req.method === "GET") {
    try {
      console.log("Fetching analytics data from SingleStore...");

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

      res.status(StatusCodes.OK).json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Error fetching analytics data" });
    }
  } else {
    res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .json({ error: "Method not allowed" });
  }
}
