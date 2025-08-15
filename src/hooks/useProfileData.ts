import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { UserProfile, UserBadge, Notification, Challenge } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast } from '../utils/toasts';

export const useProfileData = (profile: UserProfile | null) => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

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

  const updateProfileDetails = useCallback(async (details: { bio?: string; avatarFile?: File }) => {
    if (!profile) return;
    const updatePayload: { bio?: string; avatar_url?: string } = {};
    
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

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await api.updateProfile(profile.id, updatePayload);
      if (error) showErrorToast(`Failed to update profile: ${error.message}`);
      else showSuccessToast('Profile updated!');
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
  };
};