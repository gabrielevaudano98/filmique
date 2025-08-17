import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve((reader.result as string).split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Saves a photo blob to the app's private data directory.
 * @param blob The image blob to save.
 * @param rollId The ID of the roll this photo belongs to.
 * @returns The filesystem URI of the saved file.
 */
export const savePhoto = async (blob: Blob, rollId: string): Promise<string> => {
  const filename = `${rollId}/${Date.now()}.jpeg`;
  const base64Data = await blobToBase64(blob);

  const savedFile = await Filesystem.writeFile({
    path: filename,
    data: base64Data,
    directory: Directory.Data, // Use private, sandboxed storage
    recursive: true, // Create the rollId directory if it doesn't exist
  });

  return savedFile.uri;
};

/**
 * Deletes a photo from the local filesystem.
 * @param path The filesystem URI of the file to delete.
 */
export const deletePhoto = async (path: string): Promise<void> => {
  await Filesystem.deleteFile({
    path,
  });
};

/**
 * Converts a filesystem URI to a web-viewable path.
 * This is necessary to display locally saved images in <img> tags.
 * @param path The filesystem URI.
 * @returns A URL string that can be used in an `src` attribute.
 */
export const getWebPath = (path: string | null | undefined): string => {
  if (!path) return '';
  return Capacitor.convertFileSrc(path);
};