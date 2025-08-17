import React from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import FilmCanisterIcon from './FilmCanisterIcon';
import { Image as ImageIcon } from 'lucide-react';

interface RollCardProps {
  roll: Roll;
  theme?: 'light' | 'dark';
}

const RollCard: React.FC<RollCardProps> = ({ roll, theme = 'dark' }) => {
  const { setSelectedRoll, setCurrentView, filmStocks } = useAppContext();
  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);

  const handleClick = () => {
    setSelectedRoll(roll);
    setCurrentView('rollDetail');
  };

  const isLight = theme === 'light';

  const cardClasses = isLight
    ? "bg-white border border-neutral-200/80 hover:border-neutral-400/50 shadow-soft"
    : "bg-gradient-to-b from-white/5 to-black/20 border border-white/10 backdrop-blur-md hover:border-brand-amber-start/50 shadow-soft";
  
  const titleClasses = isLight ? "text-black" : "text-white";
  const subtitleClasses = isLight ? "text-neutral-600" : "text-gray-400";

  return (
    <button 
      onClick={handleClick}
      className={`w-full aspect-square flex flex-col items-center justify-center text-center p-4 rounded-xl group transition-all duration-300 ${cardClasses}`}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <FilmCanisterIcon 
          filmType={roll.film_type}
          imageUrl={filmStock?.roll_image_url}
          className="h-full max-h-32 w-auto drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex-shrink-0 w-full">
        <p className={`font-bold text-sm truncate ${titleClasses}`} title={roll.title || 'Untitled Roll'}>
          {roll.title || 'Untitled Roll'}
        </p>
        <div className={`flex items-center justify-center space-x-1 text-xs mt-1 ${subtitleClasses}`}>
          <ImageIcon className="w-3 h-3" />
          <span>{roll.shots_used} photos</span>
        </div>
      </div>
    </button>
  );
};

export default RollCard;