import React, { useState, useMemo, useRef } from 'react';
import { Award, Edit, Image as ImageIcon, Plus, Save, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import XPBar from './XPBar';
import BadgeIcon from './BadgeIcon';
import CreatePostModal from './CreatePostModal';
import { isRollDeveloped } from '../utils/rollUtils';
import PostView from './PostView';

const HighlightStat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
  </div>
);

const ProfileView: React.FC = () => {
  const { profile, feed, followersCount, followingCount, userBadges, completedRolls, updateProfileDetails } = useAppContext();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'badges'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profile?.bio || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const posts = useMemo(() => {
    if (!profile) return [];
    return feed.filter(post => post.user_id === profile.id);
  }, [feed, profile]);

  const postedRollIds = useMemo(() => new Set(feed.map(p => p.roll_id)), [feed]);
  
  const unpostedDevelopedRolls = useMemo(() => {
    return completedRolls.filter(roll => 
      isRollDeveloped(roll) && !postedRollIds.has(roll.id)
    );
  }, [completedRolls, postedRollIds]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await updateProfileDetails({ avatarFile: e.target.files[0] });
    }
  };

  const handleSaveBio = async () => {
    if (bioText.length > 255) return;
    await updateProfileDetails({ bio: bioText });
    setIsEditingBio(false);
  };

  if (!profile) {
    return <div className="text-white p-6">Loading profile...</div>;
  }

  return (
    <>
      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          unpostedRolls={unpostedDevelopedRolls}
        />
      )}
      <div className="relative flex-1 flex flex-col bg-gray-900 text-white">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-gray-800 to-gray-900 -z-10"></div>
        
        <div className="flex flex-col items-center pt-8 px-4">
          <div className="relative group">
            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            <button onClick={() => avatarInputRef.current?.click()} className="w-28 h-28 rounded-full bg-gray-700 border-4 border-gray-900 flex items-center justify-center cursor-pointer overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="User avatar" />
              ) : (
                <User className="w-16 h-16 text-gray-500" />
              )}
            </button>
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mt-4 font-recoleta">{profile.username}</h1>
          <p className="text-gray-400">{profile.first_name} {profile.last_name}</p>

          <div className="mt-4 w-full max-w-md text-center">
            {isEditingBio ? (
              <div className="flex flex-col items-center">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  maxLength={255}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-gray-300 focus:ring-amber-500 focus:border-amber-500"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">{bioText.length}/255</div>
                <button onClick={handleSaveBio} className="mt-2 bg-amber-500 text-gray-900 px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 group cursor-pointer" onClick={() => setIsEditingBio(true)}>
                <p className="text-gray-300 italic">{profile.bio || "No bio yet. Click to add one."}</p>
                <Edit className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          <div className="my-8 w-full max-w-md bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 flex justify-around items-center">
            <HighlightStat value={posts.length} label="Posts" />
            <HighlightStat value={followersCount} label="Followers" />
            <HighlightStat value={followingCount} label="Following" />
          </div>
          
          <div className="w-full max-w-md bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
            <XPBar xp={profile.xp} level={profile.level} />
          </div>
        </div>

        <div className="flex-grow mt-8 px-4">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
            {[{id: 'posts', label: 'Posts', icon: ImageIcon}, {id: 'badges', label: 'Badges', icon: Award}].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'posts' | 'badges')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === tab.id ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'posts' && (
            <div className="space-y-8">
              {posts.length > 0 ? (
                posts.map(post => <PostView key={post.id} post={post} />)
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No posts yet</h3>
                  <p>Share your first roll to see it here.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700/50">
              {userBadges.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {userBadges.map(ub => (
                    <div key={ub.badges.name} className="flex flex-col items-center text-center group cursor-pointer" title={`${ub.badges.name}: ${ub.badges.description}`}>
                      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-2 border-2 border-amber-400/50 group-hover:bg-amber-400/10 transition-colors">
                        <BadgeIcon name={ub.badges.icon_name} className="w-8 h-8 text-amber-400" />
                      </div>
                      <p className="text-xs font-semibold text-white truncate w-full">{ub.badges.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <p>No badges earned yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => setShowCreatePostModal(true)}
        className="fixed bottom-24 right-6 bg-amber-500 hover:bg-amber-600 text-gray-900 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition-transform transform hover:scale-110"
        aria-label="Create Post"
      >
        <Plus className="w-7 h-7" />
      </button>
    </>
  );
};

export default ProfileView;