import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLLMClient, getDefaultModel } from "@/lib/llm";
import { chatRequestSchema } from "@/types/workspace";
import { createSSEStream, createSSEResponse, sendSSEFrame, sendSSEDone } from "@/lib/stream";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid request body",
        code: "VALIDATION_ERROR",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { lessonId, messages, model } = parsed.data;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, systemPrompt: true, taskObjective: true },
  });

  if (!lesson) {
    return Response.json({ error: "Lesson not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const systemContent = [
    lesson.systemPrompt,
    lesson.taskObjective ? `\n\nTask: ${lesson.taskObjective}` : "",
  ]
    .join("")
    .trim();

  const client = getLLMClient();
  const selectedModel = model ?? getDefaultModel();

  const stream = createSSEStream(async (controller, encoder) => {
    try {
      const response = await client.chat.completions.create({
        model: selectedModel,
        messages: [{ role: "system", content: systemContent }, ...messages],
        stream: true,
        max_tokens: 1024,
      });

      let fullContent = "";
      let totalTokens = 0;

      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) {
          fullContent += delta;
          sendSSEFrame(controller, encoder, { delta });
        }
        if (chunk.usage) {
          totalTokens = chunk.usage.total_tokens ?? 0;
        }
      }

      const updatedMessages = [...messages, { role: "assistant" as const, content: fullContent }];

      await prisma.workspaceConversation.upsert({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId,
          },
        },
        create: {
          userId: session.user.id,
          lessonId,
          messages: updatedMessages,
          lastTokensUsed: totalTokens,
        },
        update: {
          messages: updatedMessages,
          lastTokensUsed: totalTokens,
        },
      });

      sendSSEDone(controller, encoder);
      controller.close();
    } catch {
      sendSSEFrame(controller, encoder, {
        error: "LLM request failed. Please try again.",
      });
      controller.close();
    }
  });

  return createSSEResponse(stream);
}
