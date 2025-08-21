import React, { useEffect, useState } from 'react';
import { Edit, Image as ImageIcon, Award, Camera, UserPlus, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AvatarRing from './AvatarRing';
import XPBar from './XPBar';
import BadgeIcon from './BadgeIcon';
import SnapshotCard from './SnapshotCard';
import PostDetailModal from './PostDetailModal';
import LoadingIndicator from './LoadingIndicator';
import type { Post } from '../types';

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; icon?: React.ElementType }> = ({ label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
      active ? 'bg-gradient-to-r from-brand-amber-start to-brand-amber-end text-black shadow-md' : 'bg-neutral-800/40 text-gray-300 hover:bg-neutral-800/60'
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    <span>{label}</span>
  </button>
);

const EmptyPosts: React.FC = () => (
  <div className="text-center py-20 text-neutral-500">
    <ImageIcon className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white">No posts yet</h3>
    <p className="mt-2 max-w-xl mx-auto">Share a snapshot to appear on your profile. Your photos and milestones will show up here.</p>
  </div>
);

const SmallStat: React.FC<{ value: React.ReactNode; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center px-3 py-2">
    <div className="text-lg font-bold text-white">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);

const ProfileView: React.FC = () => {
  const {
    profile,
    userBadges,
    challenges,
    userPosts,
    fetchProfilePageData,
    updateProfileDetails,
    followersCount,
    followingCount,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'posts' | 'achievements'>('posts');
  const [postToView, setPostToView] = useState<Post | null>(null);
  const [bioEditing, setBioEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSavingBio, setIsSavingBio] = useState(false);

  useEffect(() => {
    fetchProfilePageData();
    setBio(profile?.bio || '');
  }, [fetchProfilePageData, profile?.bio]);

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingIndicator text="Loading profile..." />
      </div>
    );
  }

  const posts = userPosts || [];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await updateProfileDetails({ avatarFile: e.target.files[0] });
    }
  };

  const handleSaveBio = async () => {
    if (bio === (profile.bio || '')) {
      setBioEditing(false);
      return;
    }
    setIsSavingBio(true);
    await updateProfileDetails({ bio });
    setIsSavingBio(false);
    setBioEditing(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Profile Header Section */}
      <div className="flex flex-col items-center text-center px-4 pt-4 pb-6 border-b border-neutral-700/50">
        <div className="relative mb-4">
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <AvatarRing
              src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`}
              size={120}
              alt={profile.username}
            />
          </label>
          <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-neutral-800/70 rounded-full border border-neutral-700/50 cursor-pointer">
            <Edit className="w-4 h-4 text-gray-300" />
          </label>
        </div>

        <h2 className="text-3xl font-bold text-white mb-1">{profile.username}</h2>
        <p className="text-sm text-gray-400 mb-4">{profile.first_name} {profile.last_name}</p>

        {/* Stats Row */}
        <div className="flex justify-around w-full max-w-xs mb-4">
          <SmallStat value={posts.length} label="Posts" />
          <SmallStat value={followersCount} label="Followers" />
          <SmallStat value={followingCount} label="Following" />
        </div>

        {/* Edit Profile Button (Primary CTA) */}
        <button
          onClick={() => setBioEditing(true)}
          className="w-full max-w-xs py-2.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white font-semibold text-sm transition-colors mb-4"
        >
          Edit Profile
        </button>

        {/* Bio Section */}
        <div className="w-full px-4 text-left mb-4">
          {!bioEditing ? (
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-300 flex-1">{profile.bio || 'No bio yet — tap to add one.'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                className="resize-none w-full bg-neutral-800/30 border border-neutral-700 rounded-lg p-2 text-sm text-white"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setBio(profile.bio || ''); setBioEditing(false); }} className="px-3 py-1.5 rounded-lg bg-neutral-700 text-white text-sm">
                  Cancel
                </button>
                <button onClick={handleSaveBio} disabled={isSavingBio} className="px-3 py-1.5 rounded-lg bg-brand-amber-start text-black font-semibold text-sm">
                  {isSavingBio ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* XP Bar */}
        <div className="w-full px-4">
          <XPBar xp={profile.xp} level={profile.level} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center justify-center space-x-3 px-4">
        <TabButton label="Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={Camera} />
        <TabButton label="Achievements" active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={Award} />
      </div>

      {/* Content area */}
      <div className="mt-6 px-4">
        {activeTab === 'posts' && (
          <>
            {posts.length === 0 ? (
              <EmptyPosts />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {posts.map((post) => (
                  <SnapshotCard key={post.id} post={post as any} onClick={() => setPostToView(post)} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Badges Section */}
            <div className="bg-neutral-900/30 glass-card p-4 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Your Badges</h3>
              <div className="grid grid-cols-4 gap-3">
                {userBadges.length > 0 ? userBadges.map((ub) => (
                  <div key={ub.badges.name} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                      <BadgeIcon name={ub.badges.icon_name} className="w-8 h-8 text-amber-400" />
                    </div>
                    <div className="text-xs text-white mt-2">{ub.badges.name}</div>
                  </div>
                )) : (
                  <div className="col-span-full text-center text-gray-500 py-6">No badges yet. Keep shooting!</div>
                )}
              </div>
            </div>

            {/* Challenges Section */}
            <div className="bg-neutral-900/30 glass-card p-4 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Active Challenges</h3>
              <div className="space-y-3">
                {challenges && challenges.length > 0 ? challenges.map(c => {
                  const progress = Math.min(100, Math.round(((c.progress || 0) / c.target) * 100));
                  const isComplete = (c.isCompleted || (c.progress || 0) >= c.target);
                  return (
                    <div key={c.id} className={`p-3 rounded-lg ${isComplete ? 'bg-green-900/30 border border-green-700' : 'bg-neutral-800/40 border border-neutral-700/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{c.title}</div>
                          <div className="text-xs text-gray-400 truncate">{c.description}</div>
                        </div>
                        <div className="text-xs text-gray-300 ml-3">{isComplete ? 'Completed' : `${c.progress || 0}/${c.target}`}</div>
                      </div>
                      <div className="mt-3 h-2 bg-neutral-700 rounded-full overflow-hidden">
                        <div style={{ width: `${progress}%` }} className={`h-full ${isComplete ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                      </div>
                    </div>
                  );
                }) : <div className="text-center text-gray-500 py-6">No active challenges.</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {postToView && <PostDetailModal post={postToView} onClose={() => setPostToView(null)} />}
    </div>
  );
};

export default ProfileView;