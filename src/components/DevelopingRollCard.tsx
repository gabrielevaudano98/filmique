import React, { useState, useEffect } from 'react';
import { Film, Clock, Zap } from 'lucide-react';
import { Roll, UserProfile } from '../context/AppContext';

interface DevelopingRollCardProps {
  roll: Roll;
  profile: UserProfile | null;
  onDevelop: (roll: Roll) => void;
}

const DevelopingRollCard: React.FC<DevelopingRollCardProps> = ({ roll, profile, onDevelop }) => {
  const [currentTime, setCurrentTime] = useState(() => new Date().getTime());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 1000); // Update every second
    return () => clearInterval(timerId);
  }, []);

  const completedTime = new Date(roll.completed_at!).getTime();
  const thirtySixHoursInMillis = 36 * 60 * 60 * 1000;
  const readyTime = completedTime + thirtySixHoursInMillis;
  const remainingMillis = readyTime - currentTime;

  const getRemainingTime = () => {
    if (remainingMillis <= 0) return "Ready!";
    const hours = Math.floor(remainingMillis / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMillis % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const calculateCost = () => {
    const thirtyMinutesInMillis = 30 * 60 * 1000;
    if (remainingMillis <= thirtyMinutesInMillis) {
      return 0;
    }

    const initialCost = 1 + Math.ceil(0.2 * roll.shots_used);
    if (initialCost <= 1) {
      return 1;
    }

    const timeWindowForCost = thirtySixHoursInMillis - thirtyMinutesInMillis;
    const remainingTimeInWindow = remainingMillis - thirtyMinutesInMillis;
    const remainingPortion = Math.max(0, remainingTimeInWindow / timeWindowForCost);
    
    const dynamicCost = 1 + (initialCost - 1) * remainingPortion;
    return Math.ceil(dynamicCost);
  };

  const cost = calculateCost();
  const canAfford = (profile?.credits || 0) >= cost;
  const progress = Math.min(100, ((currentTime - completedTime) / (readyTime - completedTime)) * 100);

  return (
    <div className="bg-brand-brown-dark rounded-xl p-4 space-y-4 border border-brand-border">
      {/* Top section: Info */}
      <div className="flex items-center space-x-4">
        <div className="bg-brand-brown-light p-3 rounded-lg">
          <Film className="w-6 h-6 text-brand-orange-start" />
        </div>
        <div>
          <h4 className="font-semibold text-white text-lg">{roll.film_type}</h4>
          <p className="text-gray-400 text-sm">{roll.shots_used} photos</p>
        </div>
      </div>

      {/* Middle section: Progress and Time */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm text-gray-400 mb-1">
          <span className="font-medium">Developing...</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {getRemainingTime()}
          </span>
        </div>
        <div className="w-full bg-brand-brown-light rounded-full h-2">
          <div
            className="bg-brand-orange h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Bottom section: Action */}
      <div className="pt-4">
        <button
          onClick={() => onDevelop(roll)}
          className="w-full py-3 flex items-center justify-center bg-brand-orange hover:bg-brand-orange-end rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-white text-base shadow-lg shadow-brand-orange/20 disabled:shadow-none"
          disabled={!canAfford}
          aria-label="Develop Now"
        >
          <Zap className="w-5 h-5 mr-2" />
          <span>
            {canAfford ? `Develop Now for ${cost} Credits` : 'Not enough credits'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default DevelopingRollCard;