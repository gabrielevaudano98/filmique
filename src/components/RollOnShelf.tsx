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
    <div className="flex flex-col items-center text-center group">
      <button 
        onClick={handleViewDevelopedRoll} 
        disabled={!isDeveloped}
        className="relative transition-transform duration-300 group-hover:-translate-y-2"
      >
        <FilmCanisterIcon filmType={roll.film_type} imageUrl={filmStock?.roll_image_url} className="h-32 w-auto drop-shadow-lg" />
        {isDeveloped && (
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-neutral-800">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </button>
      <p className="font-bold text-white text-sm mt-3 w-32 truncate" title={roll.title || 'Untitled Roll'}>{roll.title || 'Untitled Roll'}</p>
      
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
  );
};

export default RollOnShelf;