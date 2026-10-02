/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"] },
      colors: {
        bg: "var(--bg)", surface: "var(--surface)", surface2: "var(--surface2)", ink: "var(--ink)",
        muted: "var(--muted)", line: "var(--line)", accent: "var(--accent)", accentsoft: "var(--accent-soft)",
        accenton: "var(--accent-on)", crit: "var(--crit)", high: "var(--high)", med: "var(--med)",
      },
    },
  },
  plugins: [],
};
