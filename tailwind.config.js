/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16201C",
          soft: "#3A453F",
        },
        jade: {
          50: "#EAF3F0",
          100: "#CFE4DC",
          400: "#1E8E77",
          500: "#0F6D5F",
          600: "#0B584D",
          700: "#08453C",
        },
        sage: {
          400: "#8B9A92",
          500: "#6B7A72",
        },
        amber: {
          400: "#F0B655",
          500: "#E8A33D",
          600: "#C9832A",
        },
        paper: "#F7F8F6",
        line: "#E4E7E3",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
