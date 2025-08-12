import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
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

  // Theme: initialize from localStorage or system preference
  const getInitialTheme = (): 'dark' | 'light' => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      // ignore
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  };

  const [theme, setThemeState] = useState<'dark' | 'light'>(getInitialTheme);

  // Expose a setter that persists
  const setTheme = (t: 'dark' | 'light') => {
    try {
      localStorage.setItem('theme', t);
    } catch (e) {
      // ignore
    }
    setThemeState(t);
  };

  // Apply data-theme attribute to the document root for CSS to react to
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

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
    theme,
    setTheme,
  }), [auth, profileData, rollsAndPhotos, social, albumsData, currentView, cameraMode, showFilmModal, theme]);

  return <AppContext.Provider value={value as AppContextType}>{children}</AppContext.Provider>;
};