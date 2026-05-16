import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireAdmin, requireEmployee } from '../middleware/auth.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors.js';
import { hashPassword, passwordSchemaRegex } from '../utils/password.js';
import { emailService } from '../services/email.service.js';
import { audit } from '../services/audit.service.js';

const router = Router();

/* ============================================================
 *  Gestion comptes employés (admin only)
 * ============================================================ */

const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().regex(passwordSchemaRegex),
  nom: z.string().min(1).max(80),
  prenom: z.string().min(1).max(80),
});

router.post(
  '/employees',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const body = createEmployeeSchema.parse(req.body);

    const { data: existing } = await supabase
      .from('utilisateur').select('utilisateur_id').eq('email', body.email).maybeSingle();
    if (existing) throw new ConflictError('Email déjà utilisé');

    const { data: role } = await supabase.from('role').select('role_id').eq('libelle', 'employe').single();
    if (!role) throw new Error('Rôle "employe" manquant');

    const password_hash = await hashPassword(body.password);
    const { data: created, error } = await supabase
      .from('utilisateur').insert({
        email: body.email, password_hash, nom: body.nom, prenom: body.prenom, role_id: role.role_id,
      }).select('utilisateur_id, email').single();
    if (error || !created) throw new Error(error?.message || 'Création échouée');

    void emailService.employeeAccountCreated(body.email, { adminEmail: req.user.email });
    res.status(201).json({ utilisateur_id: created.utilisateur_id });
  }),
);

router.get(
  '/employees',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const { data } = await supabase
      .from('utilisateur')
      .select('utilisateur_id, email, nom, prenom, est_actif, created_at, role:role_id(libelle)')
      .in('role_id', (await supabase.from('role').select('role_id').in('libelle', ['employe','administrateur'])).data?.map((r: any) => r.role_id) || [])
      .order('created_at', { ascending: false });
    res.json(data || []);
  }),
);

router.post(
  '/employees/:id/disable',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new BadRequestError('ID invalide');
    const { error } = await supabase.from('utilisateur').update({ est_actif: false }).eq('utilisateur_id', id);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  }),
);

router.post(
  '/employees/:id/enable',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new BadRequestError('ID invalide');
    const { error } = await supabase.from('utilisateur').update({ est_actif: true }).eq('utilisateur_id', id);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  }),
);

/* ============================================================
 *  Modération des avis (employé OU admin)
 * ============================================================ */

router.get(
  '/reviews/pending',
  requireAuth,
  requireEmployee,
  asyncHandler(async (_req, res) => {
    const { data } = await supabase
      .from('avis')
      .select('*, utilisateur:utilisateur_id(prenom, nom, email)')
      .eq('statut', 'en_attente')
      .order('created_at', { ascending: false });
    res.json(data || []);
  }),
);

const moderateSchema = z.object({ statut: z.enum(['valide', 'refuse']) });

router.post(
  '/reviews/:id/moderate',
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new BadRequestError('ID invalide');
    const { statut } = moderateSchema.parse(req.body);
    const { error } = await supabase
      .from('avis').update({ statut, moderated_at: new Date().toISOString() }).eq('avis_id', id);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  }),
);

/* ============================================================
 *  Dashboard admin (lecture Mongo)
 * ============================================================ */

const dashboardSchema = z.object({
  since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  menu_ids: z.string().optional(), // CSV
});

router.get(
  '/dashboard/orders-by-menu',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const q = dashboardSchema.parse(req.query);
    const since = q.since ? new Date(q.since) : undefined;
    const until = q.until ? new Date(q.until) : undefined;
    const raw = await audit.dashboardOrdersByMenu({ since, until });

    // Enrichir avec les titres de menu depuis Postgres
    const menuIds = raw.map((r: any) => r._id);
    const titles: Record<number, string> = {};
    if (menuIds.length > 0) {
      const { data } = await supabase.from('menu').select('menu_id, titre').in('menu_id', menuIds);
      (data || []).forEach((m: any) => (titles[m.menu_id] = m.titre));
    }
    res.json(raw.map((r: any) => ({ menu_id: r._id, titre: titles[r._id] || `Menu #${r._id}`, count: r.count })));
  }),
);

router.get(
  '/dashboard/revenue',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const q = dashboardSchema.parse(req.query);
    const since = q.since ? new Date(q.since) : undefined;
    const until = q.until ? new Date(q.until) : undefined;
    const menuIds = q.menu_ids ? q.menu_ids.split(',').map(Number).filter(Number.isInteger) : undefined;
    const raw = await audit.dashboardRevenue({ menuIds, since, until });

    const ids = raw.map((r: any) => r._id);
    const titles: Record<number, string> = {};
    if (ids.length > 0) {
      const { data } = await supabase.from('menu').select('menu_id, titre').in('menu_id', ids);
      (data || []).forEach((m: any) => (titles[m.menu_id] = m.titre));
    }
    const totalCA = raw.reduce((s: number, r: any) => s + (r.total || 0), 0);
    res.json({
      total_ca: totalCA,
      par_menu: raw.map((r: any) => ({ menu_id: r._id, titre: titles[r._id] || `Menu #${r._id}`, ca: r.total || 0, count: r.count })),
    });
  }),
);

export default router;
