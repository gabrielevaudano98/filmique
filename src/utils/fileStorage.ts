import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// Helper to read a blob and return a base64 string without the data URL prefix
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',', 2)[1];
      resolve(base64Data);
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Saves a photo blob to the device's private data directory.
 * @returns The URI of the saved file.
 */
export const savePhoto = async (blob: Blob, userId: string, rollId: string): Promise<string> => {
  const filename = `${Date.now()}.jpeg`;
  const path = `photos/${userId}/${rollId}/${filename}`;

  const base64Data = await blobToBase64(blob);

  const result = await Filesystem.writeFile({
    path,
    data: base64Data,
    directory: Directory.Data, // Private to the app, not user-visible
    recursive: true, // Create parent directories if they don't exist
  });

  return result.uri;
};

/**
 * Converts a filesystem URI to a URL that can be used in the WebView's <img> tags.
 */
export const getPhotoAsWebViewPath = (uri: string): string => {
  return Capacitor.convertFileSrc(uri);
};

/**
 * Reads a local file URI and returns its content as a base64 data URL.
 * This is necessary for components like Canvas that can't use the WebView path directly.
 */
export const getPhotoAsBase64 = async (uri: string): Promise<string> => {
  const result = await Filesystem.readFile({ path: uri });
  return `data:image/jpeg;base64,${result.data}`;
};

/**
 * Deletes an entire directory for a roll, cleaning up all its photos.
 */
export const deleteRollDirectory = async (userId: string, rollId: string): Promise<void> => {
    const path = `photos/${userId}/${rollId}`;
    try {
        await Filesystem.rmdir({
            path,
            directory: Directory.Data,
            recursive: true,
        });
    } catch (e) {
        // It's okay if the directory doesn't exist. We can ignore that error.
        if ((e as any).message !== 'Folder does not exist.') {
            console.error(`Failed to delete directory ${path}`, e);
        }
    }
};