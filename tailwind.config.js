/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(215, 25%, 15%)',
        surface: 'hsl(215, 25%, 20%)',
        primary: 'hsl(210, 80%, 50%)',
        accent: 'hsl(170, 70%, 40%)',
        success: 'hsl(130, 70%, 45%)',
        warning: 'hsl(30, 70%, 50%)',
        error: 'hsl(0, 70%, 50%)',
        textPrimary: 'hsl(0, 0%, 95%)',
        textSecondary: 'hsl(0, 0%, 70%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
      },
      boxShadow: {
        'card': '0 4px 16px hsla(0, 0%, 0%, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}