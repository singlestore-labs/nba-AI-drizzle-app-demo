"use server";

import { db } from "@/db";
import { commentaryTable } from "@/db/schema";
import { OPENAI_API_KEY } from "@/lib/config";
import { generateEmbeddingOpenAI } from "@/lib/utils";
import OpenAI from "openai";

export const openAIClient = new OpenAI({ apiKey: OPENAI_API_KEY });

type CommentaryResponse = {
  commentary: string;
  embedding: number[] | null;
  latency: number | null;
  warriorsWinProbability: number | null;
  warriorsScore: number | null;
  cavaliersScore: number | null;
  gameClock: string | null;
};

export const generateCommentaryWithOpenAI = async (
  encodedImage: string
): Promise<CommentaryResponse> => {
  try {
    console.log(
      "Preparing request to OpenAI API with encoded image of length:",
      encodedImage.length
    );

    const chatCompletion = await openAIClient.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      max_completion_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "You are a sports commentator for ESPN. You are tasked with commenting on several moments from the 2016 NBA Finals Game 7 between the Golden State Warriors and the Cleveland Cavaliers. You'll be presented with an image from the game, and you should generate a commentary based on the game score and the time remaining in the 4th quarter.",
        },
        {
          role: "system",
          content:
            "The game score is in a box to the right of ESPN. The teams' abbreviations are CLE for the Cavaliers and GS for the Warriors, and each team's score is shown on the right side of the abbreviation. The game clock is on the right side of the game score, next to the 4th Quarter indicator. If the scoreboard is not visible in the image, assume the game score to be the last known score.",
        },
        {
          role: "system",
          content:
            "Make the comments as engaging and exciting as possible and don't repeat the same commentary for different moments. And also make them brief and to the point.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Write a commentary for the frame moment based on the game score and the time remaining in the 4th quarter.

              Also, provide the warriors score, cavaliers score, warriors win probability, the game clock, and the latency of the commentary.
              
              The output should be a JSON object with the following fields:
              - commentary (string): The generated commentary text
              - latency (int): The time taken to generate the commentary in milliseconds
              - warriorsScore (int): The Golden State Warriors' score at that moment
              - cavaliersScore (int): The Cleveland Cavaliers' score at that moment
              - warriorsWinProbability (int): The Golden State Warriors' win probability at that moment. This should take into account the current score and time remaining in the game
              - gameClock (string): The game time remaining at that moment`,
            },
            {
              type: "image_url",
              image_url: {
                url: `${encodedImage}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Received null or undefined content from OpenAI API");
    }
    const parsedContent = JSON.parse(content);
    console.log("Received response from OpenAI API:", parsedContent);

    const commentary = parsedContent.commentary || "No commentary generated.";
    const latency = parsedContent.latency ?? 0;
    const winProbability = parsedContent.warriorsWinProbability ?? 0;
    const warriorsScore = parsedContent.warriorsScore ?? 0;
    const cavaliersScore = parsedContent.cavaliersScore ?? 0;
    const gameClock = parsedContent.gameClock || null;

    // Generate embedding
    const embedding = await generateEmbeddingOpenAI(commentary);
    console.log(
      "Generated embedding:",
      embedding
        ? "Embedding generated successfully"
        : "Failed to generate embedding"
    );

    // Insert data into SingleStore
    const timestamp = new Date();

    await db.insert(commentaryTable).values({
      commentary,
      embedding: embedding,
      latency: latency,
      warriors_win_probability: winProbability,
      warriors_score: warriorsScore,
      cavaliers_score: cavaliersScore,
      game_clock: gameClock,
      timestamp,
    });

    return {
      commentary,
      embedding,
      latency,
      warriorsWinProbability: winProbability,
      warriorsScore,
      cavaliersScore,
      gameClock,
    };
  } catch (error) {
    console.error("Error generating commentary with OpenAI API:", error);

    return {
      commentary: "Error generating commentary",
      embedding: null,
      latency: null,
      warriorsWinProbability: null,
      warriorsScore: null,
      cavaliersScore: null,
      gameClock: null,
    };
  }
};
