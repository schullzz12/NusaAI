import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nusa: {
          bg: "#0a0a0f",
          surface: "#141420",
          card: "#1a1a2e",
          border: "#2a2a3e",
          primary: "#e91e63",
          "primary-dark": "#c2185b",
          secondary: "#ff6090",
          accent: "#f48fb1",
          text: "#e8e8f0",
          muted: "#8888a0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
