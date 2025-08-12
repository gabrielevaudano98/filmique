/**
 * Filmique — Typography System (iOS 26 inspired)
 *
 * This file exports a typed typography scale and usage recommendations for component developers.
 * - Primary font: SF Pro Display (system default already included in index.css)
 * - Fallbacks for web: Inter, system-ui
 */

export const typography = {
  // Font stacks
  fonts: {
    display: '"SF Pro Display", Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    ui:      '"SF Pro Text", Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    mono:    '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Segoe UI Mono", "Courier New", monospace',
  },

  // Weight mapping
  weights: {
    thin: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    heavy: 800
  },

  // Size scale (px) — mobile first, responsive considerations included
  // Name => { size, lineHeight, tracking }
  scale: {
    largeTitle: { size: 34, lineHeight: 40, weight: 700, usage: 'Primary screens, hero headings' },
    title1:     { size: 28, lineHeight: 34, weight: 700, usage: 'Section headings' },
    title2:     { size: 22, lineHeight: 28, weight: 600, usage: 'Card titles, modal headings' },
    title3:     { size: 18, lineHeight: 24, weight: 600, usage: 'Subtitles, important labels' },
    body1:      { size: 16, lineHeight: 22, weight: 400, usage: 'Primary body copy' },
    body2:      { size: 14, lineHeight: 20, weight: 400, usage: 'Secondary body copy, captions' },
    caption:    { size: 12, lineHeight: 16, weight: 400, usage: 'Tiny labels, timestamps' },
    micro:      { size: 11, lineHeight: 14, weight: 400, usage: 'UI chrome small labels' }
  },

  // Quick utility mapping for use in components
  util: {
    hero: { fontFamily: '"SF Pro Display", Inter, system-ui', fontWeight: 700, fontSize: '34px', lineHeight: '40px' },
    heading: { fontFamily: '"SF Pro Display", Inter, system-ui', fontWeight: 600, fontSize: '22px', lineHeight: '28px' },
    body: { fontFamily: '"SF Pro Text", Inter, system-ui', fontWeight: 400, fontSize: '16px', lineHeight: '22px' },
    caption: { fontFamily: '"SF Pro Text", Inter, system-ui', fontWeight: 400, fontSize: '12px', lineHeight: '16px' },
  },

  // Voice & accessibility rules (short)
  accessibility: {
    minFontSize: 11,
    recommendedContrast: '4.5:1 (WCAG AA) for body text; 3:1 for large titles',
    responsiveScale: 'Use 0.8x – 1.25x multipliers for very small/very large devices; respect user text-size settings.'
  }
};

export type Typography = typeof typography;

export default typography;