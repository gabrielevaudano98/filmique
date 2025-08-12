import React from 'react';
import { useAppContext } from '../context/AppContext';
import NotificationsBell from './NotificationsBell';
import { Sun, Moon } from 'lucide-react';

const TopBar: React.FC = () => {
  const { notifications, setCurrentView, theme, setTheme } = useAppContext();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-700/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="w-10"></div> {/* Spacer */}
        <h1 className="text-lg font-bold text-white">
          Filmique
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-md text-gray-300 hover:text-white transition-colors bg-transparent"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <NotificationsBell 
            unreadCount={unreadCount} 
            onClick={() => setCurrentView('notifications')} 
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;