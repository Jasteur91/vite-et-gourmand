import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireEmployee } from '../middleware/auth.js';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors.js';
import { emailService } from '../services/email.service.js';
import { audit } from '../services/audit.service.js';

const router = Router();

/* ============================================================
 *  Règles métier
 * ============================================================ */

const PRIX_LIVRAISON_BASE_HORS_BORDEAUX = 5;
const PRIX_PAR_KM = 0.59;
const REMISE_PCT = 10;
const SEUIL_REMISE_PERSONNES = 5;

/** Calcule prix livraison. Bordeaux = 0. Ailleurs = base + km estimés (placeholder simple). */
function computeLivraison(ville: string): number {
  const isBordeaux = ville.trim().toLowerCase() === 'bordeaux';
  if (isBordeaux) return 0;
  // À défaut d'API maps, on facture base + 10 km (placeholder documenté dans la copie ECF)
  return PRIX_LIVRAISON_BASE_HORS_BORDEAUX + 10 * PRIX_PAR_KM;
}

function computeTotal(opts: {
  prix_par_personne: number;
  nombre_personne: number;
  nombre_personne_minimum: number;
  prix_livraison: number;
}) {
  const prix_menu = opts.prix_par_personne * opts.nombre_personne;
  const remise_pct = opts.nombre_personne >= opts.nombre_personne_minimum + SEUIL_REMISE_PERSONNES ? REMISE_PCT : 0;
  const remise = (prix_menu * remise_pct) / 100;
  const prix_total = prix_menu - remise + opts.prix_livraison;
  return { prix_menu, remise_pct, prix_total };
}

