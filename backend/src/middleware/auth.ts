import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JWTPayload } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Token manquant');

  try {
    const token = header.slice(7);
    req.user = verifyToken(token);
    next();
  } catch {
    throw new UnauthorizedError('Token invalide ou expiré');
  }
}

export function requireRole(...roles: Array<JWTPayload['role']>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) throw new ForbiddenError('Rôle insuffisant');
    next();
  };
}

export const requireEmployee = requireRole('employe', 'administrateur');
export const requireAdmin = requireRole('administrateur');
