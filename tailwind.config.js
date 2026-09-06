/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#000000",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        primary: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f3f4f6",
          foreground: "#374151",
        },
        muted: {
          DEFAULT: "#f9fafb",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
        },
        border: "#e5e7eb",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        minimal: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "minimal-card": "0 4px 20px -2px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
}
