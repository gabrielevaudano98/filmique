import React from 'react';
import { Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface LevelCreditsDisplayProps {
  profile: UserProfile | null;
}

const LevelCreditsDisplay: React.FC<LevelCreditsDisplayProps> = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="flex items-center rounded-full bg-white/80 dark:bg-neutral-800/60 border border-white/30 dark:border-neutral-700/50 backdrop-blur-lg shadow-none transition-colors">
      <div className="px-3 py-1.5 text-sm font-bold text-black dark:text-white">
        LV {profile.level}
      </div>
      <div className="h-full w-px bg-white/20 dark:bg-neutral-700/50"></div> {/* Separator */}
      <div className="flex items-center px-3 py-1.5 text-sm font-bold text-brand-amber-start">
        <span>{profile.credits}</span>
        <Zap className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
};

export default LevelCreditsDisplay;