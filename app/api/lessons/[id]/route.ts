import { NextRequest } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LessonUpdateSchema } from "@/types/lesson";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: { select: { id: true, title: true, order: true, courseId: true } },
    },
  });

  if (!lesson) {
    return Response.json({ error: "Lesson not found", code: "NOT_FOUND" }, { status: 404 });
  }

  return Response.json({ data: lesson });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const adminCheck = await requireAdmin(session);
  if (!adminCheck.authorized) {
    return Response.json(
      { error: adminCheck.error, code: adminCheck.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN" },
      { status: adminCheck.status },
    );
  }

  const body = await req.json();
  const parsed = LessonUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.moduleId !== undefined) updateData.moduleId = data.moduleId;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.systemPrompt !== undefined) updateData.systemPrompt = data.systemPrompt;
  if (data.hintSystemPrompt !== undefined)
    updateData.hintSystemPrompt = data.hintSystemPrompt ?? null;
  if (data.taskObjective !== undefined) updateData.taskObjective = data.taskObjective ?? null;

  const lesson = await prisma.lesson.update({
    where: { id },
    data: updateData,
  });

  return Response.json({ data: lesson });
}
