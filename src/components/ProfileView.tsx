import React, { useEffect, useState } from 'react';
import { Edit, ArrowLeft, Image as ImageIcon, Award, Sparkles } from 'lucide-react';
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
  <div className="flex flex-col items-center px-3 py-2 bg-neutral-800/40 rounded-xl">
    <div className="text-sm font-bold text-white">{value}</div>
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

  const handleAvatarClick = () => setEditingAvatar(true);
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await refreshProfile(); // context handles upload; refresh after change
    setEditingAvatar(false);
  };

  const handleSaveBio = async () => {
    if (bio === (profile.bio || '')) {
      setBioEditing(false);
      return;
    }
    setIsSavingBio(true);
    await refreshProfile(); // updateProfileDetails handled by context
    setIsSavingBio(false);
    setBioEditing(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Top header — centered, airy */}
      <div className="bg-neutral-900/30 glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <label htmlFor="avatar-upload" onClick={handleAvatarClick} className="cursor-pointer">
            <AvatarRing
              src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`}
              size={112}
              alt={profile.username}
            />
          </label>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white truncate">{profile.username}</h2>
              <p className="text-sm text-gray-300 mt-1 truncate">{profile.first_name ? `${profile.first_name} ${profile.last_name ?? ''}` : ''}</p>

              {/* Bio */}
              <div className="mt-3">
                {!bioEditing ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-400 line-clamp-2">{profile.bio || 'No bio yet — share a short note about yourself.'}</p>
                    <button onClick={() => setBioEditing(true)} className="text-gray-400 hover:text-white p-1 rounded-full">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <textarea
                      className="resize-none w-full bg-neutral-800/30 border border-neutral-700 rounded-lg p-2 text-sm text-white"
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                    <div className="flex flex-col gap-2">
                      <button onClick={handleSaveBio} disabled={isSavingBio} className="px-3 py-2 rounded-lg bg-brand-amber-start text-black font-semibold">
                        {isSavingBio ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => { setBio(profile.bio || ''); setBioEditing(false); }} className="px-3 py-2 rounded-lg bg-neutral-700 text-white">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right-side compact stats */}
            <div className="ml-auto hidden md:flex items-center gap-3">
              <div className="w-44">
                <XPBar xp={profile.xp} level={profile.level} />
              </div>
              <SmallStat value={<span>{posts.length}</span>} label="Posts" />
              <SmallStat value={<span>{userBadges.length}</span>} label="Badges" />
            </div>
          </div>

          {/* Mobile stats below header for breathing room */}
          <div className="mt-4 md:hidden flex items-center gap-3">
            <div className="flex-1">
              <XPBar xp={profile.xp} level={profile.level} />
            </div>
            <SmallStat value={<span>{posts.length}</span>} label="Posts" />
            <SmallStat value={<span>{userBadges.length}</span>} label="Badges" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center justify-center space-x-3">
        <TabButton label="Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={ImageIcon} />
        <TabButton label="Achievements" active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={Award} />
      </div>

      {/* Content area: two-column on wide screens */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left: Posts */}
        <div>
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

          {/* If Achievements tab is active on narrow screens, show badges above challenges */}
          {activeTab === 'achievements' && (
            <>
              <div className="bg-neutral-900/30 glass-card p-4 rounded-2xl mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">Badges</h3>
                <div className="grid grid-cols-4 gap-3">
                  {userBadges.length > 0 ? userBadges.map((ub) => (
                    <div key={ub.badges.name} className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                        <BadgeIcon name={ub.badges.icon_name} className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="text-xs text-white mt-2 text-center">{ub.badges.name}</div>
                    </div>
                  )) : (
                    <div className="col-span-full text-center text-gray-500 py-6">No badges yet.</div>
                  )}
                </div>
              </div>

              <div className="bg-neutral-900/30 glass-card p-4 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-3">Challenges</h3>
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
            </>
          )}
        </div>

        {/* Right: Achievements panel (sticky on desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="bg-neutral-900/30 glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-300">Badges</h4>
                <span className="text-xs text-gray-400">{userBadges.length}</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {userBadges.length > 0 ? userBadges.map((ub) => (
                  <div key={ub.badges.name} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                      <BadgeIcon name={ub.badges.icon_name} className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-xs text-white mt-2 text-center">{ub.badges.name}</div>
                  </div>
                )) : (
                  <div className="col-span-full text-center text-gray-500 py-6">No badges yet.</div>
                )}
              </div>
            </div>

            <div className="bg-neutral-900/30 glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-300">Challenges</h4>
                <span className="text-xs text-gray-400">{challenges.length}</span>
              </div>
              <div className="space-y-3">
                {challenges && challenges.length > 0 ? challenges.map(c => {
                  const progress = Math.min(100, Math.round(((c.progress || 0) / c.target) * 100));
                  const isComplete = (c.isCompleted || (c.progress || 0) >= c.target);
                  return (
                    <div key={c.id} className={`p-3 rounded-lg ${isComplete ? 'bg-green-900/30 border border-green-700' : 'bg-neutral-800/40 border border-neutral-700/30'}`}>
                      <div className="text-sm font-semibold text-white truncate">{c.title}</div>
                      <div className="mt-2 h-2 bg-neutral-700 rounded-full overflow-hidden">
                        <div style={{ width: `${progress}%` }} className={`h-full ${isComplete ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                        <span>{isComplete ? 'Completed' : `${c.progress || 0}/${c.target}`}</span>
                        <span>{c.type}</span>
                      </div>
                    </div>
                  );
                }) : <div className="text-center text-gray-500 py-6">No active challenges.</div>}
              </div>
            </div>

            <div className="bg-neutral-900/10 p-3 rounded-2xl text-center text-xs text-gray-400">
              Keep sharing to earn more badges and XP — progress shows up here.
            </div>
          </div>
        </aside>
      </div>

      {postToView && <PostDetailModal post={postToView} onClose={() => setPostToView(null)} />}
    </div>
  );
};

export default ProfileView;