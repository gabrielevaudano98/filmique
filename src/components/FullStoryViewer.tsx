import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { UserProfile, Post } from '../context/AppContext';
import StoryViewerModal from './StoryViewerModal'; // Reusing the existing modal for individual story display

interface FullStoryViewerProps {
  allUserStories: Map<string, { user: UserProfile, posts: Post[] }>;
  initialUserId: string;
  initialPostIndex: number;
  onClose: () => void;
}

const FullStoryViewer: React.FC<FullStoryViewerProps> = ({
  allUserStories,
  initialUserId,
  initialPostIndex,
  onClose,
}) => {
  const userIds = Array.from(allUserStories.keys());
  const initialUserIndex = userIds.indexOf(initialUserId);

  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentPostIndex, setCurrentPostIndex] = useState(initialPostIndex);

  const currentUserStoriesData = allUserStories.get(userIds[currentUserIndex]);
  const currentUserPosts = currentUserStoriesData?.posts || [];

  // Reset post index if user changes or if initialPostIndex is out of bounds
  useEffect(() => {
    if (currentPostIndex >= currentUserPosts.length) {
      setCurrentPostIndex(0);
    }
  }, [currentUserIndex, currentUserPosts.length]);

  const handleNextPost = useCallback(() => {
    if (currentPostIndex < currentUserPosts.length - 1) {
      setCurrentPostIndex(prev => prev + 1);
    } else {
      // Move to next user if no more posts for current user
      handleNextUser();
    }
  }, [currentPostIndex, currentUserPosts.length]);

  const handlePrevPost = useCallback(() => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(prev => prev - 1);
    } else {
      // Move to previous user if at the first post of current user
      handlePrevUser();
    }
  }, [currentPostIndex]);

  const handleNextUser = useCallback(() => {
    if (currentUserIndex < userIds.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentPostIndex(0); // Start from the first post of the new user
    } else {
      onClose(); // Close if no more users
    }
  }, [currentUserIndex, userIds.length, onClose]);

  const handlePrevUser = useCallback(() => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      const prevUserPosts = allUserStories.get(userIds[prev - 1])?.posts || [];
      setCurrentPostIndex(prevUserPosts.length - 1); // Go to the last post of the previous user
    } else {
      // Optionally, loop back to the last user or just stay
      // For now, we'll just stay at the first user's first post
    }
  }, [currentUserIndex, userIds, allUserStories]);

  const handlers = useSwipeable({
    onSwipedLeft: handleNextPost,
    onSwipedRight: handlePrevPost,
    onSwipedUp: handleNextUser,
    onSwipedDown: handlePrevUser,
    preventScrollOnSwipe: true, // Prevent page scroll when swiping
    trackMouse: true, // Enable mouse swiping for desktop
  });

  if (!currentUserStoriesData || currentUserPosts.length === 0) {
    return null; // Should not happen if data is properly passed
  }

  return (
    <div {...handlers} className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100] p-0 sm:p-4">
      <StoryViewerModal
        post={currentUserPosts[currentPostIndex]}
        onClose={onClose} // Close the entire viewer
      />
    </div>
  );
};

export default FullStoryViewer;