import React, { useState, useRef, useEffect } from 'react';
import { Settings, Edit, Loader, CheckCircle, Image as ImageIcon, Award, LayoutGrid } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import AvatarRing from './AvatarRing';
import AlbumCard from './AlbumCard';
import BadgeIcon from './BadgeIcon';
import XPBar from './XPBar';
import SnapshotCard from './SnapshotCard';
import PostDetailModal from './PostDetailModal';
import { Post } from '../types';

const HighlightStat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

const TabButton: React.FC<{ icon: React.ElementType; isActive: boolean; onClick: () => void; }> = ({ icon: Icon, isActive, onClick }) => (
  <button onClick={onClick} className={`flex-1 py-3 flex justify-center items-center border-b-2 transition-colors ${isActive ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-white'}`}>
    <Icon className="w-6 h-6" />
  </button>
);

const ProfileView: React.FC = () => {
  const { 
    profile, 
    albums,
    userBadges,
    followersCount, 
    followingCount, 
    updateProfileDetails, 
    setCurrentView, 
    refreshProfile, 
    fetchProfilePageData,
    setSelectedAlbum,
    refetchAlbums,
    userPosts
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('albums');
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const debouncedBio = useDebounce(bioText, 1000);
  const isBioChanged = React.useMemo(() => bioText !== (profile?.bio || ''), [bioText, profile?.bio]);
  const [postToView, setPostToView] = useState<Post | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfilePageData();
    refetchAlbums();
  }, [fetchProfilePageData, refetchAlbums]);

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

  const photoCount = albums.reduce((sum, album) => sum + (album.photoCount || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-transparent text-white">
      {/* Header Section */}
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
            <HighlightStat value={userPosts.length} label="Posts" />
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
        <div className="mt-4">
          <XPBar xp={profile.xp} level={profile.level} />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-8 sticky top-0 bg-warm-900 z-10">
        <div className="flex border-b border-neutral-700">
          <TabButton icon={LayoutGrid} isActive={activeTab === 'albums'} onClick={() => setActiveTab('albums')} />
          <TabButton icon={ImageIcon} isActive={activeTab === 'snapshots'} onClick={() => setActiveTab('snapshots')} />
          <TabButton icon={Award} isActive={activeTab === 'badges'} onClick={() => setActiveTab('badges')} />
        </div>
      </div>
      
      <div className="mt-4 p-2">
        {activeTab === 'albums' && (
          albums.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {albums.map(album => (
                <AlbumCard 
                  key={album.id} 
                  album={album} 
                  onClick={() => {
                    setSelectedAlbum(album);
                    setCurrentView('albumDetail');
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <ImageIcon className="w-12 h-12 mx-auto mb-4" />
              <p>No albums created yet.</p>
            </div>
          )
        )}

        {activeTab === 'snapshots' && (
          userPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {userPosts.map(post => (
                <SnapshotCard key={post.id} post={post} onClick={() => setPostToView(post)} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <ImageIcon className="w-12 h-12 mx-auto mb-4" />
              <p>No snapshots to show yet.</p>
            </div>
          )
        )}

        {activeTab === 'badges' && (
          userBadges.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {userBadges.map(userBadge => (
                <div key={userBadge.badges.name} className="flex flex-col items-center text-center p-2">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center border-2 border-neutral-700">
                    <BadgeIcon name={userBadge.badges.icon_name} className="w-8 h-8 text-amber-400" />
                  </div>
                  <p className="text-sm font-bold mt-2">{userBadge.badges.name}</p>
                  <p className="text-xs text-gray-400">{userBadge.badges.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <Award className="w-12 h-12 mx-auto mb-4" />
              <p>No badges earned yet.</p>
            </div>
          )
        )}
      </div>

      {postToView && (
        <PostDetailModal post={postToView} onClose={() => setPostToView(null)} />
      )}
    </div>
  );
};

export default ProfileView;