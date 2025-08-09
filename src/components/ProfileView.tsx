import React, { useEffect, useState } from 'react';
import { Settings, Image as ImageIcon, BookOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import XPBar from './XPBar';
import { Post } from '../context/AppContext';

const HighlightStat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
  </div>
);

const ProfileView: React.FC = () => {
  const { profile, setCurrentView, fetchUserPosts, followersCount, followingCount } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (profile) {
      fetchUserPosts(profile.id).then(userPosts => {
        if (userPosts) {
          setPosts(userPosts);
        }
      });
    }
  }, [profile, fetchUserPosts]);

  if (!profile) {
    return <div className="text-white p-6">Loading profile...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-6">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`}
            className="w-20 h-20 rounded-full object-cover bg-gray-700 border-2 border-gray-600"
            alt="User avatar"
          />
          <button onClick={() => setCurrentView('settings')} className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          <p className="text-sm text-gray-400 mb-4">{profile.first_name} {profile.last_name}</p>
        </div>

        <div className="flex items-center justify-around my-6">
          <HighlightStat value={posts.length} label="Posts" />
          <HighlightStat value={followersCount} label="Followers" />
          <HighlightStat value={followingCount} label="Following" />
        </div>

        <div className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700/50">
          <XPBar xp={profile.xp} level={profile.level} />
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {posts.map(post => (
              <div key={post.id} className="aspect-square bg-gray-800">
                <img src={post.rolls.photos[0]?.thumbnail_url} alt="Post thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No posts yet</h3>
            <p>Share your first roll to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;