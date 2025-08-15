import React from 'react';
import { FilmStock } from '../types';
import { Info, Lock, Zap } from 'lucide-react';
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
      className={`w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center gap-4 border-2
        ${isSelected 
          ? 'border-brand-amber-start bg-brand-amber-start/10 shadow-lg shadow-brand-amber-start/10' 
          : 'border-transparent'
        }
        ${isLocked 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:bg-neutral-700/50'
        }
      `}
    >
      <FilmCanisterIcon filmType={film.name} imageUrl={film.roll_image_url} className="h-16 w-auto flex-shrink-0" />
      
      <div className="flex-grow">
        <h4 className="font-medium text-base text-white">{film.name}</h4>
        <p className="text-xs text-gray-500">{film.capacity} exposures</p>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onInfoClick(); }}
          className="p-2 text-gray-500 hover:text-white rounded-full transition-colors"
          aria-label={`More info about ${film.name}`}
        >
          <Info className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-end space-x-1 text-right flex-shrink-0 w-14">
          {isLocked ? (
            <Lock className="w-5 h-5 text-gray-500" />
          ) : (
            <>
              <span className="text-sm font-semibold text-white">{film.price}</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </>
          )}
        </div>
      </div>
    </button>
  );
};

export default FilmStockCard;