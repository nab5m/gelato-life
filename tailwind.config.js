/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 젤라또 팔레트
        gelato: {
          // 스트로베리 핑크 (Airbnb의 rose 자리)
          50: "#fff1f6",
          100: "#ffe4ee",
          200: "#ffc9dd",
          300: "#ff9dc0",
          400: "#ff6aa0",
          500: "#f93f86",
          600: "#e51f6e",
          700: "#c1115a",
          800: "#a0114e",
          900: "#851345",
        },
        mint: {
          50: "#effcf9",
          100: "#c9f7ee",
          200: "#94eedd",
          300: "#57dec9",
          400: "#2ec6b3",
          500: "#19c3b2",
          600: "#0f8f86",
          700: "#11726c",
          800: "#125b57",
          900: "#134b49",
        },
        cream: "#fff8f0",
        vanilla: "#fdf3e3",
        choco: "#5b3a29",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 20px rgba(0,0,0,0.08)",
        soft: "0 2px 16px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
