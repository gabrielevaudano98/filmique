import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationsBellProps {
  unreadCount: number;
  onClick: () => void;
}

const NotificationsBell: React.FC<NotificationsBellProps> = ({ unreadCount, onClick }) => {
  return (
    <button onClick={onClick} className="relative p-2 text-gray-300 hover:text-white transition-colors">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-amber-start rounded-full border-2 border-neutral-900"></div>
      )}
    </button>
  );
};

export default NotificationsBell;