import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgressBar } from "@/components/courses/ProgressBar";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const userId = session.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
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
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  if (enrollments.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-display-sm text-forge-text">Welcome to LearnForge</h1>
          <p className="mt-2 text-body-m text-forge-muted">
            You aren&apos;t enrolled in any courses yet. Browse the catalog to get started.
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-md bg-forge-violet px-5 py-2.5 text-body-m font-medium text-white hover:bg-forge-violet-hover transition-colors"
        >
          Browse Courses →
        </Link>
      </div>
    );
  }

  const progressMap = new Map<
    string,
    { completed: number; total: number; inProgressLessonId?: string }
  >();

  for (const enrollment of enrollments) {
    const lessonIds = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const total = lessonIds.length;

    const progressRecords = await prisma.lessonProgress.findMany({
      where: { userId, lessonId: { in: lessonIds } },
      select: { lessonId: true, status: true },
    });

    const completed = progressRecords.filter((p) => p.status === "COMPLETE").length;

    const inProgress = progressRecords.find((p) => p.status === "IN_PROGRESS");

    progressMap.set(enrollment.course.id, {
      completed,
      total,
      inProgressLessonId: inProgress?.lessonId,
    });
  }

  const firstInProgressEnrollment = enrollments.find((enr) => {
    const p = progressMap.get(enr.course.id);
    return p && p.inProgressLessonId;
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-display-sm text-forge-text">Dashboard</h1>
        <p className="mt-1 text-body-m text-forge-muted">
          Welcome back, {session.user.name ?? "Learner"}
        </p>
      </div>

      {firstInProgressEnrollment &&
        (() => {
          const course = firstInProgressEnrollment.course;
          const progress = progressMap.get(course.id)!;

          const allLessons = course.modules.flatMap((m) =>
            m.lessons.map((l) => ({
              ...l,
              moduleTitle: m.title,
              moduleOrder: m.order,
            })),
          );

          const inProgressIndex = allLessons.findIndex((l) => l.id === progress.inProgressLessonId);

          const inProgressLesson =
            inProgressIndex >= 0 ? allLessons[inProgressIndex] : allLessons[0];

          if (!inProgressLesson) return null;

          return (
            <section className="space-y-4">
              <h2 className="font-display text-display-xs text-forge-text">Continue Learning</h2>
              <Link
                href={`/learn/${course.slug}/${inProgressLesson.slug}`}
                className="group block overflow-hidden rounded-xl border border-forge-border bg-forge-surface transition-all hover:border-forge-violet-dim hover:shadow-[0_0_0_1px_var(--forge-violet-dim)]"
              >
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <div className="text-label text-forge-violet uppercase tracking-wider">
                      {course.title}
                    </div>
                    <h3 className="font-display text-display-xs text-forge-text">
                      {inProgressLesson.title}
                    </h3>
                    <p className="text-body-s text-forge-muted">
                      {inProgressLesson.moduleTitle} · Lesson {inProgressLesson.order} of{" "}
                      {allLessons.length}
                    </p>
                  </div>
                  <ProgressBar completed={progress.completed} total={progress.total} />
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 rounded-md bg-forge-violet px-5 py-2.5 text-body-m font-medium text-white transition-colors hover:bg-forge-violet-hover">
                      Continue →
                    </span>
                  </div>
                </div>
              </Link>
            </section>
          );
        })()}

      <section className="space-y-4">
        <h2 className="font-display text-display-xs text-forge-text">Your Courses</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            const progress = progressMap.get(course.id)!;
            const lessonCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            const moduleCount = course.modules.length;

            const firstLesson = course.modules
              .flatMap((m) => m.lessons)
              .sort((a, b) => a.order - b.order)[0];

            return (
              <Link
                key={course.id}
                href={
                  progress?.inProgressLessonId
                    ? `/learn/${course.slug}/${course.modules.flatMap((m) => m.lessons).find((l) => l.id === progress!.inProgressLessonId)?.slug ?? firstLesson?.slug}`
                    : `/learn/${course.slug}/${firstLesson?.slug}`
                }
                className="group block overflow-hidden rounded-xl border border-forge-border bg-forge-surface transition-all hover:border-forge-violet-dim hover:shadow-[0_0_0_1px_var(--forge-violet-dim)]"
              >
                <div className="aspect-video w-full bg-forge-void flex items-center justify-center">
                  {course.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-display-xs text-forge-muted select-none">
                      {course.title.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-display text-display-xs text-forge-text leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-body-s text-forge-muted line-clamp-2">
                    {course.description ?? "No description"}
                  </p>
                  <div className="text-label text-forge-muted">
                    {moduleCount} module{moduleCount !== 1 ? "s" : ""} · {lessonCount} lesson
                    {lessonCount !== 1 ? "s" : ""}
                  </div>
                  {progress && (
                    <ProgressBar completed={progress.completed} total={progress.total} />
                  )}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-forge-violet px-4 py-2 text-body-s font-medium text-white transition-colors hover:bg-forge-violet-hover">
                      {progress && progress.completed === progress.total
                        ? "Review →"
                        : "Continue →"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="pt-4">
        <Link
          href="/courses"
          className="text-body-m text-forge-violet hover:text-forge-violet-hover transition-colors"
        >
          Browse all courses →
        </Link>
      </div>
    </div>
  );
}
