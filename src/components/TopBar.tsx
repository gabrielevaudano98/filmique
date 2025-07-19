import React from 'react';
import { Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const TopBar: React.FC = () => {
  const { setCurrentView } = useAppContext();

  return (
    <div className="w-full flex items-center justify-between px-4 py-4 bg-black text-white z-20">
      {/* Left: Empty space to balance centering */}
      <div className="flex-1 flex justify-start">
      </div>

      {/* Center: Logo */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-2xl font-recoleta font-bold text-amber-400">Filmique</h1>
      </div>

      {/* Right: Settings */}
      <div className="flex-1 flex justify-end">
        <button
          onClick={() => setCurrentView('settings')}
          className="p-2 rounded-full bg-neutral-800 flex items-center justify-center transition-colors hover:bg-neutral-700"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
