import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings } from 'lucide-react';
import NotificationsBell from './NotificationsBell';

const TopBar: React.FC = () => {
  const { setCurrentView } = useAppContext();

  return (
    <header className={`fixed top-0 left-0 right-0 w-full bg-gray-900 text-white px-4 flex items-center justify-between z-40 transition-all duration-300 border-b border-gray-700/80 h-20 py-4 pt-safe`}>
      <div className="flex items-center justify-between flex-1">
        <NotificationsBell />
        <h1 className="text-2xl font-bold font-recoleta text-center">
          <span className="text-amber-400">Filmique</span>
        </h1>
        <button
          onClick={() => setCurrentView('settings')}
          aria-label="Settings"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;