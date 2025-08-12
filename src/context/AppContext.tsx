import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { applyFilter } from '../utils/imageProcessor';
import { filmPresets } from '../utils/filters';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { extractStoragePathFromPublicUrl, filenameFromUrl } from '../utils/storage';
import { isNonEmptyString, isEmail } from '../utils/validators';

/**
 * AppContext
 *
 * Responsibilities:
 * - Provide a centralized app state for auth, user profile, rolls, feed, albums, notifications.
 * - Provide a concise, well-documented public API used across UI components.
 *
 * Notes:
 * - All public functions validate inputs minimally and report user-facing errors via toast.
 * - Side effects with Supabase are handled consistently and update local state where appropriate.
 */

/* ----------------------------- Types ---------------------------------- */

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

/* ----------------------- Context public interface --------------------- */

interface AppContextType {
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
  notifications: Notification[];
  userBadges: UserBadge[];
  recentStories: Map<string, { user: UserProfile, posts: Post[] }>;
  // actions
  startNewRoll: (filmType: string, capacity: number) => Promise<void>;
  takePhoto: (imageBlob: Blob, metadata: any) => Promise<void>;
  setFeed: React.Dispatch<React.SetStateAction<Post[]>>;
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  refreshProfile: () => Promise<void>;
  // auth flows
  authStep: 'login' | 'otp';
  setAuthStep: (s: 'login' | 'otp') => void;
  verificationEmail: string;
  handleLogin: (email: string) => Promise<void>;
  handleVerifyOtp: (token: string) => Promise<void>;
  // selections
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

/* ------------------------- Internal helpers -------------------------- */

const POST_SELECT_QUERY = '*, cover_photo_url, profiles!posts_user_id_fkey(username, avatar_url, level, id), rolls!posts_roll_id_fkey(title, film_type, developed_at, photos(*)), likes(user_id), comments(*, profiles(username, avatar_url))';

const showErrorToast = (message: string) => {
  toast.error(message || 'Something went wrong. Please try again.');
};

const showSuccessToast = (message: string) => {
  toast.success(message);
};

const ensureProfile = (profile: UserProfile | null): profile is UserProfile => {
  if (!profile) {
    showErrorToast('You must be signed in to perform this action.');
    return false;
  }
  return true;
};

/* ------------------------------ Provider ----------------------------- */

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // session & profile
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [currentView, setCurrentView] = useState<string>('rolls');
  const [cameraMode, setCameraMode] = useState<'simple' | 'pro'>('simple');
  const [showFilmModal, setShowFilmModal] = useState(false);

  // auth helpers
  const [authStep, setAuthStep] = useState<'login' | 'otp'>('login');
  const [verificationEmail, setVerificationEmail] = useState('');

  // app data
  const [activeRoll, setActiveRoll] = useState<Roll | null>(null);
  const [completedRolls, setCompletedRolls] = useState<Roll[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [recentStories, setRecentStories] = useState<Map<string, { user: UserProfile, posts: Post[] }>>(new Map());

  // selections + counts
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [rollToName, setRollToName] = useState<Roll | null>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  /* ------------------------ Fetch helpers (declare before useEffect) --------------------- */

  const fetchFeed = useCallback(async (userId: string) => {
    if (!userId) return;
    const { data: followingData } = await supabase.from('followers').select('following_id').eq('follower_id', userId);
    const followedUserIds = new Set(followingData?.map((f: any) => f.following_id) || []);

    const { data: allPostsData, error } = await supabase.from('posts').select(POST_SELECT_QUERY).order('created_at', { ascending: false }).limit(50);
    if (error || !allPostsData) {
      console.error('fetchFeed error', error);
      setFeed([]);
      return;
    }

    const augmented = allPostsData.map((post: any) => ({
      ...post,
      isLiked: post.likes?.some((l: any) => l.user_id === userId) || false,
      isFollowed: followedUserIds.has(post.user_id),
    })) as Post[];

    setFeed(augmented);
  }, []);

  const fetchAlbums = useCallback(async (userId: string) => {
    if (!userId) return;
    const { data } = await supabase.from('albums').select('*, album_rolls(rolls(shots_used))').eq('user_id', userId);
    if (!data) return;
    const enhanced = data.map((album: any) => ({
      ...album,
      rollCount: album.album_rolls?.length || 0,
      photoCount: album.album_rolls?.reduce((s: number, ar: any) => s + (ar.rolls?.shots_used || 0), 0) || 0,
    }));
    setAlbums(enhanced);
  }, []);

  const fetchRollsAndSet = useCallback(async (userId: string) => {
    if (!userId) return;
    const { data: rollsData } = await supabase.from('rolls').select('*, photos(*)').eq('user_id', userId).order('created_at', { ascending: false });
    if (!rollsData) return;
    setActiveRoll(rollsData.find((r: Roll) => !r.is_completed) || null);
    setCompletedRolls(rollsData.filter((r: Roll) => r.is_completed));
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actors:profiles!notifications_actor_id_fkey(username, avatar_url), posts(rolls(photos(thumbnail_url)))')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('fetchNotifications', error);
      return;
    }
    setNotifications(data || []);
  }, [profile]);

