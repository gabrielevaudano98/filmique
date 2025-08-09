import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Award, Edit, Grid, Settings, User, CheckCircle, Loader } from 'lucide-react';
import { useAppContext, Post } from '../context/AppContext';
import BadgeIcon from './BadgeIcon';
import PostDetailModal from './PostDetailModal';
import { useDebounce } from '../hooks/useDebounce';

// Stat component, made leaner
const HighlightStat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

const ProfileView: React.FC = () => {
  const { profile, feed, followersCount, followingCount, userBadges, updateProfileDetails, setCurrentView } = useAppContext();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'badges'>('posts');
  
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const debouncedBio = useDebounce(bioText, 1000);
  const isBioChanged = useMemo(() => bioText !== (profile?.bio || ''), [bioText, profile?.bio]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);

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
    if (!isBioChanged || bioText.length > 150) return;
    setIsSavingBio(true);
    await updateProfileDetails({ bio: bioText });
    setIsSavingBio(false);
  };

  // Auto-save on debounce
  useEffect(() => {
    if (isEditingBio && isBioChanged && debouncedBio === bioText) {
      handleSaveBio();
    }
  }, [debouncedBio, isEditingBio, isBioChanged, bioText]);

  // Focus the textarea when editing starts
  useEffect(() => {
    if (isEditingBio) {
      bioInputRef.current?.focus();
      bioInputRef.current?.select();
    }
  }, [isEditingBio]);

  if (!profile) {
    return <div className="text-white p-6">Loading profile...</div>;
  }

  return (
    <>
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      
      <div className="flex-1 flex flex-col bg-gray-900 text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-xl font-bold font-recoleta">{profile.username}</h2>
          <button onClick={() => setCurrentView('settings')} className="p-2">
            <Settings className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Profile Info Section */}
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-shrink-0 group">
              <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              <button onClick={() => avatarInputRef.current?.click()} className="w-20 h-20 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center cursor-pointer overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt="User avatar" />
                ) : (
                  <User className="w-10 h-10 text-gray-500" />
                )}
              </button>
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Edit className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 flex justify-around ml-4">
              <HighlightStat value={posts.length} label="Posts" />
              <HighlightStat value={followersCount} label="Followers" />
              <HighlightStat value={followingCount} label="Following" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-white">{profile.first_name} {profile.last_name}</p>
            <div className="mt-1 text-gray-300 text-sm">
              {isEditingBio ? (
                <textarea
                  ref={bioInputRef}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  onBlur={() => {
                    handleSaveBio();
                    setIsEditingBio(false);
                  }}
                  maxLength={150}
                  className="w-full bg-transparent border-b border-gray-700 focus:border-amber-500 outline-none text-sm p-0 resize-none"
                  rows={2}
                />
              ) : (
                <p>{profile.bio || <span className="text-gray-500">No bio yet.</span>}</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <button 
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="flex-1 bg-gray-700/80 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              {isEditingBio ? 'Done' : 'Edit Profile'}
            </button>
            <div className="w-8 h-8 flex items-center justify-center">
              {isSavingBio && <Loader className="w-4 h-4 animate-spin" />}
              {!isSavingBio && !isBioChanged && isEditingBio && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
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
                <div className="text-center py-16 text-gray-500">
                  <Grid className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Posts Yet</h3>
                  <p>Your shared photos will appear here.</p>
                </div>
              )
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