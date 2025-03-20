"use server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in config.");
  throw new Error("GEMINI_API_KEY is not set in config.");
}

console.log("GEMINI_API_KEY in config:", GEMINI_API_KEY ? "Set" : "Not set");

export { GEMINI_API_KEY };
