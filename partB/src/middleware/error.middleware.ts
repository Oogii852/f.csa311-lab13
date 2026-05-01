import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public statusCode: number, message: string, public code?: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    res.status(400).json({ success: false, error: 'Validation failed', details: JSON.parse(err.message) });
    return;
  }

  // SQLite unique constraint
  if ((err as NodeJS.ErrnoException).code === 'SQLITE_CONSTRAINT_UNIQUE') {
    res.status(409).json({ success: false, error: 'Duplicate entry — record already exists', code: 'DUPLICATE' });
    return;
  }

  console.error('[ERROR]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}
