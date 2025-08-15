import React from 'react';
import { Roll } from '../types';
import FilmCanisterIcon from './FilmCanisterIcon';
import { Clock, Eye } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface RollCardProps {
  roll: Roll;
  isDeveloped: boolean;
}

const RollCard: React.FC<RollCardProps> = ({ roll, isDeveloped }) => {
  const { developShelvedRoll, filmStocks, setSelectedRoll, setCurrentView } = useAppContext();
  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);

  const handleAction = () => {
    if (isDeveloped) {
      setSelectedRoll(roll);
      setCurrentView('rollDetail');
    } else {
      developShelvedRoll(roll.id);
    }
  };

  const ActionButton = () => (
    <button 
      onClick={handleAction}
      className="w-full mt-3 px-3 py-2 rounded-full bg-gradient-to-r from-brand-orange-start to-brand-orange-end text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-transform hover:scale-105 active:scale-100 shadow-md shadow-black/30"
    >
      {isDeveloped ? <Eye className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      <span>{isDeveloped ? 'View' : 'Develop'}</span>
    </button>
  );

  return (
    <div className="bg-black/20 rounded-xl p-3 text-center group border border-white/5 shadow-lg backdrop-blur-sm">
      <div className="aspect-[3/4] flex items-center justify-center transform-gpu transition-transform group-hover:scale-105" style={{ transform: 'perspective(800px) rotateY(-5deg) rotateX(2deg)' }}>
        <FilmCanisterIcon filmType={roll.film_type} imageUrl={filmStock?.roll_image_url} className="h-full w-auto drop-shadow-2xl" />
      </div>
      <p className="font-medium text-white text-sm mt-3 truncate" title={roll.title || 'Untitled Roll'}>{roll.title || 'Untitled Roll'}</p>
      <ActionButton />
    </div>
  );
};

export default RollCard;