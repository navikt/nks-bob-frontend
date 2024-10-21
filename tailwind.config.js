/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("@navikt/ds-tailwind")],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
}
