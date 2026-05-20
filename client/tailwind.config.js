/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50: "#f8fafc",
          100: "#eef2f6",
          500: "#64748b",
          700: "#334155",
          900: "#0f172a",
        },
        paper: "#fffaf0",
        cedar: {
          500: "#9f5f37",
          600: "#8a4f2d",
          700: "#6f3f26",
        },
        forest: {
          500: "#256d5a",
          600: "#1f5d4d",
          700: "#17473b",
        },
      },
      boxShadow: {
        soft: "0 16px 40px rgba(15, 23, 42, 0.08)",
        lift: "0 22px 55px rgba(15, 23, 42, 0.14)",
      },
    },
  },
  plugins: [],
}
