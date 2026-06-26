"use client";

import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { useWorkspaceChat } from "@/hooks/useWorkspaceChat";
import { ChatMessage } from "@/components/player/ChatMessage";
import { WorkspaceInput } from "@/components/player/WorkspaceInput";
import { TokenCounter } from "@/components/player/TokenCounter";
import { ModelSelector } from "@/components/player/ModelSelector";
import { CompleteButton } from "@/components/player/CompleteButton";

export function AiWorkspace({
  lessonId,
  courseSlug,
  taskObjective,
  nextLessonSlug,
  hasPrerequisite,
}: {
  lessonId: string;
  courseSlug: string;
  taskObjective: string | null;
  nextLessonSlug: string | null;
  hasPrerequisite?: boolean;
}) {
  const {
    messages,
    isStreaming,
    tokenUsage,
    model,
    setModel,
    sendMessage,
    requestHint,
    clearHistory,
    error,
  } = useWorkspaceChat(lessonId);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? null;

  return (
    <div className="flex h-full flex-col bg-forge-terminal">
      <div className="flex shrink-0 items-center justify-between border-b border-forge-border px-4 py-2.5">
        <ModelSelector value={model} onChange={setModel} />
        <TokenCounter usage={tokenUsage} />
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forge-violet/10">
              <Bot className="h-6 w-6 text-forge-violet" />
            </div>
            <h2 className="mb-2 text-heading-3 text-forge-text">AI Workspace</h2>
            <p className="max-w-sm text-center text-body-m text-forge-muted">
              Your AI tutor is ready. Start a conversation to practice the concepts from this
              lesson.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}

            {error && (
              <div className="mb-3 rounded-lg border border-forge-red/30 bg-forge-red/10 px-4 py-3 text-body-s text-forge-red">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      <CompleteButton
        lessonId={lessonId}
        taskObjective={taskObjective}
        lastMessage={lastUserMessage}
        hasPrerequisite={hasPrerequisite}
        courseSlug={courseSlug}
        nextLessonSlug={nextLessonSlug}
      />

      <WorkspaceInput
        onSend={sendMessage}
        onHint={requestHint}
        onClear={clearHistory}
        isStreaming={isStreaming}
      />
    </div>
  );
}
