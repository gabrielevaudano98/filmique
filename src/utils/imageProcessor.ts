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
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  // 1. Apply base CSS filters
  let filterString = '';
  if (preset.ev) filterString += `brightness(${1 + preset.ev * 0.1}) `;
  if (preset.contrast) filterString += `contrast(${1 + preset.contrast / 100}) `;
  if (preset.saturation) filterString += `saturate(${1 + preset.saturation / 100}) `;
  if (preset.wbK && preset.wbK > 0) filterString += `sepia(${preset.wbK / 2500}) `;
  if (preset.tint) filterString += `hue-rotate(${preset.tint}deg) `;
  if (preset.bw?.enable) filterString += `grayscale(1) `;
  
  ctx.filter = filterString.trim();
  ctx.drawImage(image, 0, 0);
  ctx.filter = 'none';

  // 2. Bloom
  if (preset.bloom && preset.bloom > 0) {
    addBloom(ctx, image, preset.bloom);
  }

  // 3. Grain
  if (preset.grain && preset.grain.amt > 0) {
    addGrain(ctx, preset.grain);
  }

  // 4. Vignette
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

function addBloom(ctx: CanvasRenderingContext2D, image: HTMLImageElement, amount: number) {
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = amount / 150;
  ctx.filter = `blur(${amount / 5}px) brightness(1.1)`;
  ctx.drawImage(image, 0, 0);
  
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