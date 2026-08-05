/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f766e", // Teal 700 - Islamic Green feel
        secondary: "#c2410c", // Orange 700 - Henna/Festive
        accent: "#f59e0b", // Amber 500 - Gold
      }
    },
  },
  plugins: [],
}
