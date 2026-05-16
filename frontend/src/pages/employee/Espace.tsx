import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Filter, Check, X, ChefHat, MessageSquare } from 'lucide-react';
import { $ } from '../../lib/api';

type Cmd = {
  commande_id: number; numero_commande: string; statut: string;
  nombre_personne: number; prix_total: number; date_prestation: string; pret_materiel: boolean;
  utilisateur: { email: string; nom: string; prenom: string; telephone: string };
  menu: { titre: string };
};

type AvisPending = {
  avis_id: number; note: number; commentaire: string; created_at: string;
  utilisateur: { prenom: string; nom: string; email: string };
};

const ALL_STATUTS = ['en_attente','accepte','en_preparation','en_cours_de_livraison','livre','en_attente_retour_materiel','terminee','annulee'];
const NEXT_STATUTS: Record<string, string[]> = {
  en_attente: ['accepte'],
  accepte: ['en_preparation'],
  en_preparation: ['en_cours_de_livraison'],
  en_cours_de_livraison: ['livre'],
  livre: ['en_attente_retour_materiel', 'terminee'],
  en_attente_retour_materiel: ['terminee'],
  terminee: [],
  annulee: [],
};
const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente', accepte: 'Acceptée', en_preparation: 'En préparation',
  en_cours_de_livraison: 'En livraison', livre: 'Livrée',
  en_attente_retour_materiel: 'Matériel à rendre', terminee: 'Terminée', annulee: 'Annulée',
};

