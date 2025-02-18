"use server";

import { db } from "@/db";
import { commentaryTable } from "@/db/schema";
import { GEMINI_API_KEY } from "@/lib/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = geminiClient.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" },
});

type CommentaryResponse = {
  commentary: string;
  latency: number | null;
  warriorsWinProbability: number | null;
  warriorsScore: number | null;
  cavaliersScore: number | null;
  gameClock: string | null;
};

export async function generateGeminiCommentary(
  encodedImage: string,
  mimeType: string = "image/jpeg"
): Promise<CommentaryResponse> {
  try {
    const startTime = Date.now();

    // Write your prompt here
    const textPart;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: encodedImage,
      },
    };

    const result = await model.generateContent([textPart, imagePart]);

    const endTime = Date.now();
    const latency = endTime - startTime;

    const response = result.response.text();

    if (response) {
      try {
        console.log("Response from Gemini:", response);
        const parsedContent: CommentaryResponse = JSON.parse(response);

        const commentary =
          parsedContent.commentary || "No commentary generated.";
        const latencyValue = latency;
        const winProbability = parsedContent.warriorsWinProbability ?? 0;
        const warriorsScore = parsedContent.warriorsScore ?? 0;
        const cavaliersScore = parsedContent.cavaliersScore ?? 0;
        const gameClock = parsedContent.gameClock || null;

        // Insert data into SingleStore (or your database)
        const timestamp = new Date();

        await db.insert(commentaryTable).values({
          // Make sure 'db' and 'commentaryTable' are defined
          commentary,
          latency: latencyValue, // Use the correct variable name
          warriors_win_probability: winProbability,
          warriors_score: warriorsScore,
          cavaliers_score: cavaliersScore,
          game_clock: gameClock,
          timestamp,
        });

        return {
          commentary,
          latency: latencyValue, // Return the correct variable
          warriorsWinProbability: winProbability,
          warriorsScore,
          cavaliersScore,
          gameClock,
        };
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        return {
          commentary: "Error parsing JSON response",
          latency: null,
          warriorsWinProbability: null,
          warriorsScore: null,
          cavaliersScore: null,
          gameClock: null,
        };
      }
    } else {
      console.error("No text generated or invalid response:", result.response);
      return {
        commentary: "No response from Gemini",
        latency: null,
        warriorsWinProbability: null,
        warriorsScore: null,
        cavaliersScore: null,
        gameClock: null,
      };
    }
  } catch (error) {
    console.error("Error generating text:", error);
    return {
      commentary: "Error in Gemini call",
      latency: null,
      warriorsWinProbability: null,
      warriorsScore: null,
      cavaliersScore: null,
      gameClock: null,
    };
  }
}
