/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      colors: {
        ink: "#0d0d0d",
        noir: "#171717",
        ivory: "#f7f7f5",
        parchment: "#e8e6df",
        stone: "#8e8e8e",
        taupe: "#5e5e5e",
        graphite: "#262626",
        bone: "#ebe8df",
        chartreuse: "#e78b73",
        coral: "#e78b73",
        terracotta: "#e78b73",
        pureWhite: "#ffffff",
        pureBlack: "#000000",
        silver: "#e5e7eb",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        editorial: ["Cormorant Garamond", "Georgia", "serif"],
        mono: ["Space Mono", "monospace"],
        brand: ["Syne", "sans-serif"],
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
