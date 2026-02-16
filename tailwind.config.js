/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // GreenBuddy v2.2 Palette - Nature/Organic
        primary: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",  // Primary main (spec)
          600: "#16A34A",
          700: "#166534",  // Secondary (spec)
          800: "#14532D",
          900: "#052E16",
        },
        accent: {
          300: "#FCD34D",
          400: "#FACC15",  // Accent main (spec)
          500: "#EAB308",
          600: "#CA8A04",
        },
        background: "#FEFCE8",  // Crème (spec)
        surface: "#FFFBEB",     // Blanc cassé (spec)
        error: "#DC2626",       // Rouge brique (spec)
        warning: "#F97316",     // Orange terre (spec)
        success: "#10B981",
        text: {
          primary: "#78350F",   // Brun terre (spec)
          secondary: "#A16207",
          tertiary: "#D97706",
          muted: "#D1D5DB",
        },
      },
      fontFamily: {
        nunito: ["Nunito"],
        poppins: ["Poppins"],
        inter: ["Inter"],
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
