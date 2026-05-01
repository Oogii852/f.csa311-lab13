import { getDb } from '../utils/db.util';
import type { CreateBook, UpdateBook, BookQuery } from '../utils/validate.util';

export interface IBook {
  id: number;
  isbn: string;
  title: string;
  author: string;
  category: string;
  quantity: number;
  available_qty: number;
  created_at: string;
}

export const BookModel = {
  findAll(query: BookQuery): { data: IBook[]; total: number } {
    const db = getDb();
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (query.q) {
      conditions.push(`(title LIKE ? OR author LIKE ? OR isbn LIKE ?)`);
      const like = `%${query.q}%`;
      params.push(like, like, like);
    }
    if (query.category) {
      conditions.push(`category = ?`);
      params.push(query.category);
    }
    if (query.available === 'true') {
      conditions.push(`available_qty > 0`);
    } else if (query.available === 'false') {
      conditions.push(`available_qty = 0`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) as cnt FROM books ${where}`).get(...params) as { cnt: number }).cnt;
    const offset = (query.page - 1) * query.limit;
    const data = db.prepare(`SELECT * FROM books ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, query.limit, offset) as IBook[];

    return { data, total };
  },

  findById(id: number): IBook | undefined {
    return getDb().prepare(`SELECT * FROM books WHERE id = ?`).get(id) as IBook | undefined;
  },

  findByIsbn(isbn: string): IBook | undefined {
    return getDb().prepare(`SELECT * FROM books WHERE isbn = ?`).get(isbn) as IBook | undefined;
  },

  create(data: CreateBook): IBook {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO books (isbn, title, author, category, quantity, available_qty)
      VALUES (@isbn, @title, @author, @category, @quantity, @quantity)
    `);
    const result = stmt.run(data);
    return this.findById(result.lastInsertRowid as number)!;
  },

  update(id: number, data: UpdateBook): IBook | undefined {
    const db = getDb();
    const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
    if (!fields) return this.findById(id);
    db.prepare(`UPDATE books SET ${fields} WHERE id = @id`).run({ ...data, id });
    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = getDb().prepare(`DELETE FROM books WHERE id = ?`).run(id);
    return result.changes > 0;
  },

  checkAvailability(id: number): boolean {
    const book = this.findById(id);
    return !!book && book.available_qty > 0;
  },
};
