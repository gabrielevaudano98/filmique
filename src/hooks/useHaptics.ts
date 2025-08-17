import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const isHapticsAvailable = Capacitor.isPluginAvailable('Haptics');

export const useHaptics = () => {
  const impact = (style: ImpactStyle) => {
    if (isHapticsAvailable) Haptics.impact({ style });
  };

  const notification = (type: NotificationType) => {
    if (isHapticsAvailable) Haptics.notification({ type });
  };

  const selectionChanged = () => {
    if (isHapticsAvailable) Haptics.selectionChanged();
  };

  return { impact, notification, selectionChanged };
};