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
  subscription: 'free' | 'plus' | 'premium';
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

const generatePhotos = (rollId: string, count: number, photoSet: number): Photo[] => {
  const photoPool = [
    // Set 1: Portraits / People
    'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg',
    'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
    'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg',
    // Set 2: City / Street
    'https://images.pexels.com/photos/374845/pexels-photo-374845.jpeg',
    'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg',
    'https://images.pexels.com/photos/777059/pexels-photo-777059.jpeg',
    'https://images.pexels.com/photos/356844/pexels-photo-356844.jpeg',
    // Set 3: Nature / Landscape
    'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg',
    'https://images.pexels.com/photos/1528640/pexels-photo-1528640.jpeg',
    'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg',
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
  ];
  
  const selectedPool = photoSet === 1 ? photoPool.slice(0,4) : photoSet === 2 ? photoPool.slice(4,8) : photoPool.slice(8,12);

  return Array.from({ length: count }, (_, i) => {
    const url = selectedPool[i % selectedPool.length];
    return {
      id: `${rollId}-photo-${i}`,
      rollId,
      url: `${url}?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
      thumbnail: `${url}?auto=compress&cs=tinysrgb&w=400`,
      metadata: {
        iso: 400,
        aperture: 'f/8',
        shutterSpeed: '1/125',
        focal: '50mm',
        zoom: '1x',
        timestamp: new Date(),
      },
    };
  });
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('off');
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [activeRoll, setActiveRoll] = useState<Roll | null>(null);
  
  const [completedRolls, setCompletedRolls] = useState<Roll[]>([
    {
      id: 'roll-1',
      filmType: 'Kodak Gold 200',
      capacity: 24,
      shotsUsed: 24,
      isCompleted: true,
      isUnlocked: true,
      createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      photos: generatePhotos('roll-1', 24, 1),
    },
    {
      id: 'roll-2',
      filmType: 'Cinestill 800T',
      capacity: 36,
      shotsUsed: 36,
      isCompleted: true,
      isUnlocked: false,
      createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      photos: generatePhotos('roll-2', 36, 2),
    },
    {
      id: 'roll-3',
      filmType: 'Ilford HP5+ B&W',
      capacity: 12,
      shotsUsed: 12,
      isCompleted: true,
      isUnlocked: true,
      createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      photos: generatePhotos('roll-3', 12, 3),
    },
  ]);

  const [cameraMode, setCameraMode] = useState<'simple' | 'pro'>('simple');

  const user: User = useMemo(() => ({
    id: 'user-123',
    username: 'TestUser',
    email: 'test@example.com',
    level: 5,
    credits: 150,
    streak: 5,
    subscription: 'free'
  }), []);

  const feed = useMemo(() => [
    {
      id: 'post-1',
      username: 'Alice',
      timestamp: new Date(),
      photos: [
        { id: 'photo-1', thumbnail: 'https://images.pexels.com/photos/16856558/pexels-photo-16856558/free-photo-of-a-woman-wearing-sunglasses-and-a-hat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-2', thumbnail: 'https://images.pexels.com/photos/16856558/pexels-photo-16856558/free-photo-of-a-woman-wearing-sunglasses-and-a-hat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-3', thumbnail: 'https://images.pexels.com/photos/16856558/pexels-photo-16856558/free-photo-of-a-woman-wearing-sunglasses-and-a-hat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-4', thumbnail: 'https://images.pexels.com/photos/16856558/pexels-photo-16856558/free-photo-of-a-woman-wearing-sunglasses-and-a-hat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-5', thumbnail: 'https://images.pexels.com/photos/16856558/pexels-photo-16856558/free-photo-of-a-woman-wearing-sunglasses-and-a-hat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-6', thumbnail: 'https://images.pexels.com/photos/16856558/pexels-photo-16856558/free-photo-of-a-woman-wearing-sunglasses-and-a-hat.jpeg?auto=compress&cs=tinysrgb&w=200' },
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
        { id: 'photo-7', thumbnail: 'https://images.pexels.com/photos/17744413/pexels-photo-17744413/free-photo-of-close-up-of-a-cat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-8', thumbnail: 'https://images.pexels.com/photos/17744413/pexels-photo-17744413/free-photo-of-close-up-of-a-cat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-9', thumbnail: 'https://images.pexels.com/photos/17744413/pexels-photo-17744413/free-photo-of-close-up-of-a-cat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-10', thumbnail: 'https://images.pexels.com/photos/17744413/pexels-photo-17744413/free-photo-of-close-up-of-a-cat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-11', thumbnail: 'https://images.pexels.com/photos/17744413/pexels-photo-17744413/free-photo-of-close-up-of-a-cat.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 'photo-12', thumbnail: 'https://images.pexels.com/photos/17744413/pexels-photo-17744413/free-photo-of-close-up-of-a-cat.jpeg?auto=compress&cs=tinysrgb&w=200' },
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
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
      isCompleted: true,
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
  }), [currentView, flashMode, showFilmModal, activeRoll, user, feed, completedRolls, cameraMode, challenges]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
