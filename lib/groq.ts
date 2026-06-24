import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY!,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return cachedClient;
}
