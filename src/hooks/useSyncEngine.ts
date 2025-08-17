import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../integrations/db';
import * as api from '../services/api';
import { showSuccessToast } from '../utils/toasts';

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
        // Other cases will be added here in future iterations
        default:
          console.warn(`Unknown transaction type: ${transaction.type}`);
      }

      // If successful, delete the transaction from the queue
      await db.pending_transactions.delete(transaction.id!);

    } catch (error) {
      console.error('Sync transaction failed:', error);
      // For now, we'll just mark it as failed. A more robust system
      // could implement retry logic with backoff.
      await db.pending_transactions.update(transaction.id!, { 
        status: 'failed',
        attempts: (transaction.attempts || 0) + 1,
      });
    }
  };
};