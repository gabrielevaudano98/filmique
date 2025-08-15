import React from 'react';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { Post } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';
import AvatarRing from './AvatarRing';
import LazyImage from './LazyImage';
import { getTransformedUrl } from '../utils/image';

interface RollPostCardProps {
  post: Post;
  onClick: () => void;
}

const RollPostCard: React.FC<RollPostCardProps> = ({ post, onClick }) => {
  const { profile, handleLike } = useAppContext();
  if (!profile) return null;

  const cacheBuster = post.rolls.developed_at ? `?t=${new Date(post.rolls.developed_at).getTime()}` : '';
  const coverPhotoUrl = post.cover_photo_url || post.rolls.photos?.[0]?.url;
  const transformedCoverUrl = coverPhotoUrl ? getTransformedUrl(coverPhotoUrl, { width: 512, quality: 80 }) : '';

  return (
    <button onClick={onClick} className="relative aspect-[9/16] w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg group bg-neutral-900 text-left">
      {coverPhotoUrl && (
        <LazyImage 
          src={`${transformedCoverUrl}${cacheBuster}`} 
          alt={post.rolls.title || 'Roll cover'} 
          containerClassName="absolute inset-0 w-full h-full"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex flex-col justify-end h-full">
        <div className="flex items-center space-x-3">
          <AvatarRing src={post.profiles.avatar_url} size={40} />
          <div>
            <h3 className="font-bold text-base leading-tight">{post.rolls.title}</h3>
            <p className="text-sm text-gray-300">{post.profiles.username}</p>
          </div>
        </div>
        <p className="text-sm text-gray-200 mt-3 line-clamp-2">{post.caption}</p>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
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

export default React.memo(RollPostCard);