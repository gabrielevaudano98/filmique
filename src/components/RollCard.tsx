import React from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import FilmCanisterIcon from './FilmCanisterIcon';
import { Image as ImageIcon, Clock } from 'lucide-react';
import SyncStatusIcon from './SyncStatusIcon';
import { LocalRoll } from '../integrations/db';
import { isRollDeveloped } from '../utils/rollUtils';
import { showInfoToast } from '../utils/toasts';

interface RollCardProps {
  roll: Roll;
}

const RollCard: React.FC<RollCardProps> = ({ roll: baseRoll }) => {
  const { setSelectedRoll, setCurrentView, filmStocks } = useAppContext();
  const filmStock = filmStocks.find(fs => fs.name === baseRoll.film_type);
  const roll = baseRoll as LocalRoll;
  const isDeveloped = isRollDeveloped(roll);

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
      className="w-full aspect-square flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-white/5 to-black/20 border border-white/10 backdrop-blur-md rounded-xl group hover:border-brand-amber-start/50 transition-all duration-300 shadow-soft relative"
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
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 mt-1">
          <div className="flex items-center space-x-1">
            <ImageIcon className="w-3 h-3" />
            <span>{roll.shots_used} photos</span>
          </div>
          <SyncStatusIcon status={roll.sync_status} />
        </div>
      </div>
      {!isDeveloped && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-center p-2">
          <Clock className="w-8 h-8 text-cyan-400 mb-2" />
          <p className="text-xs font-bold text-white">In Darkroom</p>
        </div>
      )}
    </button>
  );
};

export default RollCard;