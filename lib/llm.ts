import { getNvidiaNimClient } from "@/lib/nvidia";
import { getGroqClient } from "@/lib/groq";
import OpenAI from "openai";

export function getLLMClient(): OpenAI {
  if (process.env.NVIDIA_API_KEY) return getNvidiaNimClient();
  if (process.env.GROQ_API_KEY) return getGroqClient();
  throw new Error("No LLM API key configured. Set NVIDIA_API_KEY or GROQ_API_KEY.");
}

export function getDefaultModel(): string {
  if (process.env.NVIDIA_API_KEY) return "meta/llama-3.1-70b-instruct";
  if (process.env.GROQ_API_KEY) return "llama3-70b-8192";
  return "meta/llama-3.1-70b-instruct";
}

export function getFastModel(): string {
  if (process.env.NVIDIA_API_KEY) return "meta/llama-3.1-8b-instruct";
  if (process.env.GROQ_API_KEY) return "llama3-70b-8192";
  return "meta/llama-3.1-8b-instruct";
}
