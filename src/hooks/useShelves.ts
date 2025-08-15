import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { UserProfile, Album as Shelf } from '../types';
import { showErrorToast } from '../utils/toasts';

export const useShelves = (profile: UserProfile | null) => {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);

  const refetchShelves = useCallback(async () => {
    if (!profile) return;
    const { data } = await api.fetchAlbums(profile.id);
    if (data) {
      const enhanced = data.map(shelf => ({
        ...shelf,
        rollCount: shelf.rolls?.length || 0,
        photoCount: shelf.rolls?.reduce((s, r) => s + (r.shots_used || 0), 0) || 0,
      }));
      setShelves(enhanced);
    }
  }, [profile]);

  const createShelf = useCallback(async (title: string) => {
    if (!profile) return;
    const { error } = await api.createAlbum(profile.id, title);
    if (error) showErrorToast('Failed to create shelf.');
    else refetchShelves();
  }, [profile, refetchShelves]);

  const selectShelf = useCallback(async (shelfId: string) => {
    const { data } = await api.fetchAlbumDetails(shelfId);
    if (data) setSelectedShelf(data as Shelf);
  }, []);

  const addRollsToShelf = useCallback(async (shelfId: string, rollIds: string[]) => {
    const { error } = await api.updateRollsAlbum(rollIds, shelfId);
    if (error) {
      showErrorToast('Failed to add rolls.');
    } else {
      refetchShelves();
      if (selectedShelf?.id === shelfId) {
        selectShelf(shelfId);
      }
    }
  }, [refetchShelves, selectedShelf, selectShelf]);

  const removeRollFromShelf = useCallback(async (rollId: string) => {
    const { error } = await api.updateRollsAlbum([rollId], null);
    if (error) {
      showErrorToast('Failed to remove roll from shelf.');
    } else {
      refetchShelves();
      if (selectedShelf) {
        selectShelf(selectedShelf.id);
      }
    }
  }, [refetchShelves, selectedShelf, selectShelf]);

  return {
    shelves,
    selectedShelf,
    setSelectedShelf,
    createShelf,
    selectShelf,
    addRollsToShelf,
    removeRollFromShelf,
    refetchShelves,
  };
};