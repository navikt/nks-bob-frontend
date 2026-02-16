/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("@navikt/ds-tailwind")],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        tallWide: { raw: "(max-width: 800px) and (min-height: 1200px)" },
        marginWide: { raw: "(min-width: 800px)" },
        narrowWidth: { raw: "(max-width: 750px) and (min-height: 1120px)" },
        narrowHeight: { raw: "(max-height: 1000px)" }
      },
    },
    screens: {
      phone: "450px",
    },
  },
  plugins: [],
}
