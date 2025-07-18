import React, { createContext, useContext, useState, useMemo } from 'react';

interface Photo {
  id: string;
  rollId: string;
  url: string;
  thumbnail: string;
  metadata: {
    iso: number;
    aperture: string;
    shutterSpeed: string;
    focal: string;
    zoom: string;
    timestamp: Date;
  };
}

interface Roll {
  id: string;
  filmType: string;
  capacity: number;
  shotsUsed: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  createdDate: Date;
  photos: Photo[];
}

interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  credits: number;
  streak: number;
  subscription: 'free' | 'plus' | 'premium'; // Added subscription property
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  target: number;
  reward: {
    xp: number;
    credits: number;
    badge?: string;
  };
  expiresAt?: Date;
  isCompleted: boolean;
}

interface AppContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  flashMode: 'on' | 'off' | 'auto';
  setFlashMode: (mode: 'on' | 'off' | 'auto') => void;
  showFilmModal: boolean;
  setShowFilmModal: (show: boolean) => void;
  activeRoll: Roll | null;
  setActiveRoll: (roll: Roll | null) => void;
  user: User;
  feed: {
    id: string;
    username: string;
    timestamp: Date;
    photos: { id: string; thumbnail: string }[];
    caption: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    rollId: string;
  }[];
  completedRolls: Roll[];
  cameraMode: 'simple' | 'pro';
  setCameraMode: (mode: 'simple' | 'pro') => void;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('off');
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [activeRoll, setActiveRoll] = useState<Roll | null>(null);
  const [completedRolls, setCompletedRolls] = useState<Roll[]>([]);
  const [cameraMode, setCameraMode] = useState<'simple' | 'pro'>('simple');

  const user: User = useMemo(() => ({
    id: 'user-123',
    username: 'TestUser',
    email: 'test@example.com',
    level: 1,
    credits: 100,
    streak: 5,
    subscription: 'free' // Initialized subscription
  }), []);

  const feed = useMemo(() => [
    {
      id: 'post-1',
      username: 'Alice',
      timestamp: new Date(),
      photos: [
        { id: 'photo-1', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-2', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-3', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-4', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-5', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-6', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
      ],
      caption: 'Enjoying the golden hour.',
      likes: 120,
      comments: 20,
      isLiked: false,
      rollId: '1'
    },
    {
      id: 'post-2',
      username: 'Bob',
      timestamp: new Date(),
      photos: [
        { id: 'photo-7', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-8', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-9', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-10', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-11', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-12', thumbnail: 'https://images.pexels.com/photos/17820068/pexels-photo-17820068/free-photo-of-a-woman-in-a-field-of-flowers.jpeg?auto=compress&cs=tinysrgb&w=200' },
      ],
      caption: 'Chasing sunsets.',
      likes: 85,
      comments: 15,
      isLiked: true,
      rollId: '2'
    },
  ], []);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 'c1',
      title: 'Daily Photo Streak',
      description: 'Take a photo every day for 3 days.',
      type: 'daily',
      progress: 2,
      target: 3,
      reward: { xp: 50, credits: 10 },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      isCompleted: false,
    },
    {
      id: 'c2',
      title: 'Weekly Explorer',
      description: 'Use 3 different film types in a week.',
      type: 'weekly',
      progress: 1,
      target: 3,
      reward: { xp: 150, credits: 30, badge: 'Explorer Badge' },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      isCompleted: false,
    },
    {
      id: 'c3',
      title: 'Pro Mode Master',
      description: 'Take 10 photos using Pro Mode.',
      type: 'special',
      progress: 10,
      target: 10,
      reward: { xp: 200, credits: 50, badge: 'Pro Master' },
      isCompleted: false, // Will be completed after this render
    },
    {
      id: 'c4',
      title: 'First Roll Completed',
      description: 'Develop your first film roll.',
      type: 'special',
      progress: 1,
      target: 1,
      reward: { xp: 100, credits: 20 },
      isCompleted: true, // Already completed
    },
  ]);

  const value = useMemo(() => ({
    currentView,
    setCurrentView,
    flashMode,
    setFlashMode,
    showFilmModal,
    setShowFilmModal,
    activeRoll,
    setActiveRoll,
    user,
    feed,
    completedRolls,
    cameraMode,
    setCameraMode,
    challenges,
    setChallenges,
  }), [currentView, setCurrentView, flashMode, setFlashMode, showFilmModal, setShowFilmModal, activeRoll, setActiveRoll, user, feed, completedRolls, cameraMode, setCameraMode, challenges, setChallenges]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
