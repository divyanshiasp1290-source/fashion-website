/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080706",
        noir: "#11100e",
        ivory: "#f7f1e8",
        parchment: "#e9ddcc",
        stone: "#c8bca9",
        taupe: "#7d7165",
        graphite: "#282522",
        bone: "#fbf8f1",
      },
      fontFamily: {
        display: ['"Bodoni Moda"', "Georgia", "serif"],
        editorial: ['"Newsreader"', "Georgia", "serif"],
        sans: ['"Azeret Mono"', '"Helvetica Neue"', "Arial", "sans-serif"],
      },
      letterSpacing: {
        wideLuxury: "0.16em",
      },
      boxShadow: {
        luxe: "0 24px 80px rgba(8, 7, 6, 0.18)",
      },
    },
  },
  plugins: [],
};
