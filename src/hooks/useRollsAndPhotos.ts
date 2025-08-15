import { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as api from '../services/api';
import { UserProfile, Roll, Photo, FilmStock } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast, showWarningToast } from '../utils/toasts';
import { filenameFromUrl } from '../utils/storage';

export const useRollsAndPhotos = (
  profile: UserProfile | null, 
  filmStocks: FilmStock[],
  refreshProfile: () => Promise<void>
) => {
  const [activeRoll, setActiveRoll] = useState<Roll | null>(null);
  const [completedRolls, setCompletedRolls] = useState<Roll[]>([]);
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [rollToName, setRollToName] = useState<Roll | null>(null);
  const [rollToConfirm, setRollToConfirm] = useState<Roll | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const refetchRolls = useCallback(async () => {
    if (!profile) return;
    const { data: fetchedRolls, error } = await api.fetchAllRolls(profile.id);
    if (error || !fetchedRolls) return;

    const untitledCompletedRolls = fetchedRolls.filter(r => r.is_completed && !r.title);
    let finalRolls = fetchedRolls;

    if (untitledCompletedRolls.length > 0) {
        const updates = untitledCompletedRolls.map(roll => {
            const date = new Date(roll.created_at);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            const shortId = roll.id.substring(0, 8);
            const defaultTitle = `Untitled ${formattedDate} - ${shortId}`;
            return api.updateRoll(roll.id, { title: defaultTitle }).then(response => response.data);
        });

        const updatedRollsData = (await Promise.all(updates)).filter(Boolean) as Roll[];
        const updatedRollsMap = new Map(updatedRollsData.map(r => [r.id, r]));
        
        finalRolls = fetchedRolls.map(r => updatedRollsMap.get(r.id) || r);
    }

    const active = finalRolls.find(r => !r.is_completed) || null;
    const completed = finalRolls.filter(r => r.is_completed);
    setActiveRoll(active);
    setCompletedRolls(completed);
    
  }, [profile]);

  useEffect(() => {
    // Find active roll from already fetched completed rolls on initial load
    if (profile && completedRolls.length === 0) {
      refetchRolls();
    }
  }, [profile, refetchRolls, completedRolls]);

  const startNewRoll = useCallback(async (film: FilmStock) => {
    if (!profile) return;
    if (profile.credits < film.price) {
      showErrorToast('Not enough credits to buy this film.');
      return;
    }
    
    const toastId = showLoadingToast('Purchasing film...');
    try {
      const { error: updateError } = await api.updateProfile(profile.id, { credits: profile.credits - film.price });
      if (updateError) throw updateError;

      await refreshProfile();

      if (activeRoll) {
        await api.deleteRollById(activeRoll.id);
      }

      const { data, error } = await api.createNewRoll(profile.id, film.name, film.capacity);
      if (error) {
        throw error;
      }
      
      setActiveRoll(data);
      dismissToast(toastId);
      showSuccessToast(`${film.name} loaded!`);
    } catch (error: any) {
      showErrorToast(error.message || 'An error occurred while loading film.');
      dismissToast(toastId);
    }
  }, [profile, activeRoll, refreshProfile]);

  const takePhoto = useCallback(async (imageBlob: Blob, metadata: any) => {
    if (!profile || !activeRoll || isSavingPhoto) return;

    if (activeRoll.shots_used >= activeRoll.capacity) {
      showWarningToast("This film roll is already full.");
      return;
    }

    setIsSavingPhoto(true);
    const filePath = `${profile.id}/${activeRoll.id}/${Date.now()}.jpeg`;
    try {
      await api.uploadPhotoToStorage(filePath, imageBlob);
      const { data: urlData } = api.getPublicUrl('photos', filePath);
      await api.createPhotoRecord(profile.id, activeRoll.id, urlData.publicUrl, metadata);
      
      const newShotsUsed = activeRoll.shots_used + 1;
      const isCompleted = newShotsUsed >= activeRoll.capacity;
      const updatePayload: any = { shots_used: newShotsUsed, is_completed: isCompleted };
      
      const { data: updatedRoll } = await api.updateRoll(activeRoll.id, updatePayload);
      if (updatedRoll) {
        if (isCompleted) {
          setActiveRoll(null);
          setCompletedRolls(prev => [updatedRoll, ...prev]);
          setRollToConfirm(updatedRoll);
        } else {
          setActiveRoll(updatedRoll);
        }
      }
    } catch (error) {
      showErrorToast('Failed to save photo.');
    } finally {
      setIsSavingPhoto(false);
    }
  }, [profile, activeRoll, isSavingPhoto]);

  const sendToDarkroom = async (roll: Roll, title: string) => {
    const completedAt = new Date().toISOString();
    const updatedRoll = { ...roll, title, completed_at: completedAt };
    setCompletedRolls(prev => prev.map(r => r.id === roll.id ? updatedRoll : r));

    const { error } = await api.updateRoll(roll.id, { title, completed_at: completedAt });
    if (error) {
      showErrorToast('Failed to send roll to darkroom.');
      setCompletedRolls(prev => prev.map(r => r.id === roll.id ? roll : r));
    } else {
      showSuccessToast("Roll sent to the darkroom!");
    }
  };

  const putOnShelf = async (roll: Roll, title: string) => {
    const updatedRoll = { ...roll, title };
    setCompletedRolls(prev => prev.map(r => r.id === roll.id ? updatedRoll : r));

    const { error } = await api.updateRoll(roll.id, { title });
    if (error) {
      showErrorToast('Failed to place roll on shelf.');
      setCompletedRolls(prev => prev.map(r => r.id === roll.id ? roll : r));
    } else {
      showSuccessToast("Roll placed on your shelf.");
    }
  };

  const developShelvedRoll = async (rollId: string) => {
      const { error } = await api.updateRoll(rollId, { completed_at: new Date().toISOString() });
      if (error) { showErrorToast('Could not send to darkroom.'); }
      else {
        showSuccessToast("Roll sent to the darkroom!");
        refetchRolls();
      }
  };

  const developRoll = useCallback(async (roll: Roll) => {
    if (!profile) return;
    const toastId = showLoadingToast('Developing your film...');
    try {
      await api.developRollPhotos(roll, filmStocks);
      const { data: updatedRoll } = await api.updateRoll(roll.id, { developed_at: new Date().toISOString() });
      if (updatedRoll) {
        setCompletedRolls(prev => prev.map(r => r.id === roll.id ? updatedRoll : r));
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
        const photoPaths = photos.map(p => filenameFromUrl(p.url)).filter(Boolean);
        if (photoPaths.length > 0) await api.deletePhotosFromStorage(photoPaths);
      }
      await api.deletePhotosForRoll(rollId);
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
    try {
      const response = await fetch(photo.url);
      saveAs(await response.blob(), filenameFromUrl(photo.url));
      showSuccessToast('Photo download started!');
    } catch (error) {
      showErrorToast('Could not download photo.');
    }
  }, []);

  const downloadRoll = useCallback(async (roll: Roll) => {
    if (!roll.photos || roll.photos.length === 0) return;
    const toastId = showLoadingToast(`Zipping ${roll.photos.length} photos...`);
    try {
      const zip = new JSZip();
      await Promise.all(roll.photos.map(async (photo) => {
        const response = await fetch(photo.url);
        zip.file(filenameFromUrl(photo.url), await response.blob());
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
    rollToConfirm,
    setRollToConfirm,
    isSavingPhoto,
    startNewRoll,
    takePhoto,
    developRoll,
    updateRollTitle,
    deleteRoll,
    downloadPhoto,
    downloadRoll,
    refetchRolls,
    sendToDarkroom,
    putOnShelf,
    developShelvedRoll,
  };
};