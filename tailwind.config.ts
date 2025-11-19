import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import touchHitboxPlugin from "./lib/plugins/touch-hitbox-plugin.js";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: "var(--font-geist-sans)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        "border-primary": "hsl(var(--border-primary))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
          6: "hsl(var(--chart-6))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      cardinal: {
        DEFAULT: "#A60303",
        dark: "#5E0202",
        light: "#C42727",
      },
      ecru: {
        DEFAULT: "#F2EDE4",
        dark: "#E5DFD4",
        light: "#FAF7F0",
      },
      night: {
        DEFAULT: "#070707",
        light: "#1A1A1A",
        lighter: "#27201f",
      },
      alabaster: {
        DEFAULT: "#f6f2e6",
        dark: "#ede8d9",
        darker: "#e4dfc8",
      },
      backgroundImage: {
        "gradient-cardinal":
          "linear-gradient(135deg, #A60303 0%, #5E0202 50%, #A60303 100%)",
        "gradient-ecru": "linear-gradient(135deg, #F2EDE4 0%, #FAF7F0 100%)",
        "gradient-hero": "linear-gradient(180deg, #A60303 0%, #F2EDE4 100%)",
      },
    },
  },
  plugins: [animate, touchHitboxPlugin],
} satisfies Config;
