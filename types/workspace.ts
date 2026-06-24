import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  lessonId: z.string().min(1),
  messages: z.array(chatMessageSchema).min(1),
  model: z.string().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
