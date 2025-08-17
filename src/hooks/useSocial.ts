import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { UserProfile, Post, Comment } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast, showInfoToast } from '../utils/toasts';
import { addActionToQueue } from '../utils/queue';

export const useSocial = (profile: UserProfile | null, isOnline: boolean) => {
  const [feed, setFeed] = useState<Post[]>([]);
  const [recentStories, setRecentStories] = useState<Map<string, { user: UserProfile, posts: Post[] }>>(new Map());

  const fetchFeed = useCallback(async () => {
    if (!profile) return;
    const { data: followingData } = await api.fetchFollowedIds(profile.id);
    const followedUserIds = new Set(followingData?.map(f => f.following_id) || []);
    const { data: postsData, error } = await api.fetchFeedPosts();
    if (error) return;
    const augmented = postsData.map(post => ({
      ...post,
      isLiked: post.likes?.some(l => l.user_id === profile.id),
      isFollowed: followedUserIds.has(post.user_id),
    })) as Post[];
    setFeed(augmented);
  }, [profile]);

  const fetchRecentStories = useCallback(async () => {
    if (!profile) return;
    const { data: followingData } = await api.fetchFollowedIds(profile.id);
    const followedUserIds = followingData?.map(f => f.following_id) || [];
    if (followedUserIds.length === 0) return;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentPosts } = await api.fetchRecentStoryPosts(followedUserIds, since);
    if (!recentPosts) return;
    const storiesMap = new Map<string, { user: UserProfile, posts: Post[] }>();
    recentPosts.forEach(post => {
      const user = post.profiles as UserProfile;
      if (!storiesMap.has(user.id)) storiesMap.set(user.id, { user, posts: [] });
      storiesMap.get(user.id)!.posts.push({ ...post, isLiked: post.likes?.some(l => l.user_id === profile.id), isFollowed: true } as Post);
    });
    setRecentStories(storiesMap);
  }, [profile]);

  const handleLike = useCallback(async (postId: string, postOwnerId: string, isLiked?: boolean) => {
    if (!profile) return;
    
    setFeed(prevFeed => prevFeed.map(p => {
      if (p.id === postId) {
        const newLikes = isLiked ? p.likes.filter(l => l.user_id !== profile.id) : [...p.likes, { user_id: profile.id }];
        return { ...p, isLiked: !isLiked, likes: newLikes };
      }
      return p;
    }));

    if (!isOnline) {
      await addActionToQueue({
        type: isLiked ? 'unlike' : 'like',
        payload: { userId: profile.id, postId },
        timestamp: Date.now(),
      });
      showInfoToast('You are offline. Action will sync when you reconnect.');
      return;
    }

    const action = isLiked ? api.unlikePost(profile.id, postId) : api.likePost(profile.id, postId);
    const { error } = await action;
    if (error) {
      showErrorToast('Failed to update like.');
      fetchFeed(); // Revert on error
    } else if (!isLiked) {
      api.recordActivity('like', profile.id, postId, postOwnerId);
    }
  }, [profile, fetchFeed, isOnline]);

  const handleFollow = useCallback(async (userId: string, isFollowed?: boolean) => {
    if (!profile) return;

    setFeed(prevFeed => prevFeed.map(p => p.user_id === userId ? { ...p, isFollowed: !isFollowed } : p));

    if (!isOnline) {
      await addActionToQueue({
        type: isFollowed ? 'unfollow' : 'follow',
        payload: { followerId: profile.id, followingId: userId },
        timestamp: Date.now(),
      });
      showInfoToast('You are offline. Action will sync when you reconnect.');
      return;
    }

    const action = isFollowed ? api.unfollowUser(profile.id, userId) : api.followUser(profile.id, userId);
    const { error } = await action;
    if (error) {
      showErrorToast('Could not update follow status.');
      fetchFeed(); // Revert on error
    } else if (!isFollowed) {
      api.recordActivity('follow', profile.id, userId, userId);
    }
  }, [profile, fetchFeed, isOnline]);

  const createPost = useCallback(async (rollId: string, caption: string, coverUrl: string | null, albumId: string | null) => {
    if (!profile) return;
    const toastId = showLoadingToast('Publishing post...');
    const { data, error } = await api.createPost(profile.id, rollId, caption, coverUrl, albumId);
    if (error) showErrorToast(error.message);
    else {
      api.recordActivity('post', profile.id, data.id, profile.id);
      showSuccessToast('Post published!');
      fetchFeed();
    }
    dismissToast(toastId);
  }, [profile, fetchFeed]);

  const addComment = useCallback(async (postId: string, postOwnerId: string, content: string) => {
    if (!profile) return;

    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      user_id: profile.id,
      profiles: { username: profile.username, avatar_url: profile.avatar_url },
    };
    setFeed(prevFeed => prevFeed.map(p => p.id === postId ? { ...p, comments: [...p.comments, tempComment] } : p));

    if (!isOnline) {
      await addActionToQueue({
        type: 'addComment',
        payload: { userId: profile.id, postId, content },
        timestamp: Date.now(),
      });
      showInfoToast('You are offline. Comment will sync when you reconnect.');
      return;
    }

    const { error } = await api.addComment(profile.id, postId, content);
    if (error) {
      showErrorToast(error.message);
      fetchFeed(); // Revert
    } else {
      api.recordActivity('comment', profile.id, postId, postOwnerId);
      fetchFeed(); // Re-fetch to sync real comment ID
    }
  }, [profile, fetchFeed, isOnline]);

  const deleteComment = useCallback(async (commentId: string) => {
    setFeed(prevFeed => prevFeed.map(p => ({ ...p, comments: p.comments.filter(c => c.id !== commentId) })));
    
    const { error } = await api.deleteComment(commentId);
    if (error) {
      showErrorToast(error.message);
      fetchFeed(); // Revert
    } else {
      showSuccessToast('Comment deleted');
    }
  }, [fetchFeed]);

  return {
    feed,
    setFeed,
    recentStories,
    fetchFeed,
    fetchRecentStories,
    handleLike,
    handleFollow,
    createPost,
    addComment,
    deleteComment,
    searchUsers: api.searchUsers,
  };
};