import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Photo } from '../types';
import { showErrorToast } from '../utils/toasts';

const isShareAvailable = Capacitor.isPluginAvailable('Share');

export const useNativeShare = () => {
  const sharePhoto = async (photo: Photo) => {
    if (!isShareAvailable) {
      showErrorToast('Sharing is not available on this device.');
      return;
    }
    try {
      await Share.share({
        title: 'Check out this photo from Filmique!',
        text: 'Shared from the Filmique app.',
        url: photo.url,
        dialogTitle: 'Share Photo',
      });
    } catch (error) {
      // This can happen if the user cancels the share sheet.
      console.log('Share canceled or failed', error);
    }
  };

  return { sharePhoto };
};