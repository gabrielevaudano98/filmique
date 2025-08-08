export interface FilterPreset {
  brightness?: number; // 1 = normal
  contrast?: number;   // 1 = normal
  saturate?: number;   // 1 = normal
  grayscale?: number;  // 0 to 1
  sepia?: number;      // 0 to 1
  hueRotate?: number;  // 0 to 360 deg
  grain?: number;      // 0 to 100
  vignette?: number;   // 0 to 1
}

export const filmPresets: { [key: string]: FilterPreset } = {
  // --- COLOR FILMS ---
  'Kodak Gold 200': {
    brightness: 1.05,
    contrast: 1.05,
    saturate: 1.1,
    sepia: 0.05, // Adds warmth
    hueRotate: -2, // Slight shift towards yellow
    grain: 8,
    vignette: 0.1,
  },
  'Kodak Portra 400': {
    brightness: 1.02,
    contrast: 0.95, // Lower contrast for portraits
    saturate: 1.05,
    sepia: 0.03, // Subtle warmth for skin tones
    grain: 10,
  },
  'Kodak Ektar 100': {
    brightness: 1.0,
    contrast: 1.15,
    saturate: 1.25, // Very vibrant colors
    grain: 5, // Very fine grain
    vignette: 0.05,
  },
  'Fujifilm Superia 400': {
    brightness: 1.0,
    contrast: 1.1,
    saturate: 1.15,
    hueRotate: 5, // Pushes towards greens/cyans
    grain: 12,
  },
  'Fujifilm Velvia 50': {
    brightness: 0.98,
    contrast: 1.25, // High contrast slide film
    saturate: 1.3,  // Very high saturation
    grain: 4,
    vignette: 0.1,
  },
  'Cinestill 800T': {
    brightness: 1.1,
    contrast: 1.1,
    saturate: 1.2,
    hueRotate: -10, // Strong blue/cool shift for tungsten balance
    grain: 18,
    vignette: 0.1,
  },
  'Agfa Vista 200': {
    brightness: 1.08,
    contrast: 1.05,
    saturate: 1.25, // Known for vibrant reds
    hueRotate: 2, // Slight red push
    grain: 9,
  },
  'LomoChrome Purple': {
    brightness: 1.1,
    contrast: 1.1,
    saturate: 1.3,
    hueRotate: 280, // Dramatic color shift to purple
    grain: 15,
    vignette: 0.2,
  },

  // --- BLACK & WHITE FILMS ---
  'Ilford HP5 Plus': {
    grayscale: 1,
    contrast: 1.2,
    brightness: 1.05,
    grain: 15,
    vignette: 0.15,
  },
  'Kodak Tri-X 400': {
    grayscale: 1,
    contrast: 1.4, // Classic high contrast
    brightness: 1.0,
    grain: 20, // Gritty, noticeable grain
    vignette: 0.2,
  },
  'Ilford Delta 3200': {
    grayscale: 1,
    contrast: 1.5,
    brightness: 1.1, // Pushed look
    grain: 35, // Very prominent grain
    vignette: 0.25,
  },
  'Fomapan 100 Classic': {
    grayscale: 1,
    contrast: 1.1,
    brightness: 1.0,
    sepia: 0.1, // A slight warm/brown tone
    grain: 8,
    vignette: 0.1,
  },

  'default': {}
};