import React from 'react';
import { FilmStock } from '../types';
import { Check, Info, Lock } from 'lucide-react';
import FilmCanisterIcon from './FilmCanisterIcon';

interface FilmStockCardProps {
  film: FilmStock;
  isSelected: boolean;
  onClick: () => void;
  onInfoClick: () => void;
}

const FilmStockCard: React.FC<FilmStockCardProps> = ({ film, isSelected, onClick, onInfoClick }) => {
  const isLocked = !film.unlocked;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full p-3 rounded-xl text-left transition-colors duration-200 flex items-center gap-4
        ${isSelected ? 'bg-brand-amber-start/10' : 'bg-transparent hover:bg-neutral-700/50'}
        ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <FilmCanisterIcon filmType={film.name} imageUrl={film.roll_image_url} className="h-16 w-auto flex-shrink-0" />
      
      <div className="flex-grow">
        <h4 className="font-bold text-base text-white">{film.name}</h4>
        <p className="text-sm text-gray-400">{film.capacity} exposures</p>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onInfoClick(); }}
          className="p-2 text-gray-500 hover:text-white rounded-full transition-colors"
          aria-label={`More info about ${film.name}`}
        >
          <Info className="w-5 h-5" />
        </button>
        <div className="text-right flex-shrink-0 w-14">
          <div className="font-bold text-white">{film.price}</div>
          <div className="text-xs text-gray-500">credits</div>
        </div>
        {isLocked ? (
          <Lock className="w-6 h-6 text-gray-500" />
        ) : isSelected ? (
          <div className="w-6 h-6 rounded-full bg-brand-amber-start flex items-center justify-center">
            <Check className="w-4 h-4 text-gray-900" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-gray-600"></div>
        )}
      </div>
    </button>
  );
};

export default FilmStockCard;