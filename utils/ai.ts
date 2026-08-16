
import { GoogleGenAI } from "@google/genai";

export const getAIKey = (): string => {
  const storedKey = localStorage.getItem('GEMINI_API_KEY');
  if (storedKey) return storedKey;
  
  return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
};

export const createAIInstance = () => {
  const apiKey = getAIKey();
  if (!apiKey) {
    throw new Error("Neural Link Offline: No API Key detected. Please configure in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};
