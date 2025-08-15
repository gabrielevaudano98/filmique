import React from 'react';
import { Album as Shelf } from '../types';
import { Image as ImageIcon, Film } from 'lucide-react';

interface ShelfCardProps {
  shelf: Shelf;
  onClick: () => void;
}

const ShelfCard: React.FC<ShelfCardProps> = ({ shelf, onClick }) => {
  const photoCount = shelf.rolls?.reduce((sum, roll) => sum + (roll.shots_used || 0), 0) || 0;
  const rollCount = shelf.rolls?.length || 0;

  return (
    <button
      onClick={onClick}
      className="w-full aspect-[4/5] bg-neutral-800 rounded-xl overflow-hidden group relative text-left flex flex-col justify-end p-4 border border-neutral-700/50 hover:border-brand-amber-start/50 transition-all"
    >
      <div className="absolute inset-0 bg-neutral-700">
        {shelf.cover_image_url && (
          <img
            src={shelf.cover_image_url}
            alt={shelf.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>
      <div className="relative z-10">
        <h3 className="font-bold text-lg text-white leading-tight">{shelf.title}</h3>
        <div className="flex items-center space-x-3 text-xs text-gray-300 mt-1">
          <span className="flex items-center gap-1"><Film className="w-3 h-3" /> {rollCount} Rolls</span>
          <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {photoCount} Photos</span>
        </div>
      </div>
    </button>
  );
};

export default ShelfCard;