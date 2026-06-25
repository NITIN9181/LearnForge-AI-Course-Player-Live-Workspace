import { NextRequest } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { LessonCreateSchema } from "@/types/lesson";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");

  const where = moduleId ? { moduleId } : {};

  const lessons = await prisma.lesson.findMany({
    where,
    orderBy: { order: "asc" },
    include: {
      module: { select: { id: true, title: true, order: true } },
    },
  });

  return Response.json({ data: lessons });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const adminCheck = await requireAdmin(session);
  if (!adminCheck.authorized) {
    return Response.json(
      { error: adminCheck.error, code: adminCheck.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN" },
      { status: adminCheck.status },
    );
  }

  const body = await req.json();
  const parsed = LessonCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  let slug = data.slug ?? slugify(data.title);

  const existing = await prisma.lesson.findUnique({
    where: { moduleId_slug: { moduleId: data.moduleId, slug } },
  });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const lesson = await prisma.lesson.create({
    data: {
      title: data.title,
      slug,
      order: data.order,
      moduleId: data.moduleId,
      content: data.content,
      systemPrompt: data.systemPrompt,
      hintSystemPrompt: data.hintSystemPrompt ?? null,
      taskObjective: data.taskObjective ?? null,
    },
  });

  return Response.json({ data: lesson }, { status: 201 });
}
