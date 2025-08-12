import React, { useState, useMemo } from 'react';
import { Plus, User } from 'lucide-react';
import { useAppContext, Post } from '../context/AppContext';
import CreatePostModal from './CreatePostModal';
import RollPostCard from './RollPostCard';
import { isRollDeveloped } from '../utils/rollUtils';
import FullStoryViewer from './FullStoryViewer';
import GlassCard from './ui/GlassCard';
import PrimaryButton from './ui/PrimaryButton';
import MotionWrapper from './ui/MotionWrapper';

const Pill: React.FC<{ children: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${active ? 'bg-gradient-to-br from-[var(--brand-brown-1)] to-[var(--brand-brown-2)] text-white shadow-lg' : 'bg-white/4 text-gray-200 hover:bg-white/6'}`}
  >
    {children}
  </button>
);

const StoryAvatar: React.FC<{ user: any; onClick: () => void }> = ({ user, onClick }) => {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2">
      <div className="story-ring rounded-full p-[3px]">
        <div className="rounded-full bg-[rgba(0,0,0,0.35)] w-16 h-16 overflow-hidden flex items-center justify-center">
          <img src={user.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} alt={user.username} className="w-14 h-14 rounded-full object-cover" />
        </div>
      </div>
      <span className="text-xs text-gray-200 max-w-[68px] truncate">{user.username}</span>
    </button>
  );
};

const CommunityView: React.FC = () => {
  const { profile, feed, completedRolls, recentStories, setCurrentView } = useAppContext();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('discover');

  const [showFullStoryViewer, setShowFullStoryViewer] = useState(false);
  const [postsForFullStoryViewer, setPostsForFullStoryViewer] = useState<Post[] | null>(null);
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

  const storyUsers = useMemo(() => Array.from(recentStories.values()).map(s => s.user), [recentStories]);

  const handleSelectStory = (userId: string, postId: string) => {
    let postsToShow: Post[] = [];
    let initialIdx = 0;

    const userStories = recentStories.get(userId);
    if (userStories) {
      postsToShow = userStories.posts;
      initialIdx = postsToShow.findIndex(p => p.id === postId);
    } 
    
    if (initialIdx === -1 || postsToShow.length === 0) {
      postsToShow = feed.filter(p => p.user_id === userId)
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      initialIdx = postsToShow.findIndex(p => p.id === postId);
    }

    if (initialIdx !== -1 && postsToShow.length > 0) {
      setPostsForFullStoryViewer(postsToShow);
      setInitialStoryPostIndex(initialIdx);
      setShowFullStoryViewer(true);
    } else {
      console.warn("Could not find post in any sequence for story viewer:", postId);
    }
  };

  return (
    <div className="w-full text-gray-100 min-h-full space-y-6">
      {/* Warm hero */}
      <div className="relative">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--brand-brown-grad)', padding: '20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">Your Space to Share</h1>
              <p className="text-sm text-white/80 mt-2 max-w-lg">Crafted for film lovers — share rolls, stories and moments with a soft, tactile interface.</p>
            </div>
            <div>
              <PrimaryButton onClick={() => setShowCreatePostModal(true)}>Create</PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stories + Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Community</h2>
        <div className="flex items-center gap-3">
          <Pill active={activeFilter === 'discover'} onClick={() => setActiveFilter('discover')}>Discover</Pill>
          <Pill active={activeFilter === 'following'} onClick={() => setActiveFilter('following')}>Following</Pill>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
        <div className="flex gap-4">
          {/* You + story avatars */}
          <div className="flex items-center gap-4">
            <StoryAvatar user={profile} onClick={() => handleSelectStory(profile.id, feed.find(p => p.user_id === profile.id)?.id || '')} />
            {storyUsers.map(u => <StoryAvatar key={u.id} user={u} onClick={() => handleSelectStory(u.id, recentStories.get(u.id)?.posts?.[0]?.id || '')} />)}
          </div>
        </div>
      </div>

      {/* Discover Feed (glass cards) */}
      <div className="space-y-4">
        {filteredFeed.length > 0 ? (
          filteredFeed.map(post => (
            <MotionWrapper key={post.id} className="w-full">
              <GlassCard className="p-0 overflow-hidden">
                <div className="relative">
                  <img src={post.rolls.photos[0]?.thumbnail_url} alt="cover" className="w-full h-56 object-cover rounded-t-lg" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={post.profiles.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${post.profiles.username}`} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                      <div>
                        <div className="font-semibold text-white">{post.profiles.username}</div>
                        <div className="text-xs text-gray-300">{post.rolls.film_type} • {post.likes.length} likes</div>
                      </div>
                    </div>
                    <div>
                      <PrimaryButton onClick={() => console.log('follow')} className="px-3 py-2">Follow</PrimaryButton>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-200 line-clamp-2">{post.caption}</p>
                </div>
              </GlassCard>
            </MotionWrapper>
          ))
        ) : (
          <div className="text-center py-16">
            <User className="w-14 h-14 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No community posts yet. Create something beautiful!</p>
          </div>
        )}
      </div>

      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          unpostedRolls={unpostedDevelopedRolls}
        />
      )}

      {showFullStoryViewer && postsForFullStoryViewer && (
        <FullStoryViewer
          posts={postsForFullStoryViewer}
          initialPostIndex={initialStoryPostIndex}
          onClose={() => {
            setShowFullStoryViewer(false);
            setPostsForFullStoryViewer(null);
          }}
        />
      )}
    </div>
  );
};

export default CommunityView;