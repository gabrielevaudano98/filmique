import React from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import { Image as ImageIcon, Clock } from 'lucide-react';
import FilmCanisterIcon from './FilmCanisterIcon';
import SyncStatusIcon from './SyncStatusIcon';
import { LocalRoll } from '../integrations/db';
import { isRollDeveloped } from '../utils/rollUtils';
import { showInfoToast } from '../utils/toasts';

interface RollCardProps {
  roll: Roll;
}

const RollCard: React.FC<RollCardProps> = ({ roll: baseRoll }) => {
  const { setSelectedRoll, setCurrentView, filmStocks } = useAppContext();
  const roll = baseRoll as LocalRoll;
  const isDeveloped = isRollDeveloped(roll);
  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);

  const handleClick = () => {
    if (!isDeveloped) {
      showInfoToast("This roll is still developing in the darkroom.");
      return;
    }
    setSelectedRoll(roll);
    setCurrentView('rollDetail');
  };

  return (
    <button 
      onClick={handleClick}
      className="w-full aspect-square bg-neutral-800 rounded-xl overflow-hidden group relative text-left flex flex-col justify-center items-center p-3 border border-neutral-700/50 hover:border-brand-amber-start/50 transition-all"
    >
      <FilmCanisterIcon filmType={roll.film_type} imageUrl={filmStock?.roll_image_url} className="h-20 w-auto transition-transform duration-300 group-hover:scale-105" />
      
      <div className="mt-3 text-center">
        <h3 className="font-bold text-sm text-white leading-tight truncate w-24">{roll.title || 'Untitled Roll'}</h3>
        <div className="flex items-center justify-center space-x-3 text-xs text-gray-400 mt-1">
          <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {roll.shots_used}</span>
          <SyncStatusIcon status={roll.sync_status} />
        </div>
      </div>

      {!isDeveloped && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-center p-2 z-20">
          <Clock className="w-8 h-8 text-cyan-400 mb-2" />
          <p className="text-xs font-bold text-white">In Darkroom</p>
        </div>
      )}
    </button>
  );
};

export default RollCard;