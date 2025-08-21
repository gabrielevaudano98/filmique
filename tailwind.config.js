/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral scale
        'neutral-900': '#060608',
        'neutral-800': '#0f1113',
        'neutral-700': '#1b1d20',
        'neutral-600': '#2a2d31',
        'neutral-400': '#9aa0a6',
        'neutral-300': '#c6c9cd',
        'neutral-100': '#f7f7f8',

        // Warm palette (reference-inspired)
        'warm-900': '#2b0f06',
        'warm-800': '#3a190a',
        'warm-700': '#5a2b12',
        'warm-600': '#7a3e19',
        'warm-500': '#a65a2b',
        'warm-400': '#d78657',
        'warm-300': '#f0c6ab',

        // Brand amber gradient stops
        'brand-amber-start': '#F6AE55',
        'brand-amber-mid': '#E98A43',
        'brand-amber-end': '#D46A2E',

        // Accent colors
        'accent-violet': '#7C6AFE',
        'accent-teal': '#2FD1B0',
        'accent-coral': '#FF6B6B',

        // Glass tokens
        'glass-thin': 'rgba(255,255,255,0.06)',
        'glass-medium': 'rgba(255,255,255,0.10)',
        'glass-dark': 'rgba(6,6,8,0.64)',

        // Semantic
        'brand-bg': '#060608',
        'brand-surface': 'rgba(28, 28, 32, 0.7)',
        'brand-border': 'rgba(65, 53, 76, 0.5)'
      },
      fontFamily: {
        sans: ['"SF Pro Display"', 'Inter', 'system-ui'],
        ui: ['"SF Pro Text"', 'Inter', 'system-ui'],
        mono: ['"SF Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo']
      },
      boxShadow: {
        'micro': '0 1px 2px rgba(6,6,8,0.24)',
        'soft': '0 6px 18px rgba(11,11,12,0.28)',
        'depth': '0 24px 60px rgba(6,6,8,0.46)'
      },
      borderRadius: {
        'card': '16px',
        'lg': '12px',
        'pill': '9999px'
      },
      transitionTimingFunction: {
        'spring-soft': 'cubic-bezier(0.20, 1.0, 0.35, 1.0)',
        'quick': 'cubic-bezier(0.25, 0.9, 0.4, 1)'
      },
      spacing: {
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
        'safe-r': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
}