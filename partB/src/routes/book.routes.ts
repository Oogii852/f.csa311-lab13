import { Router, Request, Response, NextFunction } from 'express';
import { BookModel } from '../models/book.model';
import { createBookSchema, updateBookSchema, bookQuerySchema } from '../utils/validate.util';
import { AppError } from '../middleware/error.middleware';

const router = Router();

/**
 * @openapi
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: available
 *         schema: { type: string, enum: [true, false] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of books
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = bookQuerySchema.parse(req.query);
    const { data, total } = BookModel.findAll(query);
    res.json({
      success: true,
      data,
      meta: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) },
    });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = BookModel.findById(Number(req.params.id));
    if (!book) throw new AppError(404, 'Book not found');
    res.json({ success: true, data: book });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createBookSchema.parse(req.body);
    if (BookModel.findByIsbn(data.isbn)) throw new AppError(409, 'ISBN already exists', 'DUPLICATE');
    const book = BookModel.create(data);
    res.status(201).json({ success: true, data: book });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/books/{id}:
 *   patch:
 *     summary: Update a book
 *     tags: [Books]
 */
router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!BookModel.findById(id)) throw new AppError(404, 'Book not found');
    const data = updateBookSchema.parse(req.body);
    const book = BookModel.update(id, data);
    res.json({ success: true, data: book });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 */
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!BookModel.findById(id)) throw new AppError(404, 'Book not found');
    BookModel.delete(id);
    res.json({ success: true, data: null });
  } catch (e) { next(e); }
});

export default router;
