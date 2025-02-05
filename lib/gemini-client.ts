"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/lib/config";

export const geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
