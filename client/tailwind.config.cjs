/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: "#ffffff",
      gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
      },
      blue: {
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
      },
      green: {
        500: "#22c55e",
        600: "#16a34a",
      },
      red: {
        500: "#ef4444",
      },
      zinc: {
        400: "#a1a1aa",
        700: "#3f3f46",
      },
    },
  },
  plugins: [],
}
