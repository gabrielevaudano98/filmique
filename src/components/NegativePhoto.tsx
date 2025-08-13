import React, { useRef, useEffect } from 'react';

interface NegativePhotoProps {
  src: string;
  className?: string;
}

const NegativePhoto: React.FC<NegativePhotoProps> = ({ src, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Apply a blur to obscure details, creating anticipation
      ctx.filter = 'blur(3px)';
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none'; // Reset filter before pixel manipulation

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Constants for a more authentic, dark, and obscure negative effect
      const ORANGE_MASK_R = 1.0;
      const ORANGE_MASK_G = 0.6;
      const ORANGE_MASK_B = 0.25;
      const OVERALL_DARKNESS = 0.6; // Make it darker
      const CONTRAST_MIN = 50;      // Crush blacks more
      const CONTRAST_MAX = 190;     // Crush whites more
      const GRAIN_AMOUNT = 35;      // Slightly more grain

      for (let i = 0; i < data.length; i += 4) {
        // 1. Invert colors
        let r = 255 - data[i];
        let g = 255 - data[i + 1];
        let b = 255 - data[i + 2];

        // 2. Reduce contrast to make it look flatter and less detailed
        r = CONTRAST_MIN + (r / 255) * (CONTRAST_MAX - CONTRAST_MIN);
        g = CONTRAST_MIN + (g / 255) * (CONTRAST_MAX - CONTRAST_MIN);
        b = CONTRAST_MIN + (b / 255) * (CONTRAST_MAX - CONTRAST_MIN);

        // 3. Apply the strong orange mask
        r *= ORANGE_MASK_R;
        g *= ORANGE_MASK_G;
        b *= ORANGE_MASK_B;

        // 4. Add grain
        const grain = (Math.random() - 0.5) * GRAIN_AMOUNT;
        r += grain;
        g += grain;
        b += grain;

        // 5. Apply overall darkness and clamp values to 0-255 range
        data[i] = Math.max(0, Math.min(255, r * OVERALL_DARKNESS));
        data[i + 1] = Math.max(0, Math.min(255, g * OVERALL_DARKNESS));
        data[i + 2] = Math.max(0, Math.min(255, b * OVERALL_DARKNESS));
      }

      ctx.putImageData(imageData, 0, 0);
    };
    
    const url = new URL(src);
    url.searchParams.set('t', new Date().getTime().toString());
    img.src = url.toString();

  }, [src]);

  return <canvas ref={canvasRef} className={className} />;
};

export default NegativePhoto;