import { geminiClient } from "@/lib/gemini-client";
import { openAIClient } from "@/lib/openAI-client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const selectedModel = "text-embedding-004";

export const generateEmbeddingGemini = async (text: string) => {
  const model = geminiClient.getGenerativeModel({ model: selectedModel });
  const result = await model.embedContent(text);
  return result.embedding.values;
};

export const generateEmbeddingOpenAI = async (text: string) => {
  const response = await openAIClient.embeddings.create({
    model: "text-embedding-ada-002", // Use the latest embedding model
    input: text,
  });

  return response.data[0].embedding; // Returns an array of numbers
};
