import { Router, Request, Response, NextFunction } from 'express';
import { MemberModel } from '../models/member.model';
import { createMemberSchema, updateMemberSchema } from '../utils/validate.util';
import { AppError } from '../middleware/error.middleware';

const router = Router();

/**
 * @openapi
 * /api/members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema: { type: string, enum: [true, false] }
 *     responses:
 *       200:
 *         description: List of members
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOnly = req.query.active === 'true';
    const data = MemberModel.findAll(activeOnly);
    res.json({ success: true, data, meta: { total: data.length } });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/members/{id}:
 *   get:
 *     summary: Get member by ID
 *     tags: [Members]
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = MemberModel.findById(Number(req.params.id));
    if (!member) throw new AppError(404, 'Member not found');
    res.json({ success: true, data: member });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/members:
 *   post:
 *     summary: Register a new member
 *     tags: [Members]
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createMemberSchema.parse(req.body);
    if (MemberModel.findByEmail(data.email)) {
      throw new AppError(409, 'Email already registered', 'DUPLICATE');
    }
    const member = MemberModel.create(data);
    res.status(201).json({ success: true, data: member });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/members/{id}:
 *   patch:
 *     summary: Update member info
 *     tags: [Members]
 */
router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!MemberModel.findById(id)) throw new AppError(404, 'Member not found');
    const data = updateMemberSchema.parse(req.body);
    const member = MemberModel.update(id, data);
    res.json({ success: true, data: member });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/members/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a member
 *     tags: [Members]
 */
router.patch('/:id/deactivate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!MemberModel.findById(id)) throw new AppError(404, 'Member not found');
    const member = MemberModel.setActive(id, false);
    res.json({ success: true, data: member });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/members/{id}/activate:
 *   patch:
 *     summary: Activate a member
 *     tags: [Members]
 */
router.patch('/:id/activate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!MemberModel.findById(id)) throw new AppError(404, 'Member not found');
    const member = MemberModel.setActive(id, true);
    res.json({ success: true, data: member });
  } catch (e) { next(e); }
});

export default router;
