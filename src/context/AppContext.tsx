import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { applyFilter } from '../utils/imageProcessor';
import { filmPresets } from '../utils/filters';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Type Definitions
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  level: number;
  xp: number;
  credits: number;
  streak: number;
  subscription: 'free' | 'plus' | 'premium';
  updated_at: string;
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
  id:string;
  user_id: string;
  film_type: string;
  capacity: number;
  shots_used: number;
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
  developed_at?: string;
  photos?: Photo[];
  title?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string; avatar_url: string };
  user_id: string;
}

export interface Post {
  id: string;
  user_id: string;
  roll_id: string;
  caption: string;
  created_at: string;
  cover_photo_url: string | null;
  profiles: { username: string; avatar_url: string; level: number; };
  rolls: { title: string | null; film_type: string, developed_at?: string, photos: Photo[] };
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
  album_rolls?: { roll_id: string, rolls: { photos: Photo[], developed_at?: string } }[];
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
  expires_at?: string;
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
    avatar_url: string;
  };
  posts?: {
    rolls?: {
      photos: { thumbnail_url: string }[];
    }
  }
}

export interface UserBadge {
  created_at: string;
  badges: {
    name: string;
    description: string;
    icon_name: string;
  }
}

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
  startNewRoll: (filmType: string, capacity: number) => Promise<void>;
  takePhoto: (imageBlob: Blob, metadata: any) => Promise<void>;
  setFeed: React.Dispatch<React.SetStateAction<Post[]>>;
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  refreshProfile: () => Promise<void>;
  authStep: 'login' | 'otp';
  setAuthStep: (step: 'login' | 'otp') => void;
  verificationEmail: string;
  handleLogin: (email: string) => Promise<void>;
  handleVerifyOtp: (token: string) => Promise<void>;
  selectedRoll: Roll | null;
  setSelectedRoll: (roll: Roll | null) => void;
  developRoll: (roll: Roll) => Promise<void>;
  selectedAlbum: Album | null;
  setSelectedAlbum: (album: Album | null) => void;
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
  setRollToName: (roll: Roll | null) => void;
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

