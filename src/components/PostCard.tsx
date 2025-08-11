import React from 'react';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { Post } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { profile, handleLike, handleFollow } = useAppContext();
  if (!profile) return null;

  const cacheBuster = post.rolls.developed_at ? `?t=${new Date(post.rolls.developed_at).getTime()}` : '';
  const photoUrl = post.rolls.photos?.[0]?.url;

  return (
    <div className="relative aspect-[9/16] w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg group">
      <img src={`${photoUrl}${cacheBuster}`} alt={post.caption || 'Post image'} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"></div>
      
      {/* User Info */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={post.profiles.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${post.profiles.username}`} alt="avatar" className="w-9 h-9 rounded-full bg-gray-700 border-2 border-gray-500" />
          <div>
            <p className="text-white font-bold text-sm">{post.profiles.username}</p>
            <p className="text-gray-300 text-xs">{post.likes.length} followers</p> {/* Placeholder for followers */}
          </div>
        </div>
        {post.user_id !== profile.id && (
          <button 
            onClick={() => handleFollow(post.user_id, post.isFollowed)}
            className={`text-xs font-bold py-1.5 px-4 rounded-full transition-colors ${
              post.isFollowed
                ? 'bg-brand-brown-dark text-white'
                : 'bg-brand-orange text-white hover:bg-brand-orange-end'
            }`}
          >
            {post.isFollowed ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <button onClick={() => handleLike(post.id, post.user_id, post.isLiked)} className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-sm py-1.5 px-3 rounded-full">
            <Heart className={`w-5 h-5 ${post.isLiked ? 'text-red-500 fill-current' : ''}`} />
            <span className="text-sm font-medium">{post.likes.length}</span>
          </button>
          <button className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-sm py-1.5 px-3 rounded-full">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments.length}</span>
          </button>
          <button className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-sm p-2 rounded-full">
            <Send className="w-5 h-5" />
          </button>
        </div>
        <button className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-sm p-2 rounded-full">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;