import { FilmPreset } from '../types';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

export async function applyFilter(
  imageUrl: string,
  preset: FilmPreset
): Promise<Blob> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  
  const filters = [];
  if (preset.contrast) filters.push(`contrast(${preset.contrast}%)`);
  if (preset.saturation) filters.push(`saturate(${preset.saturation}%)`);
  if (preset.ev) filters.push(`brightness(${1 + preset.ev})`);
  if (preset.bw?.enable) filters.push('grayscale(100%)');
  
  ctx.filter = filters.join(' ');
  ctx.drawImage(image, 0, 0);

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

export async function compressImage(
  blob: Blob,
  quality: number = 0.85
): Promise<Blob> {
  const imageUrl = URL.createObjectURL(blob);
  const image = await loadImage(imageUrl);
  URL.revokeObjectURL(imageUrl);

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas to Blob conversion failed'));
    }, 'image/jpeg', quality);
  });
}