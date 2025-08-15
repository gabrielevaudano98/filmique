import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api';
import { UserProfile, UserBadge, Challenge } from '../types';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast } from '../utils/toasts';

export const useProfileData = (profile: UserProfile | null) => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const profileIdRef = useRef<string | null>(null);

  useEffect(() => {
    profileIdRef.current = profile?.id || null;
  }, [profile]);

  const fetchProfilePageData = useCallback(async () => {
    const userId = profileIdRef.current;
    if (!userId) return;
    api.fetchUserBadges(userId).then(({ data }) => setUserBadges(data || []));
    api.fetchFollowerCount(userId).then(({ count }) => setFollowersCount(count || 0));
    api.fetchFollowingCount(userId).then(({ count }) => setFollowingCount(count || 0));
  }, []);

  const updateProfileDetails = useCallback(async (details: { bio?: string; avatarFile?: File }) => {
    const userId = profileIdRef.current;
    if (!userId) return;
    const updatePayload: { bio?: string; avatar_url?: string } = {};
    
    if (details.avatarFile) {
      const toastId = showLoadingToast('Uploading new avatar...');
      try {
        const fileExt = (details.avatarFile.name.split('.').pop() || 'png').replace(/[^a-z0-9]/gi, '');
        const filePath = `${userId}/avatar.${fileExt}`;
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
      const { error } = await api.updateProfile(userId, updatePayload);
      if (error) showErrorToast(`Failed to update profile: ${error.message}`);
      else showSuccessToast('Profile updated!');
    }
  }, []);

  return {
    userBadges,
    challenges,
    setChallenges,
    followersCount,
    followingCount,
    fetchProfilePageData,
    updateProfileDetails,
  };
};