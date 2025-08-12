import { supabase } from '../integrations/supabase/client';
import { extractStoragePathFromPublicUrl } from '../utils/storage';
import { applyFilter } from '../utils/imageProcessor';
import { filmPresets } from '../utils/filters';
import { Roll, Photo } from '../types';

export const POST_SELECT_QUERY = '*, cover_photo_url, profiles!posts_user_id_fkey(username, avatar_url, level, id), rolls!posts_roll_id_fkey(title, film_type, developed_at, photos(*)), likes(user_id), comments(*, profiles(username, avatar_url))';
const NOTIFICATION_SELECT_QUERY = '*, actors:profiles!notifications_actor_id_fkey(username, avatar_url), posts(rolls(photos(thumbnail_url)))';

// Auth
export const getSession = () => supabase.auth.getSession();
export const getProfile = (userId: string) => supabase.from('profiles').select('*').eq('id', userId).single();
export const onAuthStateChange = (callback: (event: string, session: any) => void) => supabase.auth.onAuthStateChange(callback);
export const signInWithOtp = (email: string) => supabase.auth.signInWithOtp({ email });
export const verifyOtp = (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: 'email' });
export const signOut = () => supabase.auth.signOut();

// Profile & User Data
export const updateProfile = (userId: string, data: any) => supabase.from('profiles').update(data).eq('id', userId);
export const uploadAvatar = (path: string, file: File) => supabase.storage.from('avatars').upload(path, file, { upsert: true });
export const getPublicUrl = (bucket: string, path: string) => supabase.storage.from(bucket).getPublicUrl(path);
export const fetchUserBadges = (userId: string) => supabase.from('user_badges').select('*, badges(*)').eq('user_id', userId);
export const fetchFollowerCount = (userId: string) => supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
export const fetchFollowingCount = (userId: string) => supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
export const searchUsers = (query: string) => supabase.from('profiles').select('*').ilike('username', `%${query}%`).limit(10);

// Rolls & Photos
export const fetchAllRolls = (userId: string) => supabase.from('rolls').select('*, photos(*)').eq('user_id', userId).order('created_at', { ascending: false });
export const deleteRollById = (rollId: string) => supabase.from('rolls').delete().eq('id', rollId);
export const createNewRoll = (userId: string, filmType: string, capacity: number) => supabase.from('rolls').insert({ user_id: userId, film_type: filmType, capacity }).select().single();
export const updateRoll = (rollId: string, data: any) => supabase.from('rolls').update(data).eq('id', rollId).select('*, photos(*)').single();
export const uploadPhotoToStorage = (path: string, blob: Blob) => supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
export const createPhotoRecord = (userId: string, rollId: string, url: string, metadata: any) => supabase.from('photos').insert({ user_id: userId, roll_id: rollId, url, thumbnail_url: url, metadata });
export const deletePhotosFromStorage = (paths: string[]) => supabase.storage.from('photos').remove(paths);
export const getPhotosForRoll = (rollId: string) => supabase.from('photos').select('url').eq('roll_id', rollId);
export const deletePhotosForRoll = (rollId: string) => supabase.from('photos').delete().eq('roll_id', rollId);

export const developRollPhotos = async (roll: Roll) => {
  const preset = filmPresets[roll.film_type] || filmPresets['Kodak Portra 400'];
  if (!preset || !roll.photos) return;

  await Promise.all(roll.photos.map(async (photo: Photo) => {
    const filteredBlob = await applyFilter(photo.url, preset);
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

// Social (Feed, Posts, Likes, Comments, Follows)
export const fetchFollowedIds = (userId: string) => supabase.from('followers').select('following_id').eq('follower_id', userId);
export const fetchFeedPosts = () => supabase.from('posts').select(POST_SELECT_QUERY).order('created_at', { ascending: false }).limit(50);
export const fetchRecentStoryPosts = (userIds: string[], since: string) => supabase.from('posts').select(POST_SELECT_QUERY).in('user_id', userIds).gte('created_at', since).order('created_at', { ascending: false });
export const likePost = (userId: string, postId: string) => supabase.from('likes').insert({ user_id: userId, post_id: postId });
export const unlikePost = (userId: string, postId: string) => supabase.from('likes').delete().match({ user_id: userId, post_id: postId });
export const followUser = (followerId: string, followingId: string) => supabase.from('followers').insert({ follower_id: followerId, following_id: followingId });
export const unfollowUser = (followerId: string, followingId: string) => supabase.from('followers').delete().match({ follower_id: followerId, following_id: followingId });
export const createPost = (userId: string, rollId: string, caption: string, coverUrl: string | null) => supabase.from('posts').insert({ user_id: userId, roll_id: rollId, caption, cover_photo_url: coverUrl }).select(POST_SELECT_QUERY).single();
export const addComment = (userId: string, postId: string, content: string) => supabase.from('comments').insert({ user_id: userId, post_id: postId, content });
export const deleteComment = (commentId: string) => supabase.from('comments').delete().eq('id', commentId);
export const deletePostsForRoll = (rollId: string) => supabase.from('posts').delete().eq('roll_id', rollId);
export const getPostsForRoll = (rollId: string) => supabase.from('posts').select('id').eq('roll_id', rollId);
export const deleteLikesForPosts = (postIds: string[]) => supabase.from('likes').delete().in('post_id', postIds);
export const deleteCommentsForPosts = (postIds: string[]) => supabase.from('comments').delete().in('post_id', postIds);

// Albums
export const fetchAlbums = (userId: string) => supabase.from('albums').select('*, album_rolls(rolls(shots_used))').eq('user_id', userId);
export const fetchAlbumDetails = (albumId: string) => supabase.from('albums').select('*, album_rolls(*, rolls(*, developed_at, photos(*)))').eq('id', albumId).single();
export const createAlbum = (userId: string, title: string) => supabase.from('albums').insert({ user_id: userId, title }).select().single();
export const deleteAlbumRolls = (albumId: string) => supabase.from('album_rolls').delete().eq('album_id', albumId);
export const insertAlbumRolls = (links: { album_id: string, roll_id: string }[]) => supabase.from('album_rolls').insert(links);
export const deleteAlbumRollsByRollId = (rollId: string) => supabase.from('album_rolls').delete().eq('roll_id', rollId);

// Notifications
export const fetchNotifications = (userId: string) => supabase.from('notifications').select(NOTIFICATION_SELECT_QUERY).eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
export const markNotificationsRead = (ids: string[]) => supabase.from('notifications').update({ is_read: true }).in('id', ids);

// Edge Functions
export const recordActivity = (activityType: string, actorId: string, entityId: string, entityOwnerId?: string) => {
  return supabase.functions.invoke('record-activity', {
    body: { activityType, actorId, entityId, entityOwnerId },
  });
};