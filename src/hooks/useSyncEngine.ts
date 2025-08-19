import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../integrations/db';
import * as api from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toasts';
import { readPhotoBlob } from '../utils/fileStorage';
import { LocalPhoto } from '../types';

export const useSyncEngine = (isOnline: boolean) => {
  const pendingTransactions = useLiveQuery(() => 
    db.pending_transactions.where('status').equals('pending').toArray()
  );

  useEffect(() => {
    if (isOnline && pendingTransactions && pendingTransactions.length > 0) {
      console.log(`Sync Engine: Online with ${pendingTransactions.length} pending transactions. Processing...`);
      processQueue();
    }
  }, [isOnline, pendingTransactions]);

  const processQueue = async () => {
    const transaction = await db.pending_transactions.where('status').equals('pending').first();
    if (!transaction) return;

    try {
      switch (transaction.type) {
        case 'DELETE_ROLL':
          await api.deleteRollById(transaction.payload.rollId);
          showSuccessToast('Cloud data synced.');
          break;
        
        case 'BACKUP_ROLL': {
          const { rollId } = transaction.payload;
          await db.rolls.update(rollId, { sync_status: 'syncing' });

          const rollToBackup = await db.rolls.get(rollId);
          const photosToBackup = await db.photos.where('roll_id').equals(rollId).toArray();

          if (!rollToBackup || photosToBackup.length === 0) {
            throw new Error('Local roll or photos not found for backup.');
          }

          const updatedPhotos: LocalPhoto[] = [];

          for (const photo of photosToBackup) {
            if (!photo.local_path) continue;
            const blob = await readPhotoBlob(photo.local_path);
            if (!blob) continue;

            const path = `${photo.user_id}/${photo.roll_id}/${photo.id}.jpeg`;
            await api.uploadBackupPhoto(path, blob);
            const { data: urlData } = api.getPublicUrl('photos', path);
            
            updatedPhotos.push({ ...photo, url: urlData.publicUrl, thumbnail_url: urlData.publicUrl });
          }

          await api.upsertCloudRoll(rollToBackup);
          await api.batchUpsertCloudPhotos(updatedPhotos);

          await db.transaction('rw', db.rolls, db.photos, async () => {
            await db.rolls.update(rollId, { sync_status: 'synced' });
            await db.photos.bulkPut(updatedPhotos);
          });

          showSuccessToast(`"${rollToBackup.title || 'A roll'}" has been backed up.`);
          break;
        }

        case 'CREATE_POST': {
          const { userId, rollId, caption, coverUrl, albumId } = transaction.payload;
          
          const rollToPost = await db.rolls.get(rollId);
          if (!rollToPost) throw new Error('Local roll for post not found.');

          // If the roll isn't synced yet, we must sync it first.
          if (rollToPost.sync_status !== 'synced') {
            const photosToUpload = await db.photos.where('roll_id').equals(rollId).toArray();
            const updatedPhotos: LocalPhoto[] = [];

            for (const photo of photosToUpload) {
              if (!photo.local_path) continue;
              const blob = await readPhotoBlob(photo.local_path);
              if (!blob) continue;

              const path = `${photo.user_id}/${photo.roll_id}/${photo.id}.jpeg`;
              await api.uploadBackupPhoto(path, blob);
              const { data: urlData } = api.getPublicUrl('photos', path);
              updatedPhotos.push({ ...photo, url: urlData.publicUrl, thumbnail_url: urlData.publicUrl });
            }
            
            await api.upsertCloudRoll(rollToPost);
            await api.batchUpsertCloudPhotos(updatedPhotos);
            
            await db.transaction('rw', db.rolls, db.photos, async () => {
              await db.rolls.update(rollId, { sync_status: 'synced' });
              await db.photos.bulkPut(updatedPhotos);
            });
          }

          // Now that we're sure the roll is synced, create the post.
          const { error } = await api.createPost(userId, rollId, caption, coverUrl, albumId);
          if (error) throw error;

          showSuccessToast('Your post has been published!');
          break;
        }

        case 'PURCHASE_PRINT': {
          const { userId, rollId, cost } = transaction.payload;
          const { error } = await api.processPrintOrder(userId, rollId, cost);
          if (error) {
            if (error.message.includes('Insufficient credits')) {
              showErrorToast("Print order failed: You don't have enough credits.");
              await db.pending_transactions.delete(transaction.id!);
              return;
            }
            throw error;
          }
          showSuccessToast('Print order processed successfully!');
          break;
        }

        default:
          console.warn(`Unknown transaction type: ${transaction.type}`);
      }

      await db.pending_transactions.delete(transaction.id!);

    } catch (error: any) {
      console.error('Sync transaction failed:', error);
      showErrorToast(`Sync failed: ${error.message}`);
      await db.pending_transactions.update(transaction.id!, { 
        status: 'failed',
        attempts: (transaction.attempts || 0) + 1,
      });
    }
  };
};