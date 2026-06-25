import { NextRequest } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { CourseUpdateSchema } from "@/types/course";

async function getCourse(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, slug: true, order: true, moduleId: true },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const course = await getCourse(id);

  if (!course) {
    return Response.json({ error: "Course not found", code: "NOT_FOUND" }, { status: 404 });
  }

  if (!course.published && session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Course not found", code: "NOT_FOUND" }, { status: 404 });
  }

  return Response.json({ data: course });
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
  const parsed = CourseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
    updateData.slug = slugify(data.title);
  }
  if (data.description !== undefined) updateData.description = data.description ?? null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl ?? null;
  if (data.published !== undefined) updateData.published = data.published;

  const course = await prisma.course.update({
    where: { id },
    data: updateData,
  });

  return Response.json({ data: course });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const adminCheck = await requireAdmin(session);
  if (!adminCheck.authorized) {
    return Response.json(
      { error: adminCheck.error, code: adminCheck.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN" },
      { status: adminCheck.status },
    );
  }

  await prisma.course.delete({ where: { id } });

  return Response.json({ data: null }, { status: 200 });
}
