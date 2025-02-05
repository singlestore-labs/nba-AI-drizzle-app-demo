import { processFrame } from "@/lib/frame-processor";
import { generateCommentaryWithOpenAI } from "@/lib/openAI-client";

export async function generateCommentary(
  imageData: string,
  width: number,
  height: number
) {
  try {
    console.log("Generating commentary for frame:", width, "x", height);
    console.log("Image data type:", typeof imageData);
    console.log("Image data length:", imageData ? imageData.length : "N/A");

    if (!imageData) {
      throw new Error("No image data provided");
    }

    const { encodedImage } = await processFrame(imageData, width, height);
    console.log("Encoded image length:", encodedImage.length);

    try {
      const { commentary, embedding } = await generateCommentaryWithOpenAI(
        encodedImage
      );
      console.log("Generated commentary:", commentary);
      console.log("Generated embedding:", embedding);
      return {
        timestamp: new Date().toISOString(),
        text: commentary,
        embedding: embedding,
      };
    } catch (groqError) {
      console.error("Error in generateCommentaryWithGroq:", groqError);
      return {
        timestamp: new Date().toISOString(),
        text: "Error generating commentary with Groq API.",
        embedding: null,
      };
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("Error in generateCommentary:", error);
    return {
      timestamp: new Date().toISOString(),
      text: "Error processing frame or generating commentary.",
      embedding: null,
      errorMessage,
    };
  }
}
