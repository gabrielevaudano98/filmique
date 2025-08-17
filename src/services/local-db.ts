import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const DB_NAME = 'filmique_local_db';

class LocalDatabaseService {
  private db: SQLiteDBConnection | null = null;
  private sqlite: SQLiteConnection | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const platform = Capacitor.getPlatform();
      this.sqlite = new SQLiteConnection(CapacitorSQLite);

      if (platform === 'web') {
        await this.sqlite.initWebStore();
      }

      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;

      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
      }

      await this.db.open();
      await this.createSchema();
      this.isInitialized = true;
      console.log('Local database initialized successfully.');
    } catch (err) {
      console.error('Error initializing local database:', err);
      throw err;
    }
  }

  private async createSchema() {
    if (!this.db) throw new Error('Database not initialized.');

    const schema = `
      CREATE TABLE IF NOT EXISTS rolls (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        film_type TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        shots_used INTEGER NOT NULL DEFAULT 0,
        is_completed BOOLEAN NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        developed_at TEXT,
        title TEXT,
        album_id TEXT,
        aspect_ratio TEXT NOT NULL DEFAULT '3:2',
        is_archived BOOLEAN NOT NULL DEFAULT 0,
        tags TEXT,
        sync_status TEXT NOT NULL DEFAULT 'local_only' CHECK(sync_status IN ('local_only', 'syncing', 'synced'))
      );

      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        roll_id TEXT NOT NULL,
        local_path TEXT,
        remote_url TEXT,
        thumbnail_url TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS profile_cache (
        id TEXT PRIMARY KEY NOT NULL,
        profile_data TEXT NOT NULL,
        local_credits INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pending_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'failed', 'success')),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now'))
      );
    `;

    await this.db.execute(schema);
  }

  public getDB() {
    if (!this.db) throw new Error('Database not initialized.');
    return this.db;
  }
}

export const LocalDB = new LocalDatabaseService();