import { dbService } from './database';
import * as api from './api';
import { Roll, Photo } from '../types';
import { compressImage } from '../utils/imageProcessor';
import { Filesystem } from '@capacitor/filesystem';
import { v4 as uuidv4 } from 'uuid';

// Helper to read a local file as a blob
const readFileAsBlob = async (path: string): Promise<Blob> => {
  const { data } = await Filesystem.readFile({ path });
  const byteCharacters = atob(data as string);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/jpeg' });
};

class SyncService {
  private isSyncing = false;

  async runSync() {
    if (this.isSyncing) {
      console.log('Sync already in progress.');
      return;
    }
    this.isSyncing = true;
    console.log('Starting sync...');

    try {
      const transactions = await dbService.getPendingTransactions();
      if (transactions.length === 0) {
        console.log('No pending transactions to sync.');
        return;
      }

      for (const tx of transactions) {
        try {
          await this.processTransaction(tx);
          await dbService.deleteTransaction(tx.id);
        } catch (error) {
          console.error(`Failed to process transaction ${tx.id} of type ${tx.type}:`, error);
          break; 
        }
      }
    } catch (error) {
      console.error('Error during sync process:', error);
    } finally {
      this.isSyncing = false;
      console.log('Sync finished.');
    }
  }

  private async processTransaction(tx: any) {
    switch (tx.type) {
      case 'CREATE_ROLL':
        await this.syncCreateRoll(tx.payload);
        break;
      case 'UPDATE_ROLL':
        await this.syncUpdateRoll(tx.payload);
        break;
      default:
        console.warn(`Unknown transaction type: ${tx.type}`);
    }
  }

  private async syncCreateRoll(payload: { roll: Roll }) {
    const { roll: localRoll } = payload;

    await dbService.saveRoll({ ...localRoll, sync_status: 'syncing' });

    const { error: createRollError } = await api.createRollRecord(localRoll);
    if (createRollError) throw createRollError;

    const uploadedPhotos: Photo[] = [];
    if (localRoll.photos) {
      for (const localPhoto of localRoll.photos) {
        if (localPhoto.local_path) {
          const fileBlob = await readFileAsBlob(localPhoto.local_path);
          const compressedBlob = await compressImage(fileBlob);
          
          const filePath = `${localRoll.user_id}/${localRoll.id}/${uuidv4()}.jpeg`;
          const { error: uploadError } = await api.uploadPhotoToStorage(filePath, compressedBlob);
          if (uploadError) throw uploadError;

          const { data: urlData } = api.getPublicUrl('photos', filePath);
          
          const serverPhoto: Photo = {
            ...localPhoto,
            url: urlData.publicUrl,
            thumbnail_url: urlData.publicUrl,
          };

          const { error: createPhotoError } = await api.createPhotoRecord(serverPhoto);
          if (createPhotoError) throw createPhotoError;

          uploadedPhotos.push(serverPhoto);
        }
      }
    }

    const finalSyncedRoll: Roll = {
      ...localRoll,
      sync_status: 'synced',
      photos: uploadedPhotos,
    };
    await dbService.saveRoll(finalSyncedRoll);
  }

  private async syncUpdateRoll(payload: { rollId: string, updates: Partial<Roll> }) {
    const { rollId, updates } = payload;
    const { error } = await api.updateRoll(rollId, updates);
    if (error) throw error;
    // The local record is already updated optimistically, so we just need to confirm sync.
    const rolls = await dbService.getRolls(payload.updates.user_id!);
    const rollToUpdate = rolls.find(r => r.id === rollId);
    if (rollToUpdate) {
      await dbService.saveRoll({ ...rollToUpdate, ...updates, sync_status: 'synced' });
    }
  }
}

export const syncService = new SyncService();