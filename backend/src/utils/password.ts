import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

/**
 * Politique mot de passe ECF :
 *   - 10 caractères minimum
 *   - ≥1 majuscule, ≥1 minuscule, ≥1 chiffre, ≥1 caractère spécial
 */
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

export function validatePasswordStrength(pwd: string): { ok: boolean; reason?: string } {
  if (pwd.length < 10) return { ok: false, reason: 'Le mot de passe doit faire au moins 10 caractères.' };
  if (!/[A-Z]/.test(pwd)) return { ok: false, reason: 'Il manque une majuscule.' };
  if (!/[a-z]/.test(pwd)) return { ok: false, reason: 'Il manque une minuscule.' };
  if (!/\d/.test(pwd)) return { ok: false, reason: 'Il manque un chiffre.' };
  if (!/[^A-Za-z0-9]/.test(pwd)) return { ok: false, reason: 'Il manque un caractère spécial.' };
  return { ok: true };
}

export const passwordSchemaRegex = PASSWORD_REGEX;

export async function hashPassword(pwd: string): Promise<string> {
  return bcrypt.hash(pwd, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(pwd: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pwd, hash);
}
