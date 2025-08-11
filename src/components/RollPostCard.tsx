import React from 'react';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { Post } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';

interface RollPostCardProps {
  post: Post;
  onClick: () => void;
}

const RollPostCard: React.FC<RollPostCardProps> = ({ post, onClick }) => {
  const { profile, handleLike } = useAppContext();
  if (!profile) return null;

  const cacheBuster = post.rolls.developed_at ? `?t=${new Date(post.rolls.developed_at).getTime()}` : '';
  const coverPhotoUrl = post.cover_photo_url || post.rolls.photos?.[0]?.url;

  return (
    <button onClick={onClick} className="relative aspect-[9/16] w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg group bg-gray-900 text-left">
      {coverPhotoUrl && (
        <img src={`${coverPhotoUrl}${cacheBuster}`} alt={post.rolls.title || 'Roll cover'} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent"></div>

      {/* Top Info */}
      <div className="absolute top-0 left-0 right-0 p-4">
        <p className="text-xs font-semibold text-gray-200 uppercase tracking-wider">{post.rolls.film_type}</p>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex flex-col justify-end h-2/3">
        <div className="flex-grow"></div>
        <div className="flex items-end space-x-3">
          <img src={post.profiles.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${post.profiles.username}`} alt="avatar" className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-500" />
          <div>
            <h3 className="font-bold text-lg leading-tight">{post.rolls.title}</h3>
            <p className="text-sm text-gray-300">@{post.profiles.username}</p>
          </div>
        </div>
        <p className="text-sm text-gray-200 mt-2 line-clamp-2">{post.caption}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <button onClick={(e) => { e.stopPropagation(); handleLike(post.id, post.user_id, post.isLiked); }} className="flex items-center space-x-1.5 text-white">
              <Heart className={`w-5 h-5 transition-colors ${post.isLiked ? 'text-red-500 fill-current' : 'hover:text-red-400'}`} />
              <span className="text-sm font-medium">{post.likes.length}</span>
            </button>
            <button onClick={(e) => e.stopPropagation()} className="flex items-center space-x-1.5 text-white">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments.length}</span>
            </button>
          </div>
          <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </button>
  );
};

export default RollPostCard;