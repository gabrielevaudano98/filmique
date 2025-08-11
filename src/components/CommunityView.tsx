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
        : 'bg-brand-surface text-gray-300 hover:bg-brand-surface/50 border border-brand-border'
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
    <div className="relative w-full text-gray-100 min-h-full -mx-4 -my-4 overflow-hidden">
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 70% at 50% -30%, #e98a43 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 10% 100%, #b5aaac 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 95% 90%, #d46a2e 0%, transparent 60%)
          `,
          backgroundColor: '#41354c',
          filter: 'blur(80px)',
          opacity: 0.5,
        }}
      />
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 pb-6">
          {/* This space is intentionally left for the sticky TopBar */}
        </div>

        {/* Stories Row */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
            <div className="flex flex-col items-center space-y-2 flex-shrink-0">
              <div className="relative">
                <img src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`} alt="Your story" className="w-16 h-16 rounded-full object-cover border-2 border-brand-border" />
                <button onClick={() => setShowCreatePostModal(true)} className="absolute -bottom-1 -right-1 bg-brand-orange rounded-full p-1 border-2 border-brand-bg">
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-400">Your Story</p>
            </div>
            {followedUsers.slice(0, 10).map(user => (
              <div key={user.username} className="flex flex-col items-center space-y-2 flex-shrink-0">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-brand-orange via-brand-orange-end to-purple-500">
                  <img src={user.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} alt={user.username} className="w-16 h-16 rounded-full object-cover border-2 border-brand-bg" />
                </div>
                <p className="text-xs text-gray-100 truncate w-16 text-center">{user.username}</p>
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
            <h2 className="text-xl font-bold">Discover Feed</h2>
            <button className="text-sm font-semibold text-gray-400 hover:text-gray-100">See All</button>
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