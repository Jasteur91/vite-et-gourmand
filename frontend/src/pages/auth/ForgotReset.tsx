import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { $ } from '../../lib/api';

const rules = [
  { test: (p: string) => p.length >= 10, label: '10 caractères min.' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Maj.' },
  { test: (p: string) => /[a-z]/.test(p), label: 'Min.' },
  { test: (p: string) => /\d/.test(p), label: 'Chiffre' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'Spécial' },
];

export function Forgot() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await $.post('/auth/request-reset', { email });
      setSent(true);
    } catch { /* on cache l'erreur volontairement (sécurité) */ }
    finally { setLoading(false); setSent(true); }
  }

  return (
    <div className="container-edit py-20 max-w-md">
      <span className="eyebrow">Mot de passe oublié</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">Pas d'inquiétude.</h1>

      {sent ? (
        <div className="mt-10 card p-8 text-center">
          <p className="font-display text-xl text-bordeaux-700">Un email vient d'être envoyé.</p>
          <p className="text-sm text-cafe-700 mt-3">
            Si l'adresse existe, vous y trouverez un lien valable 1 heure.
          </p>
          <Link to="/auth/login" className="btn-primary mt-6 inline-flex">Retour connexion</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 card p-8 space-y-5">
          <p className="text-sm text-cafe-700">Entrez votre email, nous vous enverrons un lien de réinitialisation.</p>
          <div>
            <label className="label">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Envoi…' : 'Recevoir le lien'}
          </button>
        </form>
      )}
    </div>
  );
}

export function Reset() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const allOk = useMemo(() => rules.every((r) => r.test(password)), [password]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { toast.error('Lien invalide'); return; }
    if (!allOk) { toast.error('Mot de passe trop faible'); return; }
    setLoading(true);
    try {
      await $.post('/auth/reset', { token, password });
      toast.success('Mot de passe mis à jour');
      navigate('/auth/login');
    } catch (e: any) {
      toast.error(e.message || 'Lien expiré ou invalide');
    } finally { setLoading(false); }
  }

  return (
    <div className="container-edit py-20 max-w-md">
      <span className="eyebrow">Réinitialisation</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">Nouveau mot de passe.</h1>

      <form onSubmit={submit} className="mt-10 card p-8 space-y-5">
        <div>
          <label className="label">Nouveau mot de passe</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {rules.map((r) => (
              <span key={r.label} className={`tag ${r.test(password) ? 'tag-gold' : ''}`}>{r.label}</span>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading || !allOk} className="btn-primary w-full">
          {loading ? 'Enregistrement…' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  );
}
