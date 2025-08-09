import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Clock, Camera, UserPlus, Check, Send, Shield, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext, Post } from '../context/AppContext';

interface PostViewProps {
  post: Post;
}

const PostView: React.FC<PostViewProps> = ({ post }) => {
  const { profile, handleLike, handleFollow, addComment, deleteComment } = useAppContext();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const photoContainerRef = useRef<HTMLDivElement>(null);

  if (!profile) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    await addComment(post.id, post.user_id, commentText.trim());
    setCommentText('');
    setIsSubmittingComment(false);
  };

  const handleScroll = () => {
    if (photoContainerRef.current) {
      const scrollLeft = photoContainerRef.current.scrollLeft;
      const photoWidth = photoContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / photoWidth);
      setActivePhotoIndex(newIndex);
    }
  };

  const scrollToPhoto = (index: number) => {
    if (photoContainerRef.current) {
      const photoWidth = photoContainerRef.current.offsetWidth;
      photoContainerRef.current.scrollTo({
        left: photoWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const handlePrev = () => scrollToPhoto(Math.max(0, activePhotoIndex - 1));
  const handleNext = () => scrollToPhoto(Math.min(post.rolls.photos.length - 1, activePhotoIndex + 1));

  const cacheBuster = post.rolls.developed_at ? `?t=${new Date(post.rolls.developed_at).getTime()}` : '';

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={post.profiles.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${post.profiles.username}`} alt="avatar" className="w-12 h-12 rounded-full bg-gray-700" />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg font-recoleta">{post.profiles.username}</h3>
              <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold">
                <Shield className="w-3 h-3" />
                <span>Lvl {post.profiles.level}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-400 text-xs mt-1">
              <span className="flex items-center">
                <Camera className="w-3 h-3 mr-1" />
                {post.rolls.film_type}
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        {post.user_id !== profile.id && (
          <button
            onClick={() => handleFollow(post.user_id, post.isFollowed)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center space-x-2 ${
              post.isFollowed
                ? 'bg-gray-700 text-white'
                : 'bg-amber-500 text-gray-900 hover:bg-amber-600'
            }`}
          >
            {post.isFollowed ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{post.isFollowed ? 'Following' : 'Follow'}</span>
          </button>
        )}
      </div>

      {post.rolls.photos && post.rolls.photos.length > 0 && (
        <div className="relative group">
          <div
            ref={photoContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar aspect-square bg-gray-900"
          >
            {post.rolls.photos.map((photo: any) => (
              <div key={photo.id} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
                <img src={`${photo.url}${cacheBuster}`} alt="Post photo" className="w-auto h-auto max-w-full max-h-full object-contain" />
              </div>
            ))}
          </div>
          {post.rolls.photos.length > 1 && (
            <>
              {activePhotoIndex > 0 && (
                <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {activePhotoIndex < post.rolls.photos.length - 1 && (
                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                {post.rolls.photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activePhotoIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="p-4">
        <p className="text-gray-300 leading-relaxed mb-3">{post.caption}</p>

        <div className="flex items-center space-x-6 py-2">
          <button onClick={() => handleLike(post.id, post.user_id, post.isLiked)} className={`flex items-center space-x-2 transition-colors min-h-[44px] px-2 py-1 rounded-lg ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
            <span className="font-semibold">{post.likes.length}</span>
          </button>
          <div className="flex items-center space-x-2 text-gray-400">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{post.comments?.length || 0}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-700/50 pt-4">
          <div className="max-h-48 overflow-y-auto space-y-3 pr-2 no-scrollbar">
            {post.comments.length > 0 ? (
              post.comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-3 group">
                  <img src={comment.profiles.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${comment.profiles.username}`} alt="avatar" className="w-8 h-8 rounded-full bg-gray-700 mt-1" />
                  <div className="bg-gray-700/50 rounded-lg px-3 py-2 flex-1">
                    <p className="font-semibold text-sm text-white">{comment.profiles.username}</p>
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                  {comment.user_id === profile.id && (
                    <button 
                      onClick={() => deleteComment(comment.id)}
                      className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No comments yet.</p>
            )}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 pt-4 mt-2 border-t border-gray-700/50">
            <img src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`} alt="Your avatar" className="w-8 h-8 rounded-full bg-gray-700" />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-full px-4 py-2 text-white focus:ring-amber-500 focus:border-amber-500 h-10"
            />
            <button type="submit" disabled={isSubmittingComment || !commentText.trim()} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-amber-500 rounded-full text-gray-900 disabled:bg-gray-600">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostView;