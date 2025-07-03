/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,vue}", "./public/**/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // DTF.ru Color Palette - Light Mode
        dtf: {
          primary: "#1a73e8",
          secondary: "#5f6368",
          accent: "#8000ff",
          orange: "#8000ff",
          red: "#ea4335",
          background: "#ffffff",
          surface: "#f8f9fa",
          "on-primary": "#ffffff",
          "on-secondary": "#ffffff",
          "on-surface": "#202124",
          "on-background": "#202124",
          border: "#e8eaed",
          "border-light": "#f1f3f4",
          hover: "#f1f3f4",
          active: "#e8f0fe",
          text: {
            primary: "#202124",
            secondary: "#5f6368",
            disabled: "#9aa0a6",
            inverse: "#ffffff",
          },
          message: {
            bubble: "#e3f2fd",
            "bubble-own": "#8000ff",
            "bubble-text": "#1565c0",
            "bubble-text-own": "#ffffff",
          },
        },
        // DTF.ru Color Palette - Dark Mode
        "dtf-dark": {
          primary: "#8ab4f8",
          secondary: "#9aa0a6",
          accent: "#bb86fc",
          orange: "#bb86fc",
          red: "#f28b82",
          background: "#202124",
          surface: "#303134",
          "on-primary": "#202124",
          "on-secondary": "#202124",
          "on-surface": "#e8eaed",
          "on-background": "#e8eaed",
          border: "#5f6368",
          "border-light": "#3c4043",
          hover: "#3c4043",
          active: "#1a73e8",
          text: {
            primary: "#e8eaed",
            secondary: "#9aa0a6",
            disabled: "#5f6368",
            inverse: "#202124",
          },
          message: {
            bubble: "#1e3a8a",
            "bubble-own": "#6b46c1",
            "bubble-text": "#bfdbfe",
            "bubble-text-own": "#ffffff",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        xs: ["12px", "16px"],
        sm: ["14px", "20px"],
        base: ["16px", "24px"],
        lg: ["18px", "28px"],
        xl: ["20px", "28px"],
        "2xl": ["24px", "32px"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        100: "25rem",
        112: "28rem",
      },
      borderRadius: {
        dtf: "8px",
        "dtf-lg": "12px",
        "dtf-xl": "16px",
      },
      boxShadow: {
        dtf: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "dtf-md": "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
        "dtf-lg":
          "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
        "dtf-popover":
          "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "fade-out": "fadeOut 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-left": "slideLeft 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "bounce-gentle": "bounceGentle 0.6s ease-in-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-gentle": "pulseGentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
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
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": {
            transform: "translateY(-5%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      transitionTimingFunction: {
        dtf: "cubic-bezier(0.4, 0, 0.2, 1)",
        "dtf-out": "cubic-bezier(0, 0, 0.2, 1)",
        "dtf-in": "cubic-bezier(0.4, 0, 1, 1)",
      },
    },
  },
  plugins: [
    function ({ addComponents, theme }) {
      addComponents({
        // DTF Button Components
        ".btn-dtf": {
          "@apply px-4 py-2 rounded-dtf font-medium transition-all duration-200":
            {},
          "@apply focus:outline-none focus:ring-2 focus:ring-offset-2": {},
          "@apply disabled:opacity-50 disabled:cursor-not-allowed": {},
        },
        ".btn-dtf-primary": {
          "@apply btn-dtf bg-dtf-primary text-dtf-on-primary": {},
          "@apply hover:bg-blue-600 focus:ring-dtf-primary": {},
          "@apply dark:bg-dtf-dark-primary dark:text-dtf-dark-on-primary": {},
          "@apply dark:hover:bg-blue-400": {},
        },
        ".btn-dtf-secondary": {
          "@apply btn-dtf bg-dtf-surface text-dtf-secondary border border-dtf-border":
            {},
          "@apply hover:bg-dtf-hover focus:ring-dtf-secondary": {},
          "@apply dark:bg-dtf-dark-surface dark:text-dtf-dark-secondary dark:border-dtf-dark-border":
            {},
          "@apply dark:hover:bg-dtf-dark-hover": {},
        },
        ".btn-dtf-accent": {
          "@apply btn-dtf bg-dtf-accent text-dtf-on-primary": {},
          "@apply hover:bg-purple-600 focus:ring-dtf-accent": {},
          "@apply dark:bg-dtf-dark-accent dark:text-dtf-dark-on-primary": {},
          "@apply dark:hover:bg-purple-400": {},
        },

        // DTF Card Components
        ".card-dtf": {
          "@apply bg-dtf-surface border border-dtf-border rounded-dtf-lg": {},
          "@apply shadow-dtf transition-shadow duration-200": {},
          "@apply dark:bg-dtf-dark-surface dark:border-dtf-dark-border": {},
        },
        ".card-dtf-hover": {
          "@apply card-dtf hover:shadow-dtf-md cursor-pointer": {},
        },

        // DTF Input Components
        ".input-dtf": {
          "@apply w-full px-3 py-2 border border-dtf-border rounded-dtf": {},
          "@apply bg-dtf-background text-dtf-text-primary placeholder-dtf-text-secondary":
            {},
          "@apply focus:outline-none focus:ring-2 focus:ring-dtf-primary focus:border-transparent":
            {},
          "@apply transition-colors duration-200": {},
          "@apply dark:bg-dtf-dark-background dark:text-dtf-dark-text-primary":
            {},
          "@apply dark:border-dtf-dark-border dark:placeholder-dtf-dark-text-secondary":
            {},
          "@apply dark:focus:ring-dtf-dark-primary": {},
        },

        // DTF Message Bubble Components
        ".message-bubble": {
          "@apply px-3 py-2 rounded-dtf max-w-xs break-words": {},
          "@apply transition-colors duration-200": {},
        },
        ".message-bubble-received": {
          "@apply message-bubble bg-dtf-message-bubble text-dtf-message-bubble-text":
            {},
          "@apply dark:bg-dtf-dark-message-bubble dark:text-dtf-dark-message-bubble-text":
            {},
        },
        ".message-bubble-sent": {
          "@apply message-bubble bg-dtf-message-bubble-own text-dtf-message-bubble-text-own":
            {},
          "@apply dark:bg-dtf-dark-message-bubble-own dark:text-dtf-dark-message-bubble-text-own":
            {},
        },

        // DTF Popover Components
        ".popover-dtf": {
          "@apply bg-dtf-background border border-dtf-border rounded-dtf-lg shadow-dtf-popover":
            {},
          "@apply animate-slide-up": {},
          "@apply dark:bg-dtf-dark-background dark:border-dtf-dark-border": {},
        },
      });
    },
  ],
};
