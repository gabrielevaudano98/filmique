import React from 'react';
import { useAppContext } from '../context/AppContext';
import { X, ArrowLeft, Settings } from 'lucide-react';

const TopBar: React.FC = () => {
  const { currentView, setCurrentView } = useAppContext();

  const isCameraView = currentView === 'camera';

  return (
    <header className={`w-full bg-gray-900 text-white px-4 flex items-center justify-between relative z-40 transition-all duration-300 border-b border-gray-700 ${isCameraView ? 'h-14 py-2' : 'h-16 py-3'}`}>
      {isCameraView ? (
        <>
          <button
            onClick={() => setCurrentView('home')}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            aria-label="Cancel camera operation"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Cancel</span>
          </button>
          <h1 className="text-xl font-bold font-recoleta text-center flex-1">
            <span className="text-amber-400">Filmique</span>
          </h1>
          <button
            onClick={() => setCurrentView('home')}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close camera view"
          >
            <X className="w-6 h-6" />
          </button>
        </>
      ) : (
        <div className="flex items-center justify-between flex-1">
          {/* Placeholder for left alignment to center title */}
          <div className="w-6 h-6"></div> 
          <h1 className="text-2xl font-bold font-recoleta text-center flex-1">
            <span className="text-amber-400">Filmique</span>
          </h1>
          <button
            onClick={() => setCurrentView('settings')}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      )}
    </header>
  );
};

export default TopBar;
