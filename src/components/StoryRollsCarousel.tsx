import React from 'react';
import { UserProfile, Post } from '../context/AppContext';

interface StoryRollsCarouselProps {
  recentStories: Map<string, { user: UserProfile, posts: Post[] }>;
  onSelectStory: (userId: string, postId: string) => void; // Changed to postId
}

const StoryRollsCarousel: React.FC<StoryRollsCarouselProps> = ({ recentStories, onSelectStory }) => {
  const storyUsers = Array.from(recentStories.values());

  if (storyUsers.length === 0) {
    return null; // Don't render if no stories
  }

  return (
    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
      {storyUsers.map(({ user, posts }) => (
        <button
          key={user.id}
          onClick={() => onSelectStory(user.id, posts[0].id)} // Pass posts[0].id
          className="flex flex-col items-center flex-shrink-0 group"
        >
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-red-500 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105">
            <img
              src={user.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`}
              alt={user.username}
              className="w-full h-full rounded-full object-cover border-2 border-gray-900"
            />
          </div>
          <p className="text-xs text-gray-300 mt-1.5 font-medium truncate max-w-[70px]">{user.username}</p>
        </button>
      ))}
    </div>
  );
};

export default StoryRollsCarousel;