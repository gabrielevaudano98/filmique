import { useState, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as api from '../services/api';
import { UserProfile, Roll, Photo, FilmStock } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast, showWarningToast } from '../utils/toasts';
import { filenameFromUrl } from '../utils/storage';
import { isRollDeveloped } from '../utils/rollUtils';
import { useHaptics } from './useHaptics';
import { ImpactStyle, NotificationType } from '@capacitor/haptics';
import * as localFileStorage from '../utils/localFileStorage';

export const useRollsAndPhotos = (
  profile: UserProfile | null, 
  filmStocks: FilmStock[],
  refreshProfile: () => Promise<void>
) => {
  const [activeRoll, setActiveRoll] = useState<Roll | null>(null);
  const [completedRolls, setCompletedRolls] = useState<Roll[]>([]);
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [rollToConfirm, setRollToConfirm] = useState<Roll | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [developedRollForWizard, setDevelopedRollForWizard] = useState<Roll | null>(null);
  const { impact, notification } = useHaptics();

  // For now, we will fetch from the server on load.
  // In a future iteration, we will merge this with local state.
  const refetchRolls = useCallback(async () => {
    if (!profile) return;
    const { data: fetchedRolls, error } = await api.fetchAllRolls(profile.id);
    if (error || !fetchedRolls) return;

    const rollsWithStatus = fetchedRolls.map(r => ({ ...r, sync_status: 'synced' as const, photos: r.photos?.map(p => ({...p, local_path: null})) }));

    const active = rollsWithStatus.find(r => !r.is_completed) || null;
    const completed = rollsWithStatus.filter(r => r.is_completed);
    setActiveRoll(active);
    setCompletedRolls(completed);
    
  }, [profile]);

  useEffect(() => {
    if (profile) {
      refetchRolls();
    }
  }, [profile, refetchRolls]);

  const developingRolls = useMemo(() => {
    return completedRolls
      .filter(r => r.is_completed && r.completed_at && !isRollDeveloped(r))
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
  }, [completedRolls]);

  const startNewRoll = useCallback(async (film: FilmStock, aspectRatio: string) => {
    if (!profile) return;
    if (profile.credits < film.price) {
      showErrorToast('Not enough credits to buy this film.');
      return;
    }
    
    // For now, this part remains online. We will make it offline-capable later.
    const toastId = showLoadingToast('Purchasing film...');
    try {
      const { error: updateError } = await api.updateProfile(profile.id, { credits: profile.credits - film.price });
      if (updateError) throw updateError;

      await refreshProfile();

      if (activeRoll) {
        await api.deleteRollById(activeRoll.id);
      }

      const { data, error } = await api.createNewRoll(profile.id, film.name, film.capacity, aspectRatio);
      if (error) throw error;
      
      setActiveRoll({ ...data, sync_status: 'synced', photos: [] });
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

    impact(ImpactStyle.Light);
    setIsSavingPhoto(true);
    
    try {
      // Save photo to local device storage
      const localPath = await localFileStorage.savePhoto(imageBlob, activeRoll.id);

      const newPhoto: Photo = {
        id: `local-${Date.now()}`, // Temporary local ID
        user_id: profile.id,
        roll_id: activeRoll.id,
        url: null,
        thumbnail_url: null,
        local_path: localPath,
        metadata,
        created_at: new Date().toISOString(),
      };

      const newShotsUsed = activeRoll.shots_used + 1;
      const isCompleted = newShotsUsed >= activeRoll.capacity;
      
      const updatedRoll: Roll = {
        ...activeRoll,
        shots_used: newShotsUsed,
        is_completed: isCompleted,
        photos: [...(activeRoll.photos || []), newPhoto],
        // If the roll was synced, it's now dirty and needs to be re-synced later.
        // For now, we'll just manage it locally. In the next step, we'll handle this state change.
      };

      if (isCompleted) {
        setActiveRoll(null);
        setCompletedRolls(prev => [{...updatedRoll, sync_status: 'local'}, ...prev]);
        setRollToConfirm(updatedRoll);
      } else {
        setActiveRoll(updatedRoll);
      }

    } catch (error) {
      console.error("Failed to save photo locally:", error);
      showErrorToast('Failed to save photo.');
    } finally {
      setIsSavingPhoto(false);
    }
  }, [profile, activeRoll, isSavingPhoto, impact]);

  const sendToStudio = async (roll: Roll, title: string) => {
    const completedAt = new Date().toISOString();
    const updatedRoll = { ...roll, title, completed_at: completedAt };
    setCompletedRolls(prev => prev.map(r => r.id === roll.id ? updatedRoll : r));
    // In a future step, this will add a transaction to the queue.
    // For now, we assume online and update directly.
    const { error } = await api.updateRoll(roll.id, { title, completed_at: completedAt });
    if (error) {
      showErrorToast('Failed to send roll to the studio.');
      setCompletedRolls(prev => prev.map(r => r.id === roll.id ? roll : r));
    } else {
      showSuccessToast("Roll sent to the studio!");
    }
  };

  const putOnShelf = async (roll: Roll, title: string) => {
    const updatedRoll = { ...roll, title };
    setCompletedRolls(prev => prev.map(r => r.id === roll.id ? updatedRoll : r));
    // In a future step, this will add a transaction to the queue.
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
      if (error) { showErrorToast('Could not send to the studio.'); }
      else {
        showSuccessToast("Roll sent to the studio!");
        refetchRolls();
      }
  };

  const developRoll = useCallback(async (roll: Roll) => {
    // This function will need significant changes for offline mode later.
    // For now, it assumes the photos are accessible via URL, which they are not for local rolls.
    // We will adjust this in the sync iteration.
    showWarningToast("Development of local-only rolls will be enabled in a future step.");
  }, []);

  const updateRollTitle = useCallback(async (rollId: string, title: string) => {
    // This will also become a queued transaction.
    if (!profile) return false;
    const { error } = await api.updateRoll(rollId, { title });
    if (error) return false;
    setCompletedRolls(prev => prev.map(r => r.id === rollId ? { ...r, title } : r));
    if (selectedRoll?.id === rollId) setSelectedRoll(prev => prev ? { ...prev, title } : null);
    return true;
  }, [profile, selectedRoll]);

  const updateRollTags = useCallback(async (rollId: string, tags: string[]) => {
    // This will also become a queued transaction.
    if (!profile) return false;
    const { error } = await api.updateRoll(rollId, { tags });
    if (error) {
      showErrorToast('Failed to update tags.');
      return false;
    }
    setCompletedRolls(prev => prev.map(r => r.id === rollId ? { ...r, tags } : r));
    if (selectedRoll?.id === rollId) setSelectedRoll(prev => prev ? { ...prev, tags } : null);
    showSuccessToast('Tags updated!');
    return true;
  }, [profile, selectedRoll]);

  const deleteRoll = useCallback(async (rollId: string) => {
    // This needs to handle deleting local files too.
    if (!profile) return;
    const toastId = showLoadingToast('Deleting roll...');
    try {
      const rollToDelete = completedRolls.find(r => r.id === rollId);
      if (rollToDelete?.photos) {
        for (const photo of rollToDelete.photos) {
          if (photo.local_path) {
            await localFileStorage.deletePhoto(photo.local_path);
          }
        }
      }
      // Online deletion logic
      await api.deleteRollById(rollId);
      setCompletedRolls(prev => prev.filter(r => r.id !== rollId));
      setSelectedRoll(null);
      showSuccessToast('Roll deleted.');
    } catch (error: any) {
      showErrorToast(`Failed to delete roll: ${error?.message}`);
    } finally {
      dismissToast(toastId);
    }
  }, [profile, completedRolls]);

  const downloadPhoto = useCallback(async (photo: Photo) => {
    showErrorToast("Download not supported for local photos yet.");
  }, []);

  const downloadRoll = useCallback(async (roll: Roll) => {
    showErrorToast("Download not supported for local rolls yet.");
  }, []);

  const archiveRoll = useCallback(async (rollId: string, archive: boolean) => {
    if (!profile) return;
    const { error } = await api.archiveRoll(rollId, archive);
    if (error) {
      showErrorToast(`Failed to ${archive ? 'archive' : 'unarchive'} roll.`);
    } else {
      showSuccessToast(`Roll ${archive ? 'archived' : 'unarchived'}.`);
      refetchRolls();
    }
  }, [profile, refetchRolls]);

  return {
    activeRoll,
    completedRolls,
    developingRolls,
    selectedRoll,
    setSelectedRoll,
    rollToConfirm,
    setRollToConfirm,
    isSavingPhoto,
    startNewRoll,
    takePhoto,
    developRoll,
    updateRollTitle,
    updateRollTags,
    deleteRoll,
    downloadPhoto,
    downloadRoll,
    refetchRolls,
    sendToStudio,
    putOnShelf,
    developShelvedRoll,
    developedRollForWizard,
    setDevelopedRollForWizard,
    archiveRoll,
  };
};