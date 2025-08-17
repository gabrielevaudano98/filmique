import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { AppContextType, FilmStock, Roll, Album } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useProfileData } from '../hooks/useProfileData';
import { useRollsAndPhotos } from '../hooks/useRollsAndPhotos';
import { useSocial } from '../hooks/useSocial';
import { useAlbums } from '../hooks/useAlbums';
import { useRollsSettings } from '../hooks/useRollsSettings';
import * as api from '../services/api';
import { Library, Clock, Printer } from 'lucide-react';
import { Network } from '@capacitor/network';
import { showInfoToast, showSuccessToast } from '../utils/toasts';
import { dbService } from '../services/database';
import { syncService } from '../services/sync';

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
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [studioSection, setStudioSection] = useState<'rolls' | 'darkroom' | 'prints'>('rolls');
  const [isStudioHeaderSticky, setIsStudioHeaderSticky] = useState(false);
  const [isRollsSettingsOpen, setIsRollsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  // Data State
  const [filmStocks, setFilmStocks] = useState<FilmStock[]>([]);

  const studioSectionOptions = [
    { value: 'rolls', icon: Library, description: 'Your collection of developed film.', colors: { from: 'from-accent-violet', to: 'to-blue-500', shadow: 'shadow-blue-500/30' } },
    { value: 'darkroom', icon: Clock, description: 'Develop your completed rolls.', colors: { from: 'from-brand-amber-start', to: 'to-brand-amber-end', shadow: 'shadow-brand-amber-end/40' } },
    { value: 'prints', icon: Printer, description: 'Order prints of your photos.', colors: { from: 'from-accent-teal', to: 'to-emerald-500', shadow: 'shadow-emerald-500/30' } },
  ];

  // Initialize DB
  useEffect(() => {
    dbService.initializeDatabase().then(() => setIsDbInitialized(true));
  }, []);

  // Modular Hooks
  const auth = useAuth();
  const profileData = useProfileData(auth.profile);
  const rollsAndPhotos = useRollsAndPhotos(auth.profile, filmStocks, auth.refreshProfile);
  const social = useSocial(auth.profile);
  const albumsData = useAlbums(auth.profile);
  const rollsSettings = useRollsSettings();

  // Network and Sync Logic
  useEffect(() => {
    const initializeNetworkListener = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      if (status.connected) {
        syncService.runSync().then(() => rollsAndPhotos.refetchRolls());
      }

      Network.addListener('networkStatusChange', (status) => {
        setIsOnline(currentIsOnline => {
          if (status.connected && !currentIsOnline) {
            showSuccessToast("You're back online! Syncing changes.");
            syncService.runSync().then(() => rollsAndPhotos.refetchRolls());
          } else if (!status.connected && currentIsOnline) {
            showInfoToast("You've gone offline. Changes will be saved locally.");
          }
          return status.connected;
        });
      });
    };

    if (isDbInitialized && auth.session) {
      initializeNetworkListener();
    }

    return () => {
      Network.removeAllListeners();
    };
  }, [isDbInitialized, auth.session, rollsAndPhotos.refetchRolls]);

  useEffect(() => {
    const getFilmStocks = async () => {
      const { data, error } = await api.fetchFilmStocks();
      if (error) console.error("Failed to fetch film stocks:", error);
      else setFilmStocks(data as FilmStock[]);
    };
    if (auth.session) getFilmStocks();
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
    isTopBarVisible,
    setIsTopBarVisible,
    searchTerm,
    setSearchTerm,
    studioSection,
    setStudioSection,
    isStudioHeaderSticky,
    setIsStudioHeaderSticky,
    studioSectionOptions,
    isRollsSettingsOpen,
    setIsRollsSettingsOpen,
    isOnline,
  }), [auth, profileData, rollsAndPhotos, social, albumsData, rollsSettings, filmStocks, currentView, cameraMode, showFilmModal, headerAction, isTopBarVisible, searchTerm, studioSection, isStudioHeaderSticky, isRollsSettingsOpen, isOnline]);

  if (!isDbInitialized) {
    return <div>Initializing...</div>;
  }

  return <AppContext.Provider value={value as AppContextType}>{children}</AppContext.Provider>;
};