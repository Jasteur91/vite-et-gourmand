import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrap d'une route async pour capturer les rejets et les router vers le error middleware.
 */
export const asyncHandler =
  <T extends RequestHandler>(fn: T): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
