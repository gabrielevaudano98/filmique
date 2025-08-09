import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Clock, Camera, UserPlus, Check, Send, Shield, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext, Post } from '../context/AppContext';
import { formatDistanceToNow } from '../utils/time';

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
  
  const latestComment = post.comments && post.comments.length > 0 ? post.comments[post.comments.length - 1] : null;

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-800/80 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={post.profiles.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${post.profiles.username}`} alt="avatar" className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600" />
          <div>
            <h3 className="font-bold text-white">{post.profiles.username}</h3>
            <p className="text-gray-400 text-xs">{post.rolls.film_type}</p>
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

      {/* Photo Carousel */}
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
                <button onClick={handlePrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/70">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {activePhotoIndex < post.rolls.photos.length - 1 && (
                <button onClick={handleNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/70">
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
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

      {/* Content Area: Actions, Caption, Comments */}
      <div className="p-4 flex flex-col space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button onClick={() => handleLike(post.id, post.user_id, post.isLiked)} className={`flex items-center space-x-2 transition-colors rounded-lg ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
            <Heart className={`w-6 h-6 transition-transform duration-200 ${post.isLiked ? 'fill-current scale-110' : ''}`} />
          </button>
          <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Likes Count */}
        {post.likes.length > 0 && (
          <p className="font-bold text-sm text-white">{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</p>
        )}

        {/* Caption */}
        <p className="text-gray-200 text-sm leading-relaxed">
          <span className="font-bold text-white mr-2">{post.profiles.username}</span>
          {post.caption}
        </p>

        {/* View all comments button */}
        {post.comments.length > 1 && (
          <button className="text-gray-500 text-sm text-left hover:text-gray-400">
            View all {post.comments.length} comments
          </button>
        )}

        {/* Latest Comment */}
        {latestComment && (
          <div className="flex items-start space-x-3 group">
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white mr-2">{latestComment.profiles.username}</span>
              {latestComment.content}
            </p>
            {latestComment.user_id === profile.id && (
              <button 
                onClick={() => deleteComment(latestComment.id)}
                className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete comment"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 pt-2 border-t border-gray-700/50">
          <img src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`} alt="Your avatar" className="w-8 h-8 rounded-full bg-gray-700" />
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
        
        {/* Post Date */}
        <p className="text-gray-500 text-xs uppercase tracking-wider pt-1">
          {formatDistanceToNow(post.created_at)}
        </p>
      </div>
    </div>
  );
};

export default PostView;