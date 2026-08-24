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
        background: "#070b14",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "rgba(17, 26, 48, 0.65)",
          foreground: "#f8fafc",
        },
        popover: {
          DEFAULT: "rgba(15, 23, 42, 0.95)",
          foreground: "#f8fafc",
        },
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
          glow: "rgba(59, 130, 246, 0.35)",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#94a3b8",
        },
        muted: {
          DEFAULT: "#1e293b",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#06b6d4",
          foreground: "#ffffff",
          glow: "rgba(6, 182, 212, 0.35)",
        },
        violet: {
          DEFAULT: "#8b5cf6",
          glow: "rgba(139, 92, 246, 0.35)",
        },
        emerald: {
          DEFAULT: "#10b981",
          glow: "rgba(16, 185, 129, 0.3)",
        },
        amber: {
          DEFAULT: "#f59e0b",
          glow: "rgba(245, 158, 11, 0.3)",
        },
        coral: {
          DEFAULT: "#f43f5e",
          glow: "rgba(244, 63, 94, 0.3)",
        },
        border: "rgba(99, 102, 241, 0.18)",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        xl: "24px",
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: "0 0 25px rgba(59, 130, 246, 0.35)",
        "glow-cyan": "0 0 25px rgba(6, 182, 212, 0.35)",
        "glow-purple": "0 0 30px rgba(139, 92, 246, 0.35)",
      },
    },
  },
  plugins: [],
}
