import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading-1 text-forge-text">Courses</h1>
          <p className="text-body-m text-forge-muted mt-1">
            {courses.length} course{courses.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="bg-forge-violet text-white hover:bg-forge-violet/90">
            + New Course
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-forge-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-forge-border bg-forge-void/50">
              <th className="px-4 py-3 text-left text-label text-forge-muted">Title</th>
              <th className="px-4 py-3 text-left text-label text-forge-muted">Slug</th>
              <th className="px-4 py-3 text-left text-label text-forge-muted">Status</th>
              <th className="px-4 py-3 text-left text-label text-forge-muted">Modules</th>
              <th className="px-4 py-3 text-left text-label text-forge-muted">Enrolled</th>
              <th className="px-4 py-3 text-left text-label text-forge-muted">Created</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-b border-forge-border last:border-0 hover:bg-forge-void/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="text-body-m text-forge-text hover:text-forge-violet transition-colors"
                  >
                    {course.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-body-s text-forge-muted font-mono">{course.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-label ${
                      course.published
                        ? "bg-forge-mint/10 text-forge-mint"
                        : "bg-forge-amber/10 text-forge-amber"
                    }`}
                  >
                    {course.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-body-s text-forge-muted">{course._count.modules}</td>
                <td className="px-4 py-3 text-body-s text-forge-muted">
                  {course._count.enrollments}
                </td>
                <td className="px-4 py-3 text-body-s text-forge-muted">
                  {course.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-body-m text-forge-muted">
                  No courses yet. Create your first course.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
