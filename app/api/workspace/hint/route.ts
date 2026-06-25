import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLLMClient, getDefaultModel } from "@/lib/llm";
import { z } from "zod";

const hintRequestSchema = z.object({
  lessonId: z.string().min(1),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    }),
  ),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = hintRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lessonId, messages } = parsed.data;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      systemPrompt: true,
      hintSystemPrompt: true,
      taskObjective: true,
    },
  });

  if (!lesson) {
    return Response.json({ error: "Lesson not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const hintPrompt = lesson.hintSystemPrompt ?? lesson.systemPrompt;
  const systemContent = [
    hintPrompt,
    lesson.taskObjective ? `\n\nThe learner is working on: ${lesson.taskObjective}` : "",
  ]
    .join("")
    .trim();

  const client = getLLMClient();

  try {
    const response = await client.chat.completions.create({
      model: getDefaultModel(),
      messages: [{ role: "system", content: systemContent }, ...messages],
      max_tokens: 512,
    });

    const hintContent = response.choices[0]?.message?.content ?? "";

    if (!hintContent) {
      return Response.json(
        { error: "Hint generation returned empty response", code: "INTERNAL_ERROR" },
        { status: 500 },
      );
    }

    const updatedMessages = [...messages, { role: "assistant" as const, content: hintContent }];

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
      },
      update: {
        messages: updatedMessages,
      },
    });

    return Response.json({ data: { message: hintContent } });
  } catch {
    return Response.json({ error: "Hint request failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
