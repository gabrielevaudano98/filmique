import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Award, Edit, Image as ImageIcon, Grid, Settings, User, CheckCircle, Loader, LayoutList } from 'lucide-react';
import { useAppContext, Post } from '../context/AppContext';
import BadgeIcon from './BadgeIcon';
import PostDetailModal from './PostDetailModal';
import { useDebounce } from '../hooks/useDebounce';
import PostView from './PostView';

const HighlightStat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

const ProfileView: React.FC = () => {
  const { profile, feed, followersCount, followingCount, userBadges, updateProfileDetails, setCurrentView } = useAppContext();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'feed' | 'badges'>('posts');
  
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const debouncedBio = useDebounce(bioText, 1500);
  const isBioChanged = useMemo(() => bioText !== (profile?.bio || ''), [bioText, profile?.bio]);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const posts = useMemo(() => {
    if (!profile) return [];
    return feed.filter(post => post.user_id === profile.id);
  }, [feed, profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await updateProfileDetails({ avatarFile: e.target.files[0] });
    }
  };

  const handleSaveBio = async () => {
    if (!isBioChanged || bioText.length > 255) return;
    setIsSavingBio(true);
    await updateProfileDetails({ bio: bioText });
    setIsSavingBio(false);
    setIsEditingBio(false);
  };

  useEffect(() => {
    if (isEditingBio && isBioChanged && debouncedBio === bioText) {
      handleSaveBio();
    }
  }, [debouncedBio]);

  if (!profile) {
    return <div className="text-white p-6">Loading profile...</div>;
  }

  return (
    <>
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      
      <div className="flex-1 flex flex-col bg-gray-900 text-white">
        {/* Header */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            <button onClick={() => setCurrentView('settings')} className="p-2">
              <Settings className="w-6 h-6 text-gray-300" />
            </button>
          </div>
          <div className="flex items-center mt-4">
            <div className="relative flex-shrink-0">
              <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              <button onClick={() => avatarInputRef.current?.click()} className="w-24 h-24 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center cursor-pointer overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt="User avatar" />
                ) : (
                  <User className="w-12 h-12 text-gray-500" />
                )}
              </button>
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
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
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
              <div onClick={() => setIsEditingBio(true)} className="mt-1 text-gray-400 text-sm group cursor-pointer">
                {profile.bio || <span className="italic">No bio yet. Click to add one.</span>}
                <Edit className="w-4 h-4 text-gray-500 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow mt-6">
          {/* Tabs */}
          <div className="flex border-t border-gray-700">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex justify-center items-center py-3 transition-colors ${activeTab === 'posts' ? 'text-white border-t-2 border-white' : 'text-gray-500'}`}
            >
              <Grid className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 flex justify-center items-center py-3 transition-colors ${activeTab === 'feed' ? 'text-white border-t-2 border-white' : 'text-gray-500'}`}
            >
              <LayoutList className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 flex justify-center items-center py-3 transition-colors ${activeTab === 'badges' ? 'text-white border-t-2 border-white' : 'text-gray-500'}`}
            >
              <Award className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Content */}
          <div className="w-full">
            {activeTab === 'posts' && (
              posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5">
                  {posts.map(post => (
                    <div key={post.id} className="aspect-square bg-gray-800 group cursor-pointer" onClick={() => setSelectedPost(post)}>
                      <img
                        src={post.rolls.photos[0]?.thumbnail_url}
                        alt="Post thumbnail"
                        className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  <Grid className="w-12 h-12 mx-auto mb-2" />
                  <p>No posts yet.</p>
                </div>
              )
            )}
            {activeTab === 'feed' && (
              <div className="space-y-8 p-4">
                {posts.length > 0 ? (
                  posts.map(post => <PostView key={post.id} post={post} />)
                ) : (
                  <div className="text-center text-gray-500 py-10">
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
                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-2 border-2 border-amber-400/30 group-hover:bg-amber-400/10 transition-colors">
                          <BadgeIcon name={ub.badges.icon_name} className="w-10 h-10 text-amber-400" />
                        </div>
                        <p className="text-xs font-semibold text-white truncate w-full">{ub.badges.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
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