import Dexie, { Table } from 'dexie';
import { Roll, Photo, UserProfile } from '../../types';

// Defines the structure for a pending transaction in the offline queue.
export interface PendingTransaction {
  id?: number;
  type: 'CREATE_POST' | 'PURCHASE_PRINT' | 'BACKUP_ROLL' | 'SYNC_PROFILE';
  payload: any;
  status: 'pending' | 'failed';
  created_at: string;
  attempts: number;
}

// Extends the base Roll type with a status for cloud synchronization.
export interface LocalRoll extends Roll {
  sync_status: 'local_only' | 'syncing' | 'synced';
}

// Extends the base Photo type for offline storage.
// A local photo will always have a `local_path`. The `url` and `thumbnail_url`
// fields will be populated after syncing with the cloud.
export interface LocalPhoto extends Omit<Photo, 'url' | 'thumbnail_url'> {
  local_path?: string;
  url?: string | null;
  thumbnail_url?: string | null;
}

// This class defines the database schema.
export class FilmiqueDB extends Dexie {
  rolls!: Table<LocalRoll>;
  photos!: Table<LocalPhoto>;
  profile!: Table<UserProfile>;
  pending_transactions!: Table<PendingTransaction>;

  constructor() {
    super('filmiqueDB');
    this.version(1).stores({
      // 'id' is the primary key. The other fields are indexed for faster queries.
      rolls: 'id, user_id, is_completed, sync_status, album_id',
      photos: 'id, roll_id, user_id, local_path',
      profile: 'id',
      // '++id' means it's an auto-incrementing primary key.
      pending_transactions: '++id, type, status, created_at',
    });
  }
}

export const db = new FilmiqueDB();