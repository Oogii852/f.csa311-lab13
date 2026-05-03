import { Router, Request, Response, NextFunction } from 'express';
import { getDb } from '../utils/db.util';
import { LoanModel } from '../models/loan.model';

const router = Router();

/**
 * @openapi
 * /api/stats:
 *   get:
 *     summary: Get library statistics
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Library dashboard statistics
 */
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    LoanModel.updateOverdue();
    const db = getDb();

    const totalBooks = (db.prepare(`SELECT COUNT(*) as cnt FROM books`).get() as { cnt: number }).cnt;
    const totalMembers = (db.prepare(`SELECT COUNT(*) as cnt FROM members WHERE is_active = 1`).get() as { cnt: number }).cnt;
    const activeLoans = (db.prepare(`SELECT COUNT(*) as cnt FROM loans WHERE status = 'active'`).get() as { cnt: number }).cnt;
    const overdueLoans = LoanModel.countOverdue();
    const totalLoans = (db.prepare(`SELECT COUNT(*) as cnt FROM loans`).get() as { cnt: number }).cnt;
    const returnedLoans = (db.prepare(`SELECT COUNT(*) as cnt FROM loans WHERE status = 'returned'`).get() as { cnt: number }).cnt;
    const availableBooks = (db.prepare(`SELECT SUM(available_qty) as cnt FROM books`).get() as { cnt: number }).cnt || 0;

    const topBorrowed = db.prepare(`
      SELECT b.title, b.author, COUNT(l.id) as loan_count
      FROM loans l JOIN books b ON l.book_id = b.id
      GROUP BY b.id ORDER BY loan_count DESC LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        books: { total: totalBooks, available: availableBooks },
        members: { active: totalMembers },
        loans: { active: activeLoans, overdue: overdueLoans, returned: returnedLoans, total: totalLoans },
        topBorrowed,
      },
    });
  } catch (e) { next(e); }
});

export default router;
