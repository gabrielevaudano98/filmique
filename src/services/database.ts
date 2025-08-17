import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';

class DatabaseService {
  private db: SQLiteDBConnection | null = null;
  private sqlite: SQLiteConnection | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'web') {
        // Ensure the jeep-sqlite element is only added once
        if (!document.querySelector('jeep-sqlite')) {
          const jeepSqliteEl = document.createElement('jeep-sqlite');
          document.body.appendChild(jeepSqliteEl);
          await customElements.whenDefined('jeep-sqlite');
          await CapacitorSQLite.initWebStore();
        }
      }

      this.sqlite = new SQLiteConnection(CapacitorSQLite);
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (ret.result && ret.result._isConsistent) || false;

      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection('filmique-db', false);
      } else {
        this.db = await this.sqlite.createConnection('filmique-db', false, 'no-encryption', 1, false);
      }

      await this.db.open();
      // We will create tables in the next step.
      console.log("Database connection opened successfully.");
      this.isInitialized = true;
    } catch (err) {
      console.error("Failed to initialize database service", err);
      throw err;
    }
  }

  getDb(): SQLiteDBConnection {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }
}

export const dbService = new DatabaseService();