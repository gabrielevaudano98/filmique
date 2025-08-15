import React, { useState, useRef, useEffect } from 'react';
import { Settings, Edit, Loader, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import AvatarRing from './AvatarRing';
import AlbumCard from './AlbumCard';

const HighlightStat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

const ProfileView: React.FC = () => {
  const { 
    profile, 
    albums,
    followersCount, 
    followingCount, 
    updateProfileDetails, 
    setCurrentView, 
    refreshProfile, 
    fetchProfilePageData,
    setSelectedAlbum,
    refetchAlbums
  } = useAppContext();
  
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const debouncedBio = useDebounce(bioText, 1000);
  const isBioChanged = React.useMemo(() => bioText !== (profile?.bio || ''), [bioText, profile?.bio]);

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

  const postCount = albums.reduce((sum, album) => sum + (album.photoCount || 0), 0);

  return (
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
            <HighlightStat value={postCount} label="Photos" />
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
        <h3 className="px-4 text-lg font-bold mb-4">My Albums</h3>
        {albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-4">
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
            <p>No albums created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;