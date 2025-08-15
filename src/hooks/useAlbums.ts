import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { UserProfile, Album } from '../types';
import { showErrorToast } from '../utils/toasts';
import { getCache, setCache, invalidateCache } from '../utils/cache';

export const useAlbums = (profile: UserProfile | null) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const fetchAlbums = useCallback(async () => {
    if (!profile) return;
    const cacheKey = `albums-${profile.id}`;

    const cachedAlbums = getCache<Album[]>(cacheKey);
    if (cachedAlbums) {
      setAlbums(cachedAlbums);
    }

    const { data } = await api.fetchAlbums(profile.id);
    if (data) {
      const enhanced = data.map(album => ({
        ...album,
        rollCount: album.rolls?.length || 0,
        photoCount: album.rolls?.reduce((s, r) => s + (r.shots_used || 0), 0) || 0,
      }));
      setAlbums(enhanced);
      setCache(cacheKey, enhanced);
    }
  }, [profile]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const createAlbum = useCallback(async (title: string) => {
    if (!profile) return;
    const { error } = await api.createAlbum(profile.id, title);
    if (error) showErrorToast('Failed to create album.');
    else {
      invalidateCache(`albums-${profile.id}`);
      fetchAlbums();
    }
  }, [profile, fetchAlbums]);

  const selectAlbum = useCallback(async (albumId: string) => {
    const { data } = await api.fetchAlbumDetails(albumId);
    if (data) setSelectedAlbum(data as Album);
  }, []);

  const addRollsToAlbum = useCallback(async (albumId: string, rollIds: string[]) => {
    if (!profile) return;
    const { error } = await api.updateRollsAlbum(rollIds, albumId);
    if (error) {
      showErrorToast('Failed to add rolls.');
    } else {
      invalidateCache([`albums-${profile.id}`, `rolls-${profile.id}`]);
      fetchAlbums();
      if (selectedAlbum?.id === albumId) {
        selectAlbum(albumId);
      }
    }
  }, [profile, fetchAlbums, selectedAlbum, selectAlbum]);

  const removeRollFromAlbum = useCallback(async (rollId: string) => {
    if (!profile) return;
    const { error } = await api.updateRollsAlbum([rollId], null);
    if (error) {
      showErrorToast('Failed to remove roll from album.');
    } else {
      invalidateCache([`albums-${profile.id}`, `rolls-${profile.id}`]);
      fetchAlbums();
      if (selectedAlbum) {
        selectAlbum(selectedAlbum.id);
      }
    }
  }, [profile, fetchAlbums, selectedAlbum, selectAlbum]);

  return {
    albums,
    selectedAlbum,
    setSelectedAlbum,
    createAlbum,
    selectAlbum,
    addRollsToAlbum,
    removeRollFromAlbum,
    refetchAlbums: fetchAlbums,
  };
};