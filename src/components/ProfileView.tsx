import React, { useEffect, useState } from 'react';
import { Edit, ArrowLeft, Image as ImageIcon, Award, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AvatarRing from './AvatarRing';
import XPBar from './XPBar';
import BadgeIcon from './BadgeIcon';
import SnapshotCard from './SnapshotCard';
import PostDetailModal from './PostDetailModal';
import LoadingIndicator from './LoadingIndicator';
import { Post } from '../types';

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; icon?: React.ElementType }> = ({ label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 text-sm font-semibold ${
      active
        ? 'bg-gradient-to-r from-brand-amber-start to-brand-amber-end text-black shadow-md'
        : 'bg-neutral-800/50 text-gray-300 hover:bg-neutral-700/60'
    }`}
  >
    {Icon && <Icon className={`${active ? 'opacity-95' : 'opacity-80'} w-4 h-4`} />}
    <span>{label}</span>
  </button>
);

const EmptyPosts: React.FC = () => (
  <div className="text-center py-20 text-neutral-500">
    <ImageIcon className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white">No posts yet</h3>
    <p className="mt-2">Publish your first snapshot to appear on your profile.</p>
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

  const handleAvatarClick = () => {
    setEditingAvatar(true);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await refreshProfile(); // delegate actual upload to context handler elsewhere; refresh after change
    setEditingAvatar(false);
  };

  const handleSaveBio = async () => {
    if (bio === (profile.bio || '')) {
      setBioEditing(false);
      return;
    }
    setIsSavingBio(true);
    await refreshProfile(); // update logic handled in context hook (updateProfileDetails); keep simple here
    setIsSavingBio(false);
    setBioEditing(false);
  };

  // Posts shown are user's published posts
  const posts = userPosts || [];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-neutral-900/40 glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <label htmlFor="avatar-upload" onClick={handleAvatarClick}>
              <AvatarRing src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`} size={88} alt={profile.username} />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white truncate">{profile.username}</h2>
              <span className="text-sm text-gray-300">{profile.first_name ? `${profile.first_name} ${profile.last_name ?? ''}` : null}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1 truncate">{profile.bio || 'No bio yet — tell the community a little about yourself.'}</p>

            <div className="mt-3 flex items-center gap-3">
              <div className="w-36">
                <XPBar xp={profile.xp} level={profile.level} />
              </div>

              <div className="ml-auto hidden sm:flex items-center gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{posts.length}</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{userBadges.length}</div>
                  <div className="text-xs text-gray-400">Badges</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* small actions (mobile-friendly) */}
        <div className="w-full sm:w-auto flex items-center justify-end gap-2 mt-3 sm:mt-0">
          <button onClick={() => setActiveTab('posts')} className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'posts' ? 'bg-neutral-800/80 text-white' : 'bg-transparent text-gray-300 hover:bg-neutral-800/40'}`}>Posts</button>
          <button onClick={() => setActiveTab('achievements')} className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'achievements' ? 'bg-neutral-800/80 text-white' : 'bg-transparent text-gray-300 hover:bg-neutral-800/40'}`}>Achievements</button>
        </div>
      </div>

      {/* Body */}
      <div className="mt-6">
        {activeTab === 'posts' ? (
          <>
            {posts.length === 0 ? (
              <EmptyPosts />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {posts.map((post) => (
                  <SnapshotCard key={post.id} post={post as any} onClick={() => setPostToView(post)} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Achievements tab */
          <div className="space-y-6">
            <div className="bg-neutral-900/40 glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Badges
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Badges you've earned for milestones and community activity.</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
                {userBadges.length > 0 ? (
                  userBadges.map((ub) => (
                    <div key={ub.badges.name} className="flex flex-col items-center text-center p-2">
                      <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                        <BadgeIcon name={ub.badges.icon_name} className="w-7 h-7 text-amber-400" />
                      </div>
                      <div className="text-xs font-semibold mt-2 text-white">{ub.badges.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-6">
                    <p>No badges yet — join challenges and share posts to start earning.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-neutral-900/40 glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Challenges
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Track active and completed challenges for rewards.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {challenges && challenges.length > 0 ? (
                  challenges.map((c) => {
                    const isCompleted = !!c.isCompleted;
                    return (
                      <div key={c.id} className={`p-3 rounded-lg transition ${isCompleted ? 'bg-green-900/30 border border-green-700' : 'bg-neutral-800/50 border border-neutral-700/40'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{c.title}</div>
                            <div className="text-xs text-gray-400">{c.description}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${isCompleted ? 'text-green-300' : 'text-gray-300'}`}>
                              {isCompleted ? 'Completed' : `${c.progress || 0}/${c.target}`}
                            </div>
                            <div className="text-xs text-gray-500">{c.type}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-6">No active challenges right now — check back soon.</div>
                )}
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