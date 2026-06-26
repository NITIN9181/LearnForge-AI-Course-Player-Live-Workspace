import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CourseCard } from "@/components/courses/CourseCard";
import type { CourseCardCourse } from "@/components/courses/CourseCard";

export default async function CoursesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
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
    }),
    userId
      ? prisma.enrollment.findMany({
          where: { userId },
          select: { courseId: true },
        })
      : [],
  ]);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  async function getCourseWithProgress(
    course: (typeof courses)[number],
  ): Promise<CourseCardCourse> {
    if (!userId) {
      return { ...course, enrollments: [], progress: undefined };
    }

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

    const progressRecords =
      lessonIds.length > 0
        ? await prisma.lessonProgress.findMany({
            where: { userId, lessonId: { in: lessonIds } },
            select: { status: true },
          })
        : [];

    const completed = progressRecords.filter((p) => p.status === "COMPLETE").length;

    return {
      ...course,
      enrollments: [],
      progress: { completed, total: lessonIds.length },
    };
  }

  const enrichedCourses = await Promise.all(courses.map(getCourseWithProgress));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-sm text-forge-text">Course Catalog</h1>
        <p className="mt-1 text-body-m text-forge-muted">Explore our courses and start learning.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {enrichedCourses.map((course) => {
          const isEnrolled = enrolledCourseIds.has(course.id);

          const allLessons = course.modules.flatMap((m) => m.lessons) as Array<{
            id: string;
            title: string;
            slug: string;
            order: number;
          }>;
          const firstLesson = allLessons[0];

          return (
            <CourseCard
              key={course.id}
              course={course}
              enrolled={isEnrolled}
              href={
                isEnrolled && firstLesson
                  ? `/learn/${course.slug}/${firstLesson.slug}`
                  : `/api/courses/${course.id}/enroll`
              }
            />
          );
        })}

        {enrichedCourses.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="text-body-m text-forge-muted">No courses available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
