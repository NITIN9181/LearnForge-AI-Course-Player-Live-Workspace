import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CourseForm } from "@/components/admin/CourseForm";
import { LessonList } from "./LessonList";
import { Button } from "@/components/ui/button";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
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
    },
  });

  if (!course) notFound();

  return (
    <div>
      <Link
        href="/admin/courses"
        className="text-body-s text-forge-muted hover:text-forge-violet transition-colors mb-6 inline-block"
      >
        ← Back to courses
      </Link>

      <h1 className="text-heading-1 text-forge-text mb-8">Edit Course</h1>

      <div className="rounded-lg border border-forge-border p-6 mb-10">
        <CourseForm
          mode="edit"
          courseId={course.id}
          initialData={{
            title: course.title,
            description: course.description ?? "",
            imageUrl: course.imageUrl ?? "",
            published: course.published,
          }}
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-heading-2 text-forge-text">Lessons</h2>
        <Link href={`/admin/courses/${course.id}/lessons/new`}>
          <Button className="bg-forge-violet text-white hover:bg-forge-violet/90">
            + New Lesson
          </Button>
        </Link>
      </div>

      <LessonList
        courseId={course.id}
        modules={course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          order: m.order,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            order: l.order,
            moduleId: l.moduleId,
          })),
        }))}
      />
    </div>
  );
}
