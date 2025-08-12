import React, { createContext, useContext, useState, useMemo } from 'react';
import { AppContextType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useProfileData } from '../hooks/useProfileData';
import { useRollsAndPhotos } from '../hooks/useRollsAndPhotos';
import { useSocial } from '../hooks/useSocial';
import { useAlbums } from '../hooks/useAlbums';

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

  // Modular Hooks
  const auth = useAuth();
  const profileData = useProfileData(auth.profile);
  const rollsAndPhotos = useRollsAndPhotos(auth.profile);
  const social = useSocial(auth.profile);
  const albumsData = useAlbums(auth.profile);

  const value = useMemo(() => ({
    ...auth,
    ...profileData,
    ...rollsAndPhotos,
    ...social,
    ...albumsData,
    currentView,
    setCurrentView,
    cameraMode,
    setCameraMode,
    showFilmModal,
    setShowFilmModal,
    refetchRolls: rollsAndPhotos.refetchRolls,
  }), [auth, profileData, rollsAndPhotos, social, albumsData, currentView, cameraMode, showFilmModal]);

  return <AppContext.Provider value={value as AppContextType}>{children}</AppContext.Provider>;
};