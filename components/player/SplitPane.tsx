"use client";

import { useState, useEffect } from "react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { BookOpen, Bot } from "lucide-react";
import { useResizablePanel } from "@/hooks/useResizablePanel";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function SplitPane({ children }: { children: [React.ReactNode, React.ReactNode] }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { defaultLayout, onLayoutChanged } = useResizablePanel();
  const [activeTab, setActiveTab] = useState<"content" | "workspace">("content");

  if (isMobile) {
    return (
      <div className="flex h-full flex-col bg-forge-void">
        <div className="flex h-12 shrink-0 items-center border-b border-forge-border bg-forge-void">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`flex h-full flex-1 items-center justify-center gap-2 text-body-s font-medium transition-colors ${
              activeTab === "content"
                ? "border-b-3 border-forge-violet text-forge-text"
                : "text-forge-muted hover:text-forge-text"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Lesson Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("workspace")}
            className={`flex h-full flex-1 items-center justify-center gap-2 text-body-s font-medium transition-colors ${
              activeTab === "workspace"
                ? "border-b-3 border-forge-violet text-forge-text"
                : "text-forge-muted hover:text-forge-text"
            }`}
          >
            <Bot className="h-4 w-4" />
            AI Workspace
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTab === "content" ? children[0] : children[1]}
        </div>
      </div>
    );
  }

  return (
    <PanelGroup defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged} className="h-full">
      <Panel id="lesson-panel" minSize={25} maxSize={75}>
        {children[0]}
      </Panel>

      <PanelResizeHandle className="group relative flex w-1 shrink-0 items-center justify-center bg-forge-border transition-colors hover:bg-forge-violet/50">
        <div className="absolute inset-y-0 -left-2 -right-2 z-20 cursor-col-resize" />
        <div className="absolute left-0 top-0 h-full w-[4px] shadow-panel-seam" />
      </PanelResizeHandle>

      <Panel id="workspace-panel" minSize={25} maxSize={75}>
        {children[1]}
      </Panel>
    </PanelGroup>
  );
}
