"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType } from "@/types/workspace";

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function StreamingCursor() {
  return <span className="streaming-cursor" aria-hidden="true" />;
}

export function ChatMessage({
  message,
  isStreaming = false,
}: {
  message: ChatMessageType;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgRef.current && isUser) {
      msgRef.current.style.transform = "translateY(4px)";
      msgRef.current.style.opacity = "0";
      requestAnimationFrame(() => {
        if (msgRef.current) {
          msgRef.current.style.transform = "translateY(0)";
          msgRef.current.style.opacity = "1";
        }
      });
    }
  }, [isUser]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        ref={msgRef}
        role={isUser ? undefined : "status"}
        className={`max-w-[72%] ${
          isUser
            ? "rounded-msg-user border border-forge-violet/40 bg-forge-violet/20 text-forge-text"
            : "rounded-msg-ai border border-forge-border bg-forge-surface text-forge-text"
        } ${isUser ? "" : "border-l-2 border-l-forge-violet-dim"} px-4 py-3 transition-all duration-150`}
        style={isUser ? { transform: "translateY(0)", opacity: "1" } : undefined}
      >
        <div className="whitespace-pre-wrap text-body-m">
          {message.content}
          {message.role === "assistant" && isStreaming && <StreamingCursor />}
          {!message.content && message.role === "assistant" && isStreaming && <StreamingCursor />}
        </div>
        <div
          className={`mt-1 text-label ${
            isUser ? "text-right text-forge-text/50" : "text-left text-forge-muted"
          }`}
        >
          {formatTime()}
        </div>
      </div>
    </div>
  );
}
