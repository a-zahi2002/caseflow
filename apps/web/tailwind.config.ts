import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
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
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        /* Stitch Design System - M3 Colors */
        primary: {
          DEFAULT: "#00685f",
          foreground: "#ffffff",
          container: "#008378",
          "on-container": "#f4fffc",
          fixed: "#89f5e7",
          "fixed-dim": "#6bd8cb",
          "on-fixed-variant": "#005049",
        },
        secondary: {
          DEFAULT: "#855300",
          foreground: "#ffffff",
          container: "#fea619",
          "on-container": "#684000",
          fixed: "#ffddb8",
          "fixed-dim": "#ffb95f",
          "on-fixed-variant": "#653e00",
        },
        tertiary: {
          DEFAULT: "#006947",
          foreground: "#ffffff",
          container: "#00855b",
          "on-container": "#f5fff6",
          fixed: "#6ffbbe",
          "fixed-dim": "#4edea3",
          "on-fixed": "#002113",
          "on-fixed-variant": "#005236",
        },
        error: {
          DEFAULT: "#ba1a1a",
          foreground: "#ffffff",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        surface: {
          DEFAULT: "#f9f9f8",
          "on-surface": "#1a1c1c",
          variant: "#e2e2e2",
          "on-variant": "#3d4947",
          dim: "#dadad9",
          bright: "#f9f9f8",
          container: {
            lowest: "#ffffff",
            low: "#f3f4f3",
            DEFAULT: "#eeeeed",
            high: "#e8e8e7",
            highest: "#e2e2e2",
          },
          tint: "#006a61",
        },
        outline: {
          DEFAULT: "#6d7a77",
          variant: "#bcc9c6",
        },
        inverse: {
          surface: "#2f3130",
          "on-surface": "#f1f1f0",
          primary: "#6bd8cb",
        },
        /* Legacy compatibility */
        brand: {
          DEFAULT: "#00685f",
          hover: "#005049",
          light: "#89f5e7",
          text: "#00201d",
        },
        reward: {
          DEFAULT: "#855300",
          light: "#ffddb8",
          text: "#653e00",
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        heading: ['var(--font-heading)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        md: "0.375rem",
        sm: "0.25rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        hover: "0 4px 12px rgba(0,0,0,0.10)",
        brand: "0 0 0 3px rgba(0,104,95,0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

