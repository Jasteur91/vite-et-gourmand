import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireEmployee } from '../middleware/auth.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const router = Router();

/* ============================================================
 *  Routes publiques : liste menus + filtres dynamiques + détail
 * ============================================================ */

const listQuerySchema = z.object({
  prix_max: z.coerce.number().positive().optional(),
  prix_min: z.coerce.number().positive().optional(),
  theme: z.string().optional(),
  regime: z.string().optional(),
  nb_personnes_min: z.coerce.number().positive().optional(),
  search: z.string().optional(),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filters = listQuerySchema.parse(req.query);

    let query = supabase
      .from('menu')
      .select(`
        menu_id, titre, description, prix_par_personne, nombre_personne_minimum,
        quantite_restante, galerie_urls, conditions,
        theme:theme_id (theme_id, libelle),
        menu_regime ( regime:regime_id ( regime_id, libelle ) )
      `)
      .eq('est_actif', true)
      .gt('quantite_restante', 0);

    if (filters.prix_max) query = query.lte('prix_par_personne', filters.prix_max);
    if (filters.prix_min) query = query.gte('prix_par_personne', filters.prix_min);
    if (filters.nb_personnes_min) query = query.lte('nombre_personne_minimum', filters.nb_personnes_min);
    if (filters.search) query = query.ilike('titre', `%${filters.search}%`);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    let menus = data || [];

    // Filtres theme + regime côté backend (Supabase relationships filtering)
    if (filters.theme) {
      menus = menus.filter((m: any) => m.theme?.libelle === filters.theme);
    }
    if (filters.regime) {
      menus = menus.filter((m: any) =>
        (m.menu_regime || []).some((mr: any) => mr.regime?.libelle === filters.regime),
      );
    }

    res.json(menus);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new BadRequestError('ID invalide');

    const { data, error } = await supabase
      .from('menu')
      .select(`
        *,
        theme:theme_id (theme_id, libelle),
        menu_regime ( regime:regime_id ( regime_id, libelle ) ),
        menu_plat (
          plat:plat_id (
            plat_id, libelle, description, type, photo_url,
            plat_allergene ( allergene:allergene_id ( allergene_id, libelle ) )
          )
        )
      `)
      .eq('menu_id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new NotFoundError('Menu introuvable');
    res.json(data);
  }),
);

/* ============================================================
 *  Routes employé/admin : CRUD menus
 * ============================================================ */

const upsertSchema = z.object({
  titre: z.string().min(1).max(120),
  description: z.string().optional(),
  theme_id: z.number().int().positive(),
  nombre_personne_minimum: z.number().int().positive(),
  prix_par_personne: z.number().positive(),
  conditions: z.string().optional(),
  quantite_restante: z.number().int().nonnegative(),
  galerie_urls: z.array(z.string().url()).default([]),
  est_actif: z.boolean().default(true),
  plat_ids: z.array(z.number().int().positive()).default([]),
  regime_ids: z.array(z.number().int().positive()).default([]),
});

router.post(
  '/',
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const body = upsertSchema.parse(req.body);
    const { plat_ids, regime_ids, ...menuFields } = body;

    const { data: created, error } = await supabase
      .from('menu').insert(menuFields).select('menu_id').single();
    if (error || !created) throw new Error(error?.message || 'Création échouée');

    if (plat_ids.length > 0) {
      await supabase.from('menu_plat').insert(plat_ids.map((p) => ({ menu_id: created.menu_id, plat_id: p })));
    }
    if (regime_ids.length > 0) {
      await supabase.from('menu_regime').insert(regime_ids.map((r) => ({ menu_id: created.menu_id, regime_id: r })));
    }

    res.status(201).json({ menu_id: created.menu_id });
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
    const { plat_ids, regime_ids, ...menuFields } = body;

    if (Object.keys(menuFields).length > 0) {
      const { error } = await supabase.from('menu').update(menuFields).eq('menu_id', id);
      if (error) throw new Error(error.message);
    }

    if (plat_ids) {
      await supabase.from('menu_plat').delete().eq('menu_id', id);
      if (plat_ids.length > 0) {
        await supabase.from('menu_plat').insert(plat_ids.map((p) => ({ menu_id: id, plat_id: p })));
      }
    }
    if (regime_ids) {
      await supabase.from('menu_regime').delete().eq('menu_id', id);
      if (regime_ids.length > 0) {
        await supabase.from('menu_regime').insert(regime_ids.map((r) => ({ menu_id: id, regime_id: r })));
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
    const { error } = await supabase.from('menu').update({ est_actif: false }).eq('menu_id', id);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  }),
);

/* ============================================================
 *  Référentiels publics
 * ============================================================ */

router.get('/ref/themes', asyncHandler(async (_req, res) => {
  const { data } = await supabase.from('theme').select('*').order('theme_id');
  res.json(data || []);
}));

router.get('/ref/regimes', asyncHandler(async (_req, res) => {
  const { data } = await supabase.from('regime').select('*').order('regime_id');
  res.json(data || []);
}));

router.get('/ref/allergenes', asyncHandler(async (_req, res) => {
  const { data } = await supabase.from('allergene').select('*').order('allergene_id');
  res.json(data || []);
}));

router.get('/ref/horaires', asyncHandler(async (_req, res) => {
  const { data } = await supabase.from('horaire').select('*').order('horaire_id');
  res.json(data || []);
}));

export default router;
