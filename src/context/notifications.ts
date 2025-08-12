import { supabase } from '../integrations/supabase/client';

/**
 * Notifications helper(s)
 */

export async function markNotificationsAsRead(profile: any, notifications: any[], setNotifications: (v: any) => void) {
  if (!profile) return;
  try {
    const unreadIds = (notifications || []).filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => (prev || []).map((n: any) => ({ ...n, is_read: true })));
  } catch (error) {
    console.error('markNotificationsAsRead', error);
  }
}