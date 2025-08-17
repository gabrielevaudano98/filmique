import { supabase } from '../integrations/supabase/client';
import { extractStoragePathFromPublicUrl } from '../utils/storage';
import { applyFilter } from '../utils/imageProcessor';
import { Roll, Photo, FilmStock, UserProfile, Album } from '../types';
import { getCache, setCache, invalidateCache } from '../utils/cache';

export const POST_SELECT_QUERY = '*, cover_photo_url, profiles!posts_user_id_fkey(username, avatar_url, level, id), rolls!posts_roll_id_fkey(title, film_type, developed_at, photos(*)), likes(user_id), comments(*, profiles(username, avatar_url)), albums(*)';

// Auth
export const getSession = () => supabase.auth.getSession();
export const getProfile = async (userId: string) => {
  const cacheKey = `profile-${userId}`;
  const cached = await getCache<UserProfile>(cacheKey);
  if (cached) return { data: cached, error: null };

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (data) await setCache(cacheKey, data);
  return { data, error };
};
export const onAuthStateChange = (callback: (event: string, session: any) => void) => supabase.auth.onAuthStateChange(callback);
export const signInWithOtp = (email: string) => supabase.auth.signInWithOtp({ email });
export const verifyOtp = (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: 'email' });
export const signOut = async () => {
  await clearCache();
  return supabase.auth.signOut();
};

// Profile & User Data
export const updateProfile = async (userId: string, data: any) => {
  const result = await supabase.from('profiles').update(data).eq('id', userId);
  if (!result.error) await invalidateCache(`profile-${userId}`);
  return result;
};
export const uploadAvatar = (path: string, file: File) => supabase.storage.from('avatars').upload(path, file, { upsert: true });
export const getPublicUrl = (bucket: string, path: string) => supabase.storage.from(bucket).getPublicUrl(path);
export const fetchUserBadges = (userId: string) => supabase.from('user_badges').select('*, badges(*)').eq('user_id', userId);
export const fetchFollowerCount = (userId: string) => supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
export const fetchFollowingCount = (userId: string) => supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
export const searchUsers = (query: string) => supabase.from('profiles').select('*').ilike('username', `%${query}%`).limit(10);
export const fetchUserPosts = (userId: string) => supabase.from('posts').select(POST_SELECT_QUERY).eq('user_id', userId).order('created_at', { ascending: false });

// Film Stocks
export const fetchFilmStocks = async () => {
  const cacheKey = 'filmStocks';
  const cached = await getCache<FilmStock[]>(cacheKey);
  if (cached) return { data: cached, error: null };

  const { data, error } = await supabase.from('film_stocks').select('*');
  if (data) await setCache(cacheKey, data, 24 * 60 * 60 * 1000); // 24 hour TTL
  return { data, error };
};

// Rolls & Photos
export const fetchAllRolls = async (userId: string) => {
  const cacheKey = `rolls-${userId}`;
  const cached = await getCache<Roll[]>(cacheKey);
  if (cached) return { data: cached, error: null };

  const { data, error } = await supabase.from('rolls').select('*, photos(*), albums(title)').eq('user_id', userId).order('created_at', { ascending: false });
  if (data) await setCache(cacheKey, data);
  return { data, error };
};
export const deleteRollById = (rollId: string) => {
  return supabase.from('rolls').delete().eq('id', rollId);
};
export const createNewRoll = async (userId: string, filmType: string, capacity: number, aspectRatio: string) => {
  const result = await supabase.from('rolls').insert({ user_id: userId, film_type: filmType, capacity, aspect_ratio: aspectRatio }).select().single();
  if (!result.error) await invalidateCache(`rolls-${userId}`);
  return result;
};
export const updateRoll = async (rollId: string, data: any) => {
  const result = await supabase.from('rolls').update(data).eq('id', rollId).select('*, photos(*), albums(title)').single();
  if (!result.error && result.data) await invalidateCache([`rolls-${result.data.user_id}`, `albums-${result.data.user_id}`]);
  return result;
};
export const uploadPhotoToStorage = (path: string, blob: Blob) => supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
export const createPhotoRecord = (userId: string, rollId: string, url: string, metadata: any) => supabase.from('photos').insert({ user_id: userId, roll_id: rollId, url, thumbnail_url: url, metadata });
export const deletePhotosFromStorage = (paths: string[]) => supabase.storage.from('photos').remove(paths);
export const getPhotosForRoll = (rollId: string) => supabase.from('photos').select('url').eq('roll_id', rollId);
export const deletePhotosForRoll = (rollId: string) => supabase.from('photos').delete().eq('roll_id', rollId);

export const developRollPhotos = async (roll: Roll, filmStocks: FilmStock[]) => {
  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);
  if (!filmStock || !roll.photos) return;

  await Promise.all(roll.photos.map(async (photo: Photo) => {
    const filteredBlob = await applyFilter(photo.url, filmStock.preset);
    const path = extractStoragePathFromPublicUrl(photo.url);
    if (!path) throw new Error('Could not determine storage path for photo.');
    const { error } = await supabase.storage.from('photos').update(path, filteredBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/jpeg'
    });
    if (error) throw error;
  }));
};

