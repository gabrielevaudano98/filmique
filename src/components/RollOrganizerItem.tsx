import React from 'react';
import { Roll } from '../types';
import { ChevronRight } from 'lucide-react';
import FilmCanisterIcon from './FilmCanisterIcon';
import { useAppContext } from '../context/AppContext';

interface RollOrganizerItemProps {
  roll: Roll;
  onClick: () => void;
  isDragging?: boolean;
}

const RollOrganizerItem: React.FC<RollOrganizerItemProps> = ({ roll, onClick, isDragging }) => {
  const { filmStocks } = useAppContext();
  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);

  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center p-3 bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-xl transition-all duration-200
        ${isDragging ? 'opacity-30' : 'hover:bg-neutral-700/50'}
      `}
    >
      <FilmCanisterIcon 
        filmType={roll.film_type}
        imageUrl={filmStock?.roll_image_url}
        className="h-12 w-auto mr-4 flex-shrink-0"
      />
      <div className="flex-1 text-left overflow-hidden">
        <p className="text-white font-semibold truncate">{roll.title}</p>
        <p className="text-gray-400 text-sm">{roll.shots_used || 0} photos</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />
    </button>
  );
};

export default RollOrganizerItem;