export function ProgressBar({
  completed,
  total,
  className,
}: {
  completed: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-forge-border">
        <div
          className="h-full rounded-full bg-forge-violet transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-label text-forge-muted min-w-[4ch] text-right tabular-nums">
        {pct}%
      </span>
    </div>
  );
}
