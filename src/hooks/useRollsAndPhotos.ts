import { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as api from '../services/api';
import { UserProfile, Roll, Photo, FilmStock } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast } from '../utils/toasts';
import { extractStoragePathFromPublicUrl } from '../utils/storage';
import { usePhotoQueue } from './usePhotoQueue';

export const useRollsAndPhotos = (profile: UserProfile | null, filmStocks: FilmStock[]) => {
  const [activeRoll, setActiveRoll] = useState<Roll | null>(null);
  const [completedRolls, setCompletedRolls] = useState<Roll[]>([]);
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [rollToName, setRollToName] = useState<Roll | null>(null);
  const { addPhotoToQueue, processQueue } = usePhotoQueue(profile);

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
    // On startup, try to process any pending photos
    processQueue();
  }, [fetchRolls, processQueue]);

  const startNewRoll = useCallback(async (filmType: string, capacity: number) => {
    if (!profile) return;
    if (activeRoll) await api.deleteRollById(activeRoll.id);
    const { data, error } = await api.createNewRoll(profile.id, filmType, capacity);
    if (error) showErrorToast('Failed to load new film.');
    else setActiveRoll(data);
  }, [profile, activeRoll]);

  const takePhoto = useCallback(async (imageBlob: Blob, metadata: any) => {
    if (!profile || !activeRoll) return;

    // Add to the queue first. This is fast and ensures the photo is saved.
    await addPhotoToQueue(imageBlob, metadata, profile.id, activeRoll.id, activeRoll.film_type);
    showSuccessToast('Photo captured! Processing in background.');

    // Run the database update in the background without blocking the UI thread.
    (async () => {
      try {
        const newShotsUsed = activeRoll.shots_used + 1;
        const isCompleted = newShotsUsed >= activeRoll.capacity;
        
        const updatePayload: any = { 
          shots_used: newShotsUsed, 
          is_completed: isCompleted 
        };
        if (isCompleted) {
          updatePayload.completed_at = new Date().toISOString();
        }
        
        // Await the update and get the new roll data directly from the database response.
        const { data: updatedRoll, error } = await api.updateRoll(activeRoll.id, updatePayload);

        if (error) {
          console.error("Failed to update roll in DB:", error);
          showErrorToast("Couldn't update roll count. Please refresh.");
          return;
        }

        // Use the confirmed data from the database to update the local state.
        if (updatedRoll) {
          if (updatedRoll.is_completed) {
            setActiveRoll(null);
            setCompletedRolls(prev => [updatedRoll, ...prev.filter(r => r.id !== updatedRoll.id)]);
            setRollToName(updatedRoll);
          } else {
            setActiveRoll(updatedRoll);
          }
        }
      } catch (e) {
        console.error("Error in background roll update:", e);
      }
    })();

  }, [profile, activeRoll, addPhotoToQueue]);

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

  const downloadPhoto = useCallback(async (photo: Photo) => {
    const toastId = showLoadingToast('Preparing photo for download...');
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      saveAs(blob, `photo-${photo.id}.jpeg`);
      showSuccessToast('Photo download started!');
    } catch (error) {
      showErrorToast('Could not download photo.');
    } finally {
      dismissToast(toastId);
    }
  }, []);

  const downloadRoll = useCallback(async (roll: Roll) => {
    if (!roll.photos || roll.photos.length === 0) return;
    const toastId = showLoadingToast(`Preparing ${roll.photos.length} photos for download...`);
    try {
      const zip = new JSZip();
      await Promise.all(roll.photos.map(async (photo) => {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        zip.file(`photo-${photo.id}.jpeg`, blob);
      }));
      saveAs(await zip.generateAsync({ type: 'blob' }), `${(roll.title || roll.film_type)}.zip`);
      showSuccessToast('Roll download started!');
    } catch (error) {
      showErrorToast('Could not download roll.');
    } finally {
      dismissToast(toastId);
    }
  }, []);

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