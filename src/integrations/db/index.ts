import Dexie, { Table } from 'dexie';
import { Roll, Photo, UserProfile } from '../../types';

// Defines the structure for a pending transaction in the offline queue.
export interface PendingTransaction {
  id?: number;
  type: 'CREATE_POST' | 'PURCHASE_PRINT' | 'BACKUP_ROLL' | 'SYNC_PROFILE' | 'DELETE_ROLL';
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

export interface PhotoBlob {
  photo_id: string;
  blob: Blob;
}

// This class defines the database schema.
export class FilmiqueDB extends Dexie {
  rolls!: Table<LocalRoll>;
  photos!: Table<LocalPhoto>;
  profile!: Table<UserProfile>;
  pending_transactions!: Table<PendingTransaction>;
  photo_blobs!: Table<PhotoBlob>;

  constructor() {
    super('filmiqueDB');
    this.version(3).stores({
      rolls: 'id, user_id, is_completed, sync_status, album_id, [user_id+is_completed]',
      photos: 'id, roll_id, user_id, local_path',
      profile: 'id',
      pending_transactions: '++id, type, status, created_at',
      photo_blobs: 'photo_id',
    });
    
    this.version(2).stores({
      rolls: 'id, user_id, is_completed, sync_status, album_id',
      photos: 'id, roll_id, user_id, local_path',
      profile: 'id',
      pending_transactions: '++id, type, status, created_at',
      photo_blobs: 'photo_id',
    }).upgrade(tx => {
      return tx.table('photo_blobs').clear();
    });

    this.version(1).stores({
      rolls: 'id, user_id, is_completed, sync_status, album_id',
      photos: 'id, roll_id, user_id, local_path',
      profile: 'id',
      pending_transactions: '++id, type, status, created_at',
    });
  }
}

export const db = new FilmiqueDB();