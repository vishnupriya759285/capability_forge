import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F8F5",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#14532D",
          hover: "#0f3e22",
          light: "#DCFCE7",
        },
        secondary: {
          DEFAULT: "#16A34A",
          hover: "#15803d",
        },
        accent: {
          DEFAULT: "#FACC15",
          light: "#FEF9C3",
          hover: "#eab308",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
          hover: "#b91c1c",
        },
        text: {
          primary: "#172018",
          secondary: "#667066",
          muted: "#9AA59A",
        },
        border: {
          DEFAULT: "#E2E8E2",
          dark: "#CBD5CB",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        glow: "0 0 15px rgba(22, 163, 74, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
