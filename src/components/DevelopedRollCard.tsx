import React from 'react';
import { Edit, Image as ImageIcon } from 'lucide-react';
import { Roll } from '../context/AppContext';

interface DevelopedRollCardProps {
  roll: Roll;
  onSelect: () => void;
  onRename: () => void;
}

const DevelopedRollCard: React.FC<DevelopedRollCardProps> = ({ roll, onSelect, onRename }) => {
  const developedDate = new Date(roll.developed_at || roll.completed_at!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const cacheBuster = roll.developed_at ? `?t=${new Date(roll.developed_at).getTime()}` : '';
  const thumbnailUrl = roll.photos?.[0]?.thumbnail_url;
  const finalThumbnailUrl = thumbnailUrl ? `${thumbnailUrl}${cacheBuster}` : `https://placehold.co/400x400/1f2937/9ca3af?text=${roll.film_type}`;

  return (
    <div className="group relative aspect-[4/5] cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-2" onClick={onSelect}>
      <div className="w-full h-full bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col border-2 border-gray-700/50">
        <div className="w-full aspect-square bg-gray-700 overflow-hidden">
          <img
            src={finalThumbnailUrl}
            alt={roll.title || roll.film_type}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between bg-gray-800">
          <div>
            <h4 className="font-bold text-white truncate font-recoleta text-base leading-tight">{roll.title || roll.film_type}</h4>
            <p className="text-xs text-gray-400">{roll.film_type}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span>{developedDate}</span>
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              {roll.shots_used}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        className="absolute top-3 right-3 bg-black/60 p-2 rounded-full backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80 hover:scale-110"
        aria-label="Rename roll"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DevelopedRollCard;