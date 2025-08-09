import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings } from 'lucide-react';

const TopBar: React.FC = () => {
  const { setCurrentView } = useAppContext();

  const IconButton: React.FC<{onClick: () => void, 'aria-label': string, children: React.ReactNode}> = ({ onClick, 'aria-label': ariaLabel, children }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
    >
      {children}
    </button>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 w-full bg-gray-900 text-white px-4 flex items-center justify-between z-40 transition-all duration-300 border-b border-gray-700/80 h-16 py-3 pt-safe`}>
      <div className="flex items-center justify-between flex-1">
        <div className="w-10 h-10"></div> {/* Spacer */}
        <h1 className="text-2xl font-bold font-recoleta text-center">
          <span className="text-amber-400">Filmique</span>
        </h1>
        <IconButton onClick={() => setCurrentView('settings')} aria-label="Settings">
          <Settings className="w-5 h-5" />
        </IconButton>
      </div>
    </header>
  );
};

export default TopBar;