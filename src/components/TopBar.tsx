import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Film, ArrowLeft, Settings } from 'lucide-react';

const TopBar: React.FC = () => {
  const { currentView, setCurrentView, setShowFilmModal } = useAppContext();

  const isCameraView = currentView === 'camera';

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
    <header className={`w-full bg-gray-900 text-white px-4 flex items-center justify-between relative z-40 transition-all duration-300 border-b border-gray-700/80 h-16 py-3 pt-safe`}>
      {isCameraView ? (
        <>
          <button
            onClick={() => setCurrentView('home')}
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-base"
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold font-recoleta text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="text-amber-400">Filmique</span>
          </h1>
          <button
            onClick={() => setShowFilmModal(true)}
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 text-base font-medium"
            aria-label="Change film"
          >
            <Film className="w-5 h-5" />
          </button>
        </>
      ) : (
        <div className="flex items-center justify-between flex-1">
          <div className="w-10 h-10"></div> {/* Spacer */}
          <h1 className="text-2xl font-bold font-recoleta text-center">
            <span className="text-amber-400">Filmique</span>
          </h1>
          <IconButton onClick={() => setCurrentView('settings')} aria-label="Settings">
            <Settings className="w-5 h-5" />
          </IconButton>
        </div>
      )}
    </header>
  );
};

export default TopBar;