import React from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import { Image as ImageIcon, Clock, ChevronRight, CalendarDays, UploadCloud } from 'lucide-react';
import FilmCanisterIcon from './FilmCanisterIcon';
import SyncStatusIcon from './SyncStatusIcon';
import { LocalRoll } from '../integrations/db';
import { isRollDeveloped } from '../utils/rollUtils';
import { showInfoToast } from '../utils/toasts';

interface RollRowProps {
  roll: Roll;
}

const RollRow: React.FC<RollRowProps> = ({ roll: baseRoll }) => {
  const { setSelectedRoll, setCurrentView, filmStocks, profile, manuallyBackupRoll } = useAppContext();
  const roll = baseRoll as LocalRoll;
  const isDeveloped = isRollDeveloped(roll);
  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);
  const isPremium = profile?.subscription === 'plus' || profile?.subscription === 'premium';

  const handleClick = () => {
    if (!isDeveloped) {
      showInfoToast("This roll is still developing in the darkroom.");
      return;
    }
    setSelectedRoll(roll);
    setCurrentView('rollDetail');
  };

  const developedDate = roll.developed_at 
    ? new Date(roll.developed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <button 
      onClick={handleClick}
      disabled={!isDeveloped}
      className="w-full flex items-center p-3 bg-neutral-800/50 rounded-xl text-left border border-transparent hover:border-brand-amber-start/50 transition-all disabled:opacity-60 disabled:hover:border-transparent"
    >
      <FilmCanisterIcon filmType={roll.film_type} imageUrl={filmStock?.roll_image_url} className="h-16 w-auto flex-shrink-0 mr-4" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white leading-tight truncate">{roll.title || 'Untitled Roll'}</h3>
        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1.5">
          {developedDate && (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              {developedDate}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4 text-gray-400 pl-4">
        {!isDeveloped && (
          <div title="Developing">
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm">
          <ImageIcon size={14} /> 
          <span>{roll.shots_used}</span>
        </div>
        
        {isPremium ? (
          <SyncStatusIcon status={roll.sync_status} />
        ) : (
          roll.sync_status === 'local_only' ? (
            <button 
              onClick={(e) => {
                  e.stopPropagation();
                  manuallyBackupRoll(roll.id);
              }}
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
              title="Backup this roll to the cloud"
            >
              <UploadCloud size={16} />
            </button>
          ) : (
            <SyncStatusIcon status={roll.sync_status} />
          )
        )}

        <ChevronRight className="w-5 h-5 text-gray-600" />
      </div>
    </button>
  );
};

export default RollRow;