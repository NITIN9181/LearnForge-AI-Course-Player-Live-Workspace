"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/workspace";

const MODEL_KEY = "forge:workspace:model";

export type UseWorkspaceChatReturn = {
  messages: ChatMessage[];
  isStreaming: boolean;
  tokenUsage: number;
  model: "70b" | "8b";
  setModel: (m: "70b" | "8b") => void;
  sendMessage: (content: string) => Promise<void>;
  requestHint: () => Promise<void>;
  clearHistory: () => Promise<void>;
  error: string | null;
};

function getStoredModel(): "70b" | "8b" {
  if (typeof window === "undefined") return "70b";
  const stored = localStorage.getItem(MODEL_KEY);
  if (stored === "70b" || stored === "8b") return stored;
  return "70b";
}

function modelToApiModel(model: "70b" | "8b"): string | undefined {
  if (model === "70b") return undefined;
  return "meta/llama-3.1-8b-instruct";
}

export function useWorkspaceChat(lessonId: string): UseWorkspaceChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokenUsage, setTokenUsage] = useState(0);
  const [model, setModelState] = useState<"70b" | "8b">(getStoredModel);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch(`/api/workspace/history?lessonId=${lessonId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load history");
        return res.json();
      })
      .then((data) => {
        if (data.data?.messages) {
          setMessages(data.data.messages);
        }
      })
      .catch(() => {});
  }, [lessonId]);

  const setModel = useCallback((m: "70b" | "8b") => {
    setModelState(m);
    localStorage.setItem(MODEL_KEY, m);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);
      const userMessage: ChatMessage = { role: "user", content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const response = await fetch("/api/workspace/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            model: modelToApiModel(model),
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error ?? "Request failed");
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
                assistantContent += parsed.delta;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return next;
                });
              }
              if (parsed.tokenUsage) {
                setTokenUsage(parsed.tokenUsage);
              }
              if (parsed.error) {
                setError(parsed.error);
              }
            } catch {}
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [lessonId, messages, isStreaming, model],
  );

  const requestHint = useCallback(async () => {
    if (isStreaming) return;

    setError(null);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/workspace/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? "Hint request failed");
      }

      const data = await response.json();
      if (data.data?.message) {
        const hintMessage: ChatMessage = {
          role: "assistant",
          content: data.data.message,
        };
        setMessages((prev) => [...prev, hintMessage]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [lessonId, messages, isStreaming]);

  const clearHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/workspace/history?lessonId=${lessonId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to clear history");

      setMessages([]);
      setTokenUsage(0);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, [lessonId]);

  return {
    messages,
    isStreaming,
    tokenUsage,
    model,
    setModel,
    sendMessage,
    requestHint,
    clearHistory,
    error,
  };
}
