import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LessonEditor } from "@/components/admin/LessonEditor";
import Link from "next/link";

export default async function EditLessonPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: { select: { id: true, title: true, order: true, courseId: true } },
    },
  });

  if (!lesson) notFound();

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true },
      },
    },
  });

  if (!course) notFound();

  return (
    <div>
      <Link
        href={`/admin/courses/${params.id}`}
        className="text-body-s text-forge-muted hover:text-forge-violet transition-colors mb-6 inline-block"
      >
        ← Back to course
      </Link>

      <h1 className="text-heading-1 text-forge-text mb-8">Edit Lesson</h1>

      <div className="rounded-lg border border-forge-border p-6">
        <LessonEditor
          mode="edit"
          lessonId={lesson.id}
          modules={course.modules}
          courseId={params.id}
          nextOrder={lesson.order}
          initialData={{
            title: lesson.title,
            slug: lesson.slug,
            order: lesson.order,
            moduleId: lesson.moduleId,
            content: lesson.content,
            systemPrompt: lesson.systemPrompt,
            hintSystemPrompt: lesson.hintSystemPrompt ?? "",
            taskObjective: lesson.taskObjective ?? "",
          }}
        />
      </div>
    </div>
  );
}
