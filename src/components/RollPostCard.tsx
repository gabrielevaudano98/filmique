import React from 'react';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { Post } from '../context/AppContext';
import { useAppContext } from '../context/AppContext';
import AvatarRing from './AvatarRing';
import Image from './Image';

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
    <div
      onClick={onClick}
      className="relative aspect-[9/16] w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg group bg-neutral-900 text-left cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <Image src={coverPhotoUrl ? `${coverPhotoUrl}${cacheBuster}` : undefined} alt={post.rolls.title || 'Roll cover'} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end h-full">
        <div className="flex items-center space-x-3">
          <AvatarRing src={post.profiles.avatar_url} size={40} />
          <div>
            <h3 className="font-bold text-base leading-tight text-white">{post.rolls.title}</h3>
            <p className="text-sm text-gray-300">{post.profiles.username}</p>
          </div>
        </div>
        <p className="text-sm text-gray-200 mt-3 line-clamp-2">{post.caption}</p>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200 dark:border-white/10">
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
            <Bookmark className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RollPostCard;