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
 * Saves a photo blob to the app's private data directory. Can overwrite an existing file.
 * @param blob The image blob to save.
 * @param rollId The ID of the roll this photo belongs to.
 * @param existingUri Optional. The URI of an existing file to overwrite.
 * @returns The filesystem URI of the saved file.
 */
export const savePhoto = async (blob: Blob, rollId: string, existingUri?: string): Promise<string> => {
  const base64Data = await blobToBase64(blob);

  if (existingUri) {
    const pathSegments = existingUri.split('/files/');
    const relativePath = pathSegments.length > 1 ? pathSegments[1] : '';
    
    if (relativePath) {
      await Filesystem.writeFile({
        path: relativePath,
        data: base64Data,
        directory: Directory.Data,
      });
      return existingUri;
    }
  }

  const filename = `${rollId}/${Date.now()}.jpeg`;
  const savedFile = await Filesystem.writeFile({
    path: filename,
    data: base64Data,
    directory: Directory.Data,
    recursive: true,
  });

  return savedFile.uri;
};

/**
 * Reads a local photo file and returns it as a Blob.
 * @param path The filesystem URI of the file to read.
 * @returns A promise that resolves with the image Blob.
 */
export const readPhoto = async (path: string): Promise<Blob> => {
  const { data } = await Filesystem.readFile({ path });
  const byteCharacters = atob(data as string);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/jpeg' });
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
 * @param path The filesystem URI.
 * @returns A URL string that can be used in an `src` attribute.
 */
export const getWebPath = (path: string | null | undefined): string => {
  if (!path) return '';
  return Capacitor.convertFileSrc(path);
};