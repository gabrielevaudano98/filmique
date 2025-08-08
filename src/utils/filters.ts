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
  'Kodak Gold 200': {
    brightness: 1.05,
    contrast: 1.05,
    saturate: 1.1,
    grain: 8,
    vignette: 0.1,
  },
  'Kodak Portra 400': {
    brightness: 1.02,
    contrast: 0.95,
    saturate: 1.05,
    grain: 10,
  },
  'Ilford HP5 Plus': {
    grayscale: 1,
    contrast: 1.2,
    brightness: 1.05,
    grain: 15,
    vignette: 0.15,
  },
  'Kodak Tri-X 400': {
    grayscale: 1,
    contrast: 1.4,
    brightness: 1.0,
    grain: 20,
    vignette: 0.2,
  },
  'Fujifilm Superia 400': {
    brightness: 1.0,
    contrast: 1.1,
    saturate: 1.15,
    hueRotate: -5, // slight green/cyan shift
    grain: 12,
  },
  'Cinestill 800T': {
    brightness: 1.1,
    contrast: 1.1,
    saturate: 1.2,
    hueRotate: 5, // slight blue/magenta shift
    grain: 18,
    vignette: 0.1,
  },
  'Agfa Vista 200': {
    brightness: 1.08,
    contrast: 1.05,
    saturate: 1.25, // known for vibrant reds
    grain: 9,
  },
  'LomoChrome Purple': {
    brightness: 1.1,
    contrast: 1.1,
    saturate: 1.3,
    hueRotate: 280, // dramatic color shift
    grain: 15,
  },
  'default': {}
};