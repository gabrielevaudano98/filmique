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
  const finalThumbnailUrl = thumbnailUrl ? `${thumbnailUrl}${cacheBuster}` : `https://placehold.co/400x400/e5e7eb/9ca3af?text=${roll.film_type}`;

  return (
    <div className="group relative aspect-[4/5] cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-1" onClick={onSelect}>
      <div className="w-full h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col border border-gray-200/80">
        <div className="w-full aspect-square bg-gray-100 overflow-hidden">
          <img
            src={finalThumbnailUrl}
            alt={roll.title || roll.film_type}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between bg-white">
          <div>
            <h4 className="font-semibold text-gray-900 truncate text-base leading-tight">{roll.title || roll.film_type}</h4>
            <p className="text-xs text-gray-500">{roll.film_type}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
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
        className="absolute top-2 right-2 bg-white/60 p-1.5 rounded-full backdrop-blur-sm text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/80 hover:scale-110"
        aria-label="Rename roll"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DevelopedRollCard;