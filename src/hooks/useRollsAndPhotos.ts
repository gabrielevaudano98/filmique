import { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as api from '../services/api';
import { UserProfile, Roll, Photo, FilmStock } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast } from '../utils/toasts';
import { extractStoragePathFromPublicUrl } from '../utils/storage';
import AvifWorkerUrl from '../avif.worker.ts?worker';
import AvifToJpegWorkerUrl from '../avif-to-jpeg.worker.ts?worker'; // New worker import
import { TARGET_LONG_EDGE_PX } from '../utils/imageUtils';

export const useRollsAndPhotos = (profile: UserProfile | null, filmStocks: FilmStock[]) => {
  const [activeRoll, setActiveRoll] = useState<Roll | null>(null);
  const [completedRolls, setCompletedRolls] = useState<Roll[]>([]);
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [rollToName, setRollToName] = useState<Roll | null>(null);

  const fetchRolls = useCallback(async () => {
    if (!profile) return;
    const { data } = await api.fetchAllRolls(profile.id);
    if (data) {
      setActiveRoll(data.find(r => !r.is_completed) || null);
      setCompletedRolls(data.filter(r => r.is_completed));
    }
  }, [profile]);

  useEffect(() => {
    fetchRolls();
  }, [fetchRolls]);

  const startNewRoll = useCallback(async (filmType: string, capacity: number) => {
    if (!profile) return;
    if (activeRoll) await api.deleteRollById(activeRoll.id);
    const { data, error } = await api.createNewRoll(profile.id, filmType, capacity);
    if (error) showErrorToast('Failed to load new film.');
    else setActiveRoll(data);
  }, [profile, activeRoll]);

  const takePhoto = useCallback(async (imageBlob: Blob, metadata: any) => {
    if (!profile || !activeRoll) return;
    const toastId = showLoadingToast('Processing photo...');

    try {
      const buf = new Uint8Array(await imageBlob.arrayBuffer());
      const worker = new AvifWorkerUrl();

      const avifResult: { avif?: Uint8Array; width?: number; height?: number; error?: string } =
        await new Promise((resolve) => {
          worker.onmessage = (e: MessageEvent) => {
            resolve(e.data);
            worker.terminate();
          };
          worker.onerror = (err) => {
            const errorMessage = err.message 
              ? err.message 
              : `Worker failed at ${err.filename}:${err.lineno}. This is often due to a script loading issue.`;
            resolve({ error: `Worker script error: ${errorMessage}` });
            worker.terminate();
          };
          worker.postMessage({
            buf,
            mime: imageBlob.type.toLowerCase(),
            targetLong: TARGET_LONG_EDGE_PX,
            cqLevel: 22, // print quality
            speed: 6,
            chroma: '444'
          }, [buf.buffer]);
        });

      if (avifResult.error) {
        throw new Error(`AVIF encoding failed: ${avifResult.error}`);
      }

      const avifBlob = new Blob([avifResult.avif!], { type: 'image/avif' });
      
      // Generate unique path for the AVIF image
      const filePath = `photos/${profile.id}/${activeRoll.id}/${crypto.randomUUID()}.avif`;
      const thumbnailPath = `photos/${profile.id}/${activeRoll.id}/thumbnails/${crypto.randomUUID()}_thumb.avif`; // For thumbnail

      // Upload full-size AVIF
      const { error: uploadError } = await api.uploadPhotoToStorage(filePath, avifBlob, 'image/avif');
      if (uploadError) throw new Error(`Failed to upload photo: ${uploadError.message}`);

      const { data: publicUrlData } = api.getPublicUrl('photos', filePath);
      const publicUrl = publicUrlData.publicUrl;

      // For thumbnail, we can use the same AVIF blob but potentially resize it smaller if needed
      // For simplicity, let's use the same public URL for thumbnail, but in a real app, you'd generate a smaller thumbnail.
      const thumbnailUrl = publicUrl; 

      // Create photo record in database
      const { error: recordError } = await api.createPhotoRecord(
        profile.id,
        activeRoll.id,
        publicUrl,
        thumbnailUrl,
        { ...metadata, width: avifResult.width, height: avifResult.height }
      );
      if (recordError) throw new Error(`Failed to create photo record: ${recordError.message}`);

      // Update roll status
      const newShotsUsed = activeRoll.shots_used + 1;
      const isCompleted = newShotsUsed >= activeRoll.capacity;
      const updatePayload: any = { shots_used: newShotsUsed, is_completed: isCompleted };
      if (isCompleted) updatePayload.completed_at = new Date().toISOString();
      
      const { data: updatedRoll } = await api.updateRoll(activeRoll.id, updatePayload);
      if (updatedRoll) {
        if (isCompleted) {
          setActiveRoll(null);
          setCompletedRolls(prev => [updatedRoll, ...prev]);
          setRollToName(updatedRoll);
        } else {
          setActiveRoll(updatedRoll);
        }
      }
      showSuccessToast('Photo captured!');
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to save photo.');
    } finally {
      dismissToast(toastId);
    }
  }, [profile, activeRoll]);

  const developRoll = useCallback(async (roll: Roll) => {
    if (!profile) return;
    const cost = 1 + Math.ceil(0.2 * roll.shots_used);
    if (profile.credits < cost) {
      showErrorToast('Not enough credits.');
      return;
    }
    const toastId = showLoadingToast('Developing your film...');
    try {
      await api.updateProfile(profile.id, { credits: profile.credits - cost });
      await api.developRollPhotos(roll, filmStocks);
      const { data: updatedRoll } = await api.updateRoll(roll.id, { developed_at: new Date().toISOString() });
      if (updatedRoll) {
        setCompletedRolls(prev => prev.map(r => r.id === roll.id ? updatedRoll : r));
        setRollToName(updatedRoll);
      }
      showSuccessToast('Roll developed successfully!');
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to develop roll.');
    } finally {
      dismissToast(toastId);
    }
  }, [profile, filmStocks]);

  const updateRollTitle = useCallback(async (rollId: string, title: string) => {
    if (!profile) return false;
    const { error } = await api.updateRoll(rollId, { title });
    if (error) return false;
    setCompletedRolls(prev => prev.map(r => r.id === rollId ? { ...r, title } : r));
    if (selectedRoll?.id === rollId) setSelectedRoll(prev => prev ? { ...prev, title } : null);
    return true;
  }, [profile, selectedRoll]);

  const deleteRoll = useCallback(async (rollId: string) => {
    if (!profile) return;
    const toastId = showLoadingToast('Deleting roll...');
    try {
      const { data: posts } = await api.getPostsForRoll(rollId);
      const postIds = posts?.map(p => p.id) || [];
      if (postIds.length > 0) {
        await api.deleteLikesForPosts(postIds);
        await api.deleteCommentsForPosts(postIds);
      }
      await api.deletePostsForRoll(rollId);
      
      const { data: photos } = await api.getPhotosForRoll(rollId);
      if (photos && photos.length > 0) {
        const photoPaths = photos.map(p => extractStoragePathFromPublicUrl(p.url)).filter(Boolean) as string[];
        if (photoPaths.length > 0) await api.deletePhotosFromStorage(photoPaths);
      }
      
      await api.deleteRollById(rollId);
      setCompletedRolls(prev => prev.filter(r => r.id !== rollId));
      setSelectedRoll(null);
      showSuccessToast('Roll deleted.');
    } catch (error: any) {
      showErrorToast(`Failed to delete roll: ${error?.message}`);
    } finally {
      dismissToast(toastId);
    }
  }, [profile]);

  const convertAvifToJpeg = useCallback(async (avifUrl: string): Promise<Blob | null> => {
    try {
      const response = await fetch(avifUrl);
      const buf = new Uint8Array(await response.arrayBuffer());
      const worker = new AvifToJpegWorkerUrl();

      const jpegResult: { jpeg?: Uint8Array; error?: string } = await new Promise((resolve) => {
        worker.onmessage = (e: MessageEvent) => {
          resolve(e.data);
          worker.terminate();
        };
        worker.onerror = (err) => {
          resolve({ error: `Worker error: ${err.message}` });
          worker.terminate();
        };
        worker.postMessage({ buf }, [buf.buffer]);
      });

      if (jpegResult.error) {
        throw new Error(`JPEG encoding failed: ${jpegResult.error}`);
      }
      return new Blob([jpegResult.jpeg!], { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error converting AVIF to JPEG:', error);
      return null;
    }
  }, []);

  const downloadPhoto = useCallback(async (photo: Photo) => {
    const toastId = showLoadingToast('Converting photo for download...');
    try {
      const jpegBlob = await convertAvifToJpeg(photo.url);
      if (jpegBlob) {
        saveAs(jpegBlob, `photo-${photo.id}.jpeg`);
        showSuccessToast('Photo download started!');
      } else {
        showErrorToast('Failed to convert photo for download.');
      }
    } catch (error) {
      showErrorToast('Could not download photo.');
    } finally {
      dismissToast(toastId);
    }
  }, [convertAvifToJpeg]);

  const downloadRoll = useCallback(async (roll: Roll) => {
    if (!roll.photos || roll.photos.length === 0) return;
    const toastId = showLoadingToast(`Preparing ${roll.photos.length} photos for download...`);
    try {
      const zip = new JSZip();
      await Promise.all(roll.photos.map(async (photo) => {
        const jpegBlob = await convertAvifToJpeg(photo.url);
        if (jpegBlob) {
          zip.file(`photo-${photo.id}.jpeg`, jpegBlob);
        } else {
          console.warn(`Skipping photo ${photo.id} due to conversion failure.`);
        }
      }));
      saveAs(await zip.generateAsync({ type: 'blob' }), `${(roll.title || roll.film_type)}.zip`);
      showSuccessToast('Roll download started!');
    } catch (error) {
      showErrorToast('Could not download roll.');
    } finally {
      dismissToast(toastId);
    }
  }, [convertAvifToJpeg]);

  return {
    activeRoll,
    completedRolls,
    selectedRoll,
    setSelectedRoll,
    rollToName,
    setRollToName,
    startNewRoll,
    takePhoto,
    developRoll,
    updateRollTitle,
    deleteRoll,
    downloadPhoto,
    downloadRoll,
    refetchRolls: fetchRolls,
  };
};