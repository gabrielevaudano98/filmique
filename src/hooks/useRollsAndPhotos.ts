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

  // --- Live Queries: The new source of truth from the local DB ---
  const allRolls = useLiveQuery(
    () => profile ? db.rolls.where('user_id').equals(profile.id).toArray() : [],
    [profile]
  );

  // Refactored to prevent initialization errors during re-renders.
  const activeRoll = useMemo(() => {
    if (!allRolls) return null;
    return allRolls.find(r => !r.is_completed) || null;
  }, [allRolls]);

  const completedRolls = useMemo(() => {
    if (!allRolls) return [];
    return allRolls.filter(r => r.is_completed);
  }, [allRolls]);

  // Syncs data from Supabase down to the local Dexie DB.
  const syncDownRollsFromCloud = useCallback(async () => {
    if (!profile) return;
    const { data: cloudRolls, error } = await api.fetchAllRolls(profile.id);
    if (error || !cloudRolls) return;

    // Dexie's bulkPut is smart: it inserts new records and updates existing ones.
    await db.rolls.bulkPut(cloudRolls as LocalRoll[]);
    
    // We also need to sync photos for these rolls
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
      // Credit deduction is server-authoritative and must happen online.
      const { error: updateError } = await api.updateProfile(profile.id, { credits: profile.credits - film.price });
      if (updateError) throw updateError;

      await refreshProfile();

      // If there's an existing active roll, delete it locally.
      // Fetch the current active roll directly from the DB to avoid stale closures.
      const userRolls = await db.rolls.where({ user_id: profile.id }).toArray();
      const currentActiveRoll = userRolls.find(r => !r.is_completed);
      if (currentActiveRoll) {
        await db.rolls.delete(currentActiveRoll.id);
        // TODO: Queue a transaction to delete the old roll from Supabase.
      }

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
      
      await db.rolls.add(newRoll);
      
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
      // Fetch the current active roll directly from the DB to ensure we have the latest state
      const currentActiveRoll = await db.rolls.where({ user_id: profile.id, is_completed: false }).first();

      if (!currentActiveRoll) {
        showErrorToast("No active roll loaded.");
        setIsSavingPhoto(false);
        return;
      }

      if (currentActiveRoll.shots_used >= currentActiveRoll.capacity) {
        showWarningToast("This film roll is already full.");
        setIsSavingPhoto(false);
        return;
      }

      // TODO: STEP 3 - Save imageBlob to local filesystem and get local_path.
      // For now, we'll proceed with only the database record.
      const local_path = `placeholder/${profile.id}/${currentActiveRoll.id}/${Date.now()}.jpeg`;

      const newPhoto: LocalPhoto = {
        id: crypto.randomUUID(),
        user_id: profile.id,
        roll_id: currentActiveRoll.id,
        local_path,
        metadata,
        created_at: new Date().toISOString(),
      };

      const newShotsUsed = currentActiveRoll.shots_used + 1;
      const isCompleted = newShotsUsed >= currentActiveRoll.capacity;

      // Use a Dexie transaction to ensure both operations succeed or fail together.
      await db.transaction('rw', db.photos, db.rolls, async () => {
        await db.photos.add(newPhoto);
        await db.rolls.update(currentActiveRoll.id, { 
          shots_used: newShotsUsed, 
          is_completed: isCompleted 
        });
      });

      if (isCompleted) {
        const completedRoll = await db.rolls.get(currentActiveRoll.id);
        if (completedRoll) setRollToConfirm(completedRoll);
      }

    } catch (error) {
      console.error("Failed to save photo locally:", error);
      showErrorToast('Failed to save photo.');
    } finally {
      setIsSavingPhoto(false);
    }
  }, [profile, isSavingPhoto, impact]);

  const sendToStudio = async (roll: Roll, title: string) => {
    const completedAt = new Date().toISOString();
    await db.rolls.update(roll.id, { title, completed_at: completedAt });
    // TODO: Queue a transaction to update the roll in Supabase.
    showSuccessToast("Roll sent to the studio!");
  };

  const putOnShelf = async (roll: Roll, title: string) => {
    await db.rolls.update(roll.id, { title });
    // TODO: Queue a transaction to update the roll in Supabase.
    showSuccessToast("Roll placed on your shelf.");
  };

  const developShelvedRoll = async (rollId: string) => {
    await db.rolls.update(rollId, { completed_at: new Date().toISOString() });
    // TODO: Queue a transaction to update the roll in Supabase.
    showSuccessToast("Roll sent to the studio!");
  };

  const developRoll = useCallback(async (roll: Roll) => {
    if (!profile) return;
    const toastId = showLoadingToast('Developing your film...');
    try {
      // TODO: This needs to be refactored for offline.
      // The image processing should happen locally, then get queued for upload.
      await api.developRollPhotos(roll, filmStocks);
      await db.rolls.update(roll.id, { developed_at: new Date().toISOString() });
      
      const updatedRoll = await db.rolls.get(roll.id);
      if (updatedRoll) setDevelopedRollForWizard(updatedRoll);

      showSuccessToast('Roll developed successfully!');
      notification(NotificationType.Success);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to develop roll.');
    } finally {
      dismissToast(toastId);
    }
  }, [profile, filmStocks, notification]);

  const updateRollTitle = useCallback(async (rollId: string, title: string) => {
    await db.rolls.update(rollId, { title });
    // TODO: Queue transaction
    return true;
  }, []);

  const updateRollTags = useCallback(async (rollId: string, tags: string[]) => {
    await db.rolls.update(rollId, { tags });
    // TODO: Queue transaction
    showSuccessToast('Tags updated!');
    return true;
  }, []);

  const deleteRoll = useCallback(async (rollId: string) => {
    if (!profile) return;
    const toastId = showLoadingToast('Deleting roll...');
    try {
      // Delete locally first for immediate UI feedback.
      await db.transaction('rw', db.rolls, db.photos, async () => {
        await db.rolls.delete(rollId);
        await db.photos.where('roll_id').equals(rollId).delete();
      });
      setSelectedRoll(null);
      showSuccessToast('Roll deleted from device.');

      // TODO: Queue a transaction to delete everything from Supabase.
      // For now, we'll call the API directly.
      await api.deleteRollById(rollId);

    } catch (error: any) {
      showErrorToast(`Failed to delete roll: ${error?.message}`);
    } finally {
      dismissToast(toastId);
    }
  }, [profile]);

  const downloadPhoto = useCallback(async (photo: Photo) => {
    // This will need to be updated to read from local file storage first.
    try {
      const response = await fetch(photo.url!);
      saveAs(await response.blob(), filenameFromUrl(photo.url!));
      showSuccessToast('Photo download started!');
    } catch (error) {
      showErrorToast('Could not download photo.');
    }
  }, []);

  const downloadRoll = useCallback(async (roll: Roll) => {
    // This will need to be updated to read from local file storage.
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
    // TODO: Queue transaction
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