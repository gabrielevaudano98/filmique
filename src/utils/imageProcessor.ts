import { FilmPreset, Grain, Vignette } from '../types';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

export async function applyFilter(imageUrl: string, preset: FilmPreset): Promise<Blob> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  
  ctx.drawImage(image, 0, 0);

  // Get image data to manipulate pixels
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // --- Pixel Manipulation Loop ---
  const ev = preset.ev || 0;
  const contrast = preset.contrast || 0;
  const saturation = preset.saturation || 0;
  const wbK = preset.wbK || 0; // Sepia-like effect
  const isBw = preset.bw?.enable || false;

  const brightnessMultiplier = Math.pow(2, ev / 2); // EV adjustment
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const saturationFactor = saturation / 100 + 1;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Brightness (EV)
    r *= brightnessMultiplier;
    g *= brightnessMultiplier;
    b *= brightnessMultiplier;

    // 2. Contrast - this is a non-linear adjustment affecting the whole tonal range
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // 3. Saturation
    if (!isBw) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + saturationFactor * (r - gray);
      g = gray + saturationFactor * (g - gray);
      b = gray + saturationFactor * (b - gray);
    }

    // 4. Color Balance / Tinting (Sepia for wbK)
    if (!isBw && wbK > 0) {
      const sepiaAmount = wbK / 6500; // Normalize wbK to a 0-1 range
      const sr = r, sg = g, sb = b;
      r = sr * (1 - (0.607 * sepiaAmount)) + sg * (0.769 * sepiaAmount) + sb * (0.189 * sepiaAmount);
      g = sr * (0.349 * sepiaAmount) + sg * (1 - (0.314 * sepiaAmount)) + sb * (0.168 * sepiaAmount);
      b = sr * (0.272 * sepiaAmount) + sg * (0.534 * sepiaAmount) + sb * (1 - (0.869 * sepiaAmount));
    }

    // 5. Black & White
    if (isBw) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = g = b = gray;
    }

    // Clamp values to the 0-255 range
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  // Put the modified data back
  ctx.putImageData(imageData, 0, 0);

  // --- Apply post-processing effects ---
  // Bloom
  if (preset.bloom && preset.bloom > 0) {
    addBloom(ctx, canvas, preset.bloom);
  }

  // Grain
  if (preset.grain && preset.grain.amt > 0) {
    addGrain(ctx, preset.grain);
  }

  // Vignette
  if (preset.vignette && preset.vignette.ev < 0) {
    addVignette(ctx, preset.vignette);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas to Blob conversion failed'));
      }
    }, 'image/jpeg', 0.92);
  });
}

function addBloom(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement | HTMLImageElement, amount: number) {
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = amount / 150;
  ctx.filter = `blur(${amount / 5}px) brightness(1.1)`;
  ctx.drawImage(source, 0, 0);
  
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;
  ctx.filter = 'none';
}

function addGrain(ctx: CanvasRenderingContext2D, grain: Grain) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const amount = grain.amt;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * amount;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

function addVignette(ctx: CanvasRenderingContext2D, vignette: Vignette) {
    const { width, height } = ctx.canvas;
    const outerRadius = Math.sqrt(width*width + height*height) / 2;
    const strength = Math.abs(vignette.ev);
    const radius = vignette.radius || 70;
    const softness = vignette.softness || 60;

    const startRadius = outerRadius * (radius / 100) * (1 - (softness / 200));
    
    const gradient = ctx.createRadialGradient(width/2, height/2, startRadius, width/2, height/2, outerRadius);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${strength})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}