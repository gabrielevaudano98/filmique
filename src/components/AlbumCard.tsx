import React from 'react';
import { Album } from '../types';
import { Image as ImageIcon, Film, Lock, Link2, Globe } from 'lucide-react';
import Image from './Image';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  const photoCount = album.rolls?.reduce((sum, roll) => sum + (roll.shots_used || 0), 0) || 0;
  const rollCount = album.rolls?.length || 0;

  const visibilityInfo = {
    private: { icon: Lock, label: 'Private', color: 'text-red-400' },
    unlisted: { icon: Link2, label: 'Unlisted', color: 'text-yellow-400' },
    public: { icon: Globe, label: 'Public', color: 'text-green-400' },
  };
  const info = visibilityInfo[album.type] || visibilityInfo.private;
  const Icon = info.icon;

  return (
    <button
      onClick={onClick}
      className="w-full aspect-[4/5] bg-neutral-800 rounded-xl overflow-hidden group relative text-left flex flex-col justify-end p-4 border border-neutral-700/50 hover:border-brand-amber-start/50 transition-all"
    >
      <div className="absolute inset-0 bg-neutral-700">
        <Image
          src={album.cover_image_url}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>
      
      <div className="absolute top-3 right-3 bg-gray-900/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center gap-1.5 ${info.color}">
        <Icon className="w-3 h-3" />
        <span className="font-bold">{info.label}</span>
      </div>

      <div className="relative z-10">
        <h3 className="font-bold text-lg text-white leading-tight">{album.title}</h3>
        <div className="flex items-center space-x-3 text-xs text-gray-300 mt-1">
          <span className="flex items-center gap-1"><Film className="w-3 h-3" /> {rollCount} Rolls</span>
          <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {photoCount} Photos</span>
        </div>
      </div>
    </button>
  );
};

export default AlbumCard;