import React from 'react';
import { Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface LevelCreditsDisplayProps {
  profile: UserProfile | null;
}

const LevelCreditsDisplay: React.FC<LevelCreditsDisplayProps> = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="flex items-center rounded-full shadow-none transition-colors
                border border-white/30 dark:border-neutral-700/50">
      {/* Left segment: Level */}
      <div className="px-3 py-1.5 text-sm font-bold text-black dark:text-white
                bg-white/80 dark:bg-neutral-800/60 rounded-l-full">
        LV {profile.level}
      </div>
      {/* Right segment: Credits with amber styling */}
      <div className="flex items-center px-3 py-1.5 text-sm font-bold text-brand-amber-start
                bg-gradient-to-r from-brand-amber-start/10 to-transparent rounded-r-full
                border-l border-brand-amber-start/30">
        <span>{profile.credits}</span>
        <Zap className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
};

export default LevelCreditsDisplay;