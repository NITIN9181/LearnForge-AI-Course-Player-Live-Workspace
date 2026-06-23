import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          void: "#080B11",
          document: "#F7F6F3",
          terminal: "#0D1117",
          surface: "#131820",
          border: "#1E2530",
          muted: "#6B7280",
          text: "#F0EDE8",
          ink: "#1C1917",
          violet: "#7C5CFC",
          "violet-dim": "#3D2A8A",
          mint: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          "code-bg": "#161B22",
        },
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["3rem", { lineHeight: "3.25rem", fontWeight: "800" }],
        "display-l": ["2.25rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "heading-1": ["1.75rem", { lineHeight: "2.125rem", fontWeight: "700" }],
        "heading-2": ["1.375rem", { lineHeight: "1.75rem", fontWeight: "700" }],
        "heading-3": ["1.125rem", { lineHeight: "1.625rem", fontWeight: "600" }],
        "body-l": ["1.0625rem", { lineHeight: "1.75rem", fontWeight: "400" }],
        "body-m": ["0.9375rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "body-s": ["0.8125rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        label: ["0.75rem", { lineHeight: "1rem", fontWeight: "500", letterSpacing: "0.08em" }],
      },
      borderRadius: {
        "msg-user": "16px 16px 4px 16px",
        "msg-ai": "4px 16px 16px 16px",
      },
      animation: {
        "forge-blink": "forge-blink 1.2s ease-in-out infinite",
      },
      keyframes: {
        "forge-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      boxShadow: {
        "panel-seam": "4px 0 8px -2px rgba(124, 92, 252, 0.15)",
        "workspace-glow": "0 -40px 80px -20px rgba(124, 92, 252, 0.08)",
        "card-hover": "0 0 0 1px rgba(124, 92, 252, 0.3)",
      },
    },
  },
  plugins: [typography],
};
export default config;
