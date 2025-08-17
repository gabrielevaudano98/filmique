import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as api from '../services/api';
import { UserProfile, Roll, Photo, FilmStock } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast, showWarningToast } from '../utils/toasts';
import { useHaptics } from './useHaptics';
import { ImpactStyle } from '@capacitor/haptics';
import * as localFileStorage from '../utils/localFileStorage';
import { dbService } from '../services/database';
import { isRollDeveloped } from '../utils/rollUtils';

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
  const { impact } = useHaptics();

  const refetchRolls = useCallback(async () => {
    if (!profile) return;
    
    let localRolls = await dbService.getRolls(profile.id);
    
    const { data: serverRolls, error } = await api.fetchAllRolls(profile.id);
    if (!error && serverRolls) {
        const localRollIds = new Set(localRolls.map(r => r.id));
        for (const serverRoll of serverRolls) {
            if (!localRollIds.has(serverRoll.id)) {
                await dbService.saveRoll({ ...serverRoll, sync_status: 'synced' });
            }
        }
        localRolls = await dbService.getRolls(profile.id);
    }
    
    const active = localRolls.find(r => !r.is_completed) || null;
    const completed = localRolls.filter(r => r.is_completed);
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
    
    const newRoll: Roll = {
      id: uuidv4(),
      user_id: profile.id,
      film_type: film.name,
      capacity: film.capacity,
      shots_used: 0,
      is_completed: false,
      created_at: new Date().toISOString(),
      aspect_ratio: aspectRatio,
      is_archived: false,
      sync_status: 'local',
      photos: [],
    };
    
    setActiveRoll(newRoll);
    await dbService.saveRoll(newRoll);
    await dbService.addTransaction('CREATE_ROLL', { roll: newRoll });
    showSuccessToast(`${film.name} loaded!`);
  }, [profile]);

  const takePhoto = useCallback(async (imageBlob: Blob, metadata: any) => {
    if (!profile || !activeRoll || isSavingPhoto) return;
    if (activeRoll.shots_used >= activeRoll.capacity) {
      showWarningToast("This film roll is already full.");
      return;
    }

    impact(ImpactStyle.Light);
    setIsSavingPhoto(true);
    
    try {
      const localPath = await localFileStorage.savePhoto(imageBlob, activeRoll.id);
      const newPhoto: Photo = {
        id: uuidv4(),
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
        sync_status: 'local',
      };

      await dbService.saveRoll(updatedRoll);
      await dbService.addTransaction('UPDATE_ROLL', { rollId: updatedRoll.id, updates: { shots_used: updatedRoll.shots_used, is_completed: updatedRoll.is_completed, photos: updatedRoll.photos } });

      if (isCompleted) {
        setActiveRoll(null);
        setCompletedRolls(prev => [updatedRoll, ...prev]);
        setRollToConfirm(updatedRoll);
      } else {
        setActiveRoll(updatedRoll);
      }
    } catch (error) {
      console.error("Failed to save photo:", error);
      showErrorToast('Failed to save photo.');
    } finally {
      setIsSavingPhoto(false);
    }
  }, [profile, activeRoll, isSavingPhoto, impact]);

  const updateAndQueueRoll = async (roll: Roll, updates: Partial<Roll>) => {
    const updatedRoll = { ...roll, ...updates, sync_status: 'local' as const };
    setCompletedRolls(prev => prev.map(r => r.id === roll.id ? updatedRoll : r));
    await dbService.saveRoll(updatedRoll);
    await dbService.addTransaction('UPDATE_ROLL', { rollId: roll.id, updates });
    return updatedRoll;
  };

  const sendToStudio = async (roll: Roll, title: string) => {
    await updateAndQueueRoll(roll, { title, completed_at: new Date().toISOString() });
    showSuccessToast("Roll sent to the studio! Will sync when online.");
  };

  const putOnShelf = async (roll: Roll, title: string) => {
    await updateAndQueueRoll(roll, { title });
    showSuccessToast("Roll placed on your shelf.");
  };

  const developShelvedRoll = async (rollId: string) => {
    const roll = completedRolls.find(r => r.id === rollId);
    if (roll) {
      await updateAndQueueRoll(roll, { completed_at: new Date().toISOString() });
      showSuccessToast("Roll sent to the studio!");
    }
  };

  const developRoll = useCallback(async (roll: Roll) => {
    showWarningToast("Development of local-only rolls will be enabled in a future step.");
  }, []);

  const updateRollTitle = useCallback(async (rollId: string, title: string) => {
    const roll = completedRolls.find(r => r.id === rollId);
    if (roll) {
      await updateAndQueueRoll(roll, { title });
      return true;
    }
    return false;
  }, [completedRolls]);

  const updateRollTags = useCallback(async (rollId: string, tags: string[]) => {
    const roll = completedRolls.find(r => r.id === rollId);
    if (roll) {
      await updateAndQueueRoll(roll, { tags });
      showSuccessToast('Tags updated!');
      return true;
    }
    return false;
  }, [completedRolls]);

  const deleteRoll = useCallback(async (rollId: string) => {
    // This will be enhanced with transactions later
    if (!profile) return;
    const toastId = showLoadingToast('Deleting roll...');
    try {
      const rollToDelete = completedRolls.find(r => r.id === rollId);
      if (rollToDelete?.photos) {
        for (const photo of rollToDelete.photos) {
          if (photo.local_path) await localFileStorage.deletePhoto(photo.local_path);
        }
      }
      await api.deleteRollById(rollId); // Assume online for now
      await refetchRolls();
      setSelectedRoll(null);
      showSuccessToast('Roll deleted.');
    } catch (error: any) {
      showErrorToast(`Failed to delete roll: ${error?.message}`);
    } finally {
      dismissToast(toastId);
    }
  }, [profile, completedRolls, refetchRolls]);

  const downloadPhoto = useCallback(async (photo: Photo) => {
    showErrorToast("Download not supported for local photos yet.");
  }, []);

  const downloadRoll = useCallback(async (roll: Roll) => {
    showErrorToast("Download not supported for local rolls yet.");
  }, []);

  const archiveRoll = useCallback(async (rollId: string, archive: boolean) => {
    const roll = completedRolls.find(r => r.id === rollId);
    if (roll) {
      await updateAndQueueRoll(roll, { is_archived: archive });
      showSuccessToast(`Roll ${archive ? 'archived' : 'unarchived'}.`);
    }
  }, [completedRolls]);

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