"use server";

import { db } from "@/db";
import { commentaryTable } from "@/db/schema";
import { GROQ_API_KEY } from "@/lib/config";
import { generateEmbeddingOpenAI } from "@/lib/utils";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

type CommentaryResponse = {
  commentary: string;
  embedding: number[] | null;
  warriorsWinProbability: number | null;
  warriorsScore: number | null;
  cavaliersScore: number | null;
  gameClock: string | null;
  latency: number | null;
};

export const generateCommentaryWithGroq = async (
  encodedImage: string
): Promise<CommentaryResponse> => {
  try {
    console.log(
      "Preparing request to Groq API with encoded image of length:",
      encodedImage.length
    );

    const result = await db
      .select({
        prevWarriorsScore: commentaryTable.warriors_score,
        prevCavaliersScore: commentaryTable.cavaliers_score,
        prevGameClock: commentaryTable.game_clock,
      })
      .from(commentaryTable)
      .orderBy(commentaryTable.timestamp)
      .limit(1);

    const prevWarriorsScore = result[0]?.prevWarriorsScore ?? 0;
    const prevCavaliersScore = result[0]?.prevCavaliersScore ?? 0;
    const prevGameClock = result[0]?.prevGameClock ?? "12:00";

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You'll be presented with an image from the 2016 NBA Finals Game 7 between the Golden State Warriors and the Cleveland Cavaliers. The game score is in a box to the right of ESPN.
              The teams abreviations are CLE for the Cavaliers and GS for the Warriors and each team's score is shown on the right side of the abbreviation. The game clock is on the right side of the game score, next to the 4th Quarter indicator.

              With the game score and the remaining time in the 4th quarter that you extracted from the image, you'll generate a spectator-style comment for that moment in the game. The commentary should take into account the game score, the time remaining and the play-by-play of the game, that will be provided later.

              Sometimes, the scoreboard will not be visible in the image. In that case, you should retrieve a generic commentary and admit that the game score is CLE ${prevWarriorsScore} - ${prevCavaliersScore} GS with ${prevGameClock} remaining in the 4th quarter.
              
              The output should be a json object with the following fields:
              - commentary (string): The generated commentary text
              - warriorsScore (int): The Golden State Warriors' score at that moment
              - cavaliersScore (int): The Cleveland Cavaliers' score at that moment
              - gameClock (string): The game time remaining at that moment
              `,
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
      model: "llama-3.2-90b-vision-preview",
      max_tokens: 256,
      temperature: 0,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Received null or undefined content from Groq API");
    }
    const parsedContent = JSON.parse(content);
    console.log("Received response from Groq API:", parsedContent);

    const commentary = parsedContent.commentary || "No commentary generated.";
    const winProbability = parsedContent.win_probability_gs ?? 50; // Default fallback
    const warriorsScore = parsedContent.warriorsScore ?? 0; // Default fallback
    const cavaliersScore = parsedContent.cavaliersScore ?? 0; // Default fallback
    const latency = chatCompletion.usage?.completion_time || 0; // Default fallback
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
      latency,
      win_probability: winProbability,
      warriors_score: warriorsScore,
      cavaliers_score: cavaliersScore,
      game_clock: gameClock,
      timestamp,
    });

    return {
      commentary,
      embedding,
      warriorsWinProbability: winProbability,
      warriorsScore,
      cavaliersScore,
      gameClock,
      latency,
    };
  } catch (error) {
    console.error("Error generating commentary with Groq API:", error);

    return {
      commentary: "Error generating commentary",
      embedding: null,
      warriorsWinProbability: null,
      warriorsScore: null,
      cavaliersScore: null,
      gameClock: null,
      latency: null,
    };
  }
};
