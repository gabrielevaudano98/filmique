/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#4a4258', // Dark Purple
        'brand-brown': {
          light: '#697098', // Muted Blue
          dark: '#3c354a', // Darker Purple
        },
        'brand-orange': {
          DEFAULT: '#f56a00', // Orange
          start: '#f56a00', // Orange
          end: '#a85c48', // Brown
        },
        'brand-border': '#697098', // Muted Blue
      },
      fontFamily: {
        sans: ['SF Pro Display', 'sans-serif'],
      },
    },
  },
  plugins: [],
}