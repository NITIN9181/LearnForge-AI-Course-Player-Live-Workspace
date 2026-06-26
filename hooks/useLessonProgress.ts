"use client";

import { useState, useCallback } from "react";

export function useLessonProgress({
  lessonId,
  onComplete,
}: {
  lessonId: string;
  onComplete?: () => void;
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const markInProgress = useCallback(async () => {
    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });
    } catch {}
  }, [lessonId]);

  const markComplete = useCallback(async () => {
    if (isCompleting) return;

    setIsCompleting(true);
    setValidationError(null);

    try {
      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to mark complete");
      }

      onComplete?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setValidationError(err.message);
      }
    } finally {
      setIsCompleting(false);
    }
  }, [lessonId, isCompleting, onComplete]);

  const validateTask = useCallback(
    async ({
      taskObjective,
      lastUserMessage,
      conversationSummary,
    }: {
      taskObjective: string;
      lastUserMessage: string;
      conversationSummary: string;
    }) => {
      setIsValidating(true);
      setValidationError(null);

      try {
        const response = await fetch("/api/validate-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskObjective,
            lastUserMessage,
            conversationSummary,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error ?? "Validation failed");
        }

        const result = await response.json();
        return result.data as {
          achieved: boolean;
          feedback: string;
          confidence: number;
        };
      } catch (err: unknown) {
        if (err instanceof Error) {
          setValidationError(err.message);
        }
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    [],
  );

  return {
    isCompleting,
    isValidating,
    validationError,
    markInProgress,
    markComplete,
    validateTask,
  };
}
