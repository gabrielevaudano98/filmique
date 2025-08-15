import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { Post } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';

const StoryViewerModal: React.FC<{ post: Post; onClose: () => void; }> = ({ post, onClose }) => {
  const { profile, handleLike, addComment, deleteComment } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 for cover
  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const photos = post.rolls.photos || [];
  const totalItems = 1 + photos.length;

  const goToNext = useCallback(() => {
    if (currentIndex < totalItems - 2) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose(); // Close at the end
    }
  }, [currentIndex, totalItems, onClose]);

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
  const handleInteractionEnd = () => {
    if (!showComments) { // Only resume if comments are not open
      setIsPaused(false);
    }
  };

  const handleCommentClick = () => {
    setShowComments(true);
    setIsPaused(true); // Pause story progression when comments are open
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setIsPaused(false); // Resume story progression when comments are closed
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    await addComment(post.id, post.user_id, commentText.trim());
    setCommentText('');
    setIsSubmittingComment(false);
  };

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

        {/* Content Area (Image/Cover) */}
        <div className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${showComments ? 'h-[60%]' : 'flex-1'}`}>
          {isCover ? (
            coverPhotoUrl && (
              <>
                <img src={`${coverPhotoUrl}${cacheBuster}`} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <h2 className="text-4xl font-bold leading-tight">{post.rolls.title}</h2>
                  <p className="mt-2 text-gray-200 line-clamp-3">{post.caption}</p>
                </div>
              </>
            )
          ) : (
            currentPhoto && <img src={`${currentPhoto.url}${cacheBuster}`} alt={`Photo ${currentIndex + 1}`} className="w-full h-full object-contain" />
          )}

          {/* Navigation Overlays */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full" onClick={goToPrev}></div>
            <div className="w-1/3 h-full"></div>
            <div className="w-1/3 h-full" onClick={goToNext}></div>
          </div>

          {/* Footer Actions (Heart, MessageCircle) */}
          {profile && (
            <div className="absolute bottom-6 right-4 z-20 flex flex-col items-center space-y-4">
              <button onClick={() => handleLike(post.id, post.user_id, post.isLiked)} className="p-2 rounded-full bg-black/30 flex flex-col items-center text-white space-y-1">
                <Heart className={`w-7 h-7 transition-colors ${post.isLiked ? 'text-red-500 fill-current' : 'hover:text-red-400'}`} />
                <span className="text-xs font-bold">{post.likes.length}</span>
              </button>
              <button onClick={handleCommentClick} className="p-2 rounded-full bg-black/30 flex flex-col items-center text-white space-y-1">
                <MessageCircle className="w-7 h-7" />
                <span className="text-xs font-bold">{post.comments.length}</span>
              </button>
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div className={`flex-shrink-0 bg-gray-800 rounded-t-2xl flex flex-col p-4 z-30 transition-all duration-300 ease-in-out overflow-hidden ${showComments ? 'flex-1' : 'h-0 opacity-0 pointer-events-none'}`}>
          {showComments && ( // Still conditionally render inner content for performance
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Comments ({post.comments.length})</h3>
                <button onClick={handleCloseComments} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-4">
                {post.comments.length > 0 ? (
                  post.comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3 group">
                      <img src={comment.profiles.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${comment.profiles.username}`} alt="avatar" className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0" />
                      <p className="text-sm text-gray-300 flex-grow">
                        <span className="font-bold text-white mr-2">{comment.profiles.username}</span>
                        {comment.content}
                      </p>
                      {comment.user_id === profile?.id && (
                        <button 
                          onClick={() => deleteComment(comment.id)}
                          className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No comments yet. Be the first!</p>
                )}
              </div>
              <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 pt-4 border-t border-gray-700/50 flex-shrink-0">
                <img src={profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile?.username}`} alt="Your avatar" className="w-8 h-8 rounded-full bg-gray-700" />
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                />
                {commentText.trim() && (
                  <button type="submit" disabled={isSubmittingComment} className="text-amber-400 font-bold text-sm disabled:text-gray-500 transition-colors">
                    {isSubmittingComment ? 'Posting...' : 'Post'}
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryViewerModal;