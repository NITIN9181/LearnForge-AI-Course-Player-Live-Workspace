import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LessonEditor } from "@/components/admin/LessonEditor";
import Link from "next/link";

export default async function NewLessonPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { order: true },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const modules = course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    order: m.order,
  }));

  const nextOrder =
    course.modules.reduce((max, m) => {
      const maxLessonOrder = m.lessons.reduce((maxL, l) => Math.max(maxL, l.order), -1);
      return Math.max(max, maxLessonOrder);
    }, -1) + 1;

  return (
    <div>
      <Link
        href={`/admin/courses/${params.id}`}
        className="text-body-s text-forge-muted hover:text-forge-violet transition-colors mb-6 inline-block"
      >
        ← Back to course
      </Link>

      <h1 className="text-heading-1 text-forge-text mb-8">New Lesson</h1>

      <div className="rounded-lg border border-forge-border p-6">
        <LessonEditor mode="create" modules={modules} courseId={params.id} nextOrder={nextOrder} />
      </div>
    </div>
  );
}
