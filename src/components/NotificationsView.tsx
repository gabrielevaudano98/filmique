import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell, Heart, MessageCircle, UserPlus, Award, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from '../utils/time';
import { Notification } from '../types';

const NotificationIcon = ({ type }: { type: string }) => {
  const iconProps = { className: "w-6 h-6 text-white" };
  let gradientClass = 'from-gray-500 to-gray-700';
  let IconComponent = Bell;

  switch (type) {
    case 'like':
      IconComponent = Heart;
      gradientClass = 'from-red-500 to-pink-500';
      break;
    case 'comment':
      IconComponent = MessageCircle;
      gradientClass = 'from-blue-400 to-cyan-400';
      break;
    case 'follow':
      IconComponent = UserPlus;
      gradientClass = 'from-green-400 to-emerald-500';
      break;
    case 'badge_unlocked':
      IconComponent = Award;
      gradientClass = 'from-amber-400 to-orange-500';
      break;
  }

  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${gradientClass} shadow-lg`}>
      <IconComponent {...iconProps} />
    </div>
  );
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const getNotificationText = (n: Notification) => {
    const actor = n.actors?.username || 'Someone';
    switch (n.type) {
      case 'like': return <><span className="font-bold text-white">{actor}</span> liked your post.</>;
      case 'comment': return <><span className="font-bold text-white">{actor}</span> commented on your post.</>;
      case 'follow': return <><span className="font-bold text-white">{actor}</span> started following you.</>;
      case 'badge_unlocked': return <>You unlocked a new badge!</>;
      default: return 'You have a new notification.';
    }
  };

  return (
    <div className="relative bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-2xl p-4 flex items-center space-x-4 transition-all duration-300 hover:bg-neutral-700/50">
      {!notification.is_read && (
        <div className="absolute top-4 left-[-1px] w-1 h-1 bg-brand-amber-start rounded-full unread-indicator-glow"></div>
      )}
      <div className="flex-shrink-0">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-grow">
        <p className="text-gray-300 text-sm leading-relaxed">{getNotificationText(notification)}</p>
        <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(notification.created_at)}</p>
      </div>
      {notification.posts?.rolls?.photos?.[0]?.thumbnail_url && (
        <img 
          src={notification.posts.rolls.photos[0].thumbnail_url} 
          alt="Post thumbnail" 
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border-2 border-neutral-700" 
          loading="lazy" 
          decoding="async" 
        />
      )}
    </div>
  );
};


const NotificationsView: React.FC = () => {
  const { notifications, markNotificationsAsRead, fetchNotifications, setCurrentView } = useAppContext();

  useEffect(() => {
    fetchNotifications();
    return () => {
      markNotificationsAsRead();
    };
  }, [fetchNotifications, markNotificationsAsRead]);

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentView('community')} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <button onClick={markNotificationsAsRead} className="text-sm text-brand-amber-start hover:text-brand-amber-mid font-semibold">
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map(n => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 px-4 bg-neutral-800/50 rounded-2xl mt-8">
          <Bell className="w-16 h-16 text-neutral-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-2 text-white">All Caught Up</h3>
          <p className="text-neutral-400 max-w-md mx-auto">
            You have no new notifications. Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;