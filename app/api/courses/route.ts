import { NextRequest } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { CourseCreateSchema } from "@/types/course";

export async function GET(req: NextRequest) {
  void req;
  const session = await auth();

  const isAdmin = session?.user?.role === "ADMIN";

  const where = isAdmin ? {} : { published: true };

  const courses = await prisma.course.findMany({
    where,
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, slug: true, order: true },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ data: courses });
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
  const parsed = CourseCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  let slug = slugify(data.title);

  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const course = await prisma.course.create({
    data: {
      title: data.title,
      slug,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      published: data.published,
    },
  });

  return Response.json({ data: course }, { status: 201 });
}
