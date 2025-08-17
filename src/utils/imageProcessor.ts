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

export async function applyFilterAndCompress(
  imageUrl: string, 
  preset: FilmPreset,
  quality: number = 0.85 // High quality JPEG
): Promise<Blob> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  
  // Apply filters (simplified for brevity, a full implementation would go here)
  ctx.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas to Blob conversion failed'));
      }
    }, 'image/jpeg', quality);
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