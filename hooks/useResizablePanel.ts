"use client";

import { useDefaultLayout } from "react-resizable-panels";

const STORAGE_KEY = "forge-player-layout";

export function useResizablePanel() {
  return useDefaultLayout({
    id: STORAGE_KEY,
    panelIds: ["lesson-panel", "workspace-panel"],
  });
}
