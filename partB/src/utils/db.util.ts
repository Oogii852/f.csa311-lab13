import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../library.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    migrate(db);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = undefined as unknown as Database.Database;
  }
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      isbn         TEXT    UNIQUE NOT NULL,
      title        TEXT    NOT NULL,
      author       TEXT    NOT NULL,
      category     TEXT    NOT NULL DEFAULT 'General',
      quantity     INTEGER NOT NULL DEFAULT 1,
      available_qty INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS members (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT NOT NULL,
      email     TEXT UNIQUE NOT NULL,
      phone     TEXT,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS loans (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id     INTEGER NOT NULL REFERENCES books(id),
      member_id   INTEGER NOT NULL REFERENCES members(id),
      loaned_at   TEXT NOT NULL DEFAULT (datetime('now')),
      due_date    TEXT NOT NULL,
      returned_at TEXT,
      status      TEXT NOT NULL DEFAULT 'active'
    );

    CREATE INDEX IF NOT EXISTS idx_loans_book_id   ON loans(book_id);
    CREATE INDEX IF NOT EXISTS idx_loans_member_id ON loans(member_id);
    CREATE INDEX IF NOT EXISTS idx_loans_status    ON loans(status);
    CREATE INDEX IF NOT EXISTS idx_books_isbn      ON books(isbn);
  `);
}
