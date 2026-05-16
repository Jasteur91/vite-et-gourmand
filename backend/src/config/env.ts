import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  APP_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  MONGODB_URI: z.string().default(''),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM: z.string().email(),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Variables d\'environnement invalides:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
