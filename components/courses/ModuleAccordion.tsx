"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LessonStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  order: number;
  status?: LessonStatus;
};

type Module = {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

export function ModuleAccordion({
  modules,
  courseSlug,
  activeLessonSlug,
  onNavigate,
}: {
  modules: Module[];
  courseSlug: string;
  activeLessonSlug?: string;
  onNavigate?: () => void;
}) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const activeModule = modules.find((m) => m.lessons.some((l) => l.slug === activeLessonSlug));
    const firstId = modules[0]?.id;
    return new Set(activeModule ? [activeModule.id] : firstId ? [firstId] : []);
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <nav className="flex flex-col gap-1" aria-label="Course modules">
      {modules.map((mod) => {
        const isExpanded = expandedModules.has(mod.id);
        const completedCount = mod.lessons.filter((l) => l.status === "COMPLETE").length;

        return (
          <div key={mod.id}>
            <button
              type="button"
              onClick={() => toggleModule(mod.id)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-body-s font-medium text-forge-muted transition-colors hover:text-forge-text"
              aria-expanded={isExpanded}
            >
              <svg
                className={cn("size-3 transition-transform", isExpanded && "rotate-90")}
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M4 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="flex-1 truncate">{mod.title}</span>
              <span className="text-label text-forge-muted">
                {completedCount}/{mod.lessons.length}
              </span>
            </button>

            {isExpanded && (
              <div className="ml-2 flex flex-col border-l border-forge-border">
                {mod.lessons.map((lesson) => {
                  const isActive = lesson.slug === activeLessonSlug;
                  const isComplete = lesson.status === "COMPLETE";
                  const isInProgress = lesson.status === "IN_PROGRESS";
                  const isLocked = lesson.status === "NOT_STARTED";

                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${courseSlug}/${lesson.slug}`}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2 border-l-2 py-2 pl-3 pr-3 text-body-s transition-colors",
                        isActive
                          ? "border-forge-violet bg-forge-surface text-forge-text font-medium"
                          : "border-transparent text-forge-muted hover:bg-forge-surface hover:text-forge-text",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center">
                        {isComplete ? (
                          <svg
                            viewBox="0 0 16 16"
                            className="size-4 text-forge-violet"
                            fill="none"
                            aria-label="Complete"
                          >
                            <circle cx="8" cy="8" r="6" fill="currentColor" opacity="0.2" />
                            <path
                              d="M5 8l2 2 4-4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : isInProgress || isActive ? (
                          <span className="size-2 rounded-full bg-forge-amber" />
                        ) : isLocked ? (
                          <svg
                            viewBox="0 0 16 16"
                            className="size-3 text-forge-muted"
                            fill="none"
                            aria-label="Locked"
                          >
                            <rect
                              x="3"
                              y="7"
                              width="10"
                              height="7"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <path
                              d="M5 7V5a3 3 0 016 0v2"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : null}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
