import React, { useState, useEffect } from 'react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';
import { Clock, Zap } from 'lucide-react';
import FilmCanisterIcon from './FilmCanisterIcon';
import { formatDuration } from '../utils/time';
import { LocalRoll } from '../integrations/db';
import SyncStatusIcon from './SyncStatusIcon';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const DEVELOPMENT_TIME_MS = 36 * 60 * 60 * 1000;
const SPEED_UP_COST = 25;

const DevelopingRollCard: React.FC<{ roll: Roll }> = ({ roll: baseRoll }) => {
  const { filmStocks, developRoll, speedUpDevelopment } = useAppContext();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const roll = baseRoll as LocalRoll;

  useEffect(() => {
    if (!roll.completed_at) return;

    const calculateProgress = () => {
      const completedTime = new Date(roll.completed_at!).getTime();
      const now = new Date().getTime();
      const elapsed = now - completedTime;
      const remaining = DEVELOPMENT_TIME_MS - elapsed;
      setTimeRemaining(remaining);
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [roll.completed_at]);

  const filmStock = filmStocks.find(fs => fs.name === roll.film_type);
  const isReadyToDevelop = timeRemaining <= 0;

  return (
    <>
      <div className="bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-2xl p-4 flex items-center space-x-4 shadow-lg">
        <FilmCanisterIcon
          filmType={roll.film_type}
          imageUrl={filmStock?.roll_image_url}
          className="h-20 w-auto shrink-0"
        />
        <div className="flex-1">
          <h4 className="font-bold text-white truncate">{roll.title || roll.film_type}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{roll.shots_used} photos</span>
            <SyncStatusIcon status={roll.sync_status} />
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {isReadyToDevelop ? (
            <button 
              onClick={() => developRoll(roll)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Develop</span>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-cyan-400">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(timeRemaining)}</span>
              </div>
              <button 
                  onClick={() => setShowConfirm(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold py-1 px-2 rounded-full flex items-center space-x-1"
              >
                  <Zap className="w-3 h-3" />
                  <span>{SPEED_UP_COST}</span>
              </button>
            </>
          )}
        </div>
      </div>
      {showConfirm && (
        <ConfirmDeleteModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => {
                speedUpDevelopment(roll);
                setShowConfirm(false);
            }}
            title="Speed Up Development"
            message={`Are you sure you want to spend ${SPEED_UP_COST} credits to finish development immediately?`}
            confirmText="Yes, Speed Up"
        />
      )}
    </>
  );
};

export default DevelopingRollCard;