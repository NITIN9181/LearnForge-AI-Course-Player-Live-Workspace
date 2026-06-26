import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SplitPane } from "@/components/player/SplitPane";
import { LessonContent } from "@/components/player/LessonContent";
import { AiWorkspace } from "@/components/player/AiWorkspace";

export default async function LessonPage({
  params,
}: {
  params: { courseSlug: string; lessonSlug: string };
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const lesson = await prisma.lesson.findFirst({
    where: {
      slug: params.lessonSlug,
      module: {
        course: {
          slug: params.courseSlug,
        },
      },
    },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) notFound();

  const modules = await prisma.module.findMany({
    where: { courseId: lesson.module.courseId },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentIndex >= 0 ? allLessons[currentIndex + 1] : null;

  if (lesson.prerequisiteId) {
    const prereqProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lesson.prerequisiteId,
        },
      },
    });
    const hasPrerequisite = !prereqProgress || prereqProgress.status !== "COMPLETE";

    return (
      <SplitPane>
        <LessonContent lesson={lesson} />
        <AiWorkspace
          lessonId={lesson.id}
          courseSlug={params.courseSlug}
          taskObjective={lesson.taskObjective}
          nextLessonSlug={nextLesson?.slug ?? null}
          hasPrerequisite={hasPrerequisite}
        />
      </SplitPane>
    );
  }

  return (
    <SplitPane>
      <LessonContent lesson={lesson} />
      <AiWorkspace
        lessonId={lesson.id}
        courseSlug={params.courseSlug}
        taskObjective={lesson.taskObjective}
        nextLessonSlug={nextLesson?.slug ?? null}
      />
    </SplitPane>
  );
}
