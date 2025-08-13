export const cmToPixels = (cm: number, dpi: number): number => {
  return Math.round((cm / 2.54) * dpi);
};

// Temporarily reducing this to a common web resolution for debugging
export const TARGET_LONG_EDGE_PX = 1920;