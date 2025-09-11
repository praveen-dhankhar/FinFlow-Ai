import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"],
        heading: ["var(--font-cal)", "var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        brand: { DEFAULT: "#0ea5e9", foreground: "#0b799e" },
        background: "#0b1220",
        foreground: "#e2e8f0",
        muted: "#1f2937",
        card: "#0f172a",
        border: "#1e293b",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "16px",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": { "0%": { transform: "scale(0.95)" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
