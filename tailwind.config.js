/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#002B5B",
        "secondary": "#00A8E8",
        "accent": "#00E5FF",
        "surface-light": "#F8FAFC",
        "surface-card": "#FFFFFF",
        "command-border": "#E2E8F0",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"]
      },
    },
  },
  plugins: [],
}
