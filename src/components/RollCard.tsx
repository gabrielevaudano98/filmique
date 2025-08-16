import React from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import FilmCanisterIcon from './FilmCanisterIcon';
import { Image as ImageIcon } from 'lucide-react';

interface RollCardProps {
  roll: Roll;
}

const RollCard: React.FC<RollCardProps> = ({ roll }) => {
  const { setSelectedRoll, setCurrentView, filmStocks } = useAppContext();
  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);

  const handleClick = () => {
    setSelectedRoll(roll);
    setCurrentView('rollDetail');
  };

  return (
    <button 
      onClick={handleClick}
      className="w-full aspect-[4/5] flex flex-col items-center justify-center text-center p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50 group hover:bg-neutral-700/50 hover:border-brand-amber-start/50 transition-all duration-300"
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <FilmCanisterIcon 
          filmType={roll.film_type}
          imageUrl={filmStock?.roll_image_url}
          className="h-full max-h-32 w-auto drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex-shrink-0 w-full">
        <p className="font-bold text-white text-sm truncate" title={roll.title || 'Untitled Roll'}>
          {roll.title || 'Untitled Roll'}
        </p>
        <div className="flex items-center justify-center space-x-1 text-xs text-gray-400 mt-1">
          <ImageIcon className="w-3 h-3" />
          <span>{roll.shots_used} photos</span>
        </div>
      </div>
    </button>
  );
};

export default RollCard;