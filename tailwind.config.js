/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand gradients / accents
        'brand-primary-1': '#EFA15A',
        'brand-primary-2': '#D46A2E',
        'brand-alt-1': '#8B6AD6',
        'brand-alt-2': '#5B47C9',

        // Semantic
        'success': '#34D399',
        'error': '#FB7185',
        'warning': '#FBBF24',
        'info': '#60A5FA',

        // Neutrals
        'brand-bg': '#07070a',
        'brand-surface': 'rgba(255,255,255,0.03)',
        'muted': '#9ea3ad',
        'text-100': '#ffffff'
      },
      boxShadow: {
        'brand-elev-1': '0 6px 18px rgba(7,8,11,0.36)',
        'brand-elev-2': '0 12px 36px rgba(7,8,11,0.46)',
      },
      borderRadius: {
        'md': '12px',
        'lg': '18px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}