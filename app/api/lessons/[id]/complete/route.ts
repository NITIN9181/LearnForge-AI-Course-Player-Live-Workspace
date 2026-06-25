import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) {
    return Response.json({ error: "Lesson not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: id,
      },
    },
    create: {
      userId: session.user.id,
      lessonId: id,
      status: "COMPLETE",
      completedAt: new Date(),
    },
    update: {
      status: "COMPLETE",
      completedAt: new Date(),
    },
  });

  return Response.json({
    data: {
      progress,
      lessonTitle: lesson.title,
    },
  });
}
