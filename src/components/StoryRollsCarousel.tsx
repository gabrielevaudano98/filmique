import React from 'react';
import { UserProfile, Post } from '../context/AppContext';
import AvatarRing from './AvatarRing';

interface StoryRollsCarouselProps {
  recentStories: Map<string, { user: UserProfile, posts: Post[] }>;
  onSelectStory: (userId: string, postId: string) => void;
}

const StoryRollsCarousel: React.FC<StoryRollsCarouselProps> = ({ recentStories, onSelectStory }) => {
  const storyUsers = Array.from(recentStories.values());

  if (storyUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
      {storyUsers.map(({ user, posts }) => (
        <div key={user.id} className="flex flex-col items-center flex-shrink-0 group">
          <AvatarRing
            src={user.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`}
            alt={user.username}
            size={64}
            onClick={() => onSelectStory(user.id, posts[0].id)}
          />
          <p className="text-xs text-gray-300 mt-2 font-medium truncate max-w-[70px]">{user.username}</p>
        </div>
      ))}
    </div>
  );
};

export default StoryRollsCarousel;