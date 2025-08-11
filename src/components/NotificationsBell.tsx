import React from 'react';
import { Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const NotificationsBell: React.FC = () => {
  const { notifications, setCurrentView } = useAppContext();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <button
      onClick={() => setCurrentView('notifications')}
      aria-label="Notifications"
      className="relative h-10 w-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-[10px] font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </button>
  );
};

export default NotificationsBell;