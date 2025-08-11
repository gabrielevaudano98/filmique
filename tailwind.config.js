/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#1c130c',
        'brand-brown': {
          light: '#4a2a13',
          dark: '#2a2018',
        },
        'brand-orange': {
          DEFAULT: '#d46a2e',
          start: '#e98a43',
          end: '#d46a2e',
        },
        'brand-border': '#4a3b30',
      },
      fontFamily: {
        sans: ['SF Pro Display', 'sans-serif'],
      },
    },
  },
  plugins: [],
}