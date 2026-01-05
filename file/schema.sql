-- file/schema.sql (Versi Final & Benar)
CREATE TABLE IF NOT EXISTS tg_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL UNIQUE,
    username TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    invitationCode TEXT NOT NULL DEFAULT '1I577P',
    apikey TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    phoneNumber TEXT NOT NULL,
    pin TEXT NOT NULL,
    invitationCode TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (customer_id) REFERENCES tg_users (id)
);