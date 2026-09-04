/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171714",
        noir: "#242420",
        ivory: "#f5f3ed",
        parchment: "#d8d3c5",
        stone: "#a8a99d",
        taupe: "#686960",
        graphite: "#393a34",
        bone: "#ebe8df",
        chartreuse: "#e78b73",
      },
      fontFamily: {
        display: ['"Bodoni Moda"', "Georgia", "serif"],
        editorial: ['"Newsreader"', "Georgia", "serif"],
        sans: ['"Space Grotesk"', '"Helvetica Neue"', "Arial", "sans-serif"],
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
