"use client";

import { formatTokens } from "@/lib/utils";

export function TokenCounter({ usage }: { usage: number }) {
  if (usage === 0) return null;

  const isHigh = usage > 3000;

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-label ${
        isHigh ? "bg-forge-amber/10 text-forge-amber" : "bg-forge-surface text-forge-muted"
      }`}
      title={isHigh ? "High token usage — consider clearing to stay under limits" : undefined}
    >
      {formatTokens(usage)}
    </span>
  );
}
