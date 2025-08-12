/**
 * Filmique — Brand / Color System
 *
 * Purpose:
 * - Single source of truth for colors used throughout the app.
 * - Each token includes HEX and RGB for convenience.
 *
 * Usage:
 * - Import the tokens into components or your styling system.
 * - Tailwind classes were updated to reflect the same semantic names.
 */

export const color = {
  // Neutral scaffolding (surface, text, border)
  neutral: {
    900: { hex: '#060608', rgb: '6,6,8' },
    800: { hex: '#0f1113', rgb: '15,17,19' },
    700: { hex: '#1b1d20', rgb: '27,29,32' },
    600: { hex: '#2a2d31', rgb: '42,45,49' },
    400: { hex: '#9aa0a6', rgb: '154,160,166' },
    300: { hex: '#c6c9cd', rgb: '198,201,205' },
    100: { hex: '#f7f7f8', rgb: '247,247,248' },
  },

  // Core brand (warm dynamic gradient inspired by modern iOS)
  brand: {
    amberStart: { hex: '#F6AE55', rgb: '246,174,85' }, // warm highlight
    amberMid:   { hex: '#E98A43', rgb: '233,138,67' },
    amberEnd:   { hex: '#D46A2E', rgb: '212,106,46' },
    glassSoft:  { hex: '#FFFFFF', rgb: '255,255,255' }, // used with low alpha for glass
  },

  // Accent palette (subtle supportive hues)
  accent: {
    violet:   { hex: '#7C6AFE', rgb: '124,106,254' },
    teal:     { hex: '#2FD1B0', rgb: '47,209,176' },
    pearl:    { hex: '#F3F6F8', rgb: '243,246,248' },
    coral:    { hex: '#FF6B6B', rgb: '255,107,107' },
  },

  // Semantic tokens used in components
  semantic: {
    bg: {
      light: { hex: '#FBFBFC', rgb: '251,251,252' },
      dark:  { hex: '#060608', rgb: '6,6,8' },
    },
    surface: {
      elevated: { hex: 'rgba(255,255,255,0.04)', rgb: '255,255,255' }, // use with dark glass
      card: { hex: 'rgba(255,255,255,0.06)', rgb: '255,255,255' },
    },
    border: {
      light: { hex: 'rgba(16,18,20,0.06)', rgb: '16,18,20' },
      dark:  { hex: 'rgba(255,255,255,0.06)', rgb: '255,255,255' },
    },
    text: {
      primaryLight: { hex: '#0b0b0c', rgb: '11,11,12' },
      primaryDark:  { hex: '#FFFFFF', rgb: '255,255,255' },
      muted:        { hex: '#98A0A7', rgb: '152,160,167' },
      link:         { hex: '#7C6AFE', rgb: '124,106,254' },
    },
  },

  // Gradients (compressed tokens for easy use)
  gradients: {
    sunglass: {
      css: 'linear-gradient(135deg, rgba(246,174,85,0.95) 0%, rgba(233,138,67,0.9) 45%, rgba(212,106,46,0.9) 100%)',
      stops: ['#F6AE55', '#E98A43', '#D46A2E'],
    },
    softViolet: {
      css: 'linear-gradient(120deg, rgba(124,106,254,0.9) 0%, rgba(47,209,176,0.85) 100%)',
      stops: ['#7C6AFE', '#2FD1B0'],
    },
    glassTop: {
      css: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
    }
  },

  // Shadows expressed as design tokens (use in CSS variables)
  shadows: {
    none: 'none',
    micro: '0 1px 2px rgba(6,6,8,0.24)',
    soft: '0 6px 18px rgba(11,11,12,0.28)',
    depth: '0 24px 60px rgba(6,6,8,0.46)'
  },

  // Alpha helpers (for dynamic overlays)
  alpha: {
    glassThin: 'rgba(255,255,255,0.06)',
    glassMedium: 'rgba(255,255,255,0.10)',
    glassDark: 'rgba(6,6,8,0.64)'
  }
};

export type ColorSystem = typeof color;

export default color;