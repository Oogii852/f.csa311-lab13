import { getDb } from '../utils/db.util';
import type { CreateLoan } from '../utils/validate.util';

export type LoanStatus = 'active' | 'returned' | 'overdue';

export interface ILoan {
  id: number;
  book_id: number;
  member_id: number;
  loaned_at: string;
  due_date: string;
  returned_at: string | null;
  status: LoanStatus;
}

export const LoanModel = {
  findAll(status?: LoanStatus): ILoan[] {
    const where = status ? `WHERE status = ?` : '';
    const params = status ? [status] : [];
    return getDb().prepare(`SELECT * FROM loans ${where} ORDER BY loaned_at DESC`).all(...params) as ILoan[];
  },

  findById(id: number): ILoan | undefined {
    return getDb().prepare(`SELECT * FROM loans WHERE id = ?`).get(id) as ILoan | undefined;
  },

  findByMember(memberId: number): ILoan[] {
    return getDb().prepare(`SELECT * FROM loans WHERE member_id = ? ORDER BY loaned_at DESC`).all(memberId) as ILoan[];
  },

  create(data: CreateLoan): ILoan {
    const db = getDb();
    const loan = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO loans (book_id, member_id, due_date)
        VALUES (@book_id, @member_id, @due_date)
      `).run(data);
      db.prepare(`UPDATE books SET available_qty = available_qty - 1 WHERE id = ?`).run(data.book_id);
      return result.lastInsertRowid as number;
    })();
    return this.findById(loan)!;
  },

  returnLoan(id: number): ILoan | undefined {
    const db = getDb();
    db.transaction(() => {
      const loan = this.findById(id);
      if (!loan || loan.status !== 'active') return;
      db.prepare(`
        UPDATE loans SET returned_at = datetime('now'), status = 'returned' WHERE id = ?
      `).run(id);
      db.prepare(`UPDATE books SET available_qty = available_qty + 1 WHERE id = ?`).run(loan.book_id);
    })();
    return this.findById(id);
  },

  updateOverdue(): number {
    const result = getDb().prepare(`
      UPDATE loans SET status = 'overdue'
      WHERE status = 'active' AND due_date < date('now')
    `).run();
    return result.changes;
  },

  countOverdue(): number {
    const row = getDb().prepare(`SELECT COUNT(*) as cnt FROM loans WHERE status = 'overdue'`).get() as { cnt: number };
    return row.cnt;
  },
};
