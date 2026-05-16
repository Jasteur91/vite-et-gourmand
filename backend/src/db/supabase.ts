import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Client Supabase (PostgreSQL hébergé).
 * RLS désactivé côté tables — l'auth est gérée par notre JWT custom dans le middleware.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
