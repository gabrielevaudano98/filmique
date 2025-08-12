import React from 'react';
import { useAppContext } from '../context/AppContext';
import NotificationsBell from './NotificationsBell';
import BrandLogo from './ui/BrandLogo';

const TopBar: React.FC = () => {
  const { notifications, setCurrentView } = useAppContext();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-[rgba(255,255,255,0.02)] backdrop-blur-[var(--glass-blur)] border-b border-[rgba(255,255,255,0.03)] pt-safe">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="w-10"></div> {/* Spacer */}
        <div className="flex items-center gap-2">
          <BrandLogo />
        </div>
        <div className="flex items-center gap-2">
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