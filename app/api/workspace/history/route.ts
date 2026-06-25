import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    return Response.json(
      { error: "lessonId query parameter is required", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  const conversation = await prisma.workspaceConversation.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId,
      },
    },
    select: {
      messages: true,
      lastTokensUsed: true,
    },
  });

  return Response.json({
    data: {
      messages: conversation?.messages ?? [],
      tokenUsage: conversation?.lastTokensUsed ?? 0,
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    return Response.json(
      { error: "lessonId query parameter is required", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

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
      messages: [],
      lastTokensUsed: null,
    },
    update: {
      messages: [],
      lastTokensUsed: null,
    },
  });

  return Response.json({ data: { cleared: true } });
}
