import React from 'react';
import NotificationsBell from './NotificationsBell';

const TopBar: React.FC = () => {
  return (
    <header className={`fixed top-0 left-0 right-0 w-full bg-gray-900 text-white px-4 flex items-center justify-between z-40 transition-all duration-300 border-b border-gray-700/80 h-20 py-4 pt-safe`}>
      <div className="flex items-center justify-between flex-1">
        <div className="w-10 h-10">
          <NotificationsBell />
        </div>
        <h1 className="text-2xl font-bold font-recoleta text-center absolute left-1/2 -translate-x-1/2">
          <span className="text-amber-400">Filmique</span>
        </h1>
        {/* Placeholder to keep title centered */}
        <div className="w-10 h-10"></div>
      </div>
    </header>
  );
};

export default TopBar;