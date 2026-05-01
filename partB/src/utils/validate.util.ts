import { z } from 'zod';

// ISBN-13 checksum validation
function isValidISBN13(isbn: string): boolean {
  const digits = isbn.replace(/[-\s]/g, '');
  if (!/^\d{13}$/.test(digits)) return false;
  const sum = digits.split('').reduce((acc, d, i) => {
    return acc + parseInt(d) * (i % 2 === 0 ? 1 : 3);
  }, 0);
  return sum % 10 === 0;
}

// ISBN-10 checksum validation
function isValidISBN10(isbn: string): boolean {
  const digits = isbn.replace(/[-\s]/g, '');
  if (!/^\d{9}[\dX]$/.test(digits)) return false;
  const sum = digits.split('').reduce((acc, d, i) => {
    const val = d === 'X' ? 10 : parseInt(d);
    return acc + val * (10 - i);
  }, 0);
  return sum % 11 === 0;
}

export const isbnSchema = z.string().refine(
  (val) => isValidISBN13(val) || isValidISBN10(val),
  { message: 'Invalid ISBN-10 or ISBN-13' }
);

export const createBookSchema = z.object({
  isbn: isbnSchema,
  title: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  category: z.string().min(1).max(100).default('General'),
  quantity: z.number().int().min(1).max(9999).default(1),
});

export const updateBookSchema = createBookSchema.partial().omit({ isbn: true });

export const createMemberSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

export const createLoanSchema = z.object({
  book_id: z.number().int().positive(),
  member_id: z.number().int().positive(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'due_date must be YYYY-MM-DD'),
});

export const bookQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  available: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateBook = z.infer<typeof createBookSchema>;
export type UpdateBook = z.infer<typeof updateBookSchema>;
export type CreateMember = z.infer<typeof createMemberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;
export type CreateLoan = z.infer<typeof createLoanSchema>;
export type BookQuery = z.infer<typeof bookQuerySchema>;
