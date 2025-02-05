"use server";

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

if (!GROQ_API_KEY) {
  console.error("GROQ_API_KEY is not set in config.");
  throw new Error("GROQ_API_KEY is not set in config.");
}

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in config.");
  throw new Error("GEMINI_API_KEY is not set in config.");
}

if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in config.");
  throw new Error("OPENAI_API_KEY is not set in config.");
}

console.log("GROQ_API_KEY in config:", GROQ_API_KEY ? "Set" : "Not set");
console.log("GEMINI_API_KEY in config:", GEMINI_API_KEY ? "Set" : "Not set");
console.log("OPENAI_API_KEY in config:", OPENAI_API_KEY ? "Set" : "Not set");

export { GROQ_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY };
