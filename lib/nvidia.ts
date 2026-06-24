import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function getNvidiaNimClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY!,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });
  }
  return cachedClient;
}
