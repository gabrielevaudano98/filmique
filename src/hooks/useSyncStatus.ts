import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../integrations/db';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

export const useSyncStatus = (isOnline: boolean): SyncStatus => {
  const pendingCount = useLiveQuery(() => 
    db.pending_transactions.where('status').equals('pending').count(),
    [], 
    0
  );

  const failedCount = useLiveQuery(() => 
    db.pending_transactions.where('status').equals('failed').count(),
    [],
    0
  );

  if (!isOnline) {
    return 'offline';
  }
  if (failedCount > 0) {
    return 'error';
  }
  if (pendingCount > 0) {
    return 'syncing';
  }
  return 'synced';
};