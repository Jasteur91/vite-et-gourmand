import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, CircleAlert } from 'lucide-react';
import { $ } from '../../lib/api';

type OrderHistory = { previous_statut: string | null; new_statut: string; created_at: string; actor_role: string };
type Order = {
  commande_id: number; numero_commande: string; statut: string;
  nombre_personne: number; adresse_livraison: string; ville_livraison: string;
  date_prestation: string; heure_livraison: string;
  prix_menu: number; prix_livraison: number; remise_pct: number; prix_total: number;
  motif_annulation?: string | null;
  menu: { titre: string; description: string; prix_par_personne: number };
  history: OrderHistory[];
};

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente', accepte: 'Acceptée', en_preparation: 'En préparation',
  en_cours_de_livraison: 'En livraison', livre: 'Livrée',
  en_attente_retour_materiel: 'Matériel à rendre', terminee: 'Terminée', annulee: 'Annulée',
};

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    $.get<Order>(`/commandes/${id}`).then(setOrder).catch(() => navigate('/espace'));
  }, [id, navigate]);

  async function cancel() {
    if (!order) return;
    if (!confirm('Annuler cette commande ?')) return;
    try {
      await $.post(`/commandes/mine/${order.commande_id}/cancel`);
      toast.success('Commande annulée');
      navigate('/espace');
    } catch (e: any) { toast.error(e.message); }
  }

  if (!order) return <div className="container-edit py-32 text-center text-cafe-700">Chargement…</div>;

  return (
    <div className="container-edit py-16 max-w-4xl">
      <Link to="/espace" className="inline-flex items-center gap-1 text-sm text-cafe-700 hover:text-bordeaux-700 mb-6">
        <ChevronLeft size={14} /> Mes commandes
      </Link>

      <span className="eyebrow">{order.numero_commande}</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">{order.menu.titre}</h1>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="card p-6">
            <p className="eyebrow mb-4">Détails de la commande</p>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-cafe-700">Convives</dt><dd className="text-cafe-900 text-right">{order.nombre_personne}</dd>
              <dt className="text-cafe-700">Date prestation</dt><dd className="text-cafe-900 text-right">{new Date(order.date_prestation).toLocaleDateString('fr-FR')}</dd>
              <dt className="text-cafe-700">Heure</dt><dd className="text-cafe-900 text-right">{order.heure_livraison.slice(0,5)}</dd>
              <dt className="text-cafe-700">Adresse</dt><dd className="text-cafe-900 text-right">{order.adresse_livraison}, {order.ville_livraison}</dd>
            </dl>
          </section>

          <section className="card p-6">
            <p className="eyebrow mb-4">Suivi de commande</p>
            <ol className="space-y-4">
              {order.history.map((h, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-bordeaux-700 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-cafe-900 font-medium">{STATUT_LABELS[h.new_statut]}</p>
                    <p className="text-xs text-cafe-700">
                      {new Date(h.created_at).toLocaleString('fr-FR')} · par {h.actor_role}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {order.motif_annulation && (
            <section className="card p-6 border-bordeaux-200">
              <p className="eyebrow text-bordeaux-700 mb-2 flex items-center gap-2"><CircleAlert size={14} /> Motif d'annulation</p>
              <p className="text-cafe-800">{order.motif_annulation}</p>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="card p-6">
            <p className="eyebrow mb-4">Récapitulatif</p>
            <dl className="space-y-2 text-sm">
              <Row label="Menu" value={`${order.prix_menu.toFixed(2)} €`} />
              {order.remise_pct > 0 && <Row label={`Remise -${order.remise_pct}%`} value={`−${((order.prix_menu * order.remise_pct) / 100).toFixed(2)} €`} accent />}
              <Row label="Livraison" value={`${order.prix_livraison.toFixed(2)} €`} />
            </dl>
            <div className="mt-4 pt-4 border-t border-cafe-900/8 flex items-baseline justify-between">
              <span className="text-cafe-900 font-medium">Total</span>
              <span className="font-display text-2xl text-bordeaux-700">{order.prix_total.toFixed(2)} €</span>
            </div>

            {order.statut === 'en_attente' && (
              <button onClick={cancel} className="btn-ghost w-full mt-6 text-sm">Annuler la commande</button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-cafe-700">{label}</dt>
      <dd className={accent ? 'text-or-700 font-medium' : 'text-cafe-900'}>{value}</dd>
    </div>
  );
}
