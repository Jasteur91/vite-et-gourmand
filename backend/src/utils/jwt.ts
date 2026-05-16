import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type JWTPayload = {
  sub: number;          // utilisateur_id
  email: string;
  role: 'utilisateur' | 'employe' | 'administrateur';
};

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as unknown as JWTPayload;
}
