import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const RollsControls: React.FC = () => {
  const { setCurrentView } = useAppContext();

  return (
    <button
      onClick={() => setCurrentView('rollsSettings')}
      className="flex items-center justify-center w-11 h-11 bg-neutral-800/60 backdrop-blur-lg border border-white/10 rounded-xl text-white hover:bg-neutral-700/80 transition-colors"
      aria-label="Display options"
    >
      <SlidersHorizontal className="w-5 h-5 text-gray-300" />
    </button>
  );
};

export default RollsControls;