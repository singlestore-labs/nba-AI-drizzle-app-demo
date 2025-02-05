"use server";

import { generateCommentary } from "@/lib/commentary-generator";
import type { NextApiRequest, NextApiResponse } from "next";

export type CommentaryRequestBody = {
  imageData: string;
  width: number;
  height: number;
};

interface Commentary {
  text: string;
  errorMessage?: string;
}

interface ErrorResponse {
  text: string;
  error: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Commentary | ErrorResponse | { error: string }>
) {
  console.log("Commentary API handler called");

  if (req.method === "POST") {
    try {
      const body: CommentaryRequestBody = req.body;

      const { imageData, width, height } = body;

      if (!imageData) {
        throw new Error("No image data provided");
      }

      console.log("Generating commentary...");
      const commentary: Commentary = await generateCommentary(
        imageData,
        width,
        height
      );
      console.log("Commentary generated:", commentary);

      if (commentary.errorMessage) {
        throw new Error(commentary.errorMessage);
      }

      res.status(200).json(commentary);
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("Error in generating commentary:", error);
      res.status(500).json({
        text: `Error generating commentary: ${errorMessage}`,
        error: true,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
