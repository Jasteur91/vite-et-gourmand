import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireEmployee } from '../middleware/auth.js';
import { BadRequestError } from '../utils/errors.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('plat')
      .select('*, plat_allergene ( allergene:allergene_id (allergene_id, libelle) )')
      .order('libelle');
    if (error) throw new Error(error.message);
    res.json(data || []);
  }),
);

const upsertSchema = z.object({
  libelle: z.string().min(1).max(120),
  description: z.string().optional(),
  type: z.enum(['entree', 'plat', 'dessert']),
  photo_url: z.string().url().optional().nullable(),
  allergene_ids: z.array(z.number().int().positive()).default([]),
});

router.post(
  '/',
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const body = upsertSchema.parse(req.body);
    const { allergene_ids, ...platFields } = body;

    const { data: created, error } = await supabase
      .from('plat').insert(platFields).select('plat_id').single();
    if (error || !created) throw new Error(error?.message || 'Création échouée');

    if (allergene_ids.length > 0) {
      await supabase.from('plat_allergene').insert(allergene_ids.map((a) => ({ plat_id: created.plat_id, allergene_id: a })));
    }
    res.status(201).json({ plat_id: created.plat_id });
  }),
);

router.patch(
  '/:id',
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new BadRequestError('ID invalide');
    const body = upsertSchema.partial().parse(req.body);
    const { allergene_ids, ...platFields } = body;

    if (Object.keys(platFields).length > 0) {
      const { error } = await supabase.from('plat').update(platFields).eq('plat_id', id);
      if (error) throw new Error(error.message);
    }

    if (allergene_ids) {
      await supabase.from('plat_allergene').delete().eq('plat_id', id);
      if (allergene_ids.length > 0) {
        await supabase.from('plat_allergene').insert(allergene_ids.map((a) => ({ plat_id: id, allergene_id: a })));
      }
    }

    res.json({ ok: true });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new BadRequestError('ID invalide');
    const { error } = await supabase.from('plat').delete().eq('plat_id', id);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  }),
);

export default router;
