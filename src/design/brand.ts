/**
 * Filmique — Brand / Color System (extended)
 *
 * Added warm-brown family, card surfaces, avatar ring gradients and semantic tokens
 * inspired by the provided design reference (warm glass, stacked rounded cards).
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

  // Warm brown palette inspired by the reference image
  warm: {
    900: { hex: '#2b0f06', rgb: '43,15,6' },   // very deep espresso
    800: { hex: '#3a190a', rgb: '58,25,10' },  // deep chocolate
    700: { hex: '#5a2b12', rgb: '90,43,18' },  // warm brown
    600: { hex: '#7a3e19', rgb: '122,62,25' }, // amber-brown
    500: { hex: '#a65a2b', rgb: '166,90,43' }, // primary warm accent
    400: { hex: '#d78657', rgb: '215,134,87' },// light warm
    300: { hex: '#f0c6ab', rgb: '240,198,171' } // pale warm (used in highlights)
  },

  // Core brand (amber gradient)
  brand: {
    amberStart: { hex: '#F6AE55', rgb: '246,174,85' },
    amberMid:   { hex: '#E98A43', rgb: '233,138,67' },
    amberEnd:   { hex: '#D46A2E', rgb: '212,106,46' },
    glassSoft:  { hex: '#FFFFFF', rgb: '255,255,255' },
  },

  // Avatar / accent gradients (for rings and pill CTAs)
  accents: {
    avatarRing: {
      css: 'linear-gradient(135deg, rgba(214,106,46,1) 0%, rgba(124,106,254,0.95) 60%)',
      stops: ['#D46A2E', '#7C6AFE'],
    },
    pill: {
      css: 'linear-gradient(90deg, rgba(214,106,46,1) 0%, rgba(233,138,67,0.9) 45%, rgba(124,106,254,0.92) 100%)'
    }
  },

  // Semantic tokens used in components (extended)
  semantic: {
    bg: {
      light: { hex: '#FBFBFC', rgb: '251,251,252' },
      dark:  { hex: '#060608', rgb: '6,6,8' },
    },
    surface: {
      elevated: { hex: 'rgba(255,255,255,0.04)', rgb: '255,255,255' },
      card: { hex: 'rgba(12,7,5,0.48)', rgb: '12,7,5' }, // warm translucent card used for stacked cards
      glass: { hex: 'rgba(255,255,255,0.06)', rgb: '255,255,255' }
    },
    overlay: {
      warmGradient: { css: 'linear-gradient(180deg, rgba(58,25,10,0.92), rgba(27,29,32,0.85))' },
      softTint: { hex: 'rgba(166,90,43,0.12)', rgb: '166,90,43' }
    },
    border: {
      light: { hex: 'rgba(255,255,255,0.06)', rgb: '255,255,255' },
      dark:  { hex: 'rgba(0,0,0,0.18)', rgb: '0,0,0' },
    },
    text: {
      primary: { hex: '#FFFFFF', rgb: '255,255,255' },
      highContrast: { hex: '#FFFDFB', rgb: '255,253,251' },
      subdued: { hex: '#C7B0A3', rgb: '199,176,163' },
      accent: { hex: '#A65A2B', rgb: '166,90,43' }
    }
  },

  // Shadows & depth
  shadows: {
    micro: '0 1px 2px rgba(6,6,8,0.22)',
    soft: '0 8px 30px rgba(11,11,12,0.35)',
    depth: '0 32px 90px rgba(6,6,8,0.6)',
    innerGlow: '0 8px 24px rgba(214,106,46,0.06)' // subtle warm rim light
  },

  alpha: {
    glassThin: 'rgba(255,255,255,0.06)',
    glassMedium: 'rgba(255,255,255,0.10)',
    warmTint: 'rgba(166,90,43,0.06)'
  }
};

export type ColorSystem = typeof color;

export default color;