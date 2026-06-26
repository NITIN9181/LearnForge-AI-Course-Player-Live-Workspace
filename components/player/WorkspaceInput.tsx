"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Lightbulb, X, Send, Loader2 } from "lucide-react";

export function WorkspaceInput({
  onSend,
  onHint,
  onClear,
  isStreaming,
  disabled = false,
}: {
  onSend: (content: string) => void;
  onHint: () => void;
  onClear: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue("");
  }, [value, isStreaming, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="border-t border-forge-border bg-forge-terminal/95 px-4 pb-4 pt-3">
      <div className="rounded-lg border border-forge-border bg-[#0A0E14] transition-colors focus-within:border-forge-violet">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your AI tutor anything about this lesson…"
          rows={1}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-4 pt-3 text-body-m text-forge-text placeholder-forge-muted outline-none disabled:opacity-38"
        />

        <div className="flex items-center justify-between border-t border-forge-border/50 px-3 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onHint}
              disabled={isStreaming || disabled}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-body-s font-medium text-forge-amber transition-colors hover:bg-forge-amber/10 disabled:opacity-38 disabled:cursor-not-allowed"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Hint
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-body-s font-medium text-forge-muted transition-colors hover:bg-forge-muted/10 disabled:opacity-38 disabled:cursor-not-allowed"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim() || isStreaming || disabled}
            className="flex items-center gap-1.5 rounded-md bg-forge-violet px-3 py-1.5 text-body-s font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-38 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span aria-label="streaming">· · ·</span>
              </>
            ) : (
              <>
                Send
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
