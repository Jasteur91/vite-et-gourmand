import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { supabase } from '../db/supabase.js';
import { hashPassword, verifyPassword, passwordSchemaRegex } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { emailService } from '../services/email.service.js';

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().regex(passwordSchemaRegex, 'Mot de passe trop faible (10 chars min, 1 maj, 1 min, 1 chiffre, 1 spécial)'),
  nom: z.string().min(1).max(80),
  prenom: z.string().min(1).max(80),
  telephone: z.string().min(8).max(20),
  adresse_postale: z.string().min(3).max(255),
  ville: z.string().min(2).max(80),
});

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const data = signupSchema.parse(req.body);

    const { data: existing } = await supabase
      .from('utilisateur').select('utilisateur_id').eq('email', data.email).maybeSingle();
    if (existing) throw new ConflictError('Email déjà utilisé');

    const { data: userRole } = await supabase
      .from('role').select('role_id').eq('libelle', 'utilisateur').single();
    if (!userRole) throw new Error('Rôle "utilisateur" manquant en BDD');

    const password_hash = await hashPassword(data.password);
    const { data: created, error } = await supabase
      .from('utilisateur')
      .insert({
        email: data.email,
        password_hash,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        adresse_postale: data.adresse_postale,
        ville: data.ville,
        role_id: userRole.role_id,
      })
      .select('utilisateur_id, email, prenom')
      .single();

    if (error || !created) throw new Error(error?.message || 'Création échouée');

    void emailService.welcome(created.email, created.prenom);

    const token = signToken({ sub: created.utilisateur_id, email: created.email, role: 'utilisateur' });
    res.status(201).json({ token, user: { id: created.utilisateur_id, email: created.email, prenom: created.prenom, role: 'utilisateur' } });
  }),
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);

    const { data: user } = await supabase
      .from('utilisateur')
      .select('utilisateur_id, email, password_hash, prenom, est_actif, role:role_id (libelle)')
      .eq('email', data.email)
      .maybeSingle();

    if (!user || !user.est_actif) throw new UnauthorizedError('Email ou mot de passe incorrect');

    const ok = await verifyPassword(data.password, user.password_hash);
    if (!ok) throw new UnauthorizedError('Email ou mot de passe incorrect');

    const roleLibelle = ((user.role as unknown as { libelle: string })?.libelle ?? 'utilisateur') as 'utilisateur' | 'employe' | 'administrateur';
    const token = signToken({ sub: user.utilisateur_id, email: user.email, role: roleLibelle });
    res.json({ token, user: { id: user.utilisateur_id, email: user.email, prenom: user.prenom, role: roleLibelle } });
  }),
);

const requestResetSchema = z.object({ email: z.string().email() });

router.post(
  '/request-reset',
  asyncHandler(async (req, res) => {
    const { email } = requestResetSchema.parse(req.body);

    const { data: user } = await supabase
      .from('utilisateur').select('utilisateur_id, prenom').eq('email', email).maybeSingle();

    // On répond toujours 200 pour ne pas révéler l'existence de l'email (sécurité)
    if (!user) return res.json({ ok: true });

    const token = crypto.randomBytes(48).toString('hex');
    const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await supabase.from('password_reset_token').insert({ utilisateur_id: user.utilisateur_id, token, expires_at });

    void emailService.passwordReset(email, { prenom: user.prenom, token });
    res.json({ ok: true });
  }),
);

const performResetSchema = z.object({
  token: z.string().min(32),
  password: z.string().regex(passwordSchemaRegex, 'Mot de passe trop faible'),
});

router.post(
  '/reset',
  asyncHandler(async (req, res) => {
    const { token, password } = performResetSchema.parse(req.body);

    const { data: rt } = await supabase
      .from('password_reset_token')
      .select('token_id, utilisateur_id, expires_at, used_at')
      .eq('token', token)
      .maybeSingle();

    if (!rt) throw new NotFoundError('Token invalide');
    if (rt.used_at) throw new BadRequestError('Token déjà utilisé');
    if (new Date(rt.expires_at).getTime() < Date.now()) throw new BadRequestError('Token expiré');

    const password_hash = await hashPassword(password);
    await supabase.from('utilisateur').update({ password_hash }).eq('utilisateur_id', rt.utilisateur_id);
    await supabase.from('password_reset_token').update({ used_at: new Date().toISOString() }).eq('token_id', rt.token_id);

    res.json({ ok: true });
  }),
);

export default router;
