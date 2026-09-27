import type { Config } from "tailwindcss";
// @ts-expect-error
import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";
import svgToDataUri from "mini-svg-data-uri";

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
  addBase({ ":root": newVars });
}

const config: Config = {
  // No dark mode
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border:     "hsl(var(--border))",
        glass: {
          border: "var(--glass-border)",
          bg:     "var(--glass-bg)",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT:    "#FF7A00",
          glow:       "#FFA64D",
          foreground: "#FFFFFF",
          hover:      "#EA580C",
        },
        accent: {
          blue: "#3B82F6",
          warm: "#D97706",
          sage: "#65A30D",
        },
        // Warm neutral palette
        parchment: {
          50:  "#FDFBF6",
          100: "#FAF7F0",
          200: "#F2EBD8",
          300: "#E8DCC5",
          400: "#D8C8A8",
          500: "#C4AC82",
          600: "#A88B5C",
          700: "#8A6D3D",
          800: "#6B5028",
          900: "#4A3418",
        },
        espresso: {
          50:  "#F7F0E8",
          100: "#EBD9C0",
          900: "#251E17",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        serif:   ["var(--font-cormorant)", "Georgia", "serif"],
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        mono:    ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        "display-2xl": ["5rem",   { lineHeight: "1.0", letterSpacing: "-0.035em" }],
        "display-xl":  ["4rem",   { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg":  ["3rem",   { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display-md":  ["2.25rem",{ lineHeight: "1.1",  letterSpacing: "-0.02em" }],
        "display-sm":  ["1.75rem",{ lineHeight: "1.15", letterSpacing: "-0.015em" }],
      },
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 1px)",
        sm:   "calc(var(--radius) - 2px)",
        xl:   "calc(var(--radius) + 4px)",
        "2xl":"calc(var(--radius) + 8px)",
        "3xl":"calc(var(--radius) + 14px)",
        "4xl":"calc(var(--radius) + 22px)",
      },
      boxShadow: {
        warm:    "0 4px 24px -8px rgba(150, 110, 60, 0.12), 0 1px 4px -2px rgba(150, 110, 60, 0.06)",
        "warm-lg": "0 16px 56px -16px rgba(150, 110, 60, 0.18), 0 4px 16px -6px rgba(150, 110, 60, 0.10)",
        "orange": "0 8px 32px -8px rgba(255, 122, 0, 0.30)",
        "orange-lg": "0 20px 60px -16px rgba(255, 122, 0, 0.40)",
        "inset-warm": "inset 0 1px 0 rgba(255, 255, 255, 0.60)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%":      { transform: "translate(10px, -14px) scale(1.04)" },
          "66%":      { transform: "translate(-8px, 8px) scale(0.97)" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-right": {
          "0%":   { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
        "number-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float:         "float 14s ease-in-out infinite",
        "float-slow":  "float 18s ease-in-out infinite reverse",
        "fade-up":     "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in":     "fade-in 0.4s ease-out forwards",
        "slide-right": "slide-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    addVariablesForColors,
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "bg-dot": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" cx="10" cy="10" r="1.5"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
  ],
};

export default config;
