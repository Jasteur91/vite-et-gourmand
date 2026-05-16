import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { $ } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type MenuLite = { menu_id: number; titre: string; prix_par_personne: number; nombre_personne_minimum: number; conditions: string | null };
type Profile = { nom: string; prenom: string; email: string; telephone: string | null; adresse_postale: string | null; ville: string | null };
type Preview = { prix_menu: number; remise_pct: number; prix_total: number; prix_livraison: number };

export function Order() {
  const { menuId } = useParams<{ menuId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuLite | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // form
  const [nb, setNb] = useState<number>(0);
  const [ville, setVille] = useState('');
  const [adresse, setAdresse] = useState('');
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('12:00');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!menuId || !user) return;
    Promise.all([
      $.get<any>(`/menus/${menuId}`),
      $.get<any>(`/users/me`),
    ]).then(([m, p]) => {
      setMenu({ menu_id: m.menu_id, titre: m.titre, prix_par_personne: m.prix_par_personne, nombre_personne_minimum: m.nombre_personne_minimum, conditions: m.conditions });
      setNb(m.nombre_personne_minimum);
      setProfile({ nom: p.nom, prenom: p.prenom, email: p.email, telephone: p.telephone, adresse_postale: p.adresse_postale, ville: p.ville });
      if (p.ville) setVille(p.ville);
      if (p.adresse_postale) setAdresse(p.adresse_postale);
    });
  }, [menuId, user]);

  // Calcul live preview à chaque changement de nb personnes / ville
  useEffect(() => {
    if (!menu || nb < menu.nombre_personne_minimum || !ville) return;
    $.post<Preview>('/commandes/preview', { menu_id: menu.menu_id, nombre_personne: nb, ville_livraison: ville })
      .then(setPreview)
      .catch(() => setPreview(null));
  }, [menu, nb, ville]);

  async function submit() {
    if (!menu) return;
    setSubmitting(true);
    try {
      const cmd = await $.post<{ commande_id: number; numero_commande: string }>('/commandes', {
        menu_id: menu.menu_id,
        nombre_personne: nb,
        adresse_livraison: adresse,
        ville_livraison: ville,
        date_prestation: date,
        heure_livraison: heure,
      });
      toast.success(`Commande ${cmd.numero_commande} créée ! Un mail de confirmation vient de partir.`);
      navigate(`/espace`);
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la commande');
    } finally {
      setSubmitting(false);
    }
  }

  if (!menu || !profile) return <div className="container-edit py-32 text-center text-cafe-700">Chargement…</div>;

  return (
    <div className="container-edit py-16 max-w-4xl">
      <span className="eyebrow">Étape {step} / 3</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">Commander {menu.titre}</h1>

      {menu.conditions && (
        <div className="mt-6 bg-bordeaux-50 border border-bordeaux-200 rounded-card p-4 text-sm text-bordeaux-800">
          <strong>À retenir : </strong>{menu.conditions}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div layout className="lg:col-span-2 space-y-6">

          {step === 1 && (
            <section className="card p-8 space-y-6">
              <h2 className="font-display text-2xl text-cafe-900">Vos informations</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prénom" value={profile.prenom} readOnly />
                <Field label="Nom" value={profile.nom} readOnly />
                <Field label="Email" value={profile.email} readOnly />
                <Field label="Téléphone" value={profile.telephone || ''} readOnly />
              </div>
              <p className="text-xs text-cafe-700">Ces informations proviennent de votre compte. Modifiez-les depuis votre <a href="/espace" className="underline">profil</a>.</p>
              <div className="flex justify-end">
                <button onClick={() => setStep(2)} className="btn-primary">Suivant</button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="card p-8 space-y-6">
              <h2 className="font-display text-2xl text-cafe-900">Détails de la prestation</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Adresse de livraison</label>
                  <input value={adresse} onChange={(e) => setAdresse(e.target.value)} className="input" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Ville de livraison</label>
                    <input value={ville} onChange={(e) => setVille(e.target.value)} className="input" required />
                    <p className="text-xs text-cafe-700 mt-1">Hors Bordeaux : 5€ + 0,59€/km</p>
                  </div>
                  <div>
                    <label className="label">Date de prestation</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" min={new Date().toISOString().slice(0,10)} required />
                  </div>
                </div>
                <div>
                  <label className="label">Heure de livraison souhaitée</label>
                  <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className="input" required />
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost">Retour</button>
                <button onClick={() => setStep(3)} className="btn-primary" disabled={!adresse || !ville || !date}>
                  Suivant
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="card p-8 space-y-6">
              <h2 className="font-display text-2xl text-cafe-900">Nombre de convives</h2>
              <div>
                <label className="label">Combien de personnes ?</label>
                <input
                  type="number" min={menu.nombre_personne_minimum} value={nb}
                  onChange={(e) => setNb(Number(e.target.value))}
                  className="input text-2xl text-center font-display"
                />
                <p className="text-xs text-cafe-700 mt-2">
                  Minimum {menu.nombre_personne_minimum} personnes. Au-delà de {menu.nombre_personne_minimum + 5} : <span className="text-or-700 font-medium">-10% appliqué</span>.
                </p>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="btn-ghost">Retour</button>
                <button onClick={submit} disabled={submitting || !preview} className="btn-primary">
                  {submitting ? 'Envoi…' : 'Valider la commande'}
                </button>
              </div>
            </section>
          )}
        </motion.div>

        {/* Récap prix sticky */}
        <aside className="lg:col-span-1">
          <div className="card p-6 lg:sticky lg:top-24">
            <p className="eyebrow mb-4">Récapitulatif</p>
            <p className="font-display text-xl text-cafe-900">{menu.titre}</p>
            <p className="text-sm text-cafe-700 mt-1">{menu.prix_par_personne.toFixed(2)}€ / personne</p>
            <div className="mt-6 pt-4 border-t border-cafe-900/8 space-y-2 text-sm">
              <Row label="Convives" value={`${nb || '—'} pers.`} />
              <Row label="Sous-total" value={preview ? `${preview.prix_menu.toFixed(2)} €` : '—'} />
              {preview && preview.remise_pct > 0 && (
                <Row label={`Remise -${preview.remise_pct}%`} value={`−${((preview.prix_menu * preview.remise_pct) / 100).toFixed(2)} €`} accent="or" />
              )}
              <Row label="Livraison" value={preview ? `${preview.prix_livraison.toFixed(2)} €` : '—'} />
              <div className="pt-3 mt-3 border-t border-cafe-900/8 flex items-baseline justify-between">
                <span className="text-cafe-900 font-medium">Total</span>
                <span className="font-display text-2xl text-bordeaux-700">{preview ? `${preview.prix_total.toFixed(2)} €` : '—'}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input value={value} readOnly={readOnly} className="input bg-creme-200/50" />
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: 'or' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cafe-700">{label}</span>
      <span className={accent === 'or' ? 'text-or-700 font-medium' : 'text-cafe-900'}>{value}</span>
    </div>
  );
}
