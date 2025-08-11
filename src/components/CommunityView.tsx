import React, { useState, useMemo } from 'react';
import { Plus, User } from 'lucide-react';
import { useAppContext, Post } from '../context/AppContext';
import CreatePostModal from './CreatePostModal';
import RollPostCard from './RollPostCard';
import { isRollDeveloped } from '../utils/rollUtils';
import StoryViewerModal from './StoryViewerModal';

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
  const { profile, feed, completedRolls, setCurrentView } = useAppContext();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [storyPost, setStoryPost] = useState<Post | null>(null);
  const [activeFilter, setActiveFilter] = useState('discover');

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
    <div className="w-full text-gray-100 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-6">
        <h1 className="text-3xl font-bold text-white">Community</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentView('profile')}
            className="bg-gray-800/60 backdrop-blur-lg border border-gray-700/50 rounded-full p-3 shadow-lg text-white hover:bg-gray-700 transition-colors"
            aria-label="View Profile"
          >
            <User className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowCreatePostModal(true)}
            className="bg-brand-orange text-white font-bold p-3 rounded-full shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-end transition-colors"
            aria-label="Create New Post"
          >
            <Plus className="w-6 h-6" />
          </button>
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
          {/* Removed the old "New Post" button here */}
        </div>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
          {filteredFeed.length > 0 ? (
            filteredFeed.map(post => (
              <RollPostCard key={post.id} post={post} onClick={() => setStoryPost(post)} />
            ))
          ) : (
            <div className="w-full text-center py-16 text-gray-500">
              <p>No posts to show yet.</p>
              <p>Follow some users or check back later!</p>
            </div>
          )}
        </div>
      </div>

      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          unpostedRolls={unpostedDevelopedRolls}
        />
      )}

      {storyPost && (
        <StoryViewerModal post={storyPost} onClose={() => setStoryPost(null)} />
      )}
    </div>
  );
};

export default CommunityView;