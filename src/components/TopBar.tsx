import React from 'react';
import { useAppContext } from '../context/AppContext';
import NotificationsBell from './NotificationsBell';

const TopBar: React.FC = () => {
  const { notifications, setCurrentView, headerAction, isTopBarVisible } = useAppContext();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const BackButton = headerAction ? headerAction.icon : null;

  return (
    <header 
      className={`sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-700/50 transition-transform duration-300 ${!isTopBarVisible ? '-translate-y-full' : 'translate-y-0'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between h-16 px-4">
        <div className="w-10">
          {headerAction && BackButton && (
            <button onClick={headerAction.action} className="p-2 text-gray-300 hover:text-white transition-colors -ml-2">
              <BackButton className="w-5 h-5" />
            </button>
          )}
        </div>
        <h1 className="text-lg font-bold text-white">
          Filmique
        </h1>
        <NotificationsBell 
          unreadCount={unreadCount} 
          onClick={() => setCurrentView('notifications')} 
        />
      </div>
    </header>
  );
};

export default TopBar;