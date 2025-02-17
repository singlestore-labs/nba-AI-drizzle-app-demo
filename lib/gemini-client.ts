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

    const textPart = `You are a sports commentator for ESPN. You are tasked with commenting on several moments from the 2016 NBA Finals Game 7 between the Golden State Warriors and the Cleveland Cavaliers. You'll be presented with an image from the game, and you should generate a commentary based on the game score and the time remaining in the 4th quarter.
  
  The game score is in a box to the right of ESPN. The teams' abbreviations are CLE for the Cavaliers and GS for the Warriors, and each team's score is shown on the right side of the abbreviation. The game clock is on the right side of the game score, next to the 4th Quarter indicator. If the scoreboard is not visible in the image, assume the game score to be the last known score.
  
  Make the comments as engaging and exciting as possible and don't repeat the same commentary for different moments. And also make them brief and to the point.
  
  Write a commentary for the frame moment based on the game score and the time remaining in the 4th quarter.
  
  Also, provide the warriors score, cavaliers score, warriors win probability, the game clock, and the latency of the commentary.
  
  The output should be a JSON object with the following fields:
  - commentary (string): The generated commentary text
  - warriorsScore (int): The Golden State Warriors' score at that moment
  - cavaliersScore (int): The Cleveland Cavaliers' score at that moment
  - warriorsWinProbability (int): The Golden State Warriors' win probability at that moment. This should take into account the current score and time remaining in the game
  - gameClock (string): The game time remaining at that moment
`;

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
