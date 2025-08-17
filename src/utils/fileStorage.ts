import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { db } from '../integrations/db';

const IS_NATIVE = Capacitor.isNativePlatform();

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
 * Saves a photo blob to the appropriate storage for the platform.
 * @returns A platform-specific path/identifier for the saved photo.
 */
export const savePhoto = async (blob: Blob, userId: string, rollId: string, photoId: string): Promise<string> => {
  if (IS_NATIVE) {
    const filename = `${photoId}.jpeg`;
    const path = `photos/${userId}/${rollId}/${filename}`;
    const base64Data = await blobToBase64(blob);
    const result = await Filesystem.writeFile({
      path,
      data: base64Data,
      directory: Directory.Data,
      recursive: true,
    });
    return result.uri;
  } else {
    // On web, we store the blob in IndexedDB.
    await db.photo_blobs.put({ photo_id: photoId, blob });
    // The "path" is simply the photo's ID, which we'll use to look it up.
    return photoId;
  }
};

/**
 * Gets a displayable URL for a photo from its local path/identifier.
 */
export const getPhotoAsWebViewPath = async (pathOrId: string): Promise<string> => {
  if (IS_NATIVE) {
    // On native, this is a synchronous conversion.
    return Capacitor.convertFileSrc(pathOrId);
  } else {
    // On web, we read from IndexedDB and create a temporary object URL.
    const record = await db.photo_blobs.get(pathOrId);
    if (record?.blob) {
      return URL.createObjectURL(record.blob);
    }
    // Return a transparent pixel as a fallback.
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
};

/**
 * Reads a local photo and returns its content as a base64 data URL.
 */
export const getPhotoAsBase64 = async (pathOrId: string): Promise<string> => {
  if (IS_NATIVE) {
    const result = await Filesystem.readFile({ path: pathOrId });
    return `data:image/jpeg;base64,${result.data}`;
  } else {
    const record = await db.photo_blobs.get(pathOrId);
    if (record?.blob) {
      const base64 = await blobToBase64(record.blob);
      return `data:image/jpeg;base64,${base64}`;
    }
    return '';
  }
};

/**
 * Deletes all local files/blobs associated with a roll.
 */
export const deleteRollDirectory = async (userId: string, rollId: string): Promise<void> => {
  if (IS_NATIVE) {
    const path = `photos/${userId}/${rollId}`;
    try {
      await Filesystem.rmdir({ path, directory: Directory.Data, recursive: true });
    } catch (e) {
      if ((e as any).message !== 'Folder does not exist.') {
        console.error(`Failed to delete directory ${path}`, e);
      }
    }
  } else {
    // On web, delete all blobs for photos belonging to this roll.
    const photosToDelete = await db.photos.where('roll_id').equals(rollId).toArray();
    const photoIds = photosToDelete.map(p => p.id);
    if (photoIds.length > 0) {
      await db.photo_blobs.bulkDelete(photoIds);
    }
  }
};