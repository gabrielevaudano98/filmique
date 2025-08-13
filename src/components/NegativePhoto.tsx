import React, { useRef, useEffect } from 'react';

interface NegativePhotoProps {
  src: string;
  className?: string;
}

/**
 * NegativePhoto
 *
 * This renderer loads an image (CORS enabled), draws it to a canvas,
 * then emulates a scanned color negative -> print conversion tuned to the
 * supplied example:
 *
 * - Invert (negative) then apply an S-curve tone mapping.
 * - Push midtones into a warm orange-brown film base.
 * - Shift shadows toward teal/blue for that classic negative look.
 * - Apply multi-scale grain (coarse + fine) for a scanned texture.
 * - Add subtle dust and thin scratches.
 * - Paint a warm, thin film-edge stroke.
 *
 * The implementation is intentionally single-file and synchronous (runs on the UI thread).
 * If you need higher throughput for many images, we can move this into a Web Worker later.
 */
const NegativePhoto: React.FC<NegativePhotoProps> = ({ src, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // helpers
  const clamp = (v: number) => Math.max(0, Math.min(255, v));

  // Soft S-curve; amount in [0..1]
  function applySCurve(v: number, amount = 0.12) {
    // normalize 0-1
    const x = v / 255;
    // basic smoothstep-ish S curve using pow
    const a = amount;
    const curved = (Math.pow(x, 1 - a) * (1 - a) + (1 - Math.pow(1 - x, 1 - a)) * a);
    return clamp(Math.round(curved * 255));
  }

  // contrast helper using simple gain around 0.5 pivot
  function adjustContrastChannel(value: number, contrast = 0.08) {
    // contrast positive = more contrast
    const f = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
    return clamp(f * (value - 128) + 128);
  }

  useEffect(() => {
    let mounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    const process = async () => {
      return new Promise<void>((resolve) => {
        img.onload = () => {
          if (!mounted) return resolve();

          // Limit size for performance but keep enough detail
          const MAX_DIM = 1400;
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (Math.max(w, h) > MAX_DIM) {
            if (w > h) {
              const ratio = h / w;
              w = MAX_DIM;
              h = Math.round(MAX_DIM * ratio);
            } else {
              const ratio = w / h;
              h = MAX_DIM;
              w = Math.round(MAX_DIM * ratio);
            }
          }

          canvas.width = w;
          canvas.height = h;

          // Draw image slightly softened to help grain blend
          ctx.clearRect(0, 0, w, h);
          ctx.filter = 'blur(0.4px)';
          ctx.drawImage(img, 0, 0, w, h);
          ctx.filter = 'none';

          // Attempt pixel manipulation; on failure, gracefully draw the original image
          try {
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;

            // Tuned parameters
            const warmthMidR = 1.22; // midtone warm push (R)
            const warmthMidG = 1.08; // G
            const warmthMidB = 0.78; // B

            // Shadow / highlight color shifts
            const shadowShift = { r: 0.85, g: 1.02, b: 1.12 }; // push shadows colder (relatively)
            const highlightDesaturate = 0.18;

            // Iterate pixels and convert negative -> print-like color
            for (let i = 0; i < data.length; i += 4) {
              // Read original sample (from the slightly blurred base)
              let r = data[i];
              let g = data[i + 1];
              let b = data[i + 2];

              // 1) Invert (negative -> positive)
              r = 255 - r;
              g = 255 - g;
              b = 255 - b;

              // 2) Apply a gentle S-curve to add film-like shoulder & toe
              r = applySCurve(r, 0.12);
              g = applySCurve(g, 0.12);
              b = applySCurve(b, 0.12);

              // 3) Contrast tweak
              r = adjustContrastChannel(r, 0.06);
              g = adjustContrastChannel(g, 0.06);
              b = adjustContrastChannel(b, 0.06);

              // 4) Compute luminance to drive tint blending
              const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
              const nl = lum / 255;

              // 5) Shadow vs midtone vs highlight color mapping:
              //    - shadows get a blue/teal boost
              //    - mids get warmed to orange/brown (film base)
              //    - highlights slightly desaturated
              const shadowMix = Math.max(0, (0.45 - nl) / 0.45); // 1 at deep shadow
              const highlightMix = Math.max(0, (nl - 0.75) / 0.25); // 1 at strong highlights
              const midMix = 1 - Math.min(1, shadowMix + highlightMix);

              // Apply shadow shift
              const sr = r * (1 - shadowMix) + r * shadowMix * shadowShift.r;
              const sg = g * (1 - shadowMix) + g * shadowMix * shadowShift.g;
              const sb = b * (1 - shadowMix) + b * shadowMix * shadowShift.b;

              // Apply midtone warmth
              const mr = sr * (1 - midMix) + sr * midMix * warmthMidR;
              const mg = sg * (1 - midMix) + sg * midMix * warmthMidG;
              const mb = sb * (1 - midMix) + sb * midMix * warmthMidB;

              // Apply highlight desaturation (mix toward average)
              const avg = (mr + mg + mb) / 3;
              const hr = mr * (1 - highlightMix) + avg * highlightMix * (1 - highlightDesaturate);
              const hg = mg * (1 - highlightMix) + avg * highlightMix * (1 - highlightDesaturate);
              const hb = mb * (1 - highlightMix) + avg * highlightMix * (1 - highlightDesaturate);

              data[i] = clamp(Math.round(hr));
              data[i + 1] = clamp(Math.round(hg));
              data[i + 2] = clamp(Math.round(hb));
              // alpha unchanged
            }

            ctx.putImageData(imageData, 0, 0);
          } catch (err) {
            // fallback - draw original if we can't access pixels
            console.warn('NegativePhoto: pixel operations failed, falling back:', err);
            ctx.drawImage(img, 0, 0, w, h);
          }

          // --- Add multi-scale grain (coarse + fine) ---
          const addGrainLayer = (strength = 0.06) => {
            const grainCanvas = document.createElement('canvas');
            grainCanvas.width = w;
            grainCanvas.height = h;
            const gctx = grainCanvas.getContext('2d')!;
            const gImg = gctx.createImageData(w, h);
            // Create per-pixel noise
            for (let i = 0; i < gImg.data.length; i += 4) {
              // Fine grain
              const fine = (Math.random() - 0.5) * 255 * strength;
              // Slight variation to avoid banding (coarse)
              const coarse = (Math.random() - 0.5) * 255 * strength * 3;
              const v = 128 + fine + coarse;
              gImg.data[i] = gImg.data[i + 1] = gImg.data[i + 2] = v;
              // alpha small - adjust by strength
              gImg.data[i + 3] = Math.round(26 * Math.min(2, strength * 3));
            }
            gctx.putImageData(gImg, 0, 0);

            // Blend using overlay-like effect
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.8;
            ctx.drawImage(grainCanvas, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
          };

          addGrainLayer(0.06); // primary grain

          // Add a second subtle coarse grain pass
          const addCoarseNoise = () => {
            const noise = document.createElement('canvas');
            noise.width = Math.max(200, Math.round(w / 6));
            noise.height = Math.max(40, Math.round(h / 20));
            const nctx = noise.getContext('2d')!;
            const ni = nctx.createImageData(noise.width, noise.height);
            for (let i = 0; i < ni.data.length; i += 4) {
              const v = 128 + (Math.random() - 0.5) * 80;
              ni.data[i] = ni.data[i + 1] = ni.data[i + 2] = v;
              ni.data[i + 3] = 24;
            }
            nctx.putImageData(ni, 0, 0);
            // Stretch and blend
            ctx.globalCompositeOperation = 'soft-light';
            ctx.globalAlpha = 0.55;
            ctx.drawImage(noise, 0, 0, w, h);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
          };

          addCoarseNoise();

          // --- Film base tint (warm) with subtle vignetting and density variation ---
          // Warm base color tuned to the sample (deep orange-brown)
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = 0.14; // base tint strength
          ctx.fillStyle = 'rgb(160,80,40)'; // warm base
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';

          // Add a subtle vertical density gradient to mimic uneven development
          const densityGrad = ctx.createLinearGradient(w * 0.15, 0, w * 0.85, 0);
          densityGrad.addColorStop(0.0, 'rgba(0,0,0,0.02)');
          densityGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
          densityGrad.addColorStop(1.0, 'rgba(0,0,0,0.03)');
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = densityGrad;
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';

          // --- Dust specks & scratches ---
          const drawScratches = () => {
            // scratches: several thin light/dark lines, mostly vertical, subtle alpha
            const scratchCount = Math.max(6, Math.round(w / 200));
            for (let s = 0; s < scratchCount; s++) {
              const x = Math.random() * w;
              const length = h * (0.4 + Math.random() * 0.8);
              const y0 = Math.random() * (h - length);
              ctx.beginPath();
              const lineWidth = Math.random() * 1.6 + 0.4;
              ctx.lineWidth = lineWidth;
              // alternate bright and dark scratches
              const isBright = Math.random() > 0.6;
              ctx.strokeStyle = isBright ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)';
              ctx.moveTo(x, y0);
              // add subtle waviness
              const segments = 6 + Math.round(Math.random() * 8);
              for (let seg = 1; seg <= segments; seg++) {
                const nx = x + (Math.random() - 0.5) * 8;
                const ny = y0 + (seg / segments) * length;
                ctx.lineTo(nx, ny);
              }
              ctx.stroke();
            }

            // dust: small round highlights & shadows
            const dustCount = Math.round((w * h) / (260 * 120)); // density scaled to image area
            for (let d = 0; d < dustCount; d++) {
              const dx = Math.random() * w;
              const dy = Math.random() * h;
              const radius = Math.random() * 1.8 + 0.6;
              const isBright = Math.random() > 0.7;
              ctx.beginPath();
              ctx.fillStyle = isBright ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)';
              ctx.arc(dx, dy, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          };

          drawScratches();

          // --- subtle vignette ---
          const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.9);
          vignette.addColorStop(0, 'rgba(0,0,0,0)');
          vignette.addColorStop(0.6, 'rgba(0,0,0,0.05)');
          vignette.addColorStop(1, 'rgba(0,0,0,0.22)');
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, w, h);

          // --- thin warm film-edge stroke (rounded) ---
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = 'rgba(160,90,40,0.18)';
          ctx.lineWidth = Math.max(1, Math.round(Math.min(w, h) * 0.007));
          const pad = Math.round(Math.min(w, h) * 0.012);
          ctx.beginPath();
          ctx.roundRect
            ? ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, Math.max(4, Math.round(Math.min(w, h) * 0.01)))
            : ctx.rect(pad, pad, w - pad * 2, h - pad * 2);
          ctx.stroke();
          ctx.restore();

          resolve();
        };

        img.onerror = (err) => {
          console.error('NegativePhoto: image load error', err);
          resolve();
        };

        // Add cache-buster so updates re-render reliably
        const url = new URL(src, window.location.href);
        url.searchParams.set('t', String(Date.now()));
        img.src = url.toString();
      });
    };

    process().catch((e) => {
      console.error('NegativePhoto processing failed', e);
    });

    return () => {
      mounted = false;
    };
  }, [src]);

  return <canvas ref={canvasRef} className={className} />;
};

export default NegativePhoto;