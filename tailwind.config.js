/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],

  // Enable dark mode with class strategy for manual control
  darkMode: "class",

  theme: {
    extend: {
      // DTF.ru Brand Colors
      colors: {
        // Primary DTF purple
        primary: {
          50: "#f3e8ff",
          100: "#e9d5ff",
          200: "#d9a7ff",
          300: "#c371ff",
          400: "#a855f7",
          500: "#8000ff", // Main DTF color
          600: "#7c00e6",
          700: "#6b00cc",
          800: "#5a00b3",
          900: "#4a0099",
          950: "#2a0052",
        },

        // DTF Secondary colors
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },

        // DTF Status colors
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },

        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },

        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },

        // DTF specific UI colors
        dtf: {
          // Light theme
          background: "#ffffff",
          "background-secondary": "#f8fafc",
          surface: "#ffffff",
          "surface-secondary": "#f1f5f9",
          text: "#1e293b",
          "text-secondary": "#64748b",
          "text-muted": "#94a3b8",
          border: "#e2e8f0",
          "border-secondary": "#cbd5e1",

          // Dark theme
          "dark-background": "#0f172a",
          "dark-background-secondary": "#1e293b",
          "dark-surface": "#1e293b",
          "dark-surface-secondary": "#334155",
          "dark-text": "#f8fafc",
          "dark-text-secondary": "#cbd5e1",
          "dark-text-muted": "#94a3b8",
          "dark-border": "#334155",
          "dark-border-secondary": "#475569",

          // Interactive elements
          hover: "#f1f5f9",
          "dark-hover": "#334155",
          active: "#e2e8f0",
          "dark-active": "#475569",

          // Chat specific
          "message-bg": "#f8fafc",
          "dark-message-bg": "#1e293b",
          "message-own": "#8000ff",
          "message-own-text": "#ffffff",
          "message-time": "#94a3b8",
        },
      },

      // Custom spacing for DTF components
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        sidebar: "320px",
        header: "60px",
      },

      // Custom border radius
      borderRadius: {
        dtf: "8px",
        "dtf-sm": "4px",
        "dtf-lg": "12px",
        "dtf-xl": "16px",
      },

      // Custom shadows
      boxShadow: {
        dtf: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "dtf-md":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "dtf-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "dtf-purple": "0 4px 14px 0 rgba(128, 0, 255, 0.39)",
        "dtf-purple-lg": "0 8px 25px 0 rgba(128, 0, 255, 0.3)",
      },

      // Typography
      fontFamily: {
        dtf: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        "dtf-mono": [
          "SF Mono",
          "Monaco",
          "Cascadia Code",
          "Roboto Mono",
          "monospace",
        ],
      },

      fontSize: {
        "dtf-xs": ["0.75rem", { lineHeight: "1rem" }],
        "dtf-sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "dtf-base": ["1rem", { lineHeight: "1.5rem" }],
        "dtf-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "dtf-xl": ["1.25rem", { lineHeight: "1.75rem" }],
      },

      // Animations and transitions
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "fade-out": "fadeOut 0.2s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-out": "slideOut 0.3s ease-out",
        "bounce-in": "bounceIn 0.4s ease-out",
        "pulse-purple": "pulsePurple 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        typing: "typing 1.5s steps(3, end) infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOut: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        bounceIn: {
          "0%, 20%, 40%, 60%, 80%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)",
          },
          "40%": {
            transform: "translateY(-30px)",
            animationTimingFunction: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
          },
          "60%": {
            transform: "translateY(-15px)",
            animationTimingFunction: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
          },
          "80%": {
            transform: "translateY(-4px)",
            animationTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)",
          },
          "100%": {
            transform: "translateY(0)",
          },
        },
        pulsePurple: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        shimmer: {
          "0%": {
            backgroundPosition: "-200px 0",
          },
          "100%": {
            backgroundPosition: "calc(200px + 100%) 0",
          },
        },
        typing: {
          "0%, 100%": {
            content: '""',
          },
          "33%": {
            content: '"."',
          },
          "66%": {
            content: '".."',
          },
        },
      },

      // Custom z-index values
      zIndex: {
        sidebar: "1000",
        dropdown: "1010",
        modal: "1020",
        notification: "1030",
        tooltip: "1040",
      },

      // Custom backdrop blur
      backdropBlur: {
        dtf: "8px",
      },
    },
  },

  plugins: [
    // Custom utilities plugin
    function ({ addUtilities, addComponents, theme }) {
      // Custom utilities
      addUtilities({
        ".text-balance": {
          "text-wrap": "balance",
        },
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-custom": {
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: theme("colors.dtf.border"),
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme("colors.dtf.text-muted"),
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme("colors.dtf.text-secondary"),
          },
        },
        ".dark .scrollbar-custom": {
          "&::-webkit-scrollbar-track": {
            background: theme("colors.dtf.dark-border"),
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme("colors.dtf.dark-text-muted"),
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme("colors.dtf.dark-text-secondary"),
          },
        },
      });

      // Custom components
      addComponents({
        ".btn-dtf": {
          "@apply px-4 py-2 rounded-dtf font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2":
            {},
        },
        ".btn-dtf-primary": {
          "@apply btn-dtf bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-dtf hover:shadow-dtf-md":
            {},
        },
        ".btn-dtf-secondary": {
          "@apply btn-dtf bg-dtf-surface border border-dtf-border text-dtf-text hover:bg-dtf-hover active:bg-dtf-active":
            {},
          ".dark &": {
            "@apply bg-dtf-dark-surface border-dtf-dark-border text-dtf-dark-text hover:bg-dtf-dark-hover active:bg-dtf-dark-active":
              {},
          },
        },
        ".btn-dtf-ghost": {
          "@apply btn-dtf bg-transparent text-dtf-text-secondary hover:bg-dtf-hover hover:text-dtf-text active:bg-dtf-active":
            {},
          ".dark &": {
            "@apply text-dtf-dark-text-secondary hover:bg-dtf-dark-hover hover:text-dtf-dark-text active:bg-dtf-dark-active":
              {},
          },
        },
        ".card-dtf": {
          "@apply bg-dtf-surface border border-dtf-border rounded-dtf-lg shadow-dtf":
            {},
          ".dark &": {
            "@apply bg-dtf-dark-surface border-dtf-dark-border": {},
          },
        },
        ".input-dtf": {
          "@apply w-full px-3 py-2 border border-dtf-border rounded-dtf bg-dtf-surface text-dtf-text placeholder-dtf-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200":
            {},
          ".dark &": {
            "@apply border-dtf-dark-border bg-dtf-dark-surface text-dtf-dark-text placeholder-dtf-dark-text-muted":
              {},
          },
        },
        ".message-bubble": {
          "@apply max-w-xs lg:max-w-md px-4 py-2 rounded-dtf-lg shadow-dtf": {},
        },
        ".message-bubble-received": {
          "@apply message-bubble bg-dtf-message-bg text-dtf-text": {},
          ".dark &": {
            "@apply bg-dtf-dark-message-bg text-dtf-dark-text": {},
          },
        },
        ".message-bubble-sent": {
          "@apply message-bubble bg-dtf-message-own text-dtf-message-own-text ml-auto":
            {},
        },
        ".loading-shimmer": {
          "@apply bg-gradient-to-r from-dtf-border via-dtf-background to-dtf-border bg-[length:200px_100%] animate-shimmer":
            {},
          ".dark &": {
            "@apply from-dtf-dark-border via-dtf-dark-background to-dtf-dark-border":
              {},
          },
        },
      });
    },
  ],
};
