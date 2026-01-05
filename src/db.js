// src/db.js - Webhook version for Vercel
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// For Vercel serverless, use in-memory database
let db;
let isSetup = false;

function setupDatabase() {
    if (isSetup) return;
    
    try {
        // Try to use file-based database first
        const dbDir = path.join('/tmp', 'file');
        const dbPath = path.join(dbDir, 'database.db');

        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // Check if schema exists
        const schemaPath = path.join(process.cwd(), 'file', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            db = new Database(dbPath);
            const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tg_users'").get();
            if (!tableCheck) {
                console.log("Creating database tables...");
                const schema = fs.readFileSync(schemaPath, 'utf8');
                db.exec(schema);
                console.log("Database setup complete.");
            }
            console.log(`✅ SQLite connected at: ${dbPath}`);
        } else {
            console.log("⚠️ Schema file not found, using in-memory database");
            db = new Database(':memory:');
            createInMemoryTables();
        }
    } catch (error) {
        console.error("⚠️ Failed to setup file database, using in-memory:", error.message);
        db = new Database(':memory:');
        createInMemoryTables();
    }
    
    isSetup = true;
}

function createInMemoryTables() {
    console.log("Creating in-memory database tables...");
    const schema = `
        CREATE TABLE IF NOT EXISTS tg_users (
            telegram_id INTEGER PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            username TEXT,
            apikey TEXT,
            invitationCode TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            phoneNumber TEXT,
            pin TEXT,
            invitationCode TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;
    db.exec(schema);
    console.log("In-memory database ready.");
}

export const getDb = () => {
    if (!db) {
        setupDatabase();
    }
    return db;
};

export function getUser(telegramId) {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM tg_users WHERE telegram_id = ?');
    return stmt.get(telegramId);
}

export function upsertUser(telegramId, firstName, lastName, username) {
    const database = getDb();
    const upsertStmt = database.prepare(`
        INSERT INTO tg_users (telegram_id, first_name, last_name, username)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(telegram_id) DO UPDATE SET
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          username = excluded.username,
          updated_at = CURRENT_TIMESTAMP
    `);

    const existingUser = getUser(telegramId);
    const isNew = !existingUser;

    upsertStmt.run(telegramId, firstName, lastName || null, username || null);

    const user = getUser(telegramId);
    return { user, isNew };
}

// Initialize database on import
setupDatabase();