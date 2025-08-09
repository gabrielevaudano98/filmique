export interface Grain { amt: number; size?: number; rough?: number; chroma?: number; }
export interface Vignette { ev: number; radius?: number; softness?: number; }
export interface BW { enable: boolean; }

export interface FilmPreset {
  ev?: number;
  wbK?: number;
  tint?: number;
  contrast?: number;
  saturation?: number;
  grain?: Grain;
  bloom?: number;
  vignette?: Vignette;
  bw?: BW;
}

export interface FilmStock {
  name: string;
  unlocked: boolean;
  price: number;
  capacity: number;
  preset: FilmPreset;
}

export const filmStockCategories: { [category: string]: FilmStock[] } = {
    "Color Negative": [
        { name: "Kodak Portra 160", unlocked: true, price: 2, capacity: 36, preset: { ev: 0, wbK: 200, tint: 3, contrast: -5, saturation: -5, grain: { amt: 18 }, bloom: 6, vignette: { ev: -0.30, radius: 70, softness: 60 } } },
        { name: "Kodak Portra 400", unlocked: true, price: 3, capacity: 36, preset: { ev: 0, wbK: 150, tint: 2, contrast: 5, saturation: -3, grain: { amt: 24 }, bloom: 8, vignette: { ev: -0.35, radius: 68, softness: 60 } } },
        { name: "Kodak Portra 800", unlocked: true, price: 4, capacity: 36, preset: { ev: 0.1, wbK: 100, tint: 4, contrast: 8, saturation: -6, grain: { amt: 38 }, bloom: 10, vignette: { ev: -0.40, radius: 66, softness: 58 } } },
        { name: "Kodak Ektar 100", unlocked: true, price: 3, capacity: 36, preset: { ev: 0, wbK: 50, tint: 0, contrast: 12, saturation: 18, grain: { amt: 10 }, bloom: 4, vignette: { ev: -0.25, radius: 72, softness: 60 } } },
        { name: "Fujifilm 400H (Pastel)", unlocked: true, price: 3, capacity: 36, preset: { ev: 0, wbK: -100, tint: 6, contrast: -4, saturation: -8, grain: { amt: 22 }, bloom: 6, vignette: { ev: -0.30, radius: 70, softness: 60 } } },
        { name: "Fuji Superia X-TRA 400", unlocked: true, price: 2, capacity: 36, preset: { ev: 0, wbK: -50, tint: 5, contrast: 6, saturation: 8, grain: { amt: 26 }, bloom: 8, vignette: { ev: -0.35, radius: 65, softness: 55 } } },
        { name: "Fuji Natura 1600", unlocked: true, price: 5, capacity: 36, preset: { ev: 0.1, wbK: -100, tint: 8, contrast: 12, saturation: -2, grain: { amt: 58 }, bloom: 12, vignette: { ev: -0.45, radius: 62, softness: 55 } } },
        { name: "Agfa Vista 200", unlocked: true, price: 2, capacity: 24, preset: { ev: 0, wbK: 120, tint: 0, contrast: 10, saturation: 10, grain: { amt: 16 }, bloom: 6, vignette: { ev: -0.30, radius: 70, softness: 60 } } },
        { name: "Lomography Color 800", unlocked: true, price: 4, capacity: 36, preset: { ev: 0, wbK: 80, tint: -2, contrast: 10, saturation: 12, grain: { amt: 44 }, bloom: 10, vignette: { ev: -0.55, radius: 58, softness: 52 } } },
    ],
    "Slide (E-6)": [
        { name: "Fuji Velvia 50", unlocked: true, price: 4, capacity: 24, preset: { ev: -0.1, wbK: 60, tint: 2, contrast: 18, saturation: 28, grain: { amt: 6 }, bloom: 6, vignette: { ev: -0.25, radius: 72, softness: 62 } } },
        { name: "Fuji Velvia 100", unlocked: true, price: 4, capacity: 36, preset: { ev: 0, wbK: 40, tint: 2, contrast: 16, saturation: 24, grain: { amt: 8 }, vignette: { ev: -0.25 } } },
        { name: "Fuji Provia 100F", unlocked: true, price: 3, capacity: 36, preset: { ev: 0, wbK: 20, tint: 0, contrast: 12, saturation: 10, grain: { amt: 8 }, vignette: { ev: -0.25 } } },
        { name: "Fuji Astia 100F", unlocked: true, price: 3, capacity: 36, preset: { ev: 0.1, wbK: 80, tint: 2, contrast: 2, saturation: 4, grain: { amt: 8 }, vignette: { ev: -0.25 } } },
        { name: "Kodak Ektachrome E100", unlocked: true, price: 3, capacity: 36, preset: { ev: 0, wbK: 10, tint: 0, contrast: 14, saturation: 12, grain: { amt: 8 }, vignette: { ev: -0.25 } } },
        { name: "Kodachrome 64 (Emulation)", unlocked: true, price: 4, capacity: 36, preset: { ev: -0.05, wbK: 120, tint: 2, contrast: 16, saturation: 16, grain: { amt: 10 }, vignette: { ev: -0.25 } } },
    ],
    "Cine & Special": [
        { name: "Kodak Vision3 50D", unlocked: true, price: 5, capacity: 36, preset: { ev: 0, wbK: 0, tint: 0, contrast: 4, saturation: 4, grain: { amt: 6 }, bloom: 6, vignette: { ev: -0.2, radius: 76, softness: 68 } } },
        { name: "Kodak Vision3 250D", unlocked: true, price: 5, capacity: 36, preset: { ev: 0, wbK: 20, tint: 2, contrast: 6, saturation: 6, grain: { amt: 12 }, bloom: 8, vignette: { ev: -0.25, radius: 72, softness: 64 } } },
        { name: "Kodak Vision3 500T", unlocked: true, price: 6, capacity: 36, preset: { ev: 0, wbK: 1800, tint: 6, contrast: 6, saturation: -2, grain: { amt: 26 }, bloom: 12, vignette: { ev: -0.3, radius: 68, softness: 60 } } },
        { name: "Cinestill 800T", unlocked: true, price: 6, capacity: 36, preset: { ev: 0, wbK: 1500, tint: 8, contrast: 10, saturation: -4, grain: { amt: 36 }, bloom: 14, vignette: { ev: -0.35, radius: 66, softness: 58 } } },
        { name: "Cinestill 50D", unlocked: true, price: 5, capacity: 36, preset: { ev: 0, wbK: 60, tint: 0, contrast: 8, saturation: 6, grain: { amt: 8 }, bloom: 8, vignette: { ev: -0.2, radius: 74, softness: 66 } } },
        { name: "Bleach Bypass", unlocked: true, price: 2, capacity: 24, preset: { ev: 0, wbK: 0, tint: 0, contrast: 24, saturation: -40, grain: { amt: 30 }, bloom: 6, vignette: { ev: -0.3, radius: 68, softness: 60 } } },
        { name: "Cross-Processed", unlocked: true, price: 2, capacity: 24, preset: { ev: -0.1, wbK: -200, tint: 10, contrast: 22, saturation: 18, grain: { amt: 20 }, bloom: 8, vignette: { ev: -0.35, radius: 64, softness: 56 } } },
    ],
    "Black & White": [
        { name: "Kodak Tri-X 400", unlocked: true, price: 3, capacity: 36, preset: { bw: { enable: true }, contrast: 12, grain: { amt: 38 }, bloom: 4, vignette: { ev: -0.25, radius: 70, softness: 60 } } },
        { name: "Kodak T-MAX 100", unlocked: true, price: 3, capacity: 36, preset: { bw: { enable: true }, contrast: 8, grain: { amt: 8 }, vignette: { ev: -0.25 } } },
        { name: "Kodak T-MAX P3200", unlocked: true, price: 4, capacity: 36, preset: { bw: { enable: true }, contrast: 18, grain: { amt: 64 }, vignette: { ev: -0.35, radius: 66, softness: 56 } } },
        { name: "Ilford HP5+ 400", unlocked: true, price: 3, capacity: 36, preset: { bw: { enable: true }, contrast: 10, grain: { amt: 30 }, vignette: { ev: -0.25 } } },
        { name: "Ilford FP4+ 125", unlocked: true, price: 3, capacity: 24, preset: { bw: { enable: true }, contrast: 10, grain: { amt: 16 }, vignette: { ev: -0.25 } } },
        { name: "Ilford Delta 3200", unlocked: true, price: 4, capacity: 36, preset: { bw: { enable: true }, contrast: 16, grain: { amt: 68 }, vignette: { ev: -0.35 } } },
        { name: "Fomapan 100 Classic", unlocked: true, price: 2, capacity: 36, preset: { bw: { enable: true }, contrast: 12, grain: { amt: 22 }, vignette: { ev: -0.25 } } },
        { name: "Kodak Double-X 5222", unlocked: true, price: 4, capacity: 36, preset: { bw: { enable: true }, contrast: 8, grain: { amt: 28 }, bloom: 4, vignette: { ev: -0.25 } } },
    ],
    "Creative Color": [
        { name: "LomoChrome Purple", unlocked: true, price: 4, capacity: 24, preset: { ev: 0, wbK: 80, tint: 4, contrast: 6, saturation: 14, grain: { amt: 30 }, bloom: 10, vignette: { ev: -0.4, radius: 60, softness: 52 } } },
        { name: "LomoChrome Turquoise", unlocked: true, price: 4, capacity: 24, preset: { ev: 0, wbK: 120, tint: 2, contrast: 8, saturation: 10, grain: { amt: 26 }, bloom: 10, vignette: { ev: -0.35, radius: 62, softness: 54 } } },
        { name: "Lomo Metropolis", unlocked: true, price: 4, capacity: 24, preset: { ev: 0, wbK: -100, tint: 6, contrast: 16, saturation: -30, grain: { amt: 40 }, bloom: 8, vignette: { ev: -0.45, radius: 58, softness: 50 } } },
        { name: "Polaroid 600 Color", unlocked: true, price: 5, capacity: 8, preset: { ev: 0.2, wbK: 250, tint: 4, contrast: -6, saturation: 6, grain: { amt: 20 }, bloom: 18, vignette: { ev: -0.5, radius: 56, softness: 48 } } },
    ],
};

export const filmPresets: { [key: string]: FilmPreset } = Object.values(filmStockCategories)
  .flat()
  .reduce((acc, film) => {
    acc[film.name] = film.preset;
    return acc;
  }, {} as { [key: string]: FilmPreset });