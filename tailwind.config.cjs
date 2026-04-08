/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
  presets: [require("@navikt/ds-tailwind")],
  darkMode: "class",
  theme: {
    screens: {
      phone: "450px",
    },
  },
  plugins: [],
}
