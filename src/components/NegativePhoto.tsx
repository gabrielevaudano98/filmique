import React, { useRef, useEffect } from 'react';
import { getPhotoAsBase64 } from '../utils/fileStorage';

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

      ctx.filter = 'blur(3px)';
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const ORANGE_MASK_R = 1.0;
      const ORANGE_MASK_G = 0.6;
      const ORANGE_MASK_B = 0.25;
      const OVERALL_DARKNESS = 0.6;
      const CONTRAST_MIN = 50;
      const CONTRAST_MAX = 190;
      const GRAIN_AMOUNT = 35;

      for (let i = 0; i < data.length; i += 4) {
        let r = 255 - data[i];
        let g = 255 - data[i + 1];
        let b = 255 - data[i + 2];

        r = CONTRAST_MIN + (r / 255) * (CONTRAST_MAX - CONTRAST_MIN);
        g = CONTRAST_MIN + (g / 255) * (CONTRAST_MAX - CONTRAST_MIN);
        b = CONTRAST_MIN + (b / 255) * (CONTRAST_MAX - CONTRAST_MIN);

        r *= ORANGE_MASK_R;
        g *= ORANGE_MASK_G;
        b *= ORANGE_MASK_B;

        const grain = (Math.random() - 0.5) * GRAIN_AMOUNT;
        r += grain;
        g += grain;
        b += grain;

        data[i] = Math.max(0, Math.min(255, r * OVERALL_DARKNESS));
        data[i + 1] = Math.max(0, Math.min(255, g * OVERALL_DARKNESS));
        data[i + 2] = Math.max(0, Math.min(255, b * OVERALL_DARKNESS));
      }

      ctx.putImageData(imageData, 0, 0);
    };
    
    const loadImage = async () => {
      if (src.startsWith('capacitor://')) {
        img.src = await getPhotoAsBase64(src);
      } else {
        const url = new URL(src);
        url.searchParams.set('t', new Date().getTime().toString());
        img.src = url.toString();
      }
    };

    loadImage();

  }, [src]);

  return <canvas ref={canvasRef} className={className} />;
};

export default NegativePhoto;