  const fetchUserBadges = useCallback(async (userId: string) => {
    if (!userId) return;
    const { data } = await supabase.from('user_badges').select('*, badges(*)').eq('user_id', userId);
    if (data) setUserBadges(data);
  }, []);

  const fetchFollowCounts = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const { count: followers } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
      const { count: following } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('fetchFollowCounts', error);
    }
  }, []);

  const fetchRecentStories = useCallback(async (userId: string) => {
    if (!userId) return setRecentStories(new Map());
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: followingData } = await supabase.from('followers').select('following_id').eq('follower_id', userId);
    const followedUserIds = followingData?.map((f: any) => f.following_id) || [];
    if (followedUserIds.length === 0) return setRecentStories(new Map());

    const { data: recentPosts, error } = await supabase.from('posts')
      .select(POST_SELECT_QUERY)
      .in('user_id', followedUserIds)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchRecentStories', error);
      return setRecentStories(new Map());
    }

    const storiesMap = new Map<string, { user: UserProfile, posts: Post[] }>();
    recentPosts.forEach((post: any) => {
      const userProfile = post.profiles as UserProfile;
      if (!storiesMap.has(userProfile.id)) {
        storiesMap.set(userProfile.id, { user: userProfile, posts: [] });
      }
      const entry = storiesMap.get(userProfile.id)!;
      entry.posts.push({
        ...post,
        isLiked: post.likes?.some((l: any) => l.user_id === userId),
        isFollowed: true,
      } as Post);
    });

    setRecentStories(storiesMap);
  }, []);

  /* --------------------------- Initialization ----------------------- */

  // whenever profile becomes available, fetch related resources
  useEffect(() => {
    if (!profile) return;
    fetchNotifications();
    fetchUserBadges(profile.id).catch(console.error);
    fetchFollowCounts(profile.id).catch(console.error);
    fetchRecentStories(profile.id).catch(console.error);
    fetchRollsAndSet(profile.id).catch(console.error);
    fetchFeed(profile.id).catch(console.error);
    fetchAlbums(profile.id).catch(console.error);
  }, [profile, fetchNotifications, fetchUserBadges, fetchFollowCounts, fetchRecentStories, fetchRollsAndSet, fetchFeed, fetchAlbums]);

  /* ----------------------- Profile & Auth helpers -------------------- */

  const refreshProfile = useCallback(async () => {
    // Get current session and refresh profile state
    const { data } = await supabase.auth.getSession();
    const s = data.session ?? null;
    setSession(s);
    if (s?.user) {
      const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', s.user.id).single();
      if (error) {
        console.error('refreshProfile: failed to fetch profile', error);
      } else {
        setProfile(profileData as UserProfile);
      }
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // initialize session on mount and subscribe to auth changes
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session ?? null);
        if (data.session?.user) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
          setProfile(profileData ?? null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      setSession(sessionData);
      if (sessionData?.user) {
        refreshProfile();
      } else {
        setProfile(null);
        setAuthStep('login');
      }
    });

    return () => subscription?.subscription.unsubscribe();
  }, [refreshProfile]);

  const handleLogin = useCallback(async (email: string) => {
    if (!isNonEmptyString(email) || !isEmail(email)) {
      showErrorToast('Please provide a valid email address.');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      showErrorToast(error.message);
    } else {
      setVerificationEmail(email);
      setAuthStep('otp');
      showSuccessToast('Check your email for the sign-in code.');
    }
    setIsLoading(false);
  }, []);

  const handleVerifyOtp = useCallback(async (token: string) => {
    if (!isNonEmptyString(token) || token.length < 4) {
      showErrorToast('Please enter the code sent to your email.');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: verificationEmail, token, type: 'email' });
    if (error) {
      showErrorToast(error.message);
    } else {
      showSuccessToast('Signed in successfully.');
      await refreshProfile();
    }
    setIsLoading(false);
  }, [verificationEmail, refreshProfile]);

  /* -------------------------- CRUD operations ----------------------- */

  // start a new roll — removes active roll if present
  const startNewRoll = useCallback(async (filmType: string, capacity: number) => {
    if (!ensureProfile(profile)) return;
    if (!isNonEmptyString(filmType) || !Number.isInteger(capacity) || capacity <= 0) {
      showErrorToast('Invalid film selection.');
      return;
    }

    // remove any current active roll storage and DB row
    if (activeRoll) {
      // delete storage folder for that roll (best-effort)
      try {
        const prefix = `${profile.id}/${activeRoll.id}`;
        // Supabase storage remove requires exact file list; because enumerating is not provided here,
        // we only attempt to delete DB row — storage cleanup could be handled server-side by a cron or edge function.
        await supabase.from('rolls').delete().eq('id', activeRoll.id);
      } catch (err) {
        console.warn('startNewRoll: failed to delete previous roll', err);
      }
    }

    const { data, error } = await supabase.from('rolls').insert({ user_id: profile.id, film_type: filmType, capacity }).select().single();
    if (error || !data) {
      showErrorToast('Failed to load new film.');
      return;
    }
    setActiveRoll(data);
    setShowFilmModal(false);
  }, [profile, activeRoll]);

  // take a photo: upload and increment shots used, move completed rolls to completedRolls
  const takePhoto = useCallback(async (imageBlob: Blob, metadata: any) => {
    if (!ensureProfile(profile)) return;
    if (!activeRoll || activeRoll.is_completed) {
      showErrorToast('No active roll loaded.');
      return;
    }

    const filePath = `${profile.id}/${activeRoll.id}/${Date.now()}.jpeg`;
    // upload
    try {
      await supabase.storage.from('photos').upload(filePath, imageBlob, { contentType: 'image/jpeg' });
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
      await supabase.from('photos').insert({ user_id: profile.id, roll_id: activeRoll.id, url: urlData.publicUrl, thumbnail_url: urlData.publicUrl, metadata });
      const newShotsUsed = (activeRoll.shots_used || 0) + 1;
      const isCompleted = newShotsUsed >= activeRoll.capacity;
      const updatePayload: any = { shots_used: newShotsUsed, is_completed: isCompleted };
      if (isCompleted) updatePayload.completed_at = new Date().toISOString();
      const { data: updatedRoll } = await supabase.from('rolls').update(updatePayload).eq('id', activeRoll.id).select('*, photos(*)').single();
      if (updatedRoll) {
        if (updatedRoll.is_completed) {
          setActiveRoll(null);
          setCompletedRolls(prev => [updatedRoll, ...prev]);
          setRollToName(updatedRoll);
          setCurrentView('rolls');
        } else {
          setActiveRoll(updatedRoll);
        }
      }
    } catch (error) {
      console.error('takePhoto error', error);
      showErrorToast('Failed to save photo.');
    }
  }, [profile, activeRoll]);

  // develop roll — applies film preset filters to every photo then marks roll developed
  const developRoll = useCallback(async (roll: Roll) => {
    if (!ensureProfile(profile)) return;
    if (!roll || !roll.photos || roll.photos.length === 0) {
      showErrorToast('No photos to develop.');
      return;
    }

    const cost = 1 + Math.ceil(0.2 * roll.shots_used);
    if (profile.credits < cost) {
      showErrorToast('Not enough credits.');
      return;
    }

    const toastId = toast.loading('Developing your film...');
    try {
      // charge user
      await supabase.from('profiles').update({ credits: profile.credits - cost }).eq('id', profile.id);

      // apply preset if available
      const preset = filmPresets[roll.film_type] || filmPresets['Kodak Portra 400'] || Object.values(filmPresets)[0];

      if (preset) {
        // Convert each photo using imageProcessor.applyFilter and upload back to same storage path (upsert)
        await Promise.all(roll.photos.map(async (photo) => {
          const filteredBlob = await applyFilter(photo.url, preset);
          const path = extractStoragePathFromPublicUrl(photo.url);
          if (!path) {
            throw new Error('Could not determine storage path for photo.');
          }
          const { error: uploadError } = await supabase.storage.from('photos').update(path, filteredBlob, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/jpeg'
          });
          if (uploadError) {
            throw uploadError;
          }
        }));
      }

      const { data: updatedRoll } = await supabase.from('rolls').update({ developed_at: new Date().toISOString() }).eq('id', roll.id).select('*, photos(*)').single();
      if (updatedRoll) {
        setCompletedRolls(prev => prev.map(r => r.id === roll.id ? updatedRoll : r));
        setRollToName(updatedRoll);
      }

      showSuccessToast('Roll developed successfully!');
    } catch (error: any) {
      console.error('developRoll error', error);
      showErrorToast(error?.message || 'Failed to develop roll.');
    } finally {
      toast.dismiss();
      toast.remove();
    }
  }, [profile]);

  /* ----------------------------- Albums ----------------------------- */

  const createAlbum = useCallback(async (title: string) => {
    if (!ensureProfile(profile)) return;
    if (!isNonEmptyString(title)) {
      showErrorToast('Please provide an album title.');
      return;
    }
    const { data, error } = await supabase.from('albums').insert({ user_id: profile.id, title }).select().single();
    if (error || !data) {
      showErrorToast('Failed to create album.');
      return;
    }
    await fetchAlbums(profile.id);
  }, [profile, fetchAlbums]);

  const selectAlbum = useCallback(async (albumId: string) => {
    if (!isNonEmptyString(albumId)) return;
    const { data } = await supabase.from('albums').select('*, album_rolls(*, rolls(*, developed_at, photos(*)))').eq('id', albumId).single();
    if (data) {
      setSelectedAlbum(data as Album);
      setCurrentView('albumDetail');
    }
  }, []);

  const updateAlbumRolls = useCallback(async (albumId: string, rollIds: string[]) => {
    if (!isNonEmptyString(albumId)) {
      showErrorToast('Invalid album.');
      return;
    }
    // remove existing links
    await supabase.from('album_rolls').delete().eq('album_id', albumId);
    if (rollIds.length > 0) {
      const newLinks = rollIds.map(roll_id => ({ album_id: albumId, roll_id }));
      await supabase.from('album_rolls').insert(newLinks);
    }
    await selectAlbum(albumId);
    if (profile) await fetchAlbums(profile.id);
  }, [profile, selectAlbum, fetchAlbums]);

  /* -------------------------- Roll utilities ------------------------ */

  const updateRollTitle = useCallback(async (rollId: string, title: string): Promise<boolean> => {
    if (!ensureProfile(profile)) return false;
    if (!isNonEmptyString(title) || !isNonEmptyString(rollId)) return false;
    const { error } = await supabase.from('rolls').update({ title }).eq('id', rollId).eq('user_id', profile.id);
    if (error) {
      console.error('updateRollTitle', error);
      return false;
    }
    setCompletedRolls(prev => prev.map(r => r.id === rollId ? { ...r, title } : r));
    if (selectedRoll?.id === rollId) {
      setSelectedRoll(prev => prev ? { ...prev, title } : null);
    }
    return true;
  }, [profile, selectedRoll]);

  const deleteRoll = useCallback(async (rollId: string) => {
    if (!ensureProfile(profile)) return;
    const toastId = toast.loading('Deleting roll...');
    try {
      // Remove any posts/likes/comments referencing this roll
      const { data: posts } = await supabase.from('posts').select('id').eq('roll_id', rollId);
      const postIds = posts?.map((p: any) => p.id) || [];
      if (postIds.length > 0) {
        await supabase.from('likes').delete().in('post_id', postIds);
        await supabase.from('comments').delete().in('post_id', postIds);
      }
      await supabase.from('posts').delete().eq('roll_id', rollId);
      await supabase.from('album_rolls').delete().eq('roll_id', rollId);

      // delete photos (best-effort)
      const { data: photos } = await supabase.from('photos').select('url').eq('roll_id', rollId);
      if (photos && photos.length > 0) {
        const photoPaths = photos.map((p: any) => extractStoragePathFromPublicUrl(p.url)).filter(Boolean) as string[];
        if (photoPaths.length > 0) {
          await supabase.storage.from('photos').remove(photoPaths);
        }
      }
      await supabase.from('photos').delete().eq('roll_id', rollId);
      await supabase.from('rolls').delete().eq('id', rollId);
      setCompletedRolls(prev => prev.filter(r => r.id !== rollId));
      setSelectedRoll(null);
      setCurrentView('rolls');
      toast.success('Roll deleted successfully.', { id: toastId });
    } catch (error: any) {
      console.error('deleteRoll', error);
      toast.error(`Failed to delete roll: ${error?.message}`, { id: toastId });
    }
  }, [profile]);

  /* --------------------------- Social Ops --------------------------- */

  const handleLike = useCallback(async (postId: string, postOwnerId: string, isLiked?: boolean) => {
    if (!ensureProfile(profile)) return;
    if (!isNonEmptyString(postId)) return;
    if (isLiked) {
      await supabase.from('likes').delete().match({ user_id: profile.id, post_id: postId });
    } else {
      await supabase.from('likes').insert({ user_id: profile.id, post_id: postId });
      recordActivity('like', postId, postOwnerId);
    }
    if (profile) fetchFeed(profile.id);
  }, [profile, fetchFeed, /* recordActivity will be declared below and doesn't need to be in deps here */]);

  const handleFollow = useCallback(async (userId: string, isFollowed?: boolean) => {
    if (!ensureProfile(profile)) return;
    if (!isNonEmptyString(userId)) return;
    if (isFollowed) {
      await supabase.from('followers').delete().match({ follower_id: profile.id, following_id: userId });
    } else {
      await supabase.from('followers').insert({ follower_id: profile.id, following_id: userId });
      recordActivity('follow', userId, userId);
    }
    if (profile) {
      fetchFeed(profile.id);
      fetchFollowCounts(profile.id);
    }
  }, [profile, fetchFeed, fetchFollowCounts]);

  /* ---------------------------- Posting ----------------------------- */

  const createPost = useCallback(async (rollId: string, caption: string, coverPhotoUrl: string | null) => {
    if (!ensureProfile(profile)) return;
    if (!isNonEmptyString(rollId)) return;
    const toastId = toast.loading('Publishing post...');
    try {
      const { data: newPost, error } = await supabase.from('posts').insert({
        user_id: profile.id,
        roll_id: rollId,
        caption: caption,
        cover_photo_url: coverPhotoUrl,
      }).select(POST_SELECT_QUERY).single();

      if (error) throw error;

      const augmentedPost = {
        ...newPost,
        isLiked: false,
        isFollowed: false,
        likes: newPost.likes || [],
        comments: newPost.comments || [],
      } as Post;

      setFeed(prev => [augmentedPost, ...prev]);
      await recordActivity('post', newPost.id, profile.id);
      toast.success('Post published!', { id: toastId });
    } catch (error: any) {
      console.error('createPost', error);
      toast.error(error?.message || 'Failed to publish post', { id: toastId });
    }
  }, [profile]);

  const addComment = useCallback(async (postId: string, postOwnerId: string, content: string) => {
    if (!ensureProfile(profile)) return;
    if (!isNonEmptyString(content) || !isNonEmptyString(postId)) return;
    const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: profile.id, content });
    if (error) {
      toast.error(error.message);
    } else {
      recordActivity('comment', postId, postOwnerId);
      if (profile) fetchFeed(profile.id);
    }
  }, [profile, fetchFeed]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!ensureProfile(profile)) return;
    if (!isNonEmptyString(commentId)) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Comment deleted');
      if (profile) fetchFeed(profile.id);
    }
  }, [profile, fetchFeed]);

  /* ---------------------------- Search ------------------------------ */

  const searchUsers = useCallback(async (query: string): Promise<UserProfile[] | null> => {
    if (!isNonEmptyString(query)) return [];
    const { data, error } = await supabase.from('profiles').select('*').ilike('username', `%${query}%`).limit(10);
    if (error) {
      toast.error(error.message);
      return null;
    }
    return data;
  }, []);

  /* ------------------------- Downloads / Exports -------------------- */

  const downloadPhoto = useCallback(async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      saveAs(blob, filenameFromUrl(photo.url));
      toast.success('Photo download started!');
    } catch (error) {
      console.error('downloadPhoto', error);
      toast.error('Could not download photo.');
    }
  }, []);

  const downloadRoll = useCallback(async (roll: Roll) => {
    if (!roll.photos || roll.photos.length === 0) {
      toast.error('No photos to download.');
      return;
    }
    const toastId = toast.loading(`Zipping ${roll.photos.length} photos...`);
    try {
      const zip = new JSZip();
      await Promise.all(roll.photos.map(async (photo) => {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        zip.file(filenameFromUrl(photo.url), blob);
      }));
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${(roll.title || roll.film_type).replace(/\s+/g, '_')}.zip`);
      toast.success('Roll download started!', { id: toastId });
    } catch (error) {
      console.error('downloadRoll', error);
      toast.error('Could not download roll.', { id: toastId });
    }
  }, []);

  /* ------------------------- Badges / Profile ----------------------- */

  // declared earlier (see fetchUserBadges) — kept for logical grouping
  const updateProfileDetails = useCallback(async (details: { bio?: string; avatarFile?: File }) => {
    if (!ensureProfile(profile)) return;
    const updatePayload: { bio?: string; avatar_url?: string } = {};
    let avatarUrl = profile.avatar_url ?? null;

    if (details.avatarFile) {
      const toastId = toast.loading('Uploading new avatar...');
      try {
        const fileExt = (details.avatarFile.name.split('.').pop() || 'png').replace(/[^a-z0-9]/gi, '');
        const filePath = `${profile.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, details.avatarFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
        updatePayload.avatar_url = avatarUrl;
        showSuccessToast('Avatar updated!');
      } catch (error: any) {
        console.error('updateProfileDetails avatar upload failed', error);
        showErrorToast(`Avatar upload failed: ${error?.message || 'unknown'}`);
        toast.remove();
        return;
      } finally {
        toast.remove();
      }
    }

    if (typeof details.bio !== 'undefined') updatePayload.bio = details.bio;

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabase.from('profiles').update(updatePayload).eq('id', profile.id);
      if (updateError) {
        showErrorToast(`Failed to update profile: ${updateError.message}`);
      } else {
        if (typeof details.bio !== 'undefined') showSuccessToast('Profile updated!');
        await refreshProfile();
      }
    }
  }, [profile, refreshProfile]);

  /* ---------------------------- Activity ---------------------------- */

  const recordActivity = useCallback(async (activityType: string, entityId: string, entityOwnerId?: string) => {
    if (!profile) return;
    try {
      await supabase.functions.invoke('record-activity', {
        body: { activityType, actorId: profile.id, entityId, entityOwnerId },
      });
      // refresh profile to pick up activity-derived rewards etc.
      await refreshProfile();
    } catch (error) {
      // Non-fatal; just log for debugging
      console.error('recordActivity error', error);
    }
  }, [profile, refreshProfile]);

  /* --------------------------- Public API --------------------------- */

  const value = useMemo(() => ({
    session,
    profile,
    isLoading,
    currentView,
    setCurrentView,
    cameraMode,
    setCameraMode,
    showFilmModal,
    setShowFilmModal,
    activeRoll,
    completedRolls,
    feed,
    albums,
    challenges,
    notifications,
    userBadges,
    recentStories,
    startNewRoll,
    takePhoto,
    setFeed,
    setChallenges,
    refreshProfile,
    authStep,
    setAuthStep,
    verificationEmail,
    handleLogin,
    handleVerifyOtp,
    selectedRoll,
    setSelectedRoll,
    developRoll,
    selectedAlbum,
    setSelectedAlbum,
    selectAlbum,
    createAlbum,
    updateAlbumRolls,
    updateRollTitle,
    handleLike,
    handleFollow,
    createPost,
    addComment,
    deleteComment,
    searchUsers,
    rollToName,
    setRollToName,
    deleteRoll,
    downloadPhoto,
    downloadRoll,
    fetchNotifications,
    markNotificationsAsRead,
    followersCount,
    followingCount,
    updateProfileDetails,
  }), [
    session,
    profile,
    isLoading,
    currentView,
    cameraMode,
    showFilmModal,
    activeRoll,
    completedRolls,
    feed,
    albums,
    challenges,
    notifications,
    userBadges,
    recentStories,
    startNewRoll,
    takePhoto,
    refreshProfile,
    authStep,
    verificationEmail,
    selectedRoll,
    developRoll,
    selectedAlbum,
    rollToName,
    deleteRoll,
    fetchNotifications,
    followersCount,
    followingCount,
    updateProfileDetails,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};