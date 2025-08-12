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

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply effects
      for (let i = 0; i < data.length; i += 4) {
        // 1. Invert colors
        const r = 255 - data[i];
        const g = 255 - data[i + 1];
        const b = 255 - data[i + 2];

        // 2. Apply orange mask (by tinting the negative cyan/blue)
        data[i] = r * 0.8; 
        data[i + 1] = g * 0.95;
        data[i + 2] = b * 1.0; 

        // 3. Add grain
        const grain = (Math.random() - 0.5) * 25;
        data[i] = Math.max(0, Math.min(255, data[i] + grain));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
      }

      // Put the modified data back
      ctx.putImageData(imageData, 0, 0);
    };
    
    // Add a cache-busting query param to the image URL
    const url = new URL(src);
    url.searchParams.set('t', new Date().getTime().toString());
    img.src = url.toString();

  }, [src]);

  return <canvas ref={canvasRef} className={className} />;
};

export default NegativePhoto;