"use server";

import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

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
      const commentariesOverTime;

      // Fetch the last 10 commentary entries
      const latestCommentaries;

      // Fetch the latest 10 latency entries
      const latestLatency;

      // Calculate total commentaries
      const totalCommentaries;

      // Fetch scores over time
      const scoresOverTime;

      // Fetch win probability over time
      const warriorsProbabilityOverTime;

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
