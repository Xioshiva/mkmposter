import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'mkm_collection.db');

export class DatabaseManager {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Create cards table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        set_name TEXT,
        rarity TEXT,
        condition TEXT DEFAULT 'Near Mint',
        language TEXT DEFAULT 'English',
        foil BOOLEAN DEFAULT false,
        quantity INTEGER DEFAULT 1,
        purchase_price REAL,
        current_price REAL,
        recommended_price REAL,
        last_price_update DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create price history table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT NOT NULL,
        price REAL NOT NULL,
        source TEXT DEFAULT 'MKM',
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards (card_id)
      )
    `);

    // Create MKM sync log table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        card_id TEXT,
        status TEXT NOT NULL,
        message TEXT,
        synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Card operations
  async addCard(cardData: {
    card_id: string;
    name: string;
    set_name?: string;
    rarity?: string;
    condition?: string;
    language?: string;
    foil?: boolean;
    quantity?: number;
    purchase_price?: number;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO cards 
        (card_id, name, set_name, rarity, condition, language, foil, quantity, purchase_price, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run([
        cardData.card_id,
        cardData.name,
        cardData.set_name || null,
        cardData.rarity || null,
        cardData.condition || 'Near Mint',
        cardData.language || 'English',
        cardData.foil || false,
        cardData.quantity || 1,
        cardData.purchase_price || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
      
      stmt.finalize();
    });
  }

  async getAllCards(): Promise<Array<{
    id: number;
    card_id: string;
    name: string;
    set_name?: string;
    rarity?: string;
    condition: string;
    language: string;
    foil: boolean;
    quantity: number;
    purchase_price?: number;
    current_price?: number;
    recommended_price?: number;
    last_price_update?: string;
    created_at: string;
    updated_at: string;
  }>> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM cards ORDER BY name', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Array<{
            id: number;
            card_id: string;
            name: string;
            set_name?: string;
            rarity?: string;
            condition: string;
            language: string;
            foil: boolean;
            quantity: number;
            purchase_price?: number;
            current_price?: number;
            recommended_price?: number;
            last_price_update?: string;
            created_at: string;
            updated_at: string;
          }>);
        }
      });
    });
  }

  async updateCardPrice(cardId: string, currentPrice: number, recommendedPrice?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE cards 
        SET current_price = ?, recommended_price = ?, last_price_update = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE card_id = ?
      `);
      
      stmt.run([currentPrice, recommendedPrice || currentPrice, cardId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
      
      stmt.finalize();
    });
  }

  async addPriceHistory(cardId: string, price: number, source: string = 'MKM'): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO price_history (card_id, price, source)
        VALUES (?, ?, ?)
      `);
      
      stmt.run([cardId, price, source], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
      
      stmt.finalize();
    });
  }

  async logSync(action: string, cardId?: string, status: string = 'success', message?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO sync_log (action, card_id, status, message)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run([action, cardId || null, status, message || null], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
      
      stmt.finalize();
    });
  }

  close(): void {
    this.db.close();
  }
}

let dbManager: DatabaseManager | null = null;

export function getDatabase(): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager();
  }
  return dbManager;
}