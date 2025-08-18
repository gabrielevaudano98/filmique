import React from 'react';
import { Roll } from '../types';
import FilmCanisterIcon from './FilmCanisterIcon';
import { CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface RollOnShelfProps {
  roll: Roll;
}

const RollOnShelf: React.FC<RollOnShelfProps> = ({ roll }) => {
  const { developShelvedRoll, filmStocks, setSelectedRoll, setCurrentView } = useAppContext();
  const isDeveloped = !!roll.developed_at;
  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);

  const handleViewDevelopedRoll = () => {
    if (isDeveloped) {
      setSelectedRoll(roll);
      setCurrentView('rollDetail');
    }
  };

  return (
    <div className="w-full aspect-square flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-white/5 to-black/20 border border-white/10 backdrop-blur-md rounded-xl group transition-all duration-300 shadow-soft">
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
        {!isDeveloped && (
          <button 
            onClick={() => developShelvedRoll(roll.id)} 
            className="mt-2 px-3 py-1.5 rounded-full bg-neutral-700 hover:bg-brand-amber-start hover:text-black text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Clock className="w-3 h-3" />
            <span>Develop</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RollOnShelf;