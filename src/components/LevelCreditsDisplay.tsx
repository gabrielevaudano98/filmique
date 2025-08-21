import React from 'react';
import { Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface LevelCreditsDisplayProps {
  profile: UserProfile | null;
}

const LevelCreditsDisplay: React.FC<LevelCreditsDisplayProps> = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="flex items-center rounded-full bg-always-white border border-neutral-300 shadow-sm overflow-hidden">
      <div className="px-3 py-1.5 text-sm font-bold text-warm-400">
        LV {profile.level}
      </div>
      <div className="flex items-center px-3 py-1.5 text-sm font-bold rounded-full bg-gradient-to-r from-brand-amber-start to-brand-amber-end text-warm-900 border border-brand-amber-end">
        <span>{profile.credits}</span>
        <Zap className="w-4 h-4 ml-1 text-accent-coral" />
      </div>
    </div>
  );
};

export default LevelCreditsDisplay;