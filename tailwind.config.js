/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0EA5E9',
          light: '#E0F2FE',
          medium: '#38BDF8',
          dark: '#0284C7',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9', // slate-100
          200: '#E2E8F0', // slate-200
          300: '#CBD5E1', // slate-300
          400: '#94A3B8', // slate-400
          500: '#64748B', // slate-500
          600: '#475569', // slate-600
          700: '#334155', // slate-700
          800: '#1E293B', // slate-800
          900: '#0F172A', // slate-900
        },
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
