import { processFrame } from "@/lib/frame-processor";
import { generateGeminiCommentary } from "@/lib/gemini-client";

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
      const { commentary } = await generateGeminiCommentary(encodedImage);
      console.log("Generated commentary:", commentary);
      return {
        timestamp: new Date().toISOString(),
        text: commentary,
      };
    } catch (err) {
      console.error("Error in generateCommentaryWithGemini:", err);
      return {
        timestamp: new Date().toISOString(),
        text: "Error generating commentary with Gemini.",
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
