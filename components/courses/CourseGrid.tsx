import type { CourseCardCourse } from "./CourseCard";
import { CourseCard } from "./CourseCard";
import { auth } from "@/lib/auth";

export async function CourseGrid({
  courses,
  enrolledCourseIds,
  getHref,
}: {
  courses: CourseCardCourse[];
  enrolledCourseIds: Set<string>;
  getHref: (course: CourseCardCourse) => string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {courses.map((course) => {
        const isEnrolled = enrolledCourseIds.has(course.id);
        const userEnrollment = Array.isArray(course.enrollments)
          ? course.enrollments.find((e) => e.userId === userId)
          : undefined;

        return (
          <CourseCard
            key={course.id}
            course={{
              ...course,
              enrollments: course.enrollments,
            }}
            enrolled={!!userEnrollment || isEnrolled}
            href={getHref(course)}
          />
        );
      })}

      {courses.length === 0 && (
        <div className="col-span-full py-16 text-center">
          <p className="text-body-m text-forge-muted">No courses found.</p>
        </div>
      )}
    </div>
  );
}
