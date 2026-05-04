import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#F5F0E8",
        ritual: {
          green: "#2F795A",
          bright: "#19D184",
          black: "#000000",
          ink: "#111111",
          elevated: "#101611",
          surface: "#18231C",
          gold: "#C8A64B",
          pink: "#D946A4"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial", "sans-serif"],
        body: ["var(--font-body)", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        ritual: "0 24px 80px -32px rgba(47, 121, 90, 0.45)",
        "emerald-glow": "0 0 42px -10px rgba(25, 209, 132, 0.65)",
        card: "0 18px 60px -36px rgba(0, 0, 0, 0.55)"
      },
      animation: {
        "slow-spin": "slowSpin 12s linear infinite",
        "reverse-spin": "reverseSpin 18s linear infinite",
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2.5s ease-in-out infinite"
      },
      keyframes: {
        slowSpin: { to: { transform: "rotate(360deg)" } },
        reverseSpin: { to: { transform: "rotate(-360deg)" } },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" }
        },
        shimmer: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};

export default config;
