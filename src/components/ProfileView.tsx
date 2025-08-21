import React, { useEffect, useState } from 'react';
import { Edit, Image as ImageIcon, Award, Sparkles, Film, Folder, Settings } from 'lucide-react';
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

const SmallStat: React.FC<{ value: React.ReactNode; label: string; icon?: React.ElementType }> = ({ value, label, icon: Icon }) => (
  <div className="flex flex-col items-center px-4 py-2 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
    {Icon && <Icon className="w-4 h-4 text-gray-400 mb-1" />}
    <div className="text-xl font-bold text-white">{value}</div>
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
    refreshProfile,
    completedRolls,
    albums,
    setCurrentView,
    updateProfileDetails,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'posts' | 'achievements'>('posts');
  const [editingAvatar, setEditingAvatar] = useState(false);
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
  const totalRolls = completedRolls.length;
  const totalAlbums = albums.length;

  const handleAvatarClick = () => setEditingAvatar(true);
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await updateProfileDetails({ avatarFile: e.target.files[0] });
    await refreshProfile(); // context handles upload; refresh after change
    setEditingAvatar(false);
  };

  const handleSaveBio = async () => {
    if (bio === (profile.bio || '')) {
      setBioEditing(false);
      return;
    }
    setIsSavingBio(true);
    await updateProfileDetails({ bio });
    await refreshProfile();
    setIsSavingBio(false);
    setBioEditing(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Profile Header Section */}
      <div className="bg-white/70 dark:bg-neutral-800/60 backdrop-blur-lg border border-white/30 dark:border-neutral-700/50 rounded-2xl shadow-none p-6 flex flex-col items-center text-center relative">
        {/* Avatar */}
        <div className="flex-shrink-0 mb-4">
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <label htmlFor="avatar-upload" onClick={handleAvatarClick} className="cursor-pointer">
            <AvatarRing
              src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`}
              size={140} // Larger avatar
              alt={profile.username}
            />
          </label>
        </div>

        {/* Username and Name */}
        <h2 className="text-4xl font-bold leading-tight text-white">{profile.username}</h2>
        {profile.first_name && (
          <p className="text-lg text-gray-300 mt-1">{profile.first_name} {profile.last_name ?? ''}</p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <SmallStat value={posts.length} label="Posts" icon={ImageIcon} />
          <SmallStat value={totalRolls} label="Rolls" icon={Film} />
          <SmallStat value={totalAlbums} label="Albums" icon={Folder} />
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => setCurrentView('settings')}
          className="mt-6 w-full max-w-xs py-2.5 px-4 rounded-lg shadow-lg shadow-brand-amber-start/20 text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all flex items-center justify-center space-x-2"
        >
          <Settings className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>

        {/* Bio */}
        <div className="mt-4 w-full max-w-md">
          {!bioEditing ? (
            <div className="flex items-center justify-center gap-3">
              <p className="text-sm text-gray-400 text-center">{profile.bio || 'No bio yet — share a short note about yourself.'}</p>
              <button onClick={() => setBioEditing(true)} className="text-gray-400 hover:text-white p-1 rounded-full">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <textarea
                className="resize-none w-full bg-neutral-800/50 border border-neutral-700 rounded-lg p-2 text-sm text-white text-center"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={handleSaveBio} disabled={isSavingBio} className="px-4 py-2 rounded-lg bg-brand-amber-start text-black font-semibold">
                  {isSavingBio ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setBio(profile.bio || ''); setBioEditing(false); }} className="px-4 py-2 rounded-lg bg-neutral-700 text-white">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gamification Stats (XP, Credits, Streak) - as a separate card below header */}
      <div className="mt-6 bg-white/70 dark:bg-neutral-800/60 backdrop-blur-lg border border-white/30 dark:border-neutral-700/50 rounded-2xl shadow-none p-6">
        <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
        <XPBar xp={profile.xp} level={profile.level} />
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-700/50 mt-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{profile.credits}</div>
            <div className="text-sm text-gray-400">Credits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{profile.streak}</div>
            <div className="text-sm text-gray-400">Daily Streak</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center justify-center space-x-3">
        <TabButton label="Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={ImageIcon} />
        <TabButton label="Achievements" active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={Award} />
      </div>

      {/* Content area: Posts or Achievements */}
      <div className="mt-6">
        {activeTab === 'posts' && (
          <>
            {posts.length === 0 ? (
              <EmptyPosts />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {posts.map((post) => (
                  <SnapshotCard key={post.id} post={post as any} onClick={() => setPostToView(post)} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-white/70 dark:bg-neutral-800/60 backdrop-blur-lg border border-white/30 dark:border-neutral-700/50 rounded-2xl shadow-none p-6">
              <h3 className="text-xl font-bold text-white mb-4">Badges</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {userBadges.length > 0 ? userBadges.map((ub) => (
                  <div key={ub.badges.name} className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                      <BadgeIcon name={ub.badges.icon_name} className="w-10 h-10 text-amber-400" />
                    </div>
                    <div className="text-sm text-white mt-2 font-medium">{ub.badges.name}</div>
                  </div>
                )) : (
                  <div className="col-span-full text-center text-gray-500 py-6">No badges yet. Keep shooting and sharing!</div>
                )}
              </div>
            </div>

            {/* Challenges */}
            <div className="bg-white/70 dark:bg-neutral-800/60 backdrop-blur-lg border border-white/30 dark:border-neutral-700/50 rounded-2xl shadow-none p-6">
              <h3 className="text-xl font-bold text-white mb-4">Challenges</h3>
              <div className="space-y-4">
                {challenges && challenges.length > 0 ? challenges.map(c => {
                  const progress = Math.min(100, Math.round(((c.progress || 0) / c.target) * 100));
                  const isComplete = (c.isCompleted || (c.progress || 0) >= c.target);
                  return (
                    <div key={c.id} className={`p-4 rounded-lg ${isComplete ? 'bg-green-900/30 border border-green-700' : 'bg-neutral-800/40 border border-neutral-700/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{c.title}</h3>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              c.type === 'daily' 
                                ? 'bg-blue-500 bg-opacity-20 text-blue-400'
                                : c.type === 'weekly'
                                ? 'bg-purple-500 bg-opacity-20 text-purple-400'
                                : 'bg-amber-500 bg-opacity-20 text-amber-400'
                            }`}>
                              {c.type}
                            </div>
                          </div>
                          <p className="text-gray-400 mb-3">{c.description}</p>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{c.progress || 0}/{c.target}</span>
                            </div>
                            <div className="bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-transform duration-300 origin-left ${
                                  isComplete ? 'bg-green-400' : 'bg-purple-400'
                                }`}
                                style={{ transform: `scaleX(${progress / 100})` }}
                              ></div>
                            </div>
                          </div>

                          {/* Rewards */}
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-purple-400" />
                              <span>{c.reward.xp} XP</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              <span>{c.reward.credits} credits</span>
                            </div>
                            {c.reward.badge && (
                              <div className="flex items-center space-x-1">
                                <Trophy className="w-4 h-4 text-orange-400" />
                                <span>{c.reward.badge}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          {timeRemaining && (
                            <div className="text-sm text-gray-400 mb-2">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {timeRemaining.hours}h {timeRemaining.minutes}m
                            </div>
                          )}
                          {isComplete && (
                            <button
                              onClick={() => handleClaimReward(challenge.id)}
                              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                            >
                              <Gift className="w-4 h-4" />
                              <span>Claim</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : <div className="col-span-full text-center text-gray-500 py-6">No active challenges.</div>}
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