import type { Config } from "tailwindcss";



const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}", 
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}"
  ],
  darkMode: "class", // Enables dark mode support
  theme: {
    extend: {
      colors: {
        background: "#0f172a", // Deep dark blue
        card: "#1e293b", // Slightly lighter dark shade
        primary: "#3b82f6", // Blue for buttons and highlights
        secondary: "#64748b", // Subtle gray for text
        accent: "#facc15", // Gold/yellow for special highlights
        border: "#334155", // Border color for elements
        danger: "#ef4444", // Red for warnings
        success: "#22c55e", // Green for confirmations
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Modern UI font
      },
      borderRadius: {
        xl: "12px", // Smooth rounded edges
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 4px 10px rgba(0, 0, 0, 0.2)", // Subtle depth effect
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};

export default config;
module.exports = {
  content: [
    "./app/**/*.{html,js,ts,jsx,tsx}", // adjust based on your file structure
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
