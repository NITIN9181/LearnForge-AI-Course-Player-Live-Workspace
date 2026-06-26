"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  order: number;
  moduleId: string;
};

type ModuleWithLessons = {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

type LessonListProps = {
  courseId: string;
  modules: ModuleWithLessons[];
};

export function LessonList({ courseId, modules }: LessonListProps) {
  const router = useRouter();
  const [localModules, setLocalModules] = useState(modules);
  const [reordering, setReordering] = useState(false);

  async function handleMoveUp(lesson: Lesson) {
    const moduleLessons = localModules
      .flatMap((m) => m.lessons)
      .filter((l) => l.moduleId === lesson.moduleId)
      .sort((a, b) => a.order - b.order);

    const idx = moduleLessons.findIndex((l) => l.id === lesson.id);
    if (idx <= 0) return;

    const prev = moduleLessons[idx - 1]!;
    const updates = [
      { lessonId: lesson.id, newOrder: prev.order, moduleId: lesson.moduleId },
      { lessonId: prev.id, newOrder: lesson.order, moduleId: prev.moduleId },
    ];

    await doReorder(updates);
  }

  async function handleMoveDown(lesson: Lesson) {
    const moduleLessons = localModules
      .flatMap((m) => m.lessons)
      .filter((l) => l.moduleId === lesson.moduleId)
      .sort((a, b) => a.order - b.order);

    const idx = moduleLessons.findIndex((l) => l.id === lesson.id);
    if (idx < 0 || idx >= moduleLessons.length - 1) return;

    const next = moduleLessons[idx + 1]!;
    const updates = [
      { lessonId: lesson.id, newOrder: next.order, moduleId: lesson.moduleId },
      { lessonId: next.id, newOrder: lesson.order, moduleId: next.moduleId },
    ];

    await doReorder(updates);
  }

  async function doReorder(
    updates: Array<{ lessonId: string; newOrder: number; moduleId: string }>,
  ) {
    setReordering(true);
    try {
      const res = await fetch("/api/lessons/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessons: updates }),
      });

      if (!res.ok) return;

      setLocalModules((prev) => {
        const updated = structuredClone(prev);
        for (const u of updates) {
          for (const mod of updated) {
            const found = mod.lessons.find((l) => l.id === u.lessonId);
            if (found) found.order = u.newOrder;
          }
        }
        return updated;
      });
      router.refresh();
    } finally {
      setReordering(false);
    }
  }

  const flatLessons = localModules
    .flatMap((m) =>
      m.lessons.map((l) => ({
        ...l,
        moduleTitle: m.title,
      })),
    )
    .sort((a, b) => a.order - b.order);

  if (flatLessons.length === 0) {
    return (
      <div className="rounded-lg border border-forge-border p-8 text-center text-body-m text-forge-muted">
        No lessons yet. Create your first lesson.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-forge-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-forge-border bg-forge-void/50">
            <th className="px-4 py-3 text-left text-label text-forge-muted">Order</th>
            <th className="px-4 py-3 text-left text-label text-forge-muted">Title</th>
            <th className="px-4 py-3 text-left text-label text-forge-muted">Module</th>
            <th className="px-4 py-3 text-left text-label text-forge-muted">Slug</th>
            <th className="px-4 py-3 text-right text-label text-forge-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {flatLessons.map((lesson) => (
            <tr
              key={lesson.id}
              className="border-b border-forge-border last:border-0 hover:bg-forge-void/30"
            >
              <td className="px-4 py-3 text-body-s text-forge-muted">{lesson.order}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                  className="text-body-m text-forge-text hover:text-forge-violet transition-colors"
                >
                  {lesson.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-body-s text-forge-muted">{lesson.moduleTitle}</td>
              <td className="px-4 py-3 text-body-s text-forge-muted font-mono">{lesson.slug}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleMoveUp(lesson)}
                    disabled={reordering}
                    className="rounded px-2 py-1 text-body-s text-forge-muted hover:text-forge-text hover:bg-forge-void disabled:opacity-30 transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(lesson)}
                    disabled={reordering}
                    className="rounded px-2 py-1 text-body-s text-forge-muted hover:text-forge-text hover:bg-forge-void disabled:opacity-30 transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
