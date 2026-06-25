import Link from "next/link";
import { ProgressBar } from "./ProgressBar";

export type CourseCardCourse = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  modules: { lessons: unknown[] }[];
  enrollments?: { userId: string }[];
  _count?: { enrollments: number };
  progress?: { completed: number; total: number };
};

export function CourseCard({
  course,
  enrolled,
  href,
}: {
  course: CourseCardCourse;
  enrolled: boolean;
  href: string;
}) {
  const lessonCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const moduleCount = course.modules.length;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl border border-forge-border bg-forge-surface transition-all hover:border-forge-violet-dim hover:shadow-[0_0_0_1px_var(--forge-violet-dim)]"
    >
      <div className="aspect-video w-full bg-forge-void flex items-center justify-center overflow-hidden">
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
        <div className="text-label text-forge-violet uppercase tracking-wider">Course</div>

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

        {enrolled && course.progress && (
          <ProgressBar completed={course.progress.completed} total={course.progress.total} />
        )}

        <div className="pt-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-forge-violet px-4 py-2 text-body-s font-medium text-white transition-colors hover:bg-forge-violet-hover">
            {enrolled ? "Continue →" : "Enroll →"}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
