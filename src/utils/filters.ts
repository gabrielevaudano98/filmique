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

export interface FilmStock {
  name: string;
  unlocked: boolean;
  price: number;
  capacity: number;
  preset: FilterPreset;
}

// Helper for translation
const t = (p: {ev?:number, wbK?:number, tint?:number, contrast?:number, saturation?:number, grain?:{amt:number}, vignette?:{ev:number}, bw?:{enable:boolean}}) => ({
  brightness: 1 + (p.ev || 0) * 0.05,
  contrast: 1 + (p.contrast || 0) / 100,
  saturate: 1 + (p.saturation || 0) / 100,
  sepia: p.wbK && p.wbK > 0 ? p.wbK / 2000 : 0,
  hueRotate: p.tint || 0,
  grain: p.grain?.amt || 0,
  vignette: p.vignette ? Math.abs(p.vignette.ev) : 0,
  grayscale: p.bw?.enable ? 1 : 0,
});

export const filmStockCategories: { [category: string]: FilmStock[] } = {
  "Color Negative": [
    { name: "Kodak Portra 160", unlocked: true, price: 2, capacity: 36, preset: t({ ev: 0, wbK: 200, tint: 3, contrast: -5, saturation: -5, grain: { amt: 18 }, vignette: { ev: -0.3 } }) },
    { name: "Kodak Portra 400", unlocked: true, price: 3, capacity: 36, preset: t({ ev: 0, wbK: 150, tint: 2, contrast: 5, saturation: -3, grain: { amt: 24 }, vignette: { ev: -0.35 } }) },
    { name: "Kodak Portra 800", unlocked: true, price: 4, capacity: 36, preset: t({ ev: 0.1, wbK: 100, tint: 4, contrast: 8, saturation: -6, grain: { amt: 38 }, vignette: { ev: -0.4 } }) },
    { name: "Kodak Ektar 100", unlocked: true, price: 3, capacity: 36, preset: t({ ev: 0, wbK: 50, tint: 0, contrast: 12, saturation: 18, grain: { amt: 10 }, vignette: { ev: -0.25 } }) },
    { name: "Fujifilm 400H (Pastel)", unlocked: true, price: 3, capacity: 36, preset: t({ ev: 0, wbK: -100, tint: 6, contrast: -4, saturation: -8, grain: { amt: 22 }, vignette: { ev: -0.3 } }) },
    { name: "Fuji Superia X-TRA 400", unlocked: true, price: 2, capacity: 36, preset: t({ ev: 0, wbK: -50, tint: 5, contrast: 6, saturation: 8, grain: { amt: 26 }, vignette: { ev: -0.35 } }) },
    { name: "Fuji Natura 1600", unlocked: true, price: 5, capacity: 36, preset: t({ ev: 0.1, wbK: -100, tint: 8, contrast: 12, saturation: -2, grain: { amt: 58 }, vignette: { ev: -0.45 } }) },
    { name: "Agfa Vista 200", unlocked: true, price: 2, capacity: 24, preset: t({ ev: 0, wbK: 120, tint: 0, contrast: 10, saturation: 10, grain: { amt: 16 }, vignette: { ev: -0.3 } }) },
    { name: "Lomography Color 800", unlocked: true, price: 4, capacity: 36, preset: t({ ev: 0, wbK: 80, tint: -2, contrast: 10, saturation: 12, grain: { amt: 44 }, vignette: { ev: -0.55 } }) },
  ],
  "Slide (E-6)": [
    { name: "Fuji Velvia 50", unlocked: true, price: 4, capacity: 24, preset: t({ ev: -0.1, wbK: 60, tint: 2, contrast: 18, saturation: 28, grain: { amt: 6 }, vignette: { ev: -0.25 } }) },
    { name: "Fuji Velvia 100", unlocked: true, price: 4, capacity: 36, preset: t({ ev: 0, wbK: 40, tint: 2, contrast: 16, saturation: 24, grain: { amt: 8 }, vignette: { ev: -0.25 } }) },
    { name: "Fuji Provia 100F", unlocked: true, price: 3, capacity: 36, preset: t({ ev: 0, wbK: 20, tint: 0, contrast: 12, saturation: 10, grain: { amt: 8 }, vignette: { ev: -0.25 } }) },
    { name: "Fuji Astia 100F", unlocked: true, price: 3, capacity: 36, preset: t({ ev: 0.1, wbK: 80, tint: 2, contrast: 2, saturation: 4, grain: { amt: 8 }, vignette: { ev: -0.25 } }) },
    { name: "Kodak Ektachrome E100", unlocked: true, price: 3, capacity: 36, preset: t({ ev: 0, wbK: 10, tint: 0, contrast: 14, saturation: 12, grain: { amt: 8 }, vignette: { ev: -0.25 } }) },
    { name: "Kodachrome 64 (Emulation)", unlocked: true, price: 4, capacity: 36, preset: t({ ev: -0.05, wbK: 120, tint: 2, contrast: 16, saturation: 16, grain: { amt: 10 }, vignette: { ev: -0.25 } }) },
  ],
  "Cine & Special": [
    { name: "Kodak Vision3 50D", unlocked: true, price: 5, capacity: 36, preset: t({ ev: 0, wbK: 0, tint: 0, contrast: 4, saturation: 4, grain: { amt: 6 }, vignette: { ev: -0.2 } }) },
    { name: "Kodak Vision3 250D", unlocked: true, price: 5, capacity: 36, preset: t({ ev: 0, wbK: 20, tint: 2, contrast: 6, saturation: 6, grain: { amt: 12 }, vignette: { ev: -0.25 } }) },
    { name: "Kodak Vision3 500T", unlocked: true, price: 6, capacity: 36, preset: t({ ev: 0, wbK: 1800, tint: 6, contrast: 6, saturation: -2, grain: { amt: 26 }, vignette: { ev: -0.3 } }) },
    { name: "Cinestill 800T", unlocked: true, price: 6, capacity: 36, preset: t({ ev: 0, wbK: 1500, tint: 8, contrast: 10, saturation: -4, grain: { amt: 36 }, vignette: { ev: -0.35 } }) },
    { name: "Cinestill 50D", unlocked: true, price: 5, capacity: 36, preset: t({ ev: 0, wbK: 60, tint: 0, contrast: 8, saturation: 6, grain: { amt: 8 }, vignette: { ev: -0.2 } }) },
    { name: "Bleach Bypass", unlocked: true, price: 2, capacity: 24, preset: t({ ev: 0, wbK: 0, tint: 0, contrast: 24, saturation: -40, grain: { amt: 30 }, vignette: { ev: -0.3 } }) },
    { name: "Cross-Processed", unlocked: true, price: 2, capacity: 24, preset: t({ ev: -0.1, wbK: -200, tint: 10, contrast: 22, saturation: 18, grain: { amt: 20 }, vignette: { ev: -0.35 } }) },
  ],
  "Black & White": [
    { name: "Kodak Tri-X 400", unlocked: true, price: 3, capacity: 36, preset: t({ bw: { enable: true }, contrast: 12, grain: { amt: 38 }, vignette: { ev: -0.25 } }) },
    { name: "Kodak T-MAX 100", unlocked: true, price: 3, capacity: 36, preset: t({ bw: { enable: true }, contrast: 8, grain: { amt: 8 }, vignette: { ev: -0.25 } }) },
    { name: "Kodak T-MAX P3200", unlocked: true, price: 4, capacity: 36, preset: t({ bw: { enable: true }, contrast: 18, grain: { amt: 64 }, vignette: { ev: -0.35 } }) },
    { name: "Ilford HP5+ 400", unlocked: true, price: 3, capacity: 36, preset: t({ bw: { enable: true }, contrast: 10, grain: { amt: 30 }, vignette: { ev: -0.25 } }) },
    { name: "Ilford FP4+ 125", unlocked: true, price: 3, capacity: 24, preset: t({ bw: { enable: true }, contrast: 10, grain: { amt: 16 }, vignette: { ev: -0.25 } }) },
    { name: "Ilford Delta 3200", unlocked: true, price: 4, capacity: 36, preset: t({ bw: { enable: true }, contrast: 16, grain: { amt: 68 }, vignette: { ev: -0.35 } }) },
    { name: "Fomapan 100 Classic", unlocked: true, price: 2, capacity: 36, preset: t({ bw: { enable: true }, contrast: 12, grain: { amt: 22 }, vignette: { ev: -0.25 } }) },
    { name: "Kodak Double-X 5222", unlocked: true, price: 4, capacity: 36, preset: t({ bw: { enable: true }, contrast: 8, grain: { amt: 28 }, vignette: { ev: -0.25 } }) },
  ],
  "Creative Color": [
    { name: "LomoChrome Purple", unlocked: true, price: 4, capacity: 24, preset: t({ ev: 0, wbK: 80, tint: 4, contrast: 6, saturation: 14, grain: { amt: 30 }, vignette: { ev: -0.4 } }) },
    { name: "LomoChrome Turquoise", unlocked: true, price: 4, capacity: 24, preset: t({ ev: 0, wbK: 120, tint: 2, contrast: 8, saturation: 10, grain: { amt: 26 }, vignette: { ev: -0.35 } }) },
    { name: "Lomo Metropolis", unlocked: true, price: 4, capacity: 24, preset: t({ ev: 0, wbK: -100, tint: 6, contrast: 16, saturation: -30, grain: { amt: 40 }, vignette: { ev: -0.45 } }) },
    { name: "Polaroid 600 Color", unlocked: true, price: 5, capacity: 8, preset: t({ ev: 0.2, wbK: 250, tint: 4, contrast: -6, saturation: 6, grain: { amt: 20 }, vignette: { ev: -0.5 } }) },
  ],
};