export const archiveRoll = async (rollId: string, isArchived: boolean) => {
    const { data: roll } = await supabase.from('rolls').select('user_id').eq('id', rollId).single();
    const result = await supabase.from('rolls').update({ is_archived: isArchived }).eq('id', rollId);
    if (!result.error && roll) await invalidateCache(`rolls-${roll.user_id}`);
    return result;
};

// Social (Feed, Posts, Likes, Comments, Follows)
export const fetchFollowedIds = (userId: string) => supabase.from('followers').select('following_id').eq('follower_id', userId);
export const fetchFeedPosts = async () => {
  const cacheKey = 'feed';
  const cached = await getCache<any[]>(cacheKey);
  if (cached) return { data: cached, error: null };

  const { data, error } = await supabase.from('posts').select(POST_SELECT_QUERY).order('created_at', { ascending: false }).limit(50);
  if (data) await setCache(cacheKey, data);
  return { data, error };
};
export const fetchRecentStoryPosts = (userIds: string[], since: string) => supabase.from('posts').select(POST_SELECT_QUERY).in('user_id', userIds).gte('created_at', since).order('created_at', { ascending: false });
export const likePost = async (userId: string, postId: string) => {
  const result = await supabase.from('likes').insert({ user_id: userId, post_id: postId });
  if (!result.error) await invalidateCache('feed');
  return result;
};
export const unlikePost = async (userId: string, postId: string) => {
  const result = await supabase.from('likes').delete().match({ user_id: userId, post_id: postId });
  if (!result.error) await invalidateCache('feed');
  return result;
};
export const followUser = async (followerId: string, followingId: string) => {
  const result = await supabase.from('followers').insert({ follower_id: followerId, following_id: followingId });
  if (!result.error) await invalidateCache('feed');
  return result;
};
export const unfollowUser = async (followerId: string, followingId: string) => {
  const result = await supabase.from('followers').delete().match({ follower_id: followerId, following_id: followingId });
  if (!result.error) await invalidateCache('feed');
  return result;
};
export const createPost = async (userId: string, rollId: string, caption: string, coverUrl: string | null, albumId: string | null) => {
  const result = await supabase.from('posts').insert({ user_id: userId, roll_id: rollId, caption, cover_photo_url: coverUrl, album_id: albumId }).select(POST_SELECT_QUERY).single();
  if (!result.error) await invalidateCache(['feed', `rolls-${userId}`]);
  return result;
};
export const addComment = async (userId: string, postId: string, content: string) => {
  const result = await supabase.from('comments').insert({ user_id: userId, post_id: postId, content });
  if (!result.error) await invalidateCache('feed');
  return result;
};
export const deleteComment = async (commentId: string) => {
  const result = await supabase.from('comments').delete().eq('id', commentId);
  if (!result.error) await invalidateCache('feed');
  return result;
};
export const deletePostsForRoll = (rollId: string) => supabase.from('posts').delete().eq('roll_id', rollId);
export const getPostsForRoll = (rollId: string) => supabase.from('posts').select('id').eq('roll_id', rollId);
export const deleteLikesForPosts = (postIds: string[]) => supabase.from('likes').delete().in('post_id', postIds);
export const deleteCommentsForPosts = (postIds: string[]) => supabase.from('comments').delete().in('post_id', postIds);

// Albums
export const fetchAlbums = async (userId: string) => {
  const cacheKey = `albums-${userId}`;
  const cached = await getCache<Album[]>(cacheKey);
  if (cached) return { data: cached, error: null };

  const { data, error } = await supabase.from('albums').select('*, rolls(*, photos(*))').eq('user_id', userId);
  if (data) await setCache(cacheKey, data);
  return { data, error };
};
export const fetchAlbumDetails = (albumId: string) => supabase.from('albums').select('*, rolls(*, photos(*))').eq('id', albumId).single();
export const createAlbum = async (userId: string, title: string, type: 'private' | 'unlisted' | 'public', parentAlbumId?: string | null) => {
  const result = await supabase.from('albums').insert({ user_id: userId, title, type, parent_album_id: parentAlbumId }).select().single();
  if (!result.error) await invalidateCache(`albums-${userId}`);
  return result;
};
export const updateAlbum = async (albumId: string, userId: string, data: { parent_album_id?: string | null }) => {
  const result = await supabase.from('albums').update(data).eq('id', albumId);
  if (!result.error) await invalidateCache(`albums-${userId}`);
  return result;
};
export const updateRollsAlbum = async (rollIds: string[], albumId: string | null) => {
  const { data: rolls } = await supabase.from('rolls').select('user_id').in('id', rollIds).limit(1);
  const result = await supabase.from('rolls').update({ album_id: albumId }).in('id', rollIds).select();
  if (!result.error && rolls && rolls.length > 0) {
    await invalidateCache([`albums-${rolls[0].user_id}`, `rolls-${rolls[0].user_id}`]);
  }
  return result;
};

// Notifications
export const fetchNotifications = (userId: string) => supabase.from('notifications').select('*, actors:profiles!notifications_actor_id_fkey(username, avatar_url)').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
export const markNotificationsRead = (ids: string[]) => supabase.from('notifications').update({ is_read: true }).in('id', ids);

// Edge Functions
export const recordActivity = (activityType: string, actorId: string, entityId: string, entityOwnerId?: string) => {
  return supabase.functions.invoke('record-activity', {
    body: { activityType, actorId, entityId, entityOwnerId },
  });
};