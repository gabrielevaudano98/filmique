import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  credits: number;
  streak: number;
  subscription: 'free' | 'plus' | 'premium';
  followersCount: number;
  followingCount: number;
  totalRolls: number;
  totalPhotos: number;
}

export interface FilmRoll {
  id: string;
  filmType: string;
  capacity: number;
  shotsUsed: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  unlockDate?: Date;
  createdDate: Date;
  photos: Photo[];
}

export interface Photo {
  id: string;
  rollId: string;
  url: string;
  thumbnail: string;
  metadata: {
    iso: number;
    aperture: string;
    shutterSpeed: string;
    focal: string;
    timestamp: Date;
  };
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  rollId: string;
  photos: Photo[];
  caption: string;
  likes: number;
  comments: number;
  timestamp: Date;
  isLiked: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  reward: {
    xp: number;
    credits: number;
    badge?: string;
  };
  progress: number;
  target: number;
  isCompleted: boolean;
  expiresAt?: Date;
}

interface AppContextType {
  user: User;
  setUser: (user: User) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  activeRoll: FilmRoll | null;
  setActiveRoll: (roll: FilmRoll | null) => void;
  completedRolls: FilmRoll[];
  setCompletedRolls: (rolls: FilmRoll[]) => void;
  feed: Post[];
  setFeed: (posts: Post[]) => void;
  challenges: Challenge[];
  setChallenges: (challenges: Challenge[]) => void;
  cameraMode: 'simple' | 'pro';
  setCameraMode: (mode: 'simple' | 'pro') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: '1',
    username: 'photographer_23',
    email: 'user@example.com',
    level: 5,
    xp: 2340,
    credits: 45,
    streak: 7,
    subscription: 'plus',
    followersCount: 234,
    followingCount: 156,
    totalRolls: 23,
    totalPhotos: 456
  });

  const [currentView, setCurrentView] = useState('home');
  const [activeRoll, setActiveRoll] = useState<FilmRoll | null>(null);
  const [completedRolls, setCompletedRolls] = useState<FilmRoll[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [cameraMode, setCameraMode] = useState<'simple' | 'pro'>('simple');

  // Initialize with sample data
  useEffect(() => {
    // Sample completed rolls
    const sampleRolls: FilmRoll[] = [
      {
        id: '1',
        filmType: 'Kodak Gold 200',
        capacity: 24,
        shotsUsed: 24,
        isCompleted: true,
        isUnlocked: true,
        createdDate: new Date('2024-01-10'),
        photos: Array.from({ length: 24 }, (_, i) => ({
          id: `photo-${i}`,
          rollId: '1',
          url: `https://images.pexels.com/photos/247851/pexels-photo-247851.jpeg?auto=compress&cs=tinysrgb&w=800`,
          thumbnail: `https://images.pexels.com/photos/247851/pexels-photo-247851.jpeg?auto=compress&cs=tinysrgb&w=400`,
          metadata: {
            iso: 200,
            aperture: 'f/5.6',
            shutterSpeed: '1/125',
            focal: '50mm',
            timestamp: new Date()
          }
        }))
      }
    ];

    // Sample feed posts
    const sampleFeed: Post[] = [
      {
        id: '1',
        userId: '2',
        username: 'street_wanderer',
        rollId: '1',
        photos: Array.from({ length: 12 }, (_, i) => ({
          id: `feed-photo-${i}`,
          rollId: '1',
          url: `https://images.pexels.com/photos/2882566/pexels-photo-2882566.jpeg?auto=compress&cs=tinysrgb&w=800`,
          thumbnail: `https://images.pexels.com/photos/2882566/pexels-photo-2882566.jpeg?auto=compress&cs=tinysrgb&w=400`,
          metadata: {
            iso: 400,
            aperture: 'f/2.8',
            shutterSpeed: '1/60',
            focal: '35mm',
            timestamp: new Date()
          }
        })),
        caption: 'Street photography session with Tri-X 400. Love the grain and contrast! 📸',
        likes: 127,
        comments: 23,
        timestamp: new Date('2024-01-15'),
        isLiked: false
      }
    ];

    // Sample challenges
    const sampleChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Daily Shooter',
        description: 'Take 5 photos today',
        type: 'daily',
        reward: { xp: 50, credits: 10 },
        progress: 3,
        target: 5,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Film Explorer',
        description: 'Try 3 different film types this week',
        type: 'weekly',
        reward: { xp: 200, credits: 25, badge: 'Film Explorer' },
        progress: 1,
        target: 3,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];

    setCompletedRolls(sampleRolls);
    setFeed(sampleFeed);
    setChallenges(sampleChallenges);
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      currentView,
      setCurrentView,
      activeRoll,
      setActiveRoll,
      completedRolls,
      setCompletedRolls,
      feed,
      setFeed,
      challenges,
      setChallenges,
      cameraMode,
      setCameraMode
    }}>
      {children}
    </AppContext.Provider>
  );
};
