import { NextRequest } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LessonBatchReorderSchema } from "@/types/lesson";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const adminCheck = await requireAdmin(session);
  if (!adminCheck.authorized) {
    return Response.json(
      { error: adminCheck.error, code: adminCheck.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN" },
      { status: adminCheck.status },
    );
  }

  const body = await req.json();
  const parsed = LessonBatchReorderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lessons } = parsed.data;

  const updates = lessons.map((l) =>
    prisma.lesson.update({
      where: { id: l.lessonId },
      data: { order: l.newOrder, moduleId: l.moduleId },
    }),
  );

  await prisma.$transaction(updates);

  return Response.json({ data: { updated: lessons.length } });
}
