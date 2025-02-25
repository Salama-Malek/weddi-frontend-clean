/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

// Define spacing scale for gap, padding, margin
const spacing = {
  "2xs": "2px",
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "12px",
  "2xl": "14px",
  "3xl": "16px",
  "4xl": "18px",
  "5xl": "20px",
  "6xl": "22px",
  "7xl": "24px",
  "8xl": "26px",
  "9xl": "28px",
  "10xl": "30px",
  "11xl": "32px",
  "12xl": "34px",
  "13xl": "36px",
  "14xl": "38px",
  "15xl": "40px",
};

// Define font sizes with line heights
const fontSize = {
  "2xs": ["10px", { lineHeight: "14px" }],
  xs: ["12px", { lineHeight: "18px" }],
  sm: ["14px", { lineHeight: "20px" }],
  md: ["16px", { lineHeight: "24px" }],
  lg: ["18px", { lineHeight: "28px" }],
  xl: ["20px", { lineHeight: "30px" }],
  "2xl": ["28px", { lineHeight: "36px" }],
};

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "0rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      gap: spacing,
      padding: spacing,
      margin: spacing,
      fontSize: fontSize,
      fontFamily: {
        ibm: ["IBM Plex Sans Arabic", "sans-serif"],
      },
      colors: {
        default: "#ff0000",
        gray: {
          25: "#FCFCFD",
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D2D6DB",
          400: "#9DA4AE",
          500: "#6C737F",
          600: "#4D5761",
          700: "#384250",
          800: "#1F2A37",
          900: "#111927",
          950: "#0D121C",
          960: "#F1F5F2",
        },
        primary: {
          DEFAULT: "#25935F",
          25: "#F7FDF9",
          50: "#F3FCF6",
          100: "#DFF6E7",
          200: "#B8EACB",
          300: "#88D8AD",
          400: "#54C08A",
          500: "#25935F",
          600: "#1B8354",
          700: "#166A45",
          800: "#14573A",
          900: "#104631",
          950: "#092A1E",
          960: "#397051",
        },
        secondary: {
          DEFAULT: "#F5BD02",
          25: "#FFFEF7",
          50: "#FFFEF2",
          100: "#FFFCE6",
          200: "#FCF3BD",
          300: "#FAE996",
          400: "#F7D54D",
          500: "#F5BD02",
          600: "#DBA102",
          700: "#B87B02",
          800: "#945C01",
          900: "#6E3C00",
          950: "#472400",
        },
      },
      backgroundImage: {
        "gradient-sa-600": "linear-gradient(90deg, #1B8354, #25935F)",
        "gradient-sa-700": "linear-gradient(45deg, #166A45, #1B8354)",
        "gradient-sa-950": "linear-gradient(45deg, #092A1E, #1B8354)",
        "gradient-sa-800": "linear-gradient(90deg, #14573A, #1B8354)",
        "gradient-sa-900": "linear-gradient(45deg, #104631, #1B8354)",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(101, 82, 128, 0.06), 0 4px 8px -2px rgba(101, 82, 128, 0.10)",
        md: "0 2px 4px -2px rgba(101, 82, 128, 0.06), 0 12px 16px -6px rgba(101, 82, 128, 0.08)",
        lg: "0 4px 6px -2px rgba(101, 82, 128, 0.03), 0 20px 24px -4px rgba(101, 82, 128, 0.08)",
        xl: "0 8px 8px -4px rgba(101, 82, 128, 0.03)",
        "2xl": "0 24px 48px -12px rgba(101, 82, 128, 0.18)",
        "3xl": "0 32px 64px -12px rgba(101, 82, 128, 0.14)",
      },
      screens: {
        sm: "600px",
        md: "960px",
        lg: "1280px",
        xl: "1440px",
        "2xl": "1536px",
      },
      height: {
        100: "72px",
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addUtilities }) {
      addUtilities({
        ".b-radius": {
          border: ".25px solid #E5E7EB",
          borderRadius: "8px",
        },
        ".header-shadow": {
          boxShadow: "0px 4px 4px 0px #1018281A",
        },
      });

      addComponents({
        h1: { fontSize: "72px", lineHeight: "90px", letterSpacing: "-2%" },
        h2: { fontSize: "60px", lineHeight: "72px", letterSpacing: "-2%" },
        h3: { fontSize: "48px", lineHeight: "60px", letterSpacing: "-2%" },
        h4: { fontSize: "36px", lineHeight: "44px", letterSpacing: "-2%" },
        h5: { fontSize: "30px", lineHeight: "38px" },
        h6: { fontSize: "24px", lineHeight: "32px" },
        p: { fontSize: "20px", lineHeight: "30px", letterSpacing: "0%" },
      });
    }),
    require("tailwindcss-animate"),
  ],
};
