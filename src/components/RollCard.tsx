import React from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import { Image as ImageIcon, Clock } from 'lucide-react';
import SyncStatusIcon from './SyncStatusIcon';
import { LocalRoll } from '../integrations/db';
import { isRollDeveloped } from '../utils/rollUtils';
import { showInfoToast } from '../utils/toasts';
import Image from './Image';

interface RollCardProps {
  roll: Roll;
}

const RollCard: React.FC<RollCardProps> = ({ roll: baseRoll }) => {
  const { setSelectedRoll, setCurrentView } = useAppContext();
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

  const coverPhotoUrl = roll.photos?.[0]?.thumbnail_url;
  const cacheBuster = roll.developed_at ? `?t=${new Date(roll.developed_at).getTime()}` : '';

  return (
    <button 
      onClick={handleClick}
      className="w-full aspect-square bg-neutral-800 rounded-xl overflow-hidden group relative text-left flex flex-col justify-end p-3 border border-neutral-700/50 hover:border-brand-amber-start/50 transition-all"
    >
      <div className="absolute inset-0 bg-neutral-700">
        <Image
          src={coverPhotoUrl ? `${coverPhotoUrl}${cacheBuster}` : undefined}
          alt={roll.title || 'Roll cover'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>
      
      <div className="relative z-10">
        <h3 className="font-bold text-base text-white leading-tight truncate">{roll.title || 'Untitled Roll'}</h3>
        <p className="text-xs text-gray-300 truncate">{roll.film_type}</p>
        <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
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