import { Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  credits: number;
  streak: number;
  subscription: 'free' | 'plus' | 'premium';
  updated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  has_completed_onboarding: boolean;
  bio: string | null;
}

export interface Photo {
  id: string;
  user_id: string;
  roll_id: string;
  url: string;
  thumbnail_url: string;
  metadata: any;
  created_at: string;
}

export interface Roll {
  id: string;
  user_id: string;
  film_type: string;
  capacity: number;
  shots_used: number;
  is_completed: boolean;
  created_at: string;
  completed_at?: string | null;
  developed_at?: string | null;
  photos?: Photo[];
  title?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string; avatar_url: string | null };
  user_id: string;
}

export interface Post {
  id: string;
  user_id: string;
  roll_id: string;
  caption: string;
  created_at: string;
  cover_photo_url: string | null;
  profiles: { id?: string; username: string; avatar_url: string | null; level?: number; };
  rolls: { title: string | null; film_type: string, developed_at?: string | null, photos: Photo[] };
  likes: { user_id: string }[];
  comments: Comment[];
  isLiked?: boolean;
  isFollowed?: boolean;
}

export interface Album {
  id: string;
  user_id: string;
  title: string;
  cover_image_url: string | null;
  type: 'personal' | 'shared' | 'public';
  created_at: string;
  album_rolls?: { roll_id: string, rolls: { photos: Photo[], developed_at?: string | null } }[];
  photoCount?: number;
  rollCount?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  target: number;
  reward: { xp: number; credits: number; badge?: string };
  expires_at?: string | null;
  progress?: number;
  isCompleted?: boolean;
}

export interface Notification {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  entity_id: string;
  actors: {
    username: string;
    avatar_url: string | null;
  };
  posts?: {
    rolls?: {
      photos: { thumbnail_url: string }[];
    };
  };
}

export interface UserBadge {
  created_at: string;
  badges: {
    name: string;
    description: string;
    icon_name: string;
  };
}

export interface AppContextType {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  currentView: string;
  setCurrentView: (view: string) => void;
  cameraMode: 'simple' | 'pro';
  setCameraMode: (mode: 'simple' | 'pro') => void;
  showFilmModal: boolean;
  setShowFilmModal: (show: boolean) => void;
  activeRoll: Roll | null;
  completedRolls: Roll[];
  feed: Post[];
  albums: Album[];
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  notifications: Notification[];
  userBadges: UserBadge[];
  recentStories: Map<string, { user: UserProfile, posts: Post[] }>;
  startNewRoll: (filmType: string, capacity: number) => Promise<void>;
  takePhoto: (imageBlob: Blob, metadata: any) => Promise<void>;
  setFeed: React.Dispatch<React.SetStateAction<Post[]>>;
  refreshProfile: () => Promise<void>;
  authStep: 'login' | 'otp';
  setAuthStep: (s: 'login' | 'otp') => void;
  verificationEmail: string;
  handleLogin: (email: string) => Promise<void>;
  handleVerifyOtp: (token: string) => Promise<void>;
  selectedRoll: Roll | null;
  setSelectedRoll: (r: Roll | null) => void;
  developRoll: (roll: Roll) => Promise<void>;
  selectedAlbum: Album | null;
  setSelectedAlbum: (a: Album | null) => void;
  selectAlbum: (albumId: string) => Promise<void>;
  createAlbum: (title: string) => Promise<void>;
  updateAlbumRolls: (albumId: string, rollIds: string[]) => Promise<void>;
  updateRollTitle: (rollId: string, title: string) => Promise<boolean>;
  handleLike: (postId: string, postOwnerId: string, isLiked?: boolean) => Promise<void>;
  handleFollow: (userId: string, isFollowed?: boolean) => Promise<void>;
  createPost: (rollId: string, caption: string, coverPhotoUrl: string | null) => Promise<void>;
  addComment: (postId: string, postOwnerId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<UserProfile[] | null>;
  rollToName: Roll | null;
  setRollToName: (r: Roll | null) => void;
  deleteRoll: (rollId: string) => Promise<void>;
  downloadPhoto: (photo: Photo) => Promise<void>;
  downloadRoll: (roll: Roll) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  followersCount: number;
  followingCount: number;
  updateProfileDetails: (details: { bio?: string; avatarFile?: File }) => Promise<void>;
}