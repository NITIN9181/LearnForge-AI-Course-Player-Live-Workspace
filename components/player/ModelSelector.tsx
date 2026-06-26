"use client";

export function ModelSelector({
  value,
  onChange,
}: {
  value: "70b" | "8b";
  onChange: (model: "70b" | "8b") => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-forge-border">
      <button
        type="button"
        onClick={() => onChange("70b")}
        className={`px-2.5 py-1 text-label font-medium transition-colors ${
          value === "70b"
            ? "bg-forge-violet text-white"
            : "bg-forge-surface text-forge-muted hover:text-forge-text"
        }`}
      >
        70B
      </button>
      <button
        type="button"
        onClick={() => onChange("8b")}
        title="Faster, fewer tokens"
        className={`px-2.5 py-1 text-label font-medium transition-colors ${
          value === "8b"
            ? "bg-forge-violet text-white"
            : "bg-forge-surface text-forge-muted hover:text-forge-text"
        }`}
      >
        8B
      </button>
    </div>
  );
}
