import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { AppContextType, FilmStock, Roll, Album } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useProfileData } from '../hooks/useProfileData';
import { useRollsAndPhotos } from '../hooks/useRollsAndPhotos';
import { useSocial } from '../hooks/useSocial';
import { useAlbums } from '../hooks/useAlbums';
import { useRollsSettings } from '../hooks/useRollsSettings';
import * as api from '../services/api';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // UI State
  const [currentView, setCurrentView] = useState<string>('rolls');
  const [cameraMode, setCameraMode] = useState<'simple' | 'pro'>('simple');
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [headerAction, setHeaderAction] = useState<{ icon: React.ElementType, action: () => void } | null>(null);
  const [rollsViewSection, setRollsViewSection] = useState<'studio' | 'shelf'>('studio');
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);

  // Data State
  const [filmStocks, setFilmStocks] = useState<FilmStock[]>([]);

  // Modular Hooks
  const auth = useAuth();
  const profileData = useProfileData(auth.profile);
  const rollsAndPhotos = useRollsAndPhotos(auth.profile, filmStocks, auth.refreshProfile);
  const social = useSocial(auth.profile);
  const albumsData = useAlbums(auth.profile);
  const rollsSettings = useRollsSettings();

  useEffect(() => {
    const getFilmStocks = async () => {
      const { data, error } = await api.fetchFilmStocks();
      if (error) {
        console.error("Failed to fetch film stocks:", error);
      } else {
        setFilmStocks(data as FilmStock[]);
      }
    };
    if (auth.session) {
      getFilmStocks();
    }
  }, [auth.session]);

  const createAlbumWithRefresh: AppContextType['createAlbum'] = async (title, type, parentAlbumId) => {
    await albumsData.createAlbum(title, type, parentAlbumId);
    await albumsData.refetchAlbums();
  };

  const createPostWithRefresh: AppContextType['createPost'] = async (rollId, caption, coverUrl, albumId) => {
    await social.createPost(rollId, caption, coverUrl, albumId);
    await social.fetchFeed();
  };

  const value = useMemo(() => ({
    ...auth,
    ...profileData,
    ...rollsAndPhotos,
    ...social,
    ...albumsData,
    ...rollsSettings,
    createAlbum: createAlbumWithRefresh,
    createPost: createPostWithRefresh,
    filmStocks,
    currentView,
    setCurrentView,
    cameraMode,
    setCameraMode,
    showFilmModal,
    setShowFilmModal,
    developShelvedRoll: rollsAndPhotos.developShelvedRoll,
    headerAction,
    setHeaderAction,
    rollsViewSection,
    setRollsViewSection,
    isTopBarVisible,
    setIsTopBarVisible,
  }), [auth, profileData, rollsAndPhotos, social, albumsData, rollsSettings, filmStocks, currentView, cameraMode, showFilmModal, headerAction, rollsViewSection, isTopBarVisible]);

  return <AppContext.Provider value={value as AppContextType}>{children}</AppContext.Provider>;
};