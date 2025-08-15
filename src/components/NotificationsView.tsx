import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell, Heart, MessageCircle, UserPlus, Award } from 'lucide-react';

const NotificationIcon = ({ type }: { type: string }) => {
  const iconProps = { className: "w-5 h-5" };
  switch (type) {
    case 'like': return <Heart {...iconProps} />;
    case 'comment': return <MessageCircle {...iconProps} />;
    case 'follow': return <UserPlus {...iconProps} />;
    case 'badge_unlocked': return <Award {...iconProps} />;
    default: return <Bell {...iconProps} />;
  }
};

const NotificationsView: React.FC = () => {
  const { notifications, markNotificationsAsRead, fetchNotifications } = useAppContext();

  useEffect(() => {
    fetchNotifications();
    return () => {
      markNotificationsAsRead();
    };
  }, []);

  const getNotificationText = (notification: any) => {
    const actor = notification.actors?.username || 'Someone';
    switch (notification.type) {
      case 'like': return <><span className="font-bold">{actor}</span> liked your post.</>;
      case 'comment': return <><span className="font-bold">{actor}</span> commented on your post.</>;
      case 'follow': return <><span className="font-bold">{actor}</span> started following you.</>;
      case 'badge_unlocked': return <>You unlocked a new badge!</>;
      default: return 'New notification';
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <button onClick={markNotificationsAsRead} className="text-sm text-amber-400 hover:text-amber-500 font-semibold">
          Mark all as read
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`flex items-start space-x-4 p-4 rounded-xl transition-colors ${n.is_read ? 'bg-gray-800/50' : 'bg-amber-500/10'}`}>
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${n.is_read ? 'bg-gray-700 text-gray-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <NotificationIcon type={n.type} />
              </div>
              <div className="flex-grow">
                <p className="text-white">{getNotificationText(n)}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {n.posts?.rolls?.photos?.[0]?.thumbnail_url && (
                <img src={n.posts.rolls.photos[0].thumbnail_url} alt="Post thumbnail" className="w-12 h-12 rounded-md object-cover flex-shrink-0" loading="lazy" decoding="async" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-gray-800/50 rounded-lg">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-white">All caught up!</h3>
          <p className="text-gray-400 max-w-md mx-auto">You have no new notifications.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;