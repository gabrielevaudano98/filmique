import React from 'react';
import { Post } from '../types';
import { Heart, MessageCircle } from 'lucide-react';
import Image from './Image';

interface SnapshotCardProps {
  post: Post;
  onClick: () => void;
}

const SnapshotCard: React.FC<SnapshotCardProps> = ({ post, onClick }) => {
  const cacheBuster = post.rolls.developed_at ? `?t=${new Date(post.rolls.developed_at).getTime()}` : '';
  const coverPhotoUrl = post.cover_photo_url || post.rolls.photos?.[0]?.url;

  return (
    <button
      onClick={onClick}
      className="w-full aspect-square bg-white/70 dark:bg-neutral-800/60 backdrop-blur-lg border border-white/30 dark:border-neutral-700/50 rounded-lg overflow-hidden group relative shadow-none"
    >
      <Image
        src={coverPhotoUrl ? `${coverPhotoUrl}${cacheBuster}` : undefined}
        alt={post.caption || 'Snapshot'}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex items-center space-x-4 text-white">
          <div className="flex items-center space-x-1">
            <Heart className="w-5 h-5" />
            <span>{post.likes.length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments.length}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default SnapshotCard;