import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { UserProfile, Album } from '../types';
import { showErrorToast } from '../utils/toasts';

export const useAlbums = (profile: UserProfile | null) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const fetchAlbums = useCallback(async () => {
    if (!profile) return;
    const { data } = await api.fetchAlbums(profile.id);
    if (data) {
      const enhanced = data.map(album => ({
        ...album,
        rollCount: album.album_rolls?.length || 0,
        photoCount: album.album_rolls?.reduce((s, ar) => s + (ar.rolls?.shots_used || 0), 0) || 0,
      }));
      setAlbums(enhanced);
    }
  }, [profile]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const createAlbum = useCallback(async (title: string) => {
    if (!profile) return;
    const { error } = await api.createAlbum(profile.id, title);
    if (error) showErrorToast('Failed to create album.');
    else fetchAlbums();
  }, [profile, fetchAlbums]);

  const selectAlbum = useCallback(async (albumId: string) => {
    const { data } = await api.fetchAlbumDetails(albumId);
    if (data) setSelectedAlbum(data as Album);
  }, []);

  const updateAlbumRolls = useCallback(async (albumId: string, rollIds: string[]) => {
    await api.deleteAlbumRolls(albumId);
    if (rollIds.length > 0) {
      const newLinks = rollIds.map(roll_id => ({ album_id: albumId, roll_id }));
      await api.insertAlbumRolls(newLinks);
    }
    await selectAlbum(albumId);
    fetchAlbums();
  }, [selectAlbum, fetchAlbums]);

  return {
    albums,
    selectedAlbum,
    setSelectedAlbum,
    createAlbum,
    selectAlbum,
    updateAlbumRolls,
  };
};