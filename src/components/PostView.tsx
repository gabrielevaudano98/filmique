import React, { useState } from 'react';
import { Heart, MessageCircle, Clock, Camera, UserPlus, Check, Send, Shield, Trash2 } from 'lucide-react';
import { useAppContext, Post } from '../context/AppContext';

interface PostViewProps {
  post: Post;
}

const PostView: React.FC<PostViewProps> = ({ post }) => {
  const { profile, handleLike, handleFollow, addComment, deleteComment } = useAppContext();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!profile) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    await addComment(post.id, post.user_id, commentText.trim());
    setCommentText('');
    setIsSubmittingComment(false);
  };

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
            <p className="text-gray-400 text-sm flex items-center mt-0.5">
              <Clock className="w-4 h-4 mr-1 text-gray-500" />
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
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
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-0.5 bg-gray-700">
          {post.rolls.photos.slice(0, 16).map((photo: any) => (
            <div key={photo.id} className="aspect-square bg-gray-700 overflow-hidden">
              <img src={`${photo.thumbnail_url}${cacheBuster}`} alt="Post photo" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="p-4">
        <p className="text-gray-300 leading-relaxed">{post.caption}</p>
        <div className="flex items-center justify-end text-gray-400 text-sm mt-2">
          <Camera className="w-4 h-4 mr-1.5" />
          <span className="font-medium">Shot on {post.rolls.film_type}</span>
        </div>

        <div className="flex items-center space-x-6 py-3">
          <button onClick={() => handleLike(post.id, post.user_id, post.isLiked)} className={`flex items-center space-x-2 transition-colors min-h-[44px] px-2 py-1 rounded-lg ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
            <span className="font-semibold">{post.likes.length}</span>
          </button>
          <div className="flex items-center space-x-2 text-gray-400">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{post.comments?.length || 0}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-700/50 pt-4 space-y-3">
          {post.comments.map(comment => (
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
          ))}
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 pt-2">
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