function generateNumero(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VG-${ts}-${rnd}`;
}

/* ============================================================
 *  Calcul devis (utile au frontend pour preview en temps réel)
 * ============================================================ */

const previewSchema = z.object({
  menu_id: z.number().int().positive(),
  nombre_personne: z.number().int().positive(),
  ville_livraison: z.string().min(2),
});

router.post(
  '/preview',
  asyncHandler(async (req, res) => {
    const body = previewSchema.parse(req.body);
    const { data: menu, error } = await supabase
      .from('menu').select('prix_par_personne, nombre_personne_minimum, quantite_restante').eq('menu_id', body.menu_id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!menu) throw new NotFoundError('Menu introuvable');

    if (body.nombre_personne < menu.nombre_personne_minimum) {
      throw new BadRequestError(`Minimum ${menu.nombre_personne_minimum} personnes pour ce menu`);
    }
    if (menu.quantite_restante <= 0) throw new BadRequestError('Plus de stock disponible');

    const prix_livraison = computeLivraison(body.ville_livraison);
    const calc = computeTotal({
      prix_par_personne: menu.prix_par_personne,
      nombre_personne: body.nombre_personne,
      nombre_personne_minimum: menu.nombre_personne_minimum,
      prix_livraison,
    });
    res.json({ ...calc, prix_livraison });
  }),
);

/* ============================================================
 *  Création de commande (utilisateur authentifié)
 * ============================================================ */

const createSchema = z.object({
  menu_id: z.number().int().positive(),
  nombre_personne: z.number().int().positive(),
  adresse_livraison: z.string().min(3).max(255),
  ville_livraison: z.string().min(2).max(80),
  date_prestation: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  heure_livraison: z.string().regex(/^\d{2}:\d{2}$/),
});

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const body = createSchema.parse(req.body);

    const { data: menu } = await supabase
      .from('menu')
      .select('menu_id, titre, prix_par_personne, nombre_personne_minimum, quantite_restante')
      .eq('menu_id', body.menu_id).maybeSingle();
    if (!menu) throw new NotFoundError('Menu introuvable');
    if (menu.quantite_restante <= 0) throw new BadRequestError('Plus de stock disponible');
    if (body.nombre_personne < menu.nombre_personne_minimum) {
      throw new BadRequestError(`Minimum ${menu.nombre_personne_minimum} personnes pour ce menu`);
    }

    const prix_livraison = computeLivraison(body.ville_livraison);
    const { prix_menu, remise_pct, prix_total } = computeTotal({
      prix_par_personne: menu.prix_par_personne,
      nombre_personne: body.nombre_personne,
      nombre_personne_minimum: menu.nombre_personne_minimum,
      prix_livraison,
    });
    const numero_commande = generateNumero();

    const { data: created, error } = await supabase
      .from('commande')
      .insert({
        numero_commande,
        utilisateur_id: req.user.sub,
        menu_id: body.menu_id,
        nombre_personne: body.nombre_personne,
        prix_menu, prix_livraison, remise_pct, prix_total,
        adresse_livraison: body.adresse_livraison,
        ville_livraison: body.ville_livraison,
        date_prestation: body.date_prestation,
        heure_livraison: body.heure_livraison,
      })
      .select('*').single();
    if (error || !created) throw new Error(error?.message || 'Création commande échouée');

    // Décrément stock
    await supabase.from('menu').update({ quantite_restante: menu.quantite_restante - 1 }).eq('menu_id', body.menu_id);

    // Audit Mongo
    await audit.logOrderEvent({
      commande_id: created.commande_id,
      menu_id: body.menu_id,
      utilisateur_id: req.user.sub,
      previous_statut: null,
      new_statut: 'en_attente',
      actor_role: req.user.role,
      actor_id: req.user.sub,
      metadata: { prix_total, menu_titre: menu.titre },
    });

    // Mail confirmation
    const { data: user } = await supabase.from('utilisateur').select('email, prenom').eq('utilisateur_id', req.user.sub).single();
    if (user) {
      void emailService.orderConfirmation(user.email, {
        prenom: user.prenom, numero: numero_commande, menu: menu.titre, total: prix_total, date: body.date_prestation,
      });
    }

    res.status(201).json(created);
  }),
);

/* ============================================================
 *  Liste/get commandes (utilisateur connecté)
 * ============================================================ */

router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const { data, error } = await supabase
      .from('commande')
      .select('*, menu:menu_id (titre, prix_par_personne), avis ( note, commentaire, statut )')
      .eq('utilisateur_id', req.user.sub)
      .order('date_commande', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(data || []);
  }),
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const id = Number(req.params.id);
    const { data, error } = await supabase
      .from('commande')
      .select('*, menu:menu_id (titre, description, prix_par_personne), avis (*)')
      .eq('commande_id', id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new NotFoundError('Commande introuvable');

    // Propriétaire OU employé/admin
    if (data.utilisateur_id !== req.user.sub && req.user.role === 'utilisateur') {
      throw new ForbiddenError();
    }

    // Historique des statuts depuis Mongo
    const events = await (await import('../db/mongo.js')).getDb()
      .collection('order_events').find({ commande_id: id }).sort({ created_at: 1 }).toArray();
    res.json({ ...data, history: events });
  }),
);

/* ============================================================
 *  Modification / annulation par utilisateur (avant accepté)
 * ============================================================ */

const updateMineSchema = z.object({
  nombre_personne: z.number().int().positive().optional(),
  adresse_livraison: z.string().min(3).max(255).optional(),
  ville_livraison: z.string().min(2).max(80).optional(),
  date_prestation: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  heure_livraison: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

router.patch(
  '/mine/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const id = Number(req.params.id);
    const body = updateMineSchema.parse(req.body);

    const { data: cmd } = await supabase
      .from('commande').select('*, menu:menu_id(prix_par_personne, nombre_personne_minimum)').eq('commande_id', id).maybeSingle();
    if (!cmd) throw new NotFoundError();
    if (cmd.utilisateur_id !== req.user.sub) throw new ForbiddenError();
    if (cmd.statut !== 'en_attente') throw new BadRequestError('Commande déjà acceptée, modification impossible');

    const merged = { ...cmd, ...body };
    const prix_livraison = computeLivraison(merged.ville_livraison);
    const totals = computeTotal({
      prix_par_personne: cmd.menu.prix_par_personne,
      nombre_personne: merged.nombre_personne,
      nombre_personne_minimum: cmd.menu.nombre_personne_minimum,
      prix_livraison,
    });

    const { error } = await supabase
      .from('commande').update({ ...body, prix_livraison, ...totals }).eq('commande_id', id);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  }),
);

router.post(
  '/mine/:id/cancel',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const id = Number(req.params.id);

    const { data: cmd } = await supabase.from('commande').select('utilisateur_id, statut, menu_id').eq('commande_id', id).maybeSingle();
    if (!cmd) throw new NotFoundError();
    if (cmd.utilisateur_id !== req.user.sub) throw new ForbiddenError();
    if (cmd.statut !== 'en_attente') throw new BadRequestError('Trop tard, contactez-nous');

    await supabase.from('commande').update({ statut: 'annulee' }).eq('commande_id', id);
    await audit.logOrderEvent({
      commande_id: id, menu_id: cmd.menu_id, utilisateur_id: req.user.sub,
      previous_statut: 'en_attente', new_statut: 'annulee',
      actor_role: req.user.role, actor_id: req.user.sub,
    });
    res.json({ ok: true });
  }),
);

/* ============================================================
 *  Espace employé : liste + modification statut
 * ============================================================ */

const employeeListSchema = z.object({
  statut: z.string().optional(),
  client: z.string().optional(),
});

router.get(
  '/manage/list',
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    const filters = employeeListSchema.parse(req.query);
    let query = supabase
      .from('commande')
      .select('*, utilisateur:utilisateur_id(email, nom, prenom, telephone), menu:menu_id(titre)')
      .order('date_prestation', { ascending: true });
    if (filters.statut) query = query.eq('statut', filters.statut);
    const { data } = await query;
    let list = data || [];
    if (filters.client) {
      const q = filters.client.toLowerCase();
      list = list.filter((c: any) =>
        c.utilisateur?.email?.toLowerCase().includes(q) ||
        c.utilisateur?.nom?.toLowerCase().includes(q) ||
        c.utilisateur?.prenom?.toLowerCase().includes(q),
      );
    }
    res.json(list);
  }),
);

const ALLOWED_STATUTS = ['accepte','en_preparation','en_cours_de_livraison','livre','en_attente_retour_materiel','terminee'] as const;
const updateStatusSchema = z.object({
  statut: z.enum(ALLOWED_STATUTS),
  pret_materiel: z.boolean().optional(),
});

router.post(
  '/manage/:id/status',
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const id = Number(req.params.id);
    const { statut, pret_materiel } = updateStatusSchema.parse(req.body);

    const { data: cmd } = await supabase
      .from('commande')
      .select('commande_id, statut, menu_id, utilisateur_id, numero_commande, utilisateur:utilisateur_id(email, prenom)')
      .eq('commande_id', id).maybeSingle();
    if (!cmd) throw new NotFoundError();

    const patch: Record<string, unknown> = { statut };
    if (pret_materiel !== undefined) patch['pret_materiel'] = pret_materiel;
    if (statut === 'terminee') patch['restitution_materiel'] = true;

    const { error } = await supabase.from('commande').update(patch).eq('commande_id', id);
    if (error) throw new Error(error.message);

    await audit.logOrderEvent({
      commande_id: id, menu_id: cmd.menu_id, utilisateur_id: cmd.utilisateur_id,
      previous_statut: cmd.statut, new_statut: statut,
      actor_role: req.user.role, actor_id: req.user.sub,
    });

    const user = cmd.utilisateur as unknown as { email: string; prenom: string } | null;
    if (user) {
      void emailService.statusChanged(user.email, { prenom: user.prenom, numero: cmd.numero_commande, statut });
      if (statut === 'en_attente_retour_materiel') {
        void emailService.materialReturnReminder(user.email, { prenom: user.prenom, numero: cmd.numero_commande });
      }
      if (statut === 'terminee') {
        void emailService.reviewInvitation(user.email, { prenom: user.prenom, numero: cmd.numero_commande });
      }
    }
    res.json({ ok: true });
  }),
);

const cancelSchema = z.object({
  motif_annulation: z.string().min(3),
  mode_contact_annulation: z.enum(['gsm', 'mail']),
});

router.post(
  '/manage/:id/cancel',
  requireAuth,
  requireEmployee,
  asyncHandler(async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const id = Number(req.params.id);
    const body = cancelSchema.parse(req.body);

    const { data: cmd } = await supabase
      .from('commande').select('menu_id, utilisateur_id, statut, numero_commande, utilisateur:utilisateur_id(email, prenom)').eq('commande_id', id).maybeSingle();
    if (!cmd) throw new NotFoundError();

    await supabase.from('commande').update({
      statut: 'annulee',
      motif_annulation: body.motif_annulation,
      mode_contact_annulation: body.mode_contact_annulation,
    }).eq('commande_id', id);

    await audit.logOrderEvent({
      commande_id: id, menu_id: cmd.menu_id, utilisateur_id: cmd.utilisateur_id,
      previous_statut: cmd.statut, new_statut: 'annulee',
      actor_role: req.user.role, actor_id: req.user.sub, metadata: { motif: body.motif_annulation, contact: body.mode_contact_annulation },
    });

    const user = cmd.utilisateur as unknown as { email: string; prenom: string } | null;
    if (user) void emailService.statusChanged(user.email, { prenom: user.prenom, numero: cmd.numero_commande, statut: 'annulee' });
    res.json({ ok: true });
  }),
);

export default router;
