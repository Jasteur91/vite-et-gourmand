import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors.js';

const router = Router();

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const { data, error } = await supabase
      .from('utilisateur')
      .select('utilisateur_id, email, nom, prenom, telephone, adresse_postale, ville, pays, role:role_id(libelle), created_at')
      .eq('utilisateur_id', req.user.sub).single();
    if (error || !data) throw new NotFoundError();
    res.json(data);
  }),
);

const updateMeSchema = z.object({
  nom: z.string().min(1).max(80).optional(),
  prenom: z.string().min(1).max(80).optional(),
  telephone: z.string().min(8).max(20).optional(),
  adresse_postale: z.string().min(3).max(255).optional(),
  ville: z.string().min(2).max(80).optional(),
  pays: z.string().min(2).max(80).optional(),
});

router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const body = updateMeSchema.parse(req.body);
    const { error } = await supabase.from('utilisateur').update(body).eq('utilisateur_id', req.user.sub);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  }),
);

const reviewSchema = z.object({
  commande_id: z.number().int().positive(),
  note: z.number().int().min(1).max(5),
  commentaire: z.string().max(2000).optional(),
});

router.post(
  '/reviews',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const body = reviewSchema.parse(req.body);

    const { data: cmd } = await supabase
      .from('commande').select('utilisateur_id, statut').eq('commande_id', body.commande_id).maybeSingle();
    if (!cmd) throw new NotFoundError();
    if (cmd.utilisateur_id !== req.user.sub) throw new ForbiddenError();
    if (cmd.statut !== 'terminee') throw new BadRequestError('Avis impossible avant la fin de la commande');

    const { data: existing } = await supabase
      .from('avis').select('avis_id').eq('commande_id', body.commande_id).maybeSingle();
    if (existing) throw new BadRequestError('Avis déjà donné');

    const { error } = await supabase.from('avis').insert({
      commande_id: body.commande_id, utilisateur_id: req.user.sub,
      note: body.note, commentaire: body.commentaire ?? null,
    });
    if (error) throw new Error(error.message);
    res.status(201).json({ ok: true });
  }),
);

router.get(
  '/reviews/public',
  asyncHandler(async (_req, res) => {
    const { data } = await supabase
      .from('avis')
      .select('note, commentaire, created_at, utilisateur:utilisateur_id(prenom)')
      .eq('statut', 'valide')
      .order('created_at', { ascending: false })
      .limit(20);
    res.json(data || []);
  }),
);

export default router;
