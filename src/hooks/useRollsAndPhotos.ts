import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as api from '../services/api';
import { UserProfile, Roll, Photo, FilmStock, LocalRoll, LocalPhoto } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast, showWarningToast, showInfoToast } from '../utils/toasts';
import { filenameFromUrl } from '../utils/storage';
import { isRollDeveloped } from '../utils/rollUtils';
import { useHaptics } from './useHaptics';
import { ImpactStyle, NotificationType } from '@capacitor/haptics';
import { db } from '../integrations/db';
import { savePhoto, deleteRollDirectory } from '../utils/fileStorage';

const SPEED_UP_COST = 25;
const PRINT_COST_PER_PHOTO = 10;

export const useRollsAndPhotos = (
  profile: UserProfile | null, 
  filmStocks: FilmStock[],
  refreshProfile: () => Promise<void>
) => {
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [rollToConfirm, setRollToConfirm] = useState<Roll | null>(null);
  const [rollToSpeedUp, setRollToSpeedUp] = useState<Roll | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const isSavingRef = useRef(false);
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

  const [activeRoll, setActiveRoll] = useState<LocalRoll | null>(null);

  const activeRollFromDB = useMemo(() => {
    if (!allRolls) return null;
    return (allRolls.find(r => r.is_completed === 0) as LocalRoll) || null;
  }, [allRolls]);

  useEffect(() => {
    setActiveRoll(activeRollFromDB);
  }, [activeRollFromDB]);

  const completedRolls = useMemo(() => {
    if (!allRolls) return [];
    return allRolls.filter(r => r.is_completed === 1);
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
        is_completed: 0,
        created_at: new Date().toISOString(),
        sync_status: 'local_only',
        is_archived: false,
      };
      
      await db.transaction('rw', db.rolls, async () => {
        const currentActiveRoll = await db.rolls.where({ user_id: profile.id, is_completed: 0 }).first();
        if (currentActiveRoll) {
          await db.rolls.delete(currentActiveRoll.id);
        }
        await db.rolls.add(newRoll);
      });
      
      setActiveRoll(newRoll);
      dismissToast(toastId);
      showSuccessToast(`${film.name} loaded!`);
    } catch (error: any) {
      showErrorToast(error.message || 'An error occurred while loading film.');
      dismissToast(toastId);
    }
  }, [profile, refreshProfile]);

  const takePhoto = useCallback(async (imageBlob: Blob, metadata: any) => {
    if (!profile || isSavingRef.current || !activeRoll) {
      if (!activeRoll) showErrorToast("No active roll loaded.");
      return;
    }
  
    impact(ImpactStyle.Light);
    isSavingRef.current = true;
    setIsSavingPhoto(true);
  
    try {
      const rollBeforeShot = activeRoll;
  
      if (rollBeforeShot.shots_used >= rollBeforeShot.capacity) {
        showWarningToast("This film roll is already full.");
        return;
      }
  
      const newShotsUsed = rollBeforeShot.shots_used + 1;
      const isCompleted = newShotsUsed >= rollBeforeShot.capacity;
  
      const photoId = crypto.randomUUID();
      const fileUriOrId = await savePhoto(imageBlob, profile.id, rollBeforeShot.id, photoId);
  
      const newPhoto: LocalPhoto = {
        id: photoId,
        user_id: profile.id,
        roll_id: rollBeforeShot.id,
        local_path: fileUriOrId,
        metadata,
        created_at: new Date().toISOString(),
      };
  
      // Update DB and let useLiveQuery handle the state update for reliability
      await db.transaction('rw', db.photos, db.rolls, async () => {
        await db.photos.add(newPhoto);
        await db.rolls.update(rollBeforeShot.id, {
          shots_used: newShotsUsed,
          is_completed: isCompleted ? 1 : 0,
        });
      });
  
      if (isCompleted) {
        // The useLiveQuery will update the state, removing the active roll.
        // We just need to trigger the completion wizard.
        const completedRoll = await db.rolls.get(rollBeforeShot.id);
        if (completedRoll) {
          setRollToConfirm(completedRoll);
        }
      }
    } catch (error) {
      console.error("Failed to save photo locally:", error);
      showErrorToast('Failed to save photo.');
    } finally {
      isSavingRef.current = false;
      setIsSavingPhoto(false);
    }
  }, [profile, impact, activeRoll, setRollToConfirm]);

  const queuePrintOrder = useCallback(async (rollId: string, totalCost: number) => {
    if (!profile) return;
    const toastId = showLoadingToast('Queuing print order...');
    try {
      await db.rolls.update(rollId, { is_printed: true });
      await db.pending_transactions.add({
        type: 'PURCHASE_PRINT',
        payload: {
          userId: profile.id,
          rollId,
          cost: totalCost,
        },
        status: 'pending',
        created_at: new Date().toISOString(),
        attempts: 0,
      });
      dismissToast(toastId);
      showInfoToast('Print order queued! It will be processed when you are online.');
    } catch (error: any) {
      dismissToast(toastId);
      showErrorToast(`Failed to queue order: ${error.message}`);
    }
  }, [profile]);

  const sendToStudio = async (roll: Roll, title: string) => {
    if (!profile) return;
    const completedAt = new Date().toISOString();
    
    if (profile.experience_mode === 'authentic') {
      const totalCost = roll.shots_used * PRINT_COST_PER_PHOTO;
      if (profile.credits < totalCost) {
        showErrorToast("Insufficient credits to order prints.");
        return;
      }
      await db.rolls.update(roll.id, { title, completed_at: completedAt });
      await queuePrintOrder(roll.id, totalCost);
      showSuccessToast("Roll sent for printing! Your unlock code will arrive with your prints.");
    } else {
      await db.rolls.update(roll.id, { title, completed_at: completedAt });
      showSuccessToast("Roll sent to the darkroom!");
    }
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
      const isPremium = profile.subscription === 'plus' || profile.subscription === 'premium';
      const autoBackupEnabled = profile.is_auto_backup_enabled ?? true;

      await db.transaction('rw', db.rolls, db.pending_transactions, async () => {
        await db.rolls.update(roll.id, { developed_at: new Date().toISOString() });
        
        if (isPremium && autoBackupEnabled) {
          await db.pending_transactions.add({
            type: 'BACKUP_ROLL',
            payload: { rollId: roll.id },
            status: 'pending',
            created_at: new Date().toISOString(),
            attempts: 0,
          });
        }
      });
      
      const updatedRoll = await db.rolls.get(roll.id);
      if (updatedRoll) setDevelopedRollForWizard(updatedRoll);

      if (isPremium && autoBackupEnabled) {
        showSuccessToast('Roll developed! Automatic backup scheduled.');
      } else {
        showSuccessToast('Roll developed!');
      }
      notification(NotificationType.Success);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to develop roll.');
    } finally {
      dismissToast(toastId);
    }
  }, [profile, notification]);

  const speedUpDevelopment = useCallback(async (roll: Roll) => {
    if (!profile) return;

    if (profile.credits < SPEED_UP_COST) {
      showErrorToast(`You need ${SPEED_UP_COST} credits to speed up development.`);
      return;
    }

    const toastId = showLoadingToast('Speeding up development...');
    try {
      const { error: updateError } = await api.updateProfile(profile.id, { credits: profile.credits - SPEED_UP_COST });
      if (updateError) throw updateError;

      await refreshProfile();
      await developRoll(roll);

      dismissToast(toastId);
    } catch (error: any) {
      dismissToast(toastId);
      showErrorToast(error.message || 'Failed to speed up development.');
    }
  }, [profile, developRoll, refreshProfile]);

  const unlockRoll = useCallback(async (rollId: string, code: string) => {
    const { data: roll, error } = await api.getRollById(rollId);
    if (error || !roll) {
      showErrorToast("Could not find the roll.");
      return;
    }
  
    if (roll.unlock_code === code) {
      const { error: updateError } = await api.updateRoll(rollId, { is_locked: false, unlock_code: null });
      if (updateError) {
        showErrorToast("Failed to unlock roll.");
      } else {
        showSuccessToast("Roll unlocked!");
        await syncDownRollsFromCloud();
      }
    } else {
      showErrorToast("Incorrect code. Please try again.");
    }
  }, [syncDownRollsFromCloud]);

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

  const manuallyBackupRoll = useCallback(async (rollId: string) => {
    if (!profile) return;

    const isPremium = profile.subscription === 'plus' || profile.subscription === 'premium';
    if (isPremium) {
        showInfoToast("As a premium member, your rolls are backed up automatically!");
        return;
    }

    try {
        await db.transaction('rw', db.rolls, db.pending_transactions, async () => {
            await db.rolls.update(rollId, { sync_status: 'syncing' });
            await db.pending_transactions.add({
                type: 'BACKUP_ROLL',
                payload: { rollId },
                status: 'pending',
                created_at: new Date().toISOString(),
                attempts: 0,
            });
        });
        showSuccessToast("Roll backup scheduled! It will upload when you're online.");
    } catch (error: any) {
        showErrorToast(`Failed to schedule backup: ${error.message}`);
        await db.rolls.update(rollId, { sync_status: 'local_only' });
    }
  }, [profile]);

  return {
    activeRoll,
    completedRolls,
    developingRolls,
    selectedRoll,
    setSelectedRoll,
    rollToConfirm,
    setRollToConfirm,
    rollToSpeedUp,
    setRollToSpeedUp,
    isSavingPhoto,
    startNewRoll,
    takePhoto,
    developRoll,
    speedUpDevelopment,
    unlockRoll,
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
    manuallyBackupRoll,
    queuePrintOrder,
  };
};