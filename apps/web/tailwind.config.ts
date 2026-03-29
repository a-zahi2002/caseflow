import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ["class"],
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
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          light: "var(--brand-light)",
          text: "var(--brand-text)",
        },
        reward: {
          DEFAULT: "var(--reward)",
          light: "var(--reward-light)",
          text: "var(--reward-text)",
        },
        surface: {
          page: "var(--surface-page)",
          card: "var(--surface-card)",
          subtle: "var(--surface-subtle)",
          muted: "var(--surface-muted)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
          brand: "var(--border-brand)",
        },
        /* Shadcn UI compatibility mapping */
        background: "var(--surface-page)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--brand)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--reward)",
          foreground: "var(--reward-text)",
        },
        muted: {
          DEFAULT: "var(--surface-subtle)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--surface-subtle)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
        brand: "var(--shadow-brand)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

