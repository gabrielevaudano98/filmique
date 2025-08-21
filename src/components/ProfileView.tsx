import React, { useEffect, useRef, useState } from 'react';
import { Edit, ArrowLeft, Image as ImageIcon, Award, Sparkles, Users, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AvatarRing from './AvatarRing';
import XPBar from './XPBar';
import BadgeIcon from './BadgeIcon';
import SnapshotCard from './SnapshotCard';
import PostDetailModal from './PostDetailModal';
import LoadingIndicator from './LoadingIndicator';
import type { Post } from '../types';

const StatPill: React.FC<{ value: React.ReactNode; label: string; hint?: string }> = ({ value, label, hint }) => (
  <div className="flex flex-col items-center px-3 py-2 bg-neutral-800/30 rounded-xl min-w-[72px]">
    <div className="text-sm font-semibold text-white">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
    {hint && <div className="text-2xs text-gray-500 mt-1">{hint}</div>}
  </div>
);

const EmptyPosts: React.FC = () => (
  <div className="text-center py-20 text-neutral-500">
    <ImageIcon className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white">No posts yet</h3>
    <p className="mt-2 max-w-xl mx-auto">Publish a snapshot to populate your profile; your posts will be displayed here.</p>
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
  const [postToView, setPostToView] = useState<Post | null>(null);
  const [bioEditing, setBioEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Sticky title/sub-bar logic (mirrors Studio style)
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    fetchProfilePageData();
    setBio(profile?.bio || '');
  }, [fetchProfilePageData, profile?.bio]);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // when the trigger is not fully visible, enable sticky condensed header
        setIsSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: [1], rootMargin: '-80px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingIndicator text="Loading profile..." />
      </div>
    );
  }

  const posts = userPosts || [];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await refreshProfile(); // delegate upload & refresh to context
  };

  const handleSaveBio = async () => {
    if (bio === (profile.bio || '')) {
      setBioEditing(false);
      return;
    }
    setIsSavingBio(true);
    await refreshProfile();
    setIsSavingBio(false);
    setBioEditing(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Hero / Cover */}
      <div className="relative h-44 md:h-56 rounded-b-2xl overflow-hidden bg-gradient-to-b from-neutral-800/60 to-neutral-900/90">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(214,106,46,0.06),rgba(12,12,14,0.16))]" />
        <div className="absolute left-6 bottom-4 md:left-10 md:bottom-6 flex items-end gap-6">
          <div className="-mt-12 md:-mt-16">
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <AvatarRing src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`} size={120} />
            </label>
          </div>

          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{profile.username}</h1>
            <p className="text-sm text-gray-300 mt-1">{profile.first_name ? `${profile.first_name} ${profile.last_name ?? ''}` : ''}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-44">
                <XPBar xp={profile.xp} level={profile.level} />
              </div>
              <div className="hidden md:flex items-center gap-3">
                <StatPill value={posts.length} label="Posts" />
                <StatPill value={userBadges.length} label="Badges" />
                <StatPill value={profile.credits} label="Credits" />
                <StatPill value={profile.streak} label="Streak" hint="days" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger for sticky behavior */}
      <div ref={triggerRef} />

      {/* Sticky title + tab/sub-bar (condensed when sticky) */}
      <div className={`w-full top-0 z-40 transition-all duration-200 ${isSticky ? 'fixed left-0 right-0 backdrop-blur-lg bg-neutral-900/70 border-b border-neutral-800/50' : 'relative mt-4'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Condensed avatar shown when sticky */}
            {isSticky && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10">
                  <AvatarRing src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`} size={40} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-tight">{profile.username}</div>
                  <div className="text-xs text-gray-400">{posts.length} posts • {userBadges.length} badges</div>
                </div>
              </div>
            )}

            {!isSticky && (
              <div>
                <div className="text-lg font-bold text-white">Profile</div>
                <div className="text-xs text-gray-400">Your public posts and achievements</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-800/40 rounded-full p-1">
              <button onClick={() => setActiveTab('posts')} className={`px-3 py-1 rounded-full text-sm font-semibold ${activeTab === 'posts' ? 'bg-neutral-900 text-white' : 'text-gray-300 hover:bg-neutral-800/50'}`}>Posts</button>
              <button onClick={() => setActiveTab('achievements')} className={`px-3 py-1 rounded-full text-sm font-semibold ${activeTab === 'achievements' ? 'bg-neutral-900 text-white' : 'text-gray-300 hover:bg-neutral-800/50'}`}>Achievements</button>
            </div>

            <button onClick={() => { /* edit profile navigation - context or route */ }} className="px-3 py-1 rounded-lg bg-neutral-800/60 text-gray-200 hover:bg-neutral-700/70">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: posts or achievements list */}
          <div>
            {activeTab === 'posts' ? (
              <>
                {posts.length === 0 ? <EmptyPosts /> : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {posts.map(p => (
                      <SnapshotCard key={p.id} post={p as any} onClick={() => setPostToView(p)} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <section className="bg-neutral-900/30 glass-card p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Award className="w-5 h-5 text-amber-400" /> Badges</h3>
                    <div className="text-sm text-gray-400">{userBadges.length} earned</div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {userBadges.length > 0 ? userBadges.map(b => (
                      <div key={b.badges.name} className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                          <BadgeIcon name={b.badges.icon_name} className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="text-xs text-white mt-2 text-center">{b.badges.name}</div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center text-gray-500 py-6">No badges yet — earn them by participating.</div>
                    )}
                  </div>
                </section>

                <section className="bg-neutral-900/30 glass-card p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /> Challenges</h3>
                    <div className="text-sm text-gray-400">{challenges.length}</div>
                  </div>
                  <div className="space-y-3">
                    {challenges && challenges.length > 0 ? challenges.map(c => {
                      const progressPct = Math.min(100, Math.round(((c.progress || 0) / c.target) * 100));
                      const completed = c.isCompleted || (c.progress || 0) >= c.target;
                      return (
                        <div key={c.id} className={`p-3 rounded-lg ${completed ? 'bg-green-900/30 border border-green-700' : 'bg-neutral-800/40 border border-neutral-700/30'}`}>
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white truncate">{c.title}</div>
                              <div className="text-xs text-gray-400 truncate">{c.description}</div>
                            </div>
                            <div className="text-xs text-gray-300 ml-3">{completed ? 'Completed' : `${c.progress || 0}/${c.target}`}</div>
                          </div>
                          <div className="mt-3 h-2 bg-neutral-700 rounded-full overflow-hidden">
                            <div style={{ width: `${progressPct}%` }} className={`h-full ${completed ? 'bg-green-400' : 'bg-amber-400'}`} />
                          </div>
                        </div>
                      );
                    }) : <div className="text-center text-gray-500 py-6">No active challenges right now.</div>}
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Right: compact achievements / quick stats (sticky) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="bg-neutral-900/30 glass-card p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-300">Summary</h4>
                  <div className="text-xs text-gray-400">Activity</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatPill value={posts.length} label="Posts" />
                  <StatPill value={userBadges.length} label="Badges" />
                  <StatPill value={profile.credits} label="Credits" />
                  <StatPill value={profile.streak} label="Streak" hint="days" />
                </div>
              </div>

              <div className="bg-neutral-900/30 glass-card p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-300">Community</h4>
                  <div className="text-xs text-gray-400">Your network</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-gray-300">Followers</div>
                    <div className="text-lg font-bold text-white">—</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-300">Following</div>
                    <div className="text-lg font-bold text-white">—</div>
                  </div>
                </div>

                <div className="mt-4">
                  <button className="w-full py-2 rounded-lg bg-gradient-to-r from-brand-amber-start to-brand-amber-end text-black font-bold">Invite friends</button>
                </div>
              </div>

              <div className="bg-neutral-900/10 p-3 rounded-2xl text-center text-xs text-gray-400">
                Profile optimized for focused sharing — posts and achievements only.
              </div>
            </div>
          </aside>
        </div>
      </div>

      {postToView && <PostDetailModal post={postToView} onClose={() => setPostToView(null)} />}
    </div>
  );
};

export default ProfileView;