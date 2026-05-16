import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Star, ChevronRight, User as UserIcon, Receipt } from 'lucide-react';
import { $ } from '../../lib/api';

type Profile = {
  utilisateur_id: number; email: string; nom: string; prenom: string;
  telephone: string | null; adresse_postale: string | null; ville: string | null;
};

type Commande = {
  commande_id: number; numero_commande: string; nombre_personne: number;
  prix_total: number; statut: string; date_prestation: string;
  menu: { titre: string };
  avis: Array<{ note: number; commentaire: string; statut: string }> | null;
};

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-cafe-100 text-cafe-800',
  accepte: 'bg-or-100 text-or-800',
  en_preparation: 'bg-or-200 text-or-900',
  en_cours_de_livraison: 'bg-bordeaux-100 text-bordeaux-800',
  livre: 'bg-bordeaux-200 text-bordeaux-900',
  en_attente_retour_materiel: 'bg-terre-100 text-terre-800',
  terminee: 'bg-creme-300 text-cafe-900',
  annulee: 'bg-creme-100 text-cafe-700 line-through',
};

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente', accepte: 'Acceptée', en_preparation: 'En préparation',
  en_cours_de_livraison: 'En livraison', livre: 'Livrée',
  en_attente_retour_materiel: 'Matériel à rendre', terminee: 'Terminée', annulee: 'Annulée',
};

export function UserEspace() {
  const [tab, setTab] = useState<'commandes' | 'profil'>('commandes');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    $.get<Profile>('/users/me').then(setProfile);
    $.get<Commande[]>('/commandes/mine').then(setCommandes);
  }, []);

  return (
    <div className="container-edit py-16">
      <span className="eyebrow">Espace personnel</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">
        Bonjour {profile?.prenom}.
      </h1>

      <div className="mt-10 flex gap-2 border-b border-cafe-900/10">
        <TabBtn active={tab === 'commandes'} onClick={() => setTab('commandes')} icon={<Receipt size={14} />}>Mes commandes</TabBtn>
        <TabBtn active={tab === 'profil'} onClick={() => setTab('profil')} icon={<UserIcon size={14} />}>Mes informations</TabBtn>
      </div>

      {tab === 'commandes' && (
        <div className="mt-8 space-y-4">
          {commandes.length === 0 && (
            <div className="card p-12 text-center">
              <p className="font-display text-2xl text-cafe-900">Aucune commande pour le moment.</p>
              <Link to="/menus" className="btn-primary mt-6 inline-flex">Voir les menus</Link>
            </div>
          )}
          {commandes.map((c, i) => (
            <motion.div key={c.commande_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-cafe-700">{c.numero_commande}</p>
                  <p className="font-display text-xl text-cafe-900 mt-1">{c.menu.titre}</p>
                  <p className="text-sm text-cafe-700 mt-1">
                    {c.nombre_personne} personnes · {new Date(c.date_prestation).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`tag ${STATUT_COLORS[c.statut]}`}>{STATUT_LABELS[c.statut]}</span>
                  <p className="font-display text-2xl text-bordeaux-700 mt-3">{c.prix_total.toFixed(2)}€</p>
                </div>
              </div>
              {c.statut === 'terminee' && (!c.avis || c.avis.length === 0) && (
                <div className="mt-4 pt-4 border-t border-cafe-900/8">
                  <AvisForm commande_id={c.commande_id} onSubmitted={() => $.get<Commande[]>('/commandes/mine').then(setCommandes)} />
                </div>
              )}
              <Link to={`/espace/${c.commande_id}`} className="mt-4 inline-flex items-center gap-1 text-sm text-bordeaux-700 hover:underline">
                Voir le détail <ChevronRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'profil' && profile && (
        <ProfileForm profile={profile} onSaved={(p) => setProfile(p)} />
      )}
    </div>
  );
}

function TabBtn({ active, children, onClick, icon }: { active: boolean; children: React.ReactNode; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${active ? 'text-bordeaux-700 border-bordeaux-700' : 'text-cafe-700 border-transparent hover:text-cafe-900'}`}>
      {icon} {children}
    </button>
  );
}

function AvisForm({ commande_id, onSubmitted }: { commande_id: number; onSubmitted: () => void }) {
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    if (note < 1) return;
    setSending(true);
    try {
      await $.post('/users/reviews', { commande_id, note, commentaire: commentaire || undefined });
      toast.success('Merci pour votre avis !');
      onSubmitted();
    } catch (e: any) { toast.error(e.message); } finally { setSending(false); }
  }

  return (
    <div>
      <p className="eyebrow text-cafe-700 mb-3">Votre avis</p>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map((n) => (
          <button key={n} onClick={() => setNote(n)} type="button" className="text-or-500">
            <Star size={20} fill={n <= note ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      <textarea
        value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
        rows={3} placeholder="Comment c'était ?"
        className="input resize-none text-sm"
      />
      <button onClick={submit} disabled={sending || note < 1} className="btn-primary mt-3 text-sm py-2 px-4">
        Envoyer
      </button>
    </div>
  );
}

function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof Profile>(k: K, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await $.patch('/users/me', {
        nom: form.nom, prenom: form.prenom, telephone: form.telephone || undefined,
        adresse_postale: form.adresse_postale || undefined, ville: form.ville || undefined,
      });
      onSaved(form);
      toast.success('Profil mis à jour');
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={save} className="mt-8 card p-8 space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Prénom</label><input value={form.prenom} onChange={(e) => update('prenom', e.target.value)} className="input" /></div>
        <div><label className="label">Nom</label><input value={form.nom} onChange={(e) => update('nom', e.target.value)} className="input" /></div>
      </div>
      <div><label className="label">Email</label><input value={form.email} readOnly className="input bg-creme-200/50" /></div>
      <div><label className="label">Téléphone</label><input value={form.telephone || ''} onChange={(e) => update('telephone', e.target.value)} className="input" /></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2"><label className="label">Adresse postale</label><input value={form.adresse_postale || ''} onChange={(e) => update('adresse_postale', e.target.value)} className="input" /></div>
        <div><label className="label">Ville</label><input value={form.ville || ''} onChange={(e) => update('ville', e.target.value)} className="input" /></div>
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
