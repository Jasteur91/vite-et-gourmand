export class AppError extends Error {
  constructor(public statusCode: number, message: string, public details?: unknown) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError { constructor(m = 'Requête invalide', d?: unknown) { super(400, m, d); } }
export class UnauthorizedError extends AppError { constructor(m = 'Non authentifié') { super(401, m); } }
export class ForbiddenError extends AppError { constructor(m = 'Action interdite') { super(403, m); } }
export class NotFoundError extends AppError { constructor(m = 'Ressource introuvable') { super(404, m); } }
export class ConflictError extends AppError { constructor(m = 'Conflit') { super(409, m); } }
