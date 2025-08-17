import { dbService } from './database';
import * as api from './api';
import { Roll, Photo } from '../types';
import { compressImage } from '../utils/imageProcessor';

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
          // Here you might add logic to mark the transaction as 'failed'
          // and implement retry logic if needed. For now, we'll just stop.
          break; // Stop sync on first error to maintain order
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
      // Add other transaction types here in the future
      default:
        console.warn(`Unknown transaction type: ${tx.type}`);
    }
  }

  private async syncCreateRoll(payload: { roll: Roll }) {
    const { roll } = payload;
    // This is a simplified version. A real implementation would handle photo uploads.
    // For now, we just create the roll record.
    const { error } = await api.createNewRoll(roll.user_id, roll.film_type, roll.capacity, roll.aspect_ratio);
    if (error) throw error;
    
    const updatedRoll = { ...roll, sync_status: 'synced' as const };
    await dbService.saveRoll(updatedRoll);
  }

  private async syncUpdateRoll(payload: { rollId: string, updates: Partial<Roll> }) {
    const { rollId, updates } = payload;
    const { error } = await api.updateRoll(rollId, updates);
    if (error) throw error;
  }
}

export const syncService = new SyncService();