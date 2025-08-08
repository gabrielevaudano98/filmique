import { FilterPreset } from './filters';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

export async function applyFilter(imageUrl: string, preset: FilterPreset): Promise<Blob> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  let filterString = '';
  if (preset.brightness) filterString += `brightness(${preset.brightness}) `;
  if (preset.contrast) filterString += `contrast(${preset.contrast}) `;
  if (preset.saturate) filterString += `saturate(${preset.saturate}) `;
  if (preset.grayscale) filterString += `grayscale(${preset.grayscale}) `;
  if (preset.sepia) filterString += `sepia(${preset.sepia}) `;
  if (preset.hueRotate) filterString += `hue-rotate(${preset.hueRotate}deg) `;
  
  ctx.filter = filterString.trim();
  ctx.drawImage(image, 0, 0);

  if (preset.grain && preset.grain > 0) {
    addGrain(ctx, preset.grain);
  }
  if (preset.vignette && preset.vignette > 0) {
    addVignette(ctx, preset.vignette);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas to Blob conversion failed'));
      }
    }, 'image/jpeg', 0.9);
  });
}

function addGrain(ctx: CanvasRenderingContext2D, amount: number) {
  const { width, height } = ctx.canvas;
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = width;
  grainCanvas.height = height;
  const grainCtx = grainCanvas.getContext('2d')!;

  const grainData = grainCtx.createImageData(width, height);
  const data = grainData.data;
  for (let i = 0; i < data.length; i += 4) {
    const value = (Math.random() * 255);
    data[i] = value;
    data[i+1] = value;
    data[i+2] = value;
    data[i+3] = amount * 2.55 * 0.15;
  }
  grainCtx.putImageData(grainData, 0, 0);

  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

function addVignette(ctx: CanvasRenderingContext2D, strength: number) {
    const { width, height } = ctx.canvas;
    const outerRadius = Math.sqrt(width*width + height*height) / 2;
    
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, outerRadius);
    gradient.addColorStop(0.3, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${strength * 0.7})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}