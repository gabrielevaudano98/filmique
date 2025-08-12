/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0c0c0f',
        'brand-purple-dark': '#41354c',
        'brand-blue-muted': '#566293',
        'brand-beige-smoky': '#b5aaac',
        'brand-bg': '#0c0c0f', // Main background
        'brand-surface': 'rgba(28, 28, 32, 0.7)', // Semi-transparent surface for cards
        'brand-orange': {
          DEFAULT: '#d46a2e',
          start: '#e98a43',
          end: '#d46a2e',
        },
        'brand-border': 'rgba(65, 53, 76, 0.5)', // Semi-transparent border
      },
      fontFamily: {
        sans: ['SF Pro Display', 'sans-serif'],
      },
    },
  },
  plugins: [],
}