const POST_SELECT_QUERY = '*, cover_photo_url, profiles!posts_user_id_fkey(username, avatar_url, level), rolls!posts_roll_id_fkey(title, film_type, developed_at, photos(*)), likes(user_id), comments(*, profiles(username, avatar_url))';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('rolls');
  const [cameraMode, setCameraMode] = useState<'simple' | 'pro'>('simple');
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'otp'>('login');
  const [verificationEmail, setVerificationEmail] = useState('');

  const [activeRoll, setActiveRoll] = useState<Roll | null>(null);
  const [completedRolls, setCompletedRolls] = useState<Roll[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [recentStories, setRecentStories] = useState<Map<string, { user: UserProfile, posts: Post[] }>>(new Map());
  const [selectedRoll, setSelectedRoll] = useState<Roll | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [rollToName, setRollToName] = useState<Roll | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
    }
  }, []);

  const recordActivity = useCallback(async (activityType: string, entityId: string, entityOwnerId?: string) => {
    if (!profile) return;
    try {
      await supabase.functions.invoke('record-activity', {
        body: { activityType, actorId: profile.id, entityId, entityOwnerId },
      });
      refreshProfile();
    } catch (error) {
      console.error('Failed to record activity:', error);
    }
  }, [profile, refreshProfile]);

  const fetchFollowCounts = useCallback(async (userId: string) => {
    const { count: followers } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    const { count: following } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);
  }, []);

  const fetchAlbums = useCallback(async (userId: string) => {
    const { data } = await supabase.from('albums').select('*, album_rolls(rolls(shots_used))').eq('user_id', userId);
    if (data) {
      const albumsWithCounts = data.map(album => ({
        ...album,
        rollCount: album.album_rolls.length,
        photoCount: album.album_rolls.reduce((sum, ar: any) => sum + ar.rolls.shots_used, 0),
      }));
      setAlbums(albumsWithCounts as any);
    }
  }, []);

  const fetchFeed = useCallback(async (userId: string) => {
    const { data: followingData } = await supabase.from('followers').select('following_id').eq('follower_id', userId);
    const followedUserIds = new Set(followingData?.map(f => f.following_id) || []);

    const { data: allPostsData, error } = await supabase.from('posts')
      .select(POST_SELECT_QUERY)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !allPostsData) {
      console.error("Error fetching feed:", error);
      setFeed([]);
      return;
    }

    const augmentedFeed = allPostsData.map(post => ({
      ...post,
      isLiked: post.likes.some(like => like.user_id === userId),
      isFollowed: followedUserIds.has(post.user_id),
    })) as Post[];
    
    setFeed(augmentedFeed);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actors:profiles!notifications_actor_id_fkey(username, avatar_url), posts(rolls(photos(thumbnail_url)))')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(30);
    
    if (error) console.error("Error fetching notifications:", error);
    else setNotifications(data as any);
  }, [profile]);

  const markNotificationsAsRead = async () => {
    if (!profile) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const fetchUserBadges = useCallback(async (userId: string) => {
    const { data } = await supabase.from('user_badges').select('*, badges(*)').eq('user_id', userId);
    if (data) setUserBadges(data as any);
  }, []);

  const fetchRecentStories = useCallback(async (userId: string) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: followingData } = await supabase.from('followers').select('following_id').eq('follower_id', userId);
    const followedUserIds = followingData?.map(f => f.following_id) || [];

    if (followedUserIds.length === 0) {
      setRecentStories(new Map());
      return;
    }

    const { data: recentPosts, error } = await supabase.from('posts')
      .select(POST_SELECT_QUERY)
      .in('user_id', followedUserIds)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching recent stories:", error);
      setRecentStories(new Map());
      return;
    }

    const storiesMap = new Map<string, { user: UserProfile, posts: Post[] }>();
    recentPosts.forEach(post => {
      const userProfile = post.profiles as UserProfile;
      if (!storiesMap.has(userProfile.id)) {
        storiesMap.set(userProfile.id, { user: userProfile, posts: [] });
      }
      storiesMap.get(userProfile.id)?.posts.push({
        ...post,
        isLiked: post.likes.some(like => like.user_id === userId),
        isFollowed: true, // All these users are followed
      } as Post);
    });

    setRecentStories(storiesMap);
  }, [profile]);

  useEffect(() => {
    if (profile) {
      fetchNotifications();
      fetchUserBadges(profile.id);
      fetchFollowCounts(profile.id);
      fetchRecentStories(profile.id);
    }
  }, [profile, fetchNotifications, fetchUserBadges, fetchFollowCounts, fetchRecentStories]);

  const handleLogin = async (email: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else {
      setVerificationEmail(email);
      setAuthStep('otp');
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (token: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: verificationEmail, token, type: 'email' });
    if (error) alert(error.message);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      const { data: rollsData } = await supabase.from('rolls').select('*, photos(*)').eq('user_id', profile.id).order('created_at', { ascending: false });
      if (rollsData) {
        setActiveRoll(rollsData.find(r => !r.is_completed) || null);
        setCompletedRolls(rollsData.filter(r => r.is_completed));
      }
      fetchFeed(profile.id);
      fetchAlbums(profile.id);
    };
    fetchData();
  }, [profile, fetchAlbums, fetchFeed]);

  useEffect(() => {
    const fetchInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      }
      setIsLoading(false);
    };
    fetchInitialSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) refreshProfile();
      else {
        setProfile(null);
        setAuthStep('login');
      }
    });
    return () => subscription.unsubscribe();
  }, [refreshProfile]);

  const startNewRoll = async (filmType: string, capacity: number) => {
    if (!profile) return;
    if (activeRoll) {
      await supabase.storage.from('photos').remove([`${profile.id}/${activeRoll.id}`]);
      await supabase.from('rolls').delete().eq('id', activeRoll.id);
    }
    const { data } = await supabase.from('rolls').insert({ user_id: profile.id, film_type: filmType, capacity }).select().single();
    if (data) setActiveRoll(data);
    setShowFilmModal(false);
  };

  const takePhoto = async (imageBlob: Blob, metadata: any) => {
    if (!profile || !activeRoll || activeRoll.is_completed) return;
    const filePath = `${profile.id}/${activeRoll.id}/${Date.now()}.jpeg`;
    await supabase.storage.from('photos').upload(filePath, imageBlob, { contentType: 'image/jpeg', upsert: false });
    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
    await supabase.from('photos').insert({ user_id: profile.id, roll_id: activeRoll.id, url: urlData.publicUrl, thumbnail_url: urlData.publicUrl, metadata });
    const newShotsUsed = activeRoll.shots_used + 1;
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
  };

  const developRoll = async (roll: Roll) => {
    if (!profile) return;
    const cost = 1 + Math.ceil(0.2 * roll.shots_used);
    if (profile.credits < cost) {
      toast.error("Not enough credits.");
      return;
    }

    const toastId = toast.loading('Developing your film... This may take a moment.');

    try {
      await supabase.from('profiles').update({ credits: profile.credits - cost }).eq('id', profile.id);

      const preset = filmPresets[roll.film_type] || filmPresets['default'];

      if (preset && roll.photos && roll.photos.length > 0) {
        await Promise.all(roll.photos.map(async (photo) => {
          const filteredBlob = await applyFilter(photo.url, preset);
          const url = new URL(photo.url);
          const path = url.pathname.substring(url.pathname.indexOf('/photos/') + '/photos/'.length);
          
          const { error: uploadError } = await supabase.storage
            .from('photos')
            .update(path, filteredBlob, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'image/jpeg'
            });

          if (uploadError) {
            throw new Error(`Failed to upload filtered photo: ${uploadError.message}`);
          }
        }));
      }

      const { data: updatedRoll } = await supabase.from('rolls').update({ developed_at: new Date().toISOString() }).eq('id', roll.id).select('*, photos(*)').single();
      
      await refreshProfile();
      if (updatedRoll) {
        setCompletedRolls(prev => prev.map(r => r.id === roll.id ? updatedRoll : r));
        setRollToName(updatedRoll);
      }

      toast.success('Roll developed successfully!', { id: toastId });

    } catch (error: any) {
      console.error("Development failed:", error);
      toast.error(error.message || 'Something went wrong during development.', { id: toastId });
    }
  };

  const createAlbum = async (title: string) => {
    if (!profile) return;
    const { data } = await supabase.from('albums').insert({ user_id: profile.id, title }).select().single();
    if (data) await fetchAlbums(profile.id);
  };

  const selectAlbum = async (albumId: string) => {
    const { data } = await supabase.from('albums').select('*, album_rolls(*, rolls(*, developed_at, photos(*)))').eq('id', albumId).single();
    if (data) {
      setSelectedAlbum(data as any);
      setCurrentView('albumDetail');
    }
  };

  const updateAlbumRolls = async (albumId: string, rollIds: string[]) => {
    await supabase.from('album_rolls').delete().eq('album_id', albumId);
    if (rollIds.length > 0) {
      const newLinks = rollIds.map(roll_id => ({ album_id: albumId, roll_id }));
      await supabase.from('album_rolls').insert(newLinks);
    }
    await selectAlbum(albumId);
    if (profile) await fetchAlbums(profile.id);
  };

  const updateRollTitle = async (rollId: string, title: string): Promise<boolean> => {
    if (!profile) return false;
    const { error } = await supabase.from('rolls').update({ title }).eq('id', rollId).eq('user_id', profile.id);
    if (error) {
      console.error('Error updating roll title:', error);
      return false;
    }
    setCompletedRolls(prev => prev.map(r => (r.id === rollId ? { ...r, title } : r)));
    if (selectedRoll?.id === rollId) {
      setSelectedRoll(prev => prev ? { ...prev, title } : null);
    }
    return true;
  };

  const handleLike = async (postId: string, postOwnerId: string, isLiked?: boolean) => {
    if (!profile) return;
    if (isLiked) {
      await supabase.from('likes').delete().match({ user_id: profile.id, post_id: postId });
    } else {
      await supabase.from('likes').insert({ user_id: profile.id, post_id: postId });
      recordActivity('like', postId, postOwnerId);
    }
    if (profile) fetchFeed(profile.id);
  };

  const handleFollow = async (userId: string, isFollowed?: boolean) => {
    if (!profile) return;
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
  };

  const createPost = async (rollId: string, caption: string, coverPhotoUrl: string | null) => {
    if (!profile) return;
    const toastId = toast.loading('Publishing post...');
    try {
      const { data: newPost, error } = await supabase.from('posts').insert({
        user_id: profile.id,
        roll_id: rollId,
        caption: caption,
        cover_photo_url: coverPhotoUrl,
      }).select(POST_SELECT_QUERY).single();
      
      if (error) throw error;

      if (newPost) {
        const augmentedPost = {
          ...newPost,
          isLiked: false,
          isFollowed: false,
          likes: newPost.likes || [],
          comments: newPost.comments || [],
        } as Post;

        setFeed(prevFeed => [augmentedPost, ...prevFeed]);
        
        await recordActivity('post', newPost.id, profile.id);
        
        toast.success('Post published!', { id: toastId });
      } else {
        throw new Error("Failed to create post.");
      }
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const addComment = async (postId: string, postOwnerId: string, content: string) => {
    if (!profile) return;
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: profile.id,
      content: content,
    });
    if (error) {
      toast.error(error.message);
    } else {
      recordActivity('comment', postId, postOwnerId);
      fetchFeed(profile.id);
    }
  };

  const deleteComment = useCallback(async (commentId: string) => {
    if (!profile) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Comment deleted');
      fetchFeed(profile.id);
    }
  }, [profile, fetchFeed]);

  const searchUsers = async (query: string): Promise<UserProfile[] | null> => {
    if (!query.trim()) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(10);
    if (error) {
      toast.error(error.message);
      return null;
    }
    return data;
  };

  const deleteRoll = async (rollId: string) => {
    if (!profile) return;
    const toastId = toast.loading('Deleting roll...');
    try {
      const { data: posts } = await supabase.from('posts').select('id').eq('roll_id', rollId);
      const postIds = posts?.map(p => p.id) || [];
      if (postIds.length > 0) {
        await supabase.from('likes').delete().in('post_id', postIds);
        await supabase.from('comments').delete().in('post_id', postIds);
      }
      await supabase.from('posts').delete().eq('roll_id', rollId);
      await supabase.from('album_rolls').delete().eq('roll_id', rollId);
      const { data: photos } = await supabase.from('photos').select('url').eq('roll_id', rollId);
      if (photos && photos.length > 0) {
        const photoPaths = photos.map(p => new URL(p.url).pathname.split('/photos/')[1]);
        await supabase.storage.from('photos').remove(photoPaths);
      }
      await supabase.from('photos').delete().eq('roll_id', rollId);
      await supabase.from('rolls').delete().eq('id', rollId);
      setCompletedRolls(prev => prev.filter(r => r.id !== rollId));
      setSelectedRoll(null);
      setCurrentView('rolls');
      toast.success('Roll deleted successfully.', { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to delete roll: ${error.message}`, { id: toastId });
    }
  };

  const downloadPhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      saveAs(blob, photo.url.split('/').pop() || 'photo.jpg');
      toast.success('Photo download started!');
    } catch (error) {
      toast.error('Could not download photo.');
    }
  };

  const downloadRoll = async (roll: Roll) => {
    if (!roll.photos || roll.photos.length === 0) {
      toast.error("No photos to download.");
      return;
    }
    const toastId = toast.loading(`Zipping ${roll.photos.length} photos...`);
    try {
      const zip = new JSZip();
      const photoPromises = roll.photos.map(async (photo) => {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        zip.file(photo.url.split('/').pop() || 'photo.jpg', blob);
      });
      await Promise.all(photoPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${roll.title?.replace(/ /g, '_') || 'roll'}.zip`);
      toast.success('Roll download started!', { id: toastId });
    } catch (error) {
      toast.error('Could not download roll.', { id: toastId });
    }
  };

  const updateProfileDetails = useCallback(async (details: { bio?: string; avatarFile?: File }) => {
    if (!profile) return;

    const updatePayload: { bio?: string; avatar_url?: string } = {};
    let avatarUrl = profile.avatar_url;

    if (details.avatarFile) {
        const toastId = toast.loading('Uploading new avatar...');
        try {
            const fileExt = details.avatarFile.name.split('.').pop();
            const filePath = `${profile.id}/avatar.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, details.avatarFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatarUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
            updatePayload.avatar_url = avatarUrl;
            toast.success('Avatar updated!', { id: toastId });
        } catch (error: any) {
            toast.error(`Avatar upload failed: ${error.message}`, { id: toastId });
            return;
        }
    }

    if (typeof details.bio !== 'undefined') {
        updatePayload.bio = details.bio;
    }

    if (Object.keys(updatePayload).length > 0) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', profile.id);

        if (updateError) {
            toast.error(`Failed to update profile: ${updateError.message}`);
        } else {
            if (typeof details.bio !== 'undefined') toast.success('Profile updated!');
            await refreshProfile();
        }
    }
  }, [profile, refreshProfile]);

  const value = useMemo(() => ({
    session, profile, isLoading, currentView, setCurrentView, cameraMode, setCameraMode, showFilmModal, setShowFilmModal, activeRoll, completedRolls, feed, albums, challenges, notifications, userBadges, recentStories, startNewRoll, takePhoto, setFeed, setChallenges, refreshProfile, authStep, setAuthStep, verificationEmail, handleLogin, handleVerifyOtp, selectedRoll, setSelectedRoll, developRoll, selectedAlbum, setSelectedAlbum, selectAlbum, createAlbum, updateAlbumRolls, updateRollTitle, handleLike, handleFollow, createPost, addComment, deleteComment, searchUsers, rollToName, setRollToName, deleteRoll, downloadPhoto, downloadRoll, fetchNotifications, markNotificationsAsRead, followersCount, followingCount, updateProfileDetails
  }), [session, profile, isLoading, currentView, cameraMode, showFilmModal, activeRoll, completedRolls, feed, albums, challenges, notifications, userBadges, recentStories, authStep, verificationEmail, selectedRoll, selectedAlbum, rollToName, handleFollow, handleLike, refreshProfile, recordActivity, fetchNotifications, markNotificationsAsRead, followersCount, followingCount, deleteComment, updateProfileDetails]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};