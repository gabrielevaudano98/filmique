import React, { useState, useMemo } from 'react';
import { Plus, User } from 'lucide-react';
import { useAppContext, Post } from '../context/AppContext';
import CreatePostModal from './CreatePostModal';
import RollPostCard from './RollPostCard';
import { isRollDeveloped } from '../utils/rollUtils';
import StoryRollsCarousel from './StoryRollsCarousel';
import FullStoryViewer from './FullStoryViewer';

const FilterPill: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex-shrink-0 whitespace-nowrap
      ${isActive
        ? 'bg-gradient-to-r from-brand-orange-start to-brand-orange-end text-white shadow-lg shadow-brand-orange/20'
        : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
      }`}
  >
    {label}
  </button>
);

const CommunityView: React.FC = () => {
  const { profile, feed, completedRolls, recentStories, setCurrentView } = useAppContext();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('discover');

  const [showFullStoryViewer, setShowFullStoryViewer] = useState(false);
  const [initialStoryUserId, setInitialStoryUserId] = useState<string | null>(null);
  const [initialStoryPostIndex, setInitialStoryPostIndex] = useState(0);

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

  const handleSelectStory = (userId: string, initialPostIndex: number) => {
    setInitialStoryUserId(userId);
    setInitialStoryPostIndex(initialPostIndex);
    setShowFullStoryViewer(true);
  };

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

      {/* Recent Stories Carousel */}
      {recentStories.size > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Recent Stories</h2>
          <StoryRollsCarousel recentStories={recentStories} onSelectStory={handleSelectStory} />
        </div>
      )}

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
        </div>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
          {filteredFeed.length > 0 ? (
            filteredFeed.map(post => (
              <RollPostCard key={post.id} post={post} onClick={() => handleSelectStory(post.user_id, filteredFeed.indexOf(post))} />
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

      {showFullStoryViewer && initialStoryUserId && (
        <FullStoryViewer
          allUserStories={recentStories}
          initialUserId={initialStoryUserId}
          initialPostIndex={initialStoryPostIndex}
          onClose={() => setShowFullStoryViewer(false)}
        />
      )}
    </div>
  );
};

export default CommunityView;