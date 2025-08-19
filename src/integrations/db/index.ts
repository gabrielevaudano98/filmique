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
    this.version(6).stores({
      rolls: 'id, user_id, is_completed, sync_status, album_id, [user_id+is_completed]',
    }).upgrade(async tx => {
      // Ensure is_completed is stored as a number (0 or 1) for reliable indexing.
      return tx.table('rolls').toCollection().modify(roll => {
        if (typeof roll.is_completed === 'boolean') {
          roll.is_completed = roll.is_completed ? 1 : 0;
        }
      });
    });
    this.version(5).stores({
      rolls: 'id, user_id, is_completed, sync_status, album_id, [user_id+is_completed]',
    }).upgrade(async tx => {
      // Migrate is_completed from number (0/1) back to boolean
      return tx.table('rolls').toCollection().modify(roll => {
        roll.is_completed = !!roll.is_completed; // Converts 1 to true, 0 to false
      });
    });
    this.version(4).stores({
      rolls: 'id, user_id, is_completed, sync_status, album_id, [user_id+is_completed]',
    }).upgrade(async tx => {
      // Migrate is_completed from boolean to number (0 or 1)
      return tx.table('rolls').toCollection().modify(roll => {
        roll.is_completed = roll.is_completed ? 1 : 0;
      });
    });
    this.version(3).stores({
      rolls: 'id, user_id, is_completed, sync_status, album_id, [user_id+is_completed]', // Added compound index
    });
    this.version(2).stores({
      // 'id' is the primary key. The other fields are indexed for faster queries.
      rolls: 'id, user_id, is_completed, sync_status, album_id',
      photos: 'id, roll_id, user_id, local_path',
      profile: 'id',
      // '++id' means it's an auto-incrementing primary key.
      pending_transactions: '++id, type, status, created_at',
      photo_blobs: 'photo_id', // New table for storing image blobs
    }).upgrade(tx => {
      // This upgrade function is empty because we are just adding a new table.
      // Dexie handles this automatically. If we were changing an existing table,
      // we would put the migration logic here.
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