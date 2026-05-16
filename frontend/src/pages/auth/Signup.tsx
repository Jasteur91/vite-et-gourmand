import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const rules = [
  { test: (p: string) => p.length >= 10, label: '10 caractères minimum' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Une majuscule' },
  { test: (p: string) => /[a-z]/.test(p), label: 'Une minuscule' },
  { test: (p: string) => /\d/.test(p), label: 'Un chiffre' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'Un caractère spécial' },
];

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', password: '',
    telephone: '', adresse_postale: '', ville: '',
  });
  const [loading, setLoading] = useState(false);
  const allPasswordOk = useMemo(() => rules.every((r) => r.test(form.password)), [form.password]);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allPasswordOk) {
      toast.error('Le mot de passe ne respecte pas les règles');
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      toast.success('Compte créé. Bienvenue !');
      navigate('/espace');
    } catch (e: any) {
      toast.error(e.message || 'Erreur de création');
    } finally { setLoading(false); }
  }

  return (
    <div className="container-edit py-20 max-w-2xl">
      <span className="eyebrow">Nouveau compte</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">
        Bienvenue chez <em className="not-italic text-bordeaux-700">Vite &amp; Gourmand</em>.
      </h1>

      <form onSubmit={submit} className="mt-10 card p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Prénom</label><input required value={form.prenom} onChange={(e) => update('prenom', e.target.value)} className="input" /></div>
          <div><label className="label">Nom</label><input required value={form.nom} onChange={(e) => update('nom', e.target.value)} className="input" /></div>
        </div>

        <div>
          <label className="label">Email</label>
          <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="input" />
        </div>

        <div>
          <label className="label">Mot de passe</label>
          <input type="password" required value={form.password} onChange={(e) => update('password', e.target.value)} className="input" />
          <ul className="mt-3 grid grid-cols-2 gap-y-1 text-xs">
            {rules.map((r) => {
              const ok = r.test(form.password);
              return (
                <li key={r.label} className={`flex items-center gap-1.5 ${ok ? 'text-or-700' : 'text-cafe-700/70'}`}>
                  {ok ? <Check size={12} /> : <X size={12} />} {r.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <label className="label">Téléphone (GSM)</label>
          <input required value={form.telephone} onChange={(e) => update('telephone', e.target.value)} className="input" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><label className="label">Adresse postale</label><input required value={form.adresse_postale} onChange={(e) => update('adresse_postale', e.target.value)} className="input" /></div>
          <div><label className="label">Ville</label><input required value={form.ville} onChange={(e) => update('ville', e.target.value)} className="input" /></div>
        </div>

        <p className="text-xs text-cafe-700">
          En créant un compte, vous acceptez nos <Link to="/cgv" className="underline">CGV</Link> et notre traitement
          des données dans le respect du RGPD (cf. <Link to="/mentions-legales" className="underline">mentions légales</Link>).
        </p>

        <button type="submit" disabled={loading || !allPasswordOk} className="btn-primary w-full">
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>

        <p className="text-sm text-center text-cafe-700">
          Déjà inscrit ? <Link to="/auth/login" className="text-bordeaux-700 underline">Connexion</Link>
        </p>
      </form>
    </div>
  );
}
