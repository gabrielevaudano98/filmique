import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { UserProfile, Album } from '../types';
import { showErrorToast } from '../utils/toasts';

export const useAlbums = (profile: UserProfile | null) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const refetchAlbums = useCallback(async () => {
    if (!profile) return;
    const { data } = await api.fetchAlbums(profile.id);
    if (data) {
      const enhanced = data.map(album => ({
        ...album,
        rollCount: album.rolls?.length || 0,
        photoCount: album.rolls?.reduce((s, r) => s + (r.shots_used || 0), 0) || 0,
      }));
      setAlbums(enhanced);
    }
  }, [profile]);

  const createAlbum = useCallback(async (title: string, type: 'private' | 'unlisted' | 'public', parentAlbumId?: string | null) => {
    if (!profile) return;
    const { error } = await api.createAlbum(profile.id, title, type, parentAlbumId);
    if (error) showErrorToast('Failed to create album.');
    else refetchAlbums();
  }, [profile, refetchAlbums]);

  const selectAlbum = useCallback(async (albumId: string) => {
    const { data } = await api.fetchAlbumDetails(albumId);
    if (data) setSelectedAlbum(data as Album);
  }, []);

  const addRollsToAlbum = useCallback(async (albumId: string, rollIds: string[]) => {
    const { error } = await api.updateRollsAlbum(rollIds, albumId);
    if (error) {
      showErrorToast('Failed to add rolls.');
    } else {
      refetchAlbums();
      if (selectedAlbum?.id === albumId) {
        selectAlbum(albumId);
      }
    }
  }, [refetchAlbums, selectedAlbum, selectAlbum]);

  const removeRollFromAlbum = useCallback(async (rollId: string) => {
    const { error } = await api.updateRollsAlbum([rollId], null);
    if (error) {
      showErrorToast('Failed to remove roll from album.');
    } else {
      refetchAlbums();
      if (selectedAlbum) {
        selectAlbum(selectedAlbum.id);
      }
    }
  }, [refetchAlbums, selectedAlbum, selectAlbum]);

  const moveAlbum = useCallback(async (albumId: string, newParentId: string | null) => {
    if (!profile) return;
    setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, parent_album_id: newParentId } : a));
    const { error } = await api.updateAlbum(albumId, profile.id, { parent_album_id: newParentId });
    if (error) {
      showErrorToast('Failed to move album.');
      refetchAlbums();
    }
  }, [profile, refetchAlbums]);

  return {
    albums,
    selectedAlbum,
    setSelectedAlbum,
    createAlbum,
    selectAlbum,
    addRollsToAlbum,
    removeRollFromAlbum,
    refetchAlbums,
    moveAlbum,
  };
};