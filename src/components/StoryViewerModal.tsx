import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Heart, MessageCircle } from 'lucide-react';
import { Post } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';

const StoryViewerModal: React.FC<{ post: Post; onClose: () => void; }> = ({ post, onClose }) => {
  const { profile, handleLike } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 for cover
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const photos = post.rolls.photos || [];
  const totalItems = 1 + photos.length;

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev < totalItems - 2) {
        return prev + 1;
      }
      onClose(); // Close at the end
      return prev;
    });
  }, [totalItems, onClose]);

  const goToPrev = () => {
    setCurrentIndex(prev => Math.max(-1, prev - 1));
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) {
      progressRef.current.style.transition = 'none';
      progressRef.current.style.width = '0%';
    }

    if (!isPaused) {
      // Force a reflow to restart the CSS transition
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.transition = 'width 5s linear';
          progressRef.current.style.width = '100%';
        }
      }, 50);

      timerRef.current = setTimeout(goToNext, 5000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused, goToNext]);

  const handleInteractionStart = () => setIsPaused(true);
  const handleInteractionEnd = () => setIsPaused(false);

  const cacheBuster = post.rolls.developed_at ? `?t=${new Date(post.rolls.developed_at).getTime()}` : '';
  const coverPhotoUrl = post.cover_photo_url || photos[0]?.url;
  const isCover = currentIndex === -1;
  const currentPhoto = !isCover ? photos[currentIndex] : null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100] p-0 sm:p-4" onMouseDown={handleInteractionStart} onMouseUp={handleInteractionEnd} onTouchStart={handleInteractionStart} onTouchEnd={handleInteractionEnd}>
      <div className="relative aspect-[9/16] w-full max-w-md h-full bg-gray-900 sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-20">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalItems }).map((_, index) => (
              <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{ width: index < currentIndex + 1 ? '100%' : '0%' }}
                  ref={index === currentIndex + 1 ? progressRef : null}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-6 left-3 right-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={post.profiles.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${post.profiles.username}`} alt="avatar" className="w-8 h-8 rounded-full bg-gray-700" />
            <span className="text-white font-bold text-sm">{post.profiles.username}</span>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {isCover ? (
            coverPhotoUrl && (
              <>
                <img src={`${coverPhotoUrl}${cacheBuster}`} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <h2 className="text-3xl font-bold">{post.rolls.title}</h2>
                  <p className="mt-2 text-gray-200 line-clamp-3">{post.caption}</p>
                </div>
              </>
            )
          ) : (
            currentPhoto && <img src={`${currentPhoto.url}${cacheBuster}`} alt={`Photo ${currentIndex + 1}`} className="w-full h-full object-contain" />
          )}
        </div>

        {/* Navigation Overlays */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full" onClick={goToPrev}></div>
          <div className="w-1/3 h-full"></div>
          <div className="w-1/3 h-full" onClick={goToNext}></div>
        </div>

        {/* Footer Actions */}
        {profile && (
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => handleLike(post.id, post.user_id, post.isLiked)} className="flex items-center space-x-1.5 text-white">
                <Heart className={`w-6 h-6 transition-colors ${post.isLiked ? 'text-red-500 fill-current' : 'hover:text-red-400'}`} />
                <span className="text-sm font-medium">{post.likes.length}</span>
              </button>
              <button className="flex items-center space-x-1.5 text-white">
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm font-medium">{post.comments.length}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewerModal;