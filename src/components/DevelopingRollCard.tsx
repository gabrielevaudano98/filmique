import React from 'react';
import { Film, Clock, Zap } from 'lucide-react';
import { Roll, UserProfile } from '../context/AppContext';

interface DevelopingRollCardProps {
  roll: Roll;
  profile: UserProfile | null;
  onDevelop: (roll: Roll) => void;
  getRemainingTime: (completedAt: string) => string;
}

const DevelopingRollCard: React.FC<DevelopingRollCardProps> = ({ roll, profile, onDevelop, getRemainingTime }) => {
  const cost = 1 + Math.ceil(0.2 * roll.shots_used);
  const canAfford = (profile?.credits || 0) >= cost;

  const completedTime = new Date(roll.completed_at!).getTime();
  const thirtySixHoursInMillis = 36 * 60 * 60 * 1000;
  const readyTime = completedTime + thirtySixHoursInMillis;
  const progress = Math.min(100, ((new Date().getTime() - completedTime) / (readyTime - completedTime)) * 100);

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      {/* Top section: Info */}
      <div className="flex items-center space-x-4">
        <div className="bg-gray-700 p-3 rounded-lg">
          <Film className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h4 className="font-semibold text-white">{roll.film_type}</h4>
          <p className="text-gray-400 text-sm">{roll.shots_used} photos</p>
        </div>
      </div>

      {/* Middle section: Progress and Time */}
      <div>
        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
          <span>Developing...</span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1.5" />
            {getRemainingTime(roll.completed_at!)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Bottom section: Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900/50 p-3 rounded-lg gap-3">
        <div className="flex items-center space-x-1.5">
          <span className="font-bold text-white text-base">{cost}</span>
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="text-gray-400 text-sm">credits to develop</span>
        </div>
        <button
          onClick={() => onDevelop(roll)}
          className="w-full sm:w-auto px-4 py-2 flex items-center justify-center bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed shrink-0 font-bold text-gray-900 text-sm"
          disabled={!canAfford}
          aria-label="Develop Now"
        >
          <Zap className="w-4 h-4 mr-2" />
          <span>{canAfford ? 'Develop Now' : 'Not enough credits'}</span>
        </button>
      </div>
    </div>
  );
};

export default DevelopingRollCard;