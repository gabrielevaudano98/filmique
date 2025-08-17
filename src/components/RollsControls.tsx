import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface RollsControlsProps {
  theme?: 'light' | 'dark';
}

const RollsControls: React.FC<RollsControlsProps> = ({ theme = 'dark' }) => {
  const { setCurrentView } = useAppContext();
  const isLight = theme === 'light';

  const buttonClasses = isLight
    ? 'bg-white/50 border-neutral-300/80 text-neutral-800 hover:bg-white/80'
    : 'bg-neutral-800/60 border-white/10 text-white hover:bg-neutral-700/80';

  return (
    <button
      onClick={() => setCurrentView('rollsSettings')}
      className={`flex items-center justify-center w-11 h-11 backdrop-blur-lg border rounded-xl transition-colors ${buttonClasses}`}
      aria-label="Display options"
    >
      <SlidersHorizontal className={`w-5 h-5 ${isLight ? 'text-neutral-700' : 'text-gray-300'}`} />
    </button>
  );
};

export default RollsControls;