import { Terminal } from "lucide-react";

export function CodeBlock({
  language,
  children,
}: {
  language?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border border-forge-border bg-forge-code-bg">
      {language && (
        <div className="flex items-center gap-1.5 border-b border-forge-border px-4 py-2 text-label text-forge-muted">
          <Terminal className="h-3 w-3" />
          {language}
        </div>
      )}
      <div className="overflow-x-auto p-4 font-mono text-body-s text-forge-text">
        <pre className="m-0">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}
