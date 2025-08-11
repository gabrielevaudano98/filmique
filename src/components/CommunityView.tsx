import React, { useState, useMemo } from 'react';
import { Heart, Send, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';
import { isRollDeveloped } from '../utils/rollUtils';

const FilterPill: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors flex-shrink-0 ${
      isActive
        ? 'bg-gradient-to-r from-brand-orange-start to-brand-orange-end text-white'
        : 'bg-brand-brown-dark text-gray-300 hover:bg-brand-brown-light/50 border border-brand-border'
    }`}
  >
    {label}
  </button>
);

const CommunityView: React.FC = () => {
  const { profile, feed, completedRolls } = useAppContext();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('discover');

  const followedUsers = useMemo(() => {
    if (!feed) return [];
    const users = new Map();
    feed.forEach(post => {
      if (post.user_id !== profile?.id && !users.has(post.user_id)) {
        users.set(post.user_id, post.profiles);
      }
    });
    return Array.from(users.values());
  }, [feed, profile]);

  const postedRollIds = useMemo(() => new Set(feed.map(p => p.roll_id)), [feed]);
  
  const unpostedDevelopedRolls = useMemo(() => {
    return completedRolls.filter(roll => 
      isRollDeveloped(roll) && !postedRollIds.has(roll.id)
    );
  }, [completedRolls, postedRollIds]);

  if (!profile) return null;

  const filteredFeed = useMemo(() => {
    switch (activeFilter) {
      case 'following':
        return feed.filter(post => post.isFollowed);
      case 'new':
        return [...feed].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'trending':
        return [...feed].sort((a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length));
      case 'discover':
      default:
        return feed;
    }
  }, [feed, activeFilter]);

  return (
    <div className="w-full bg-brand-bg text-white min-h-full pb-10 -m-4 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-from)_0%,_transparent_70%)] from-brand-brown-light/50 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 pb-6">
          <h1 className="text-3xl font-bold font-recoleta text-white">Community</h1>
          <div className="flex items-center space-x-3">
            <button onClick={() => { /* Handle Likes/Favorites */ }} className="p-2 bg-brand-brown-dark rounded-full">
              <Heart className="w-5 h-5 text-gray-300" />
            </button>
            <button onClick={() => { /* Handle DMs */ }} className="p-2 bg-brand-brown-dark rounded-full">
              <Send className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Stories Row */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
            <div className="flex flex-col items-center space-y-2 flex-shrink-0">
              <div className="relative">
                <img src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`} alt="Your story" className="w-16 h-16 rounded-full object-cover border-2 border-gray-600" />
                <button onClick={() => setShowCreatePostModal(true)} className="absolute -bottom-1 -right-1 bg-brand-orange rounded-full p-1 border-2 border-brand-bg">
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-400">Your Story</p>
            </div>
            {followedUsers.slice(0, 10).map(user => (
              <div key={user.username} className="flex flex-col items-center space-y-2 flex-shrink-0">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                  <img src={user.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} alt={user.username} className="w-16 h-16 rounded-full object-cover border-2 border-brand-bg" />
                </div>
                <p className="text-xs text-white truncate w-16 text-center">{user.username}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mb-6">
          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
            <FilterPill label="Discover" isActive={activeFilter === 'discover'} onClick={() => setActiveFilter('discover')} />
            <FilterPill label="Following" isActive={activeFilter === 'following'} onClick={() => setActiveFilter('following')} />
            <FilterPill label="Trending" isActive={activeFilter === 'trending'} onClick={() => setActiveFilter('trending')} />
            <FilterPill label="New" isActive={activeFilter === 'new'} onClick={() => setActiveFilter('new')} />
          </div>
        </div>

        {/* Discover Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-recoleta">Discover Feed</h2>
            <button className="text-sm font-semibold text-gray-400 hover:text-white">See All</button>
          </div>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {filteredFeed.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>

      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          unpostedRolls={unpostedDevelopedRolls}
        />
      )}
    </div>
  );
};

export default CommunityView;