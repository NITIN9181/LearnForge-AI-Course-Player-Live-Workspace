import { defineConfig } from "vitest/config";
import path from "path";
import fs from "fs";

const envVars: Record<string, string> = {};
const envFile = path.resolve(__dirname, ".env.test");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^"|"$/g, "");
    envVars[key] = val;
  }
}

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: envVars,
    setupFiles: ["./tests/integration/setup.ts"],
    exclude: ["**/node_modules/**", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "app/api/**"],
      exclude: ["lib/env.ts", "lib/auth.ts", "lib/db.ts", "lib/groq.ts", "lib/nvidia.ts", "lib/llm.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
