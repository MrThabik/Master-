import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", fg: "var(--fg)", muted: "var(--muted)", gold: "var(--gold)",
        em: "var(--em)", card: "var(--card)", field: "var(--field)",
      },
      fontFamily: {
        serif: ["var(--font-heading)", '"Noto Sans Tamil"', "Georgia", "serif"],
        sans: ["var(--font-body)", '"Noto Sans Tamil"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
