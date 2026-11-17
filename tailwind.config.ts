import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#060B1A", 900: "#0B1530", 850: "#0F1C3D", 800: "#14244B", 700: "#1E3363", 600: "#2B4580", 500: "#4A6399", 400: "#7487B3", 300: "#A3B1CF", 200: "#CBD4E6", 100: "#E6EBF5", 50: "#F4F6FB",
        },
        brand: { 50: "#EEF3FF", 100: "#DCE6FF", 200: "#B8CCFF", 300: "#8AAAFF", 400: "#5C86FF", 500: "#2F6BFF", 600: "#1F55E0", 700: "#1A45B5", 800: "#183B8F", 900: "#173470" },
        teal: { 50: "#ECFDF9", 100: "#CFF8EF", 200: "#9FEFDF", 300: "#62DEC9", 400: "#2CC6AF", 500: "#14A894", 600: "#0E8778", 700: "#106B61", 800: "#12564F", 900: "#134842" },
        coral: { 50: "#FFF2EF", 100: "#FFE0D9", 200: "#FFC0B3", 300: "#FF9783", 400: "#FF6B5A", 500: "#F24A3A", 600: "#D8321F", 700: "#B4271A" },
        gold: { 50: "#FFF8E8", 100: "#FEEDC4", 200: "#FCD98A", 300: "#F8C455", 400: "#F5B83D", 500: "#E09A1A", 600: "#B97A10", 700: "#8F5C10" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Songti SC", "Noto Serif CJK SC", "Georgia", "serif"],
        zh: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,21,48,.06), 0 8px 24px -12px rgba(11,21,48,.18)",
        lift: "0 2px 4px rgba(11,21,48,.08), 0 18px 40px -18px rgba(11,21,48,.35)",
        glow: "0 0 0 1px rgba(47,107,255,.35), 0 8px 30px -8px rgba(47,107,255,.55)",
      },
      borderRadius: { xl: "14px", "2xl": "20px", "3xl": "28px" },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseRing: { "0%": { boxShadow: "0 0 0 0 rgba(47,107,255,.45)" }, "100%": { boxShadow: "0 0 0 14px rgba(47,107,255,0)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
      animation: { "fade-up": "fade-up .45s ease-out both", "pulse-ring": "pulseRing 1.8s ease-out infinite", shimmer: "shimmer 1.6s linear infinite" },
    },
  },
  plugins: [],
};
export default config;
