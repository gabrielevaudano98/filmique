import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { AppContextType, FilmStock, Roll, Album } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useProfileData } from '../hooks/useProfileData';
import { useRollsAndPhotos } from '../hooks/useRollsAndPhotos';
import { useSocial } from '../hooks/useSocial';
import { useAlbums } from '../hooks/useAlbums';
import { useRollsSettings } from '../hooks/useRollsSettings';
import { usePrintOrders } from '../hooks/usePrintOrders';
import * as api from '../services/api';
import { Library, Clock, Printer, Trophy } from 'lucide-react';
import { Network } from '@capacitor/network';
import { showInfoToast, showSuccessToast } from '../utils/toasts';
import { useSyncEngine } from '../hooks/useSyncEngine';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { db } from '../integrations/db';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // UI State
  const [currentView, setCurrentView] = useState<string>('studio');
  const [cameraMode, setCameraMode] = useState<'simple' | 'pro'>('simple');
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [headerAction, setHeaderAction] = useState<{ icon: React.ElementType, action: () => void } | null>(null);
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [studioSection, setStudioSection] = useState<'darkroom' | 'albums' | 'prints'>('darkroom'); // Changed default to 'darkroom'
  const [isStudioHeaderSticky, setIsStudioHeaderSticky] = useState(false);
  const [isRollsSettingsOpen, setIsRollsSettingsOpen] = useState(false);
  const [isPrintsSettingsOpen, setIsPrintsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [printSearchTerm, setPrintSearchTerm] = useState('');
  const [printStatusFilter, setPrintStatusFilter] = useState('all');
  const [printSortOrder, setPrintSortOrder] = useState('newest');
  const [isSyncStatusModalOpen, setIsSyncStatusModalOpen] = useState(false);

  // Data State
  const [filmStocks, setFilmStocks] = useState<FilmStock[]>([]);

  const studioSectionOptions = [
    { value: 'darkroom', icon: Clock, description: 'Develop your completed rolls.', colors: { from: 'from-brand-amber-start', to: 'to-brand-amber-end', shadow: 'shadow-brand-amber-end/40' } },
    { value: 'albums', icon: Library, description: 'Your collection of developed film, organized into albums.', colors: { from: 'from-accent-violet', to: 'to-blue-500', shadow: 'shadow-blue-500/30' } },
    { value: 'prints', icon: Printer, description: 'Order prints of your photos.', colors: { from: 'from-accent-teal', to: 'to-emerald-500', shadow: 'shadow-emerald-500/30' } },
  ];

  // Modular Hooks
  const auth = useAuth();
  const profileData = useProfileData(auth.profile);
  const rollsAndPhotos = useRollsAndPhotos(auth.profile, filmStocks, auth.refreshProfile);
  const social = useSocial(auth.profile);
  const albumsData = useAlbums(auth.profile);
  const rollsSettings = useRollsSettings();
  const printOrdersData = usePrintOrders(auth.profile);
  const syncStatus = useSyncStatus(isOnline);

  // Initialize the sync engine
  useSyncEngine(isOnline);

  useEffect(() => {
    const initializeNetworkListener = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);

      Network.addListener('networkStatusChange', (status) => {
        setIsOnline(currentIsOnline => {
          if (status.connected !== currentIsOnline) {
            if (status.connected) {
              showSuccessToast("You're back online!");
            } else {
              showInfoToast("You've gone offline. Some features may be unavailable.");
            }
          }
          return status.connected;
        });
      });
    };

    initializeNetworkListener();

    return () => {
      Network.removeAllListeners();
    };
  }, []);

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

  const retryFailedTransaction = useCallback(async (transactionId: number) => {
    await db.pending_transactions.update(transactionId, { status: 'pending', attempts: 0 });
    showSuccessToast('Action has been re-queued for sync.');
  }, []);

  const deleteFailedTransaction = useCallback(async (transactionId: number) => {
    await db.pending_transactions.delete(transactionId);
    showSuccessToast('Action removed from queue.');
  }, []);

  const value = useMemo(() => ({
    ...auth,
    ...profileData,
    ...rollsAndPhotos,
    ...social,
    ...albumsData,
    ...rollsSettings,
    ...printOrdersData,
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
    syncStatus,
    isPrintsSettingsOpen,
    setIsPrintsSettingsOpen,
    printSearchTerm,
    setPrintSearchTerm,
    printStatusFilter,
    setPrintStatusFilter,
    printSortOrder,
    setPrintSortOrder,
    isSyncStatusModalOpen,
    setIsSyncStatusModalOpen,
    retryFailedTransaction,
    deleteFailedTransaction,
  }), [auth, profileData, rollsAndPhotos, social, albumsData, rollsSettings, printOrdersData, filmStocks, currentView, cameraMode, showFilmModal, headerAction, isTopBarVisible, searchTerm, studioSection, isStudioHeaderSticky, isRollsSettingsOpen, isOnline, syncStatus, isPrintsSettingsOpen, printSearchTerm, printStatusFilter, printSortOrder, isSyncStatusModalOpen, retryFailedTransaction, deleteFailedTransaction]);

  return <AppContext.Provider value={value as AppContextType}>{children}</AppContext.Provider>;
};