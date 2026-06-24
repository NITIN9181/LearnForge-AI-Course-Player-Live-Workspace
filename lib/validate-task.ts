import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const validationSchema = z.object({
  achieved: z.boolean().describe("Whether the learner completed the task objective"),
  feedback: z
    .string()
    .describe("Specific, constructive feedback on what they did or didn't achieve"),
  confidence: z.number().min(0).max(1).describe("Confidence in this assessment"),
});

export type TaskValidationResult = z.infer<typeof validationSchema>;

export async function validateTaskCompletion({
  taskObjective,
  lastUserMessage,
  conversationSummary,
}: {
  taskObjective: string;
  lastUserMessage: string;
  conversationSummary: string;
}): Promise<TaskValidationResult> {
  const parser = StructuredOutputParser.fromZodSchema(validationSchema);

  const llm = new ChatOpenAI({
    apiKey: process.env.NVIDIA_API_KEY!,
    configuration: { baseURL: "https://integrate.api.nvidia.com/v1" },
    modelName: "meta/llama-3.1-8b-instruct",
    temperature: 0,
  });

  const prompt = `
You are evaluating whether a learner has completed a task objective.

Task Objective: ${taskObjective}

Conversation summary: ${conversationSummary}

Learner's most recent message: ${lastUserMessage}

${parser.getFormatInstructions()}
  `.trim();

  const response = await llm.invoke(prompt);
  return parser.parse(response.content as string);
}
