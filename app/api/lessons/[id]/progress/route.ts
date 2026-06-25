import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const progressSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETE"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { status } = parsed.data;

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
      status,
      completedAt: status === "COMPLETE" ? new Date() : null,
    },
    update: {
      status,
      completedAt: status === "COMPLETE" ? new Date() : null,
    },
  });

  return Response.json({ data: progress });
}
