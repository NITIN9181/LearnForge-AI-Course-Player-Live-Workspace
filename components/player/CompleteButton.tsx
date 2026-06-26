"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useLessonProgress } from "@/hooks/useLessonProgress";

export function CompleteButton({
  lessonId,
  taskObjective,
  lastMessage,
  hasPrerequisite,
  courseSlug,
  nextLessonSlug,
}: {
  lessonId: string;
  taskObjective: string | null;
  lastMessage: string | null;
  hasPrerequisite?: boolean;
  courseSlug: string;
  nextLessonSlug: string | null;
}) {
  const router = useRouter();
  const [showForceComplete, setShowForceComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const completedRef = useRef(false);

  const handleNavigateNext = useCallback(() => {
    if (nextLessonSlug) {
      router.push(`/learn/${courseSlug}/${nextLessonSlug}`);
    } else {
      router.push(`/courses`);
    }
  }, [nextLessonSlug, courseSlug, router]);

  const fireConfetti = useCallback(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#7C5CFC", "#10B981", "#FFFFFF"],
    });
  }, []);

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return;
    completedRef.current = true;

    fireConfetti();

    setTimeout(() => {
      handleNavigateNext();
    }, 1200);
  }, [handleNavigateNext, fireConfetti]);

  const { isCompleting, isValidating, markComplete, validateTask } = useLessonProgress({
    lessonId,
    onComplete: () => handleComplete(),
  });

  const handleClick = useCallback(async () => {
    if (isCompleting || isValidating) return;

    if (taskObjective && lastMessage && !showForceComplete) {
      const conversationSummary = lastMessage.slice(0, 500);

      const result = await validateTask({
        taskObjective,
        lastUserMessage: lastMessage,
        conversationSummary,
      });

      if (!result) return;

      if (!result.achieved) {
        setAttempts((prev) => prev + 1);
        setShowForceComplete(attempts >= 1);
        return;
      }
    }

    await markComplete();
  }, [
    isCompleting,
    isValidating,
    taskObjective,
    lastMessage,
    showForceComplete,
    validateTask,
    markComplete,
    attempts,
  ]);

  const handleForceComplete = useCallback(async () => {
    await markComplete();
  }, [markComplete]);

  if (hasPrerequisite) {
    return (
      <div className="border-t border-forge-border px-4 py-3">
        <button
          type="button"
          disabled
          className="w-full rounded-md border border-forge-border bg-transparent px-4 py-2.5 text-body-s font-medium text-forge-muted"
        >
          Complete prerequisite lesson first
        </button>
      </div>
    );
  }

  const buttonLabel = taskObjective ? "Submit & Complete Lesson" : "Mark Lesson Complete";

  return (
    <div className="border-t border-forge-border px-4 py-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isCompleting || isValidating}
        className="group w-full rounded-md border border-forge-mint bg-transparent px-4 py-2.5 text-body-s font-medium text-forge-mint transition-colors hover:bg-forge-mint hover:text-forge-void disabled:cursor-not-allowed disabled:opacity-38"
      >
        {isValidating ? (
          <span className="flex items-center justify-center gap-2 text-forge-amber">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking your work…
          </span>
        ) : isCompleting ? (
          <span className="flex items-center justify-center gap-2 text-forge-amber">
            <Loader2 className="h-4 w-4 animate-spin" />
            Completing…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {buttonLabel}
          </span>
        )}
      </button>

      {showForceComplete && attempts >= 1 && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={handleForceComplete}
            disabled={isCompleting}
            className="text-body-s text-forge-violet underline-offset-2 hover:underline disabled:opacity-38"
          >
            Complete without retry →
          </button>
        </div>
      )}
    </div>
  );
}
