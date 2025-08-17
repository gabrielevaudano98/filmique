import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Roll, Photo, UserProfile, PendingTransaction } from '../types';

const DB_NAME = 'filmique_db';

class DatabaseService {
  private db: SQLiteDBConnection | null = null;
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);

  async initializeDatabase() {
    if (this.db) return;
    try {
      this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
      await this.db.open();
      await this.createSchema();
      console.log('Database initialized successfully.');
    } catch (e) {
      console.error('Error initializing database', e);
      throw e;
    }
  }

  private async createSchema() {
    const schema = `
      CREATE TABLE IF NOT EXISTS rolls (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        film_type TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        shots_used INTEGER NOT NULL,
        is_completed BOOLEAN NOT NULL,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        developed_at TEXT,
        title TEXT,
        album_id TEXT,
        aspect_ratio TEXT NOT NULL,
        is_archived BOOLEAN NOT NULL,
        tags TEXT,
        sync_status TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        roll_id TEXT NOT NULL,
        url TEXT,
        thumbnail_url TEXT,
        local_path TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS profile (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `;
    await this.db?.execute(schema);
  }

  // --- Roll Operations ---
  async getRolls(userId: string): Promise<Roll[]> {
    const res = await this.db?.query('SELECT * FROM rolls WHERE user_id = ?', [userId]);
    const rolls = res?.values || [];
    for (const roll of rolls) {
      const photosRes = await this.db?.query('SELECT * FROM photos WHERE roll_id = ?', [roll.id]);
      roll.photos = photosRes?.values || [];
      roll.tags = roll.tags ? JSON.parse(roll.tags) : [];
    }
    return rolls;
  }

  async saveRoll(roll: Roll) {
    const { photos, ...rollData } = roll;
    const tags = JSON.stringify(rollData.tags || []);
    await this.db?.query(
      'INSERT OR REPLACE INTO rolls (id, user_id, film_type, capacity, shots_used, is_completed, created_at, completed_at, developed_at, title, album_id, aspect_ratio, is_archived, tags, sync_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [rollData.id, rollData.user_id, rollData.film_type, rollData.capacity, rollData.shots_used, rollData.is_completed, rollData.created_at, rollData.completed_at, rollData.developed_at, rollData.title, rollData.album_id, rollData.aspect_ratio, rollData.is_archived, tags, rollData.sync_status]
    );
    if (photos) {
      for (const photo of photos) {
        await this.savePhoto(photo);
      }
    }
  }

  // --- Photo Operations ---
  async savePhoto(photo: Photo) {
    const metadata = JSON.stringify(photo.metadata || {});
    await this.db?.query(
      'INSERT OR REPLACE INTO photos (id, user_id, roll_id, url, thumbnail_url, local_path, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [photo.id, photo.user_id, photo.roll_id, photo.url, photo.thumbnail_url, photo.local_path, metadata, photo.created_at]
    );
  }

  // --- Transaction Operations ---
  async addTransaction(type: string, payload: any) {
    const payloadStr = JSON.stringify(payload);
    await this.db?.query(
      'INSERT INTO transactions (type, payload, status, created_at) VALUES (?, ?, ?, ?)',
      [type, payloadStr, 'pending', new Date().toISOString()]
    );
  }

  async getPendingTransactions(): Promise<PendingTransaction[]> {
    const res = await this.db?.query("SELECT * FROM transactions WHERE status = 'pending' ORDER BY id ASC");
    return (res?.values || []).map(t => ({ ...t, payload: JSON.parse(t.payload) }));
  }

  async deleteTransaction(id: number) {
    await this.db?.query('DELETE FROM transactions WHERE id = ?', [id]);
  }

  // --- Profile Cache ---
  async cacheProfile(profile: UserProfile) {
    await this.db?.query('INSERT OR REPLACE INTO profile (id, data) VALUES (?, ?)', [profile.id, JSON.stringify(profile)]);
  }

  async getCachedProfile(userId: string): Promise<UserProfile | null> {
    const res = await this.db?.query('SELECT data FROM profile WHERE id = ?', [userId]);
    return res?.values?.[0] ? JSON.parse(res.values[0].data) : null;
  }
}

export const dbService = new DatabaseService();