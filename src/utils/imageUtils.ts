export const cmToPixels = (cm: number, dpi: number): number => {
  return Math.round((cm / 2.54) * dpi);
};

export const TARGET_LONG_EDGE_PX = cmToPixels(45, 300); // Approximately 5315 pixels