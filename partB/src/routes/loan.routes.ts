import { Router, Request, Response, NextFunction } from 'express';
import { LoanModel } from '../models/loan.model';
import { BookModel } from '../models/book.model';
import { MemberModel } from '../models/member.model';
import { createLoanSchema } from '../utils/validate.util';
import { AppError } from '../middleware/error.middleware';
import type { LoanStatus } from '../models/loan.model';

const router = Router();

/**
 * @openapi
 * /api/loans:
 *   get:
 *     summary: Get all loans
 *     tags: [Loans]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, returned, overdue] }
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    // Update overdue status first
    LoanModel.updateOverdue();
    const status = req.query.status as LoanStatus | undefined;
    const data = LoanModel.findAll(status);
    res.json({ success: true, data, meta: { total: data.length } });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/loans/{id}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Loans]
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const loan = LoanModel.findById(Number(req.params.id));
    if (!loan) throw new AppError(404, 'Loan not found');
    res.json({ success: true, data: loan });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/loans:
 *   post:
 *     summary: Borrow a book
 *     tags: [Loans]
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createLoanSchema.parse(req.body);

    // Validate book exists and is available
    const book = BookModel.findById(data.book_id);
    if (!book) throw new AppError(404, 'Book not found');
    if (!BookModel.checkAvailability(data.book_id)) {
      throw new AppError(409, 'Book is not available for loan', 'UNAVAILABLE');
    }

    // Validate member exists and is active
    const member = MemberModel.findById(data.member_id);
    if (!member) throw new AppError(404, 'Member not found');
    if (!member.is_active) throw new AppError(409, 'Member account is deactivated', 'INACTIVE_MEMBER');

    // Validate due_date is in the future
    if (data.due_date <= new Date().toISOString().split('T')[0]) {
      throw new AppError(400, 'due_date must be in the future');
    }

    const loan = LoanModel.create(data);
    res.status(201).json({ success: true, data: loan });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/loans/{id}/return:
 *   patch:
 *     summary: Return a borrowed book
 *     tags: [Loans]
 */
router.patch('/:id/return', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const loan = LoanModel.findById(id);
    if (!loan) throw new AppError(404, 'Loan not found');
    if (loan.status === 'returned') throw new AppError(409, 'Book already returned', 'ALREADY_RETURNED');
    const updated = LoanModel.returnLoan(id);
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/members/{memberId}/loans:
 *   get:
 *     summary: Get all loans for a member
 *     tags: [Loans]
 */
router.get('/member/:memberId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberId = Number(req.params.memberId);
    if (!MemberModel.findById(memberId)) throw new AppError(404, 'Member not found');
    const data = LoanModel.findByMember(memberId);
    res.json({ success: true, data, meta: { total: data.length } });
  } catch (e) { next(e); }
});

export default router;
