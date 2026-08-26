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
        cream: {
          50: "#FAF7F2",
          100: "#F5F2EB",
          200: "#EBE5D8",
          300: "#DCD3C0",
        },
        dark: {
          bg: "#0A0A0A",
          surface: "#111111",
          card: "#161616",
          border: "#222222",
        },
        accent: {
          orange: "#FF5500",
          amber: "#F59E0B",
        },
        ghost: {
          grey: "#8E8E93",
          light: "#A1A1AA",
          dark: "#52525B",
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        '2': '2px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      },
      animation: {
        'spin-slow': 'spin 35s linear infinite',
        'spin-reverse-slow': 'spin-reverse 45s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
