import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgressStatus } from "@prisma/client";

async function doEnroll(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, slug: true, order: true },
          },
        },
      },
    },
  });

  if (!course || !course.published) return null;

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) return course;

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.create({
      data: { userId, courseId },
    });

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

    if (lessonIds.length > 0) {
      await tx.lessonProgress.createMany({
        data: lessonIds.map((lessonId) => ({
          userId,
          lessonId,
          status: ProgressStatus.NOT_STARTED,
        })),
        skipDuplicates: true,
      });
    }
  });

  return course;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    redirect("/login?redirect=" + encodeURIComponent(req.nextUrl.pathname));
  }

  const { id: courseId } = await params;
  const course = await doEnroll(session.user.id, courseId);

  if (!course) {
    return Response.json({ error: "Course not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const allLessons = course.modules.flatMap((m) => m.lessons) as Array<{
    id: string;
    slug: string;
    order: number;
  }>;
  const firstLesson = allLessons.sort((a, b) => a.order - b.order)[0];

  if (firstLesson) {
    redirect(`/learn/${course.slug}/${firstLesson.slug}`);
  }

  redirect(`/dashboard`);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id: courseId } = await params;
  const course = await doEnroll(session.user.id, courseId);

  if (!course) {
    return Response.json({ error: "Course not found", code: "NOT_FOUND" }, { status: 404 });
  }

  return Response.json({ data: { courseId, userId: session.user.id } }, { status: 201 });
}
