const TARGET_LONG_EDGE = 1920;
const THUMB_LONG_EDGE = 400;

self.onmessage = async (event: MessageEvent<{ imageBlob: Blob }>) => {
  const { imageBlob } = event.data;

  try {
    const bitmap = await createImageBitmap(imageBlob);

    const process = async (longEdge: number, quality: number) => {
      const { width, height } = bitmap;
      const scale = longEdge / Math.max(width, height);
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);

      const canvas = new OffscreenCanvas(newWidth, newHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get OffscreenCanvas context');
      
      ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
      return await canvas.convertToBlob({ type: 'image/jpeg', quality });
    };

    const [fullBlob, thumbBlob] = await Promise.all([
      process(TARGET_LONG_EDGE, 0.85),
      process(THUMB_LONG_EDGE, 0.75),
    ]);

    self.postMessage({
      status: 'success',
      fullBlob,
      thumbBlob,
      width: TARGET_LONG_EDGE, // Simplified width/height for now
      height: TARGET_LONG_EDGE,
    });

  } catch (error) {
    self.postMessage({ status: 'error', message: error.message });
  }
};