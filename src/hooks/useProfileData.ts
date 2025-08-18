import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { UserProfile, UserBadge, Notification, Challenge, Post } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast } from '../utils/toasts';

export const useProfileData = (profile: UserProfile | null) => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await api.fetchNotifications(profile.id);
    if (error) console.error('fetchNotifications', error);
    else setNotifications(data || []);
  }, [profile]);

  const fetchProfilePageData = useCallback(async () => {
    if (!profile) return;
    api.fetchUserBadges(profile.id).then(({ data }) => setUserBadges(data || []));
    api.fetchFollowerCount(profile.id).then(({ count }) => setFollowersCount(count || 0));
    api.fetchFollowingCount(profile.id).then(({ count }) => setFollowingCount(count || 0));
    api.fetchUserPosts(profile.id).then(({ data }) => setUserPosts(data || []));
  }, [profile]);

  useEffect(() => {
    if (profile) {
      fetchNotifications();
    }
  }, [profile, fetchNotifications]);

  const markNotificationsAsRead = useCallback(async () => {
    if (!profile) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await api.markNotificationsRead(unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [profile, notifications]);

  const updateProfileDetails = useCallback(async (details: { 
    bio?: string; 
    avatarFile?: File;
    is_geolocation_enabled?: boolean;
    is_auto_backup_enabled?: boolean;
    experience_mode?: 'digital' | 'standard' | 'authentic';
  }) => {
    if (!profile) return;
    const updatePayload: { 
      bio?: string; 
      avatar_url?: string;
      is_geolocation_enabled?: boolean;
      is_auto_backup_enabled?: boolean;
      experience_mode?: 'digital' | 'standard' | 'authentic';
    } = {};
    
    if (details.avatarFile) {
      const toastId = showLoadingToast('Uploading new avatar...');
      try {
        const fileExt = (details.avatarFile.name.split('.').pop() || 'png').replace(/[^a-z0-9]/gi, '');
        const filePath = `${profile.id}/avatar.${fileExt}`;
        await api.uploadAvatar(filePath, details.avatarFile);
        const { data: urlData } = api.getPublicUrl('avatars', filePath);
        updatePayload.avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;
      } catch (error: any) {
        showErrorToast(`Avatar upload failed: ${error?.message}`);
        dismissToast(toastId);
        return;
      }
      dismissToast(toastId);
    }

    if (typeof details.bio !== 'undefined') updatePayload.bio = details.bio;
    if (typeof details.is_geolocation_enabled !== 'undefined') {
      updatePayload.is_geolocation_enabled = details.is_geolocation_enabled;
    }
    if (typeof details.is_auto_backup_enabled !== 'undefined') {
      updatePayload.is_auto_backup_enabled = details.is_auto_backup_enabled;
    }
    if (details.experience_mode) {
      updatePayload.experience_mode = details.experience_mode;
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await api.updateProfile(profile.id, updatePayload);
      if (error) showErrorToast(`Failed to update profile: ${error.message}`);
      else showSuccessToast('Settings updated!');
    }
  }, [profile]);

  return {
    userBadges,
    notifications,
    fetchNotifications,
    markNotificationsAsRead,
    challenges,
    setChallenges,
    followersCount,
    followingCount,
    fetchProfilePageData,
    updateProfileDetails,
    userPosts,
  };
};