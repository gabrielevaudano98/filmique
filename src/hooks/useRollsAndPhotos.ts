import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as api from '../services/api';
import { UserProfile, Roll, Photo, FilmStock, LocalRoll, LocalPhoto } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast, showWarningToast } from '../utils/toasts';
import { filenameFromUrl } from '../utils/storage';
import { isRollDeveloped } from '../utils/rollUtils';
import { useHaptics } from './useHaptics';
import { ImpactStyle, NotificationType } from '@capacitor/haptics';
import { db } from '../integrations/db';
import { savePhoto, deleteRollDirectory } from '../utils/fileStorage';

export const useRollsAndPhotos = (
  profile: UserProfile | null, 
  filmStocks: FilmStock[],
  refreshProfile: () => Promise<void>
) => {
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [rollToConfirm, setRollToConfirm] = useState<Roll | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [developedRollForWizard, setDevelopedRollForWizard] = useState<Roll | null>(null);
  const { impact, notification } = useHaptics();

  const allRolls = useLiveQuery(async () => {
    if (!profile) return [];
    
    const rolls = await db.rolls.where('user_id').equals(profile.id).toArray();
    const photos = await db.photos.where('user_id').equals(profile.id).toArray();
    
    const photosByRollId = photos.reduce((acc, photo) => {
      if (!acc[photo.roll_id]) acc[photo.roll_id] = [];
      acc[photo.roll_id].push(photo);
      return acc;
    }, {} as Record<string, LocalPhoto[]>);

    return rolls.map(roll => ({
      ...roll,
      photos: photosByRollId[roll.id] || []
    }));
  }, [profile]);

  const activeRoll = useMemo(() => {
    if (!allRolls) return null;
    return allRolls.find(r => !r.is_completed) || null;
  }, [allRolls]);

  const completedRolls = useMemo(() => {
    if (!allRolls) return [];
    return allRolls.filter(r => r.is_completed);
  }, [allRolls]);

  const syncDownRollsFromCloud = useCallback(async () => {
    if (!profile) return;
    const { data: cloudRolls, error } = await api.fetchAllRolls(profile.id);
    if (error || !cloudRolls) return;

    await db.rolls.bulkPut(cloudRolls as LocalRoll[]);
    
    const allPhotos = cloudRolls.flatMap(roll => roll.photos || []);
    if (allPhotos.length > 0) {
      await db.photos.bulkPut(allPhotos as LocalPhoto[]);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      syncDownRollsFromCloud();
    }
  }, [profile, syncDownRollsFromCloud]);

  const developingRolls = useMemo(() => {
    return (completedRolls || [])
      .filter(r => r.is_completed && r.completed_at && !isRollDeveloped(r))
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
  }, [completedRolls]);

  const startNewRoll = useCallback(async (film: FilmStock, aspectRatio: string) => {
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

      const newRoll: LocalRoll = {
        id: crypto.randomUUID(),
        user_id: profile.id,
        film_type: film.name,
        capacity: film.capacity,
        aspect_ratio: aspectRatio,
        shots_used: 0,
        is_completed: false,
        created_at: new Date().toISOString(),
        sync_status: 'local_only',
        is_archived: false,
      };
      
      await db.transaction('rw', db.rolls, async () => {
        const currentActiveRoll = await db.rolls.where({ user_id: profile.id, is_completed: false }).first();
        if (currentActiveRoll) {
          await db.rolls.delete(currentActiveRoll.id);
        }
        await db.rolls.add(newRoll);
      });
      
      dismissToast(toastId);
      showSuccessToast(`${film.name} loaded!`);
    } catch (error: any) {
      showErrorToast(error.message || 'An error occurred while loading film.');
      dismissToast(toastId);
    }
  }, [profile, refreshProfile]);

  const takePhoto = useCallback(async (imageBlob: Blob, metadata: any) => {
    if (!profile || isSavingPhoto) return;

    impact(ImpactStyle.Light);
    setIsSavingPhoto(true);
    
    try {
      if (!activeRoll) {
        showErrorToast("No active roll loaded.");
        setIsSavingPhoto(false);
        return;
      }

      if (activeRoll.shots_used >= activeRoll.capacity) {
        showWarningToast("This film roll is already full.");
        setIsSavingPhoto(false);
        return;
      }

      const photoId = crypto.randomUUID();
      const fileUriOrId = await savePhoto(imageBlob, profile.id, activeRoll.id, photoId);

      const newPhoto: LocalPhoto = {
        id: photoId,
        user_id: profile.id,
        roll_id: activeRoll.id,
        local_path: fileUriOrId,
        metadata,
        created_at: new Date().toISOString(),
      };

      const newShotsUsed = activeRoll.shots_used + 1;
      const isCompleted = newShotsUsed >= activeRoll.capacity;

      await db.transaction('rw', db.photos, db.rolls, async () => {
        await db.photos.add(newPhoto);
        await db.rolls.update(activeRoll.id, { 
          shots_used: newShotsUsed, 
          is_completed: isCompleted 
        });
      });

      if (isCompleted) {
        const completedRoll = await db.rolls.get(activeRoll.id);
        if (completedRoll) setRollToConfirm(completedRoll);
      }

    } catch (error) {
      console.error("Failed to save photo locally:", error);
      showErrorToast('Failed to save photo.');
    } finally {
      setIsSavingPhoto(false);
    }
  }, [profile, isSavingPhoto, impact, activeRoll, setRollToConfirm]);

  const sendToStudio = async (roll: Roll, title: string) => {
    const completedAt = new Date().toISOString();
    await db.rolls.update(roll.id, { title, completed_at: completedAt });
    showSuccessToast("Roll sent to the studio!");
  };

  const putOnShelf = async (roll: Roll, title: string) => {
    await db.rolls.update(roll.id, { title });
    showSuccessToast("Roll placed on your shelf.");
  };

  const developShelvedRoll = async (rollId: string) => {
    await db.rolls.update(rollId, { completed_at: new Date().toISOString() });
    showSuccessToast("Roll sent to the studio!");
  };

  const developRoll = useCallback(async (roll: Roll) => {
    if (!profile) return;
    const toastId = showLoadingToast('Developing your film...');
    try {
      await db.transaction('rw', db.rolls, db.pending_transactions, async () => {
        await db.rolls.update(roll.id, { developed_at: new Date().toISOString() });
        await db.pending_transactions.add({
          type: 'BACKUP_ROLL',
          payload: { rollId: roll.id },
          status: 'pending',
          created_at: new Date().toISOString(),
          attempts: 0,
        });
      });
      
      const updatedRoll = await db.rolls.get(roll.id);
      if (updatedRoll) setDevelopedRollForWizard(updatedRoll);

      showSuccessToast('Roll developed! Backup scheduled.');
      notification(NotificationType.Success);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to develop roll.');
    } finally {
      dismissToast(toastId);
    }
  }, [profile, notification]);

  const updateRollTitle = useCallback(async (rollId: string, title: string) => {
    await db.rolls.update(rollId, { title });
    return true;
  }, []);

  const updateRollTags = useCallback(async (rollId: string, tags: string[]) => {
    await db.rolls.update(rollId, { tags });
    showSuccessToast('Tags updated!');
    return true;
  }, []);

  const deleteRoll = useCallback(async (rollId: string) => {
    if (!profile) return;
    
    try {
      await db.transaction('rw', db.rolls, db.photos, db.pending_transactions, async () => {
        await db.rolls.delete(rollId);
        await db.photos.where('roll_id').equals(rollId).delete();
        
        await db.pending_transactions.add({
          type: 'DELETE_ROLL',
          payload: { rollId },
          status: 'pending',
          created_at: new Date().toISOString(),
          attempts: 0,
        });
      });
      
      await deleteRollDirectory(profile.id, rollId);

      setSelectedRoll(null);
      showSuccessToast('Roll deleted. Syncing deletion to the cloud.');

    } catch (error: any) {
      showErrorToast(`Failed to delete roll: ${error?.message}`);
    }
  }, [profile]);

  const downloadPhoto = useCallback(async (photo: Photo) => {
    try {
      const response = await fetch(photo.url!);
      saveAs(await response.blob(), filenameFromUrl(photo.url!));
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
        const response = await fetch(photo.url!);
        zip.file(filenameFromUrl(photo.url!), await response.blob());
      }));
      saveAs(await zip.generateAsync({ type: 'blob' }), `${(roll.title || roll.film_type)}.zip`);
      showSuccessToast('Roll download started!');
    } catch (error) {
      showErrorToast('Could not download roll.');
    } finally {
      dismissToast(toastId);
    }
  }, []);

  const archiveRoll = useCallback(async (rollId: string, archive: boolean) => {
    await db.rolls.update(rollId, { is_archived: archive });
    showSuccessToast(`Roll ${archive ? 'archived' : 'unarchived'}.`);
  }, []);

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
    refetchRolls: syncDownRollsFromCloud,
    sendToStudio,
    putOnShelf,
    developShelvedRoll,
    developedRollForWizard,
    setDevelopedRollForWizard,
    archiveRoll,
  };
};