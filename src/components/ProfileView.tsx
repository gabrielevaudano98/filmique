import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Award, Edit, Image as ImageIcon, Grid, Settings, User, CheckCircle, Loader, LayoutList } from 'lucide-react';
import { useAppContext, Post } from '../context/AppContext';
import BadgeIcon from './BadgeIcon';
import PostDetailModal from './PostDetailModal';
import { useDebounce } from '../hooks/useDebounce';
import PostView from './PostView';
import AvatarRing from './AvatarRing';

const HighlightStat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

const ProfileView: React.FC = () => {
  const { profile, feed, followersCount, followingCount, userBadges, updateProfileDetails, setCurrentView, refreshProfile } = useAppContext();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'feed' | 'badges'>('posts');
  
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const debouncedBio = useDebounce(bioText, 1000);
  const isBioChanged = useMemo(() => bioText !== (profile?.bio || ''), [bioText, profile?.bio]);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const posts = useMemo(() => {
    if (!profile) return [];
    return feed.filter(post => post.user_id === profile.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [feed, profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await updateProfileDetails({ avatarFile: e.target.files[0] });
      await refreshProfile();
    }
  };

  const handleSaveBio = async () => {
    if (!isBioChanged || bioText.length > 255) return;
    setIsSavingBio(true);
    await updateProfileDetails({ bio: bioText });
    await refreshProfile();
    setIsSavingBio(false);
    setIsEditingBio(false);
  };

  useEffect(() => {
    if (isEditingBio && isBioChanged && debouncedBio === bioText) {
      handleSaveBio();
    }
  }, [debouncedBio, bioText, isEditingBio, isBioChanged]);

  if (!profile) {
    return <div className="text-white p-6">Loading profile...</div>;
  }

  return (
    <>
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      
      <div className="flex-1 flex flex-col bg-transparent text-white">
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            <button onClick={() => setCurrentView('settings')} className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center mt-4">
            <div className="relative flex-shrink-0">
              <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              <AvatarRing src={profile.avatar_url} size={80} onClick={() => avatarInputRef.current?.click()} />
            </div>
            <div className="flex-1 flex justify-around ml-4">
              <HighlightStat value={posts.length} label="Posts" />
              <HighlightStat value={followersCount} label="Followers" />
              <HighlightStat value={followingCount} label="Following" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-white">{profile.first_name} {profile.last_name}</p>
            {isEditingBio ? (
              <div className="mt-1">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  onBlur={handleSaveBio}
                  maxLength={255}
                  className="w-full bg-warm-800 border border-warm-700 rounded-lg p-2 text-gray-300 focus:ring-brand-amber-start focus:border-brand-amber-start text-sm"
                  rows={3}
                  autoFocus
                />
                <div className="flex items-center justify-end text-xs text-gray-500 mt-1 space-x-2">
                  <span>{bioText.length}/255</span>
                  {isSavingBio && <Loader className="w-3 h-3 animate-spin" />}
                  {!isSavingBio && isBioChanged && <span className="text-amber-400">Saving...</span>}
                  {!isSavingBio && !isBioChanged && <CheckCircle className="w-3 h-3 text-green-500" />}
                </div>
              </div>
            ) : (
              <div onClick={() => setIsEditingBio(true)} className="mt-1 text-gray-400 text-sm group cursor-pointer min-h-[24px]">
                {profile.bio || <span className="italic">No bio yet. Click to add one.</span>}
                <Edit className="w-4 h-4 text-gray-500 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow mt-6">
          <div className="flex border-b border-neutral-700">
            {[
              { key: 'posts', icon: <Grid className="w-6 h-6" /> },
              { key: 'feed', icon: <LayoutList className="w-6 h-6" /> },
              { key: 'badges', icon: <Award className="w-6 h-6" /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex justify-center items-center py-3 transition-colors relative ${activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-white'}`}
              >
                {tab.icon}
                {activeTab === tab.key && <div className="absolute bottom-0 h-1 w-full bg-white rounded-t-full"></div>}
              </button>
            ))}
          </div>

          <div className="w-full pt-0.5">
            {activeTab === 'posts' && (
              posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5">
                  {posts.map(post => (
                    <div key={post.id} className="aspect-square bg-neutral-800 group cursor-pointer" onClick={() => setSelectedPost(post)}>
                      <img
                        src={post.cover_photo_url || post.rolls.photos[0]?.thumbnail_url}
                        alt="Post thumbnail"
                        className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16">
                  <Grid className="w-12 h-12 mx-auto mb-2" />
                  <p>No posts yet.</p>
                </div>
              )
            )}
            {activeTab === 'feed' && (
              <div className="space-y-4 p-2 sm:p-4">
                {posts.length > 0 ? (
                  posts.map(post => <PostView key={post.id} post={post} />)
                ) : (
                  <div className="text-center text-gray-500 py-16">
                    <LayoutList className="w-12 h-12 mx-auto mb-2" />
                    <p>No posts yet.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'badges' && (
              <div className="p-4">
                {userBadges.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {userBadges.map(ub => (
                      <div key={ub.badges.name} className="flex flex-col items-center text-center group cursor-pointer" title={`${ub.badges.name}: ${ub.badges.description}`}>
                        <div className="w-20 h-20 rounded-full bg-warm-800 flex items-center justify-center mb-2 border-2 border-brand-amber-start/30 group-hover:bg-brand-amber-start/10 transition-colors">
                          <BadgeIcon name={ub.badges.icon_name} className="w-10 h-10 text-brand-amber-start" />
                        </div>
                        <p className="text-xs font-semibold text-white truncate w-full">{ub.badges.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-16">
                    <Award className="w-12 h-12 mx-auto mb-2" />
                    <p>No badges earned yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileView;