import { getDb } from '../db/mongo.js';

/**
 * Audit trail NoSQL (MongoDB).
 *
 * Collections :
 *   - order_events : un document par changement d'état de commande
 *   - contact_logs : log des messages de contact reçus
 *   - dashboard_snapshots : (calculé à la volée par admin/dashboard)
 *
 * Pourquoi NoSQL ?
 *   - Schéma flexible : payload variable selon le type d'événement
 *   - Time-series friendly : append-only, indexes performants sur created_at
 *   - Aggregation pipeline natif pour le dashboard admin
 */
export const audit = {
  async logOrderEvent(opts: {
    commande_id: number;
    menu_id: number;
    utilisateur_id: number;
    previous_statut: string | null;
    new_statut: string;
    actor_role: string;
    actor_id: number;
    metadata?: Record<string, unknown>;
  }) {
    await getDb().collection('order_events').insertOne({
      ...opts,
      created_at: new Date(),
    });
  },

  async logContact(opts: { contact_id: number; email: string; titre: string }) {
    await getDb().collection('contact_logs').insertOne({
      ...opts,
      created_at: new Date(),
    });
  },

  async dashboardOrdersByMenu(opts: { since?: Date; until?: Date }) {
    const match: Record<string, unknown> = { new_statut: { $in: ['accepte', 'terminee'] } };
    if (opts.since || opts.until) {
      const range: Record<string, Date> = {};
      if (opts.since) range['$gte'] = opts.since;
      if (opts.until) range['$lte'] = opts.until;
      match['created_at'] = range;
    }
    return getDb()
      .collection('order_events')
      .aggregate([
        { $match: match },
        { $group: { _id: '$menu_id', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();
  },

  async dashboardRevenue(opts: { menuIds?: number[]; since?: Date; until?: Date }) {
    const match: Record<string, unknown> = { new_statut: 'terminee' };
    if (opts.menuIds && opts.menuIds.length > 0) match['menu_id'] = { $in: opts.menuIds };
    if (opts.since || opts.until) {
      const range: Record<string, Date> = {};
      if (opts.since) range['$gte'] = opts.since;
      if (opts.until) range['$lte'] = opts.until;
      match['created_at'] = range;
    }
    return getDb()
      .collection('order_events')
      .aggregate([
        { $match: match },
        { $group: { _id: '$menu_id', total: { $sum: '$metadata.prix_total' }, count: { $sum: 1 } } },
      ])
      .toArray();
  },
};
