import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationsBellProps {
  unreadCount: number;
  onClick: () => void;
  theme?: 'light' | 'dark';
}

const NotificationsBell: React.FC<NotificationsBellProps> = ({ unreadCount, onClick, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const buttonClasses = isLight
    ? 'relative p-2 text-neutral-600 hover:text-black transition-colors'
    : 'relative p-2 text-gray-300 hover:text-white transition-colors';
  
  const dotBorder = isLight ? 'border-neutral-100' : 'border-neutral-900';

  return (
    <button 
      onClick={onClick} 
      className={buttonClasses}
      aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'View notifications'}
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <div className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-amber-start rounded-full border-2 ${dotBorder}`}></div>
      )}
    </button>
  );
};

export default NotificationsBell;