export function EmployeeEspace() {
  const [tab, setTab] = useState<'commandes' | 'avis'>('commandes');
  const [statut, setStatut] = useState<string>('');
  const [client, setClient] = useState<string>('');
  const [cmds, setCmds] = useState<Cmd[]>([]);
  const [avis, setAvis] = useState<AvisPending[]>([]);

  function reloadCommandes() {
    const p = new URLSearchParams();
    if (statut) p.set('statut', statut);
    if (client) p.set('client', client);
    $.get<Cmd[]>(`/commandes/manage/list?${p.toString()}`).then(setCmds);
  }
  function reloadAvis() {
    $.get<AvisPending[]>('/admin/reviews/pending').then(setAvis);
  }

  useEffect(() => { reloadCommandes(); /* eslint-disable-next-line */ }, [statut, client]);
  useEffect(() => { if (tab === 'avis') reloadAvis(); }, [tab]);

  async function changeStatut(cmd: Cmd, next: string, pret_materiel = false) {
    try {
      await $.post(`/commandes/manage/${cmd.commande_id}/status`, { statut: next, pret_materiel });
      toast.success(`Commande ${cmd.numero_commande} → ${STATUT_LABELS[next]}`);
      reloadCommandes();
    } catch (e: any) { toast.error(e.message); }
  }

  async function cancelCmd(cmd: Cmd) {
    const motif = window.prompt(`Motif d'annulation pour ${cmd.numero_commande} :`);
    if (!motif) return;
    const mode = window.confirm('OK pour appel téléphonique (GSM), Annuler pour mail.') ? 'gsm' : 'mail';
    try {
      await $.post(`/commandes/manage/${cmd.commande_id}/cancel`, { motif_annulation: motif, mode_contact_annulation: mode });
      toast.success('Commande annulée');
      reloadCommandes();
    } catch (e: any) { toast.error(e.message); }
  }

  async function moderate(a: AvisPending, statut: 'valide' | 'refuse') {
    try {
      await $.post(`/admin/reviews/${a.avis_id}/moderate`, { statut });
      toast.success(`Avis ${statut === 'valide' ? 'publié' : 'refusé'}`);
      reloadAvis();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="container-edit py-16">
      <span className="eyebrow">Espace pro</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">Gestion des commandes</h1>

      <div className="mt-10 flex gap-2 border-b border-cafe-900/10">
        <Tab active={tab === 'commandes'} onClick={() => setTab('commandes')} icon={<ChefHat size={14} />}>Commandes</Tab>
        <Tab active={tab === 'avis'} onClick={() => setTab('avis')} icon={<MessageSquare size={14} />}>Modération avis</Tab>
      </div>

      {tab === 'commandes' && (
        <>
          <div className="mt-6 card p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="label">Statut</label>
              <select value={statut} onChange={(e) => setStatut(e.target.value)} className="input text-sm">
                <option value="">Tous</option>
                {ALL_STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="label">Client (nom, email)</label>
              <input value={client} onChange={(e) => setClient(e.target.value)} className="input text-sm" placeholder="Rechercher…" />
            </div>
            <button onClick={() => { setStatut(''); setClient(''); }} className="btn-ghost text-sm py-2 px-3">
              <Filter size={14} /> Reset
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {cmds.length === 0 && <div className="card p-12 text-center text-cafe-700">Aucune commande.</div>}
            {cmds.map((c) => (
              <div key={c.commande_id} className="card p-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-3">
                    <p className="text-xs text-cafe-700">{c.numero_commande}</p>
                    <p className="font-medium text-cafe-900">{c.menu.titre}</p>
                    <p className="text-xs text-cafe-700">{c.nombre_personne} pers. · {new Date(c.date_prestation).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="md:col-span-3 text-sm">
                    <p className="text-cafe-900">{c.utilisateur.prenom} {c.utilisateur.nom}</p>
                    <p className="text-cafe-700 text-xs">{c.utilisateur.email}</p>
                    <p className="text-cafe-700 text-xs">{c.utilisateur.telephone}</p>
                  </div>
                  <div className="md:col-span-2 text-sm">
                    <span className="tag capitalize">{STATUT_LABELS[c.statut]}</span>
                  </div>
                  <div className="md:col-span-2 text-right font-display text-xl text-bordeaux-700">{c.prix_total.toFixed(2)}€</div>
                  <div className="md:col-span-2 flex flex-wrap gap-2 justify-end">
                    {NEXT_STATUTS[c.statut]?.map((next) => (
                      <button key={next} onClick={() => changeStatut(c, next, next === 'en_attente_retour_materiel')}
                              className="text-xs px-3 py-1.5 rounded-full bg-bordeaux-700 text-creme-100 hover:bg-bordeaux-800">
                        → {STATUT_LABELS[next]}
                      </button>
                    ))}
                    {c.statut !== 'annulee' && c.statut !== 'terminee' && (
                      <button onClick={() => cancelCmd(c)} className="text-xs px-3 py-1.5 rounded-full border border-cafe-700/30 text-cafe-700 hover:bg-cafe-900 hover:text-creme-100">
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'avis' && (
        <div className="mt-8 space-y-3">
          {avis.length === 0 && <div className="card p-12 text-center text-cafe-700">Aucun avis en attente.</div>}
          {avis.map((a) => (
            <div key={a.avis_id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-cafe-700">{a.utilisateur.prenom} {a.utilisateur.nom} · {new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
                  <div className="flex gap-0.5 mt-1 text-or-500">
                    {Array.from({length: 5}).map((_, i) => <span key={i}>{i < a.note ? '★' : '☆'}</span>)}
                  </div>
                  <p className="mt-3 text-cafe-800 leading-relaxed">« {a.commentaire || '—'} »</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => moderate(a, 'valide')} className="btn bg-or-500 text-cafe-900 hover:bg-or-600 text-sm py-2 px-3">
                    <Check size={14} /> Publier
                  </button>
                  <button onClick={() => moderate(a, 'refuse')} className="btn-ghost text-sm py-2 px-3">
                    <X size={14} /> Refuser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({ active, children, onClick, icon }: { active: boolean; children: React.ReactNode; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${active ? 'text-bordeaux-700 border-bordeaux-700' : 'text-cafe-700 border-transparent hover:text-cafe-900'}`}>
      {icon} {children}
    </button>
  );
}
