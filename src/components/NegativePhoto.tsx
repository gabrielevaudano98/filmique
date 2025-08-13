import React, { useRef, useEffect } from 'react';

interface NegativePhotoProps {
  src: string;
  className?: string;
}

/**
 * A small photographic negative renderer that:
 * - loads the image with CORS enabled
 * - draws it to canvas then applies:
 *   - invert color (negative)
 *   - subtle color toning toward warm film base
 *   - contrast/curve tweak to mimic film response
 *   - grain overlay
 *   - vignette
 * - draws subtle film-edge hints (thin warm border) so thumbnails read as negatives
 */
const NegativePhoto: React.FC<NegativePhotoProps> = ({ src, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Utility helpers
  const clamp = (v: number) => Math.max(0, Math.min(255, v));

  function applyContrastChannel(value: number, contrast: number) {
    // contrast in range [-1, 1]
    const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
    return clamp(factor * (value - 128) + 128);
  }

  useEffect(() => {
    let mounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    const loadAndProcess = async () => {
      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          if (!mounted) return resolve();
          const ratio = img.naturalWidth / img.naturalHeight;
          // we cap the size for performance while keeping detail
          const maxDim = 1200;
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (Math.max(w, h) > maxDim) {
            if (w > h) {
              w = maxDim;
              h = Math.round(maxDim / ratio);
            } else {
              h = maxDim;
              w = Math.round(maxDim * ratio);
            }
          }

          canvas.width = w;
          canvas.height = h;

          // Draw a slightly blurred base to create softer negative
          ctx.clearRect(0, 0, w, h);
          ctx.filter = 'blur(0.5px)'; // gentle base blur
          ctx.drawImage(img, 0, 0, w, h);
          ctx.filter = 'none';

          // Get pixel data and apply negative + film curve + warm base
          try {
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;

            // parameters tuned for a warm negative feel
            const warmthR = 1.05;
            const warmthG = 0.9;
            const warmthB = 0.7;
            const contrast = 0.10; // slight contrast lift

            for (let i = 0; i < data.length; i += 4) {
              // invert (negative)
              let r = 255 - data[i];
              let g = 255 - data[i + 1];
              let b = 255 - data[i + 2];

              // apply film-like tone curve (slight shoulder & toe)
              // soft S curve: lift highlights slightly, deepen shadows slightly
              r = applyContrastChannel(r, contrast);
              g = applyContrastChannel(g, contrast);
              b = applyContrastChannel(b, contrast);

              // apply warm mask (simulating inverted color base of film)
              r = r * warmthR;
              g = g * warmthG;
              b = b * warmthB;

              // add very small desaturation (film base)
              const avg = (r + g + b) / 3;
              r = r * 0.92 + avg * 0.08;
              g = g * 0.94 + avg * 0.06;
              b = b * 0.96 + avg * 0.04;

              // clamp
              data[i] = clamp(r);
              data[i + 1] = clamp(g);
              data[i + 2] = clamp(b);
              // preserve alpha
            }

            ctx.putImageData(imageData, 0, 0);
          } catch (err) {
            // If getImageData fails (CORS, etc.), fallback to drawing the original
            console.warn('NegativePhoto: pixel manipulation failed, drawing original:', err);
            ctx.drawImage(img, 0, 0, w, h);
          }

          // Add grain overlay
          const grainCanvas = document.createElement('canvas');
          grainCanvas.width = w;
          grainCanvas.height = h;
          const gctx = grainCanvas.getContext('2d')!;
          const gImg = gctx.createImageData(w, h);
          // grain intensity adapted to size (subtle)
          const grainAmount = Math.max(12, Math.round(Math.min(w, h) / 40));
          for (let i = 0; i < gImg.data.length; i += 4) {
            const v = (Math.random() - 0.5) * grainAmount + 128;
            gImg.data[i] = gImg.data[i + 1] = gImg.data[i + 2] = v;
            gImg.data[i + 3] = 12; // low alpha so grain is subtle
          }
          gctx.putImageData(gImg, 0, 0);
          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = 0.65;
          ctx.drawImage(grainCanvas, 0, 0);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';

          // Vignette
          const gradient = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.8);
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(0.6, 'rgba(0,0,0,0.08)');
          gradient.addColorStop(1, 'rgba(0,0,0,0.28)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);

          // Subtle warm film edge overlay - thin rounded rect stroke to suggest physical negative mount
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = 'rgba(166,90,43,0.10)'; // warm-amber subtle
          ctx.lineWidth = Math.max(1, Math.round(Math.min(w, h) * 0.006));
          const pad = Math.round(Math.min(w, h) * 0.014);
          ctx.beginPath();
          ctx.rect(pad, pad, w - pad * 2, h - pad * 2);
          ctx.stroke();
          ctx.restore();

          resolve();
        };

        img.onerror = (err) => {
          console.error('NegativePhoto: image load error', err);
          reject(err);
        };

        // append a cache-buster so updated photos re-render
        const url = new URL(src, window.location.href);
        url.searchParams.set('t', String(Date.now()));
        img.src = url.toString();
      });
    };

    loadAndProcess().catch(() => {}).finally(() => {/* nothing */});

    return () => {
      mounted = false;
    };
  }, [src]);

  return <canvas ref={canvasRef} className={className} />;
};

export default NegativePhoto;