import React, { useEffect, useState, useMemo } from 'react';
import { Settings, Image as ImageIcon, Award, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import XPBar from './XPBar';
import { Post } from '../context/AppContext';
import BadgeIcon from './BadgeIcon';
import CreatePostModal from './CreatePostModal';
import { isRollDeveloped } from '../utils/rollUtils';

const HighlightStat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
  </div>
);

const ProfileView: React.FC = () => {
  const { profile, setCurrentView, fetchUserPosts, followersCount, followingCount, userBadges, completedRolls, feed } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchUserPosts(profile.id).then(userPosts => {
        if (userPosts) {
          setPosts(userPosts);
        }
      });
    }
  }, [profile, fetchUserPosts]);

  const postedRollIds = useMemo(() => new Set(feed.map(p => p.roll_id)), [feed]);
  
  const unpostedDevelopedRolls = useMemo(() => {
    return completedRolls.filter(roll => 
      isRollDeveloped(roll) && !postedRollIds.has(roll.id)
    );
  }, [completedRolls, postedRollIds]);

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
      <div className="flex-1 flex flex-col bg-gray-900 text-white">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`}
              className="w-20 h-20 rounded-full object-cover bg-gray-700 border-2 border-gray-600"
              alt="User avatar"
            />
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{profile.credits}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Credits</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">{profile.streak}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Streak</p>
              </div>
            </div>
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

          <div className="flex items-center space-x-3 mb-6">
            <button onClick={() => setShowCreatePostModal(true)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Post</span>
            </button>
            <button onClick={() => setCurrentView('settings')} className="flex-shrink-0 w-12 h-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700/50">
            <XPBar xp={profile.xp} level={profile.level} />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 font-recoleta">Badges</h3>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700/50">
              {userBadges.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                  {userBadges.map(ub => (
                    <div key={ub.badges.name} className="flex flex-col items-center text-center group cursor-pointer" title={`${ub.badges.name}: ${ub.badges.description}`}>
                      <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center mb-2 border-2 border-amber-400/50 group-hover:bg-amber-400/10 transition-colors">
                        <BadgeIcon name={ub.badges.icon_name} className="w-7 h-7 text-amber-400" />
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
    </>
  );
};

export default ProfileView;