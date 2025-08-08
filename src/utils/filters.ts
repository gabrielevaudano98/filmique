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
  'default': {}
};