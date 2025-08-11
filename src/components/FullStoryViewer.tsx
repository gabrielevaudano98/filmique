import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Post } from '../context/AppContext';
import StoryViewerModal from './StoryViewerModal';

interface FullStoryViewerProps {
  posts: Post[]; // Now directly takes the array of posts for the current user
  initialPostIndex: number;
  onClose: () => void;
}

const FullStoryViewer: React.FC<FullStoryViewerProps> = ({
  posts,
  initialPostIndex,
  onClose,
}) => {
  const [currentPostIndex, setCurrentPostIndex] = useState(initialPostIndex);

  // Ensure currentPostIndex is within bounds if initialPostIndex was somehow invalid
  useEffect(() => {
    if (currentPostIndex < 0 || currentPostIndex >= posts.length) {
      setCurrentPostIndex(0); // Default to first post if invalid
    }
  }, [currentPostIndex, posts.length]);


  const handleNextPost = useCallback(() => {
    if (currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(prev => prev + 1);
    } else {
      onClose(); // Close if no more posts for current user
    }
  }, [currentPostIndex, posts.length, onClose]);

  const handlePrevPost = useCallback(() => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(prev => prev - 1);
    }
  }, [currentPostIndex]);

  const handlers = useSwipeable({
    onSwipedLeft: handleNextPost,
    onSwipedRight: handlePrevPost,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div {...handlers} className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100] p-0 sm:p-4">
      <StoryViewerModal
        post={posts[currentPostIndex]}
        onClose={onClose} // Close the entire viewer
      />
    </div>
  );
};

export default FullStoryViewer;