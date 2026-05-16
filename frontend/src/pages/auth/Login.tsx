import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/espace';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bienvenue !');
      navigate(next);
    } catch (e: any) {
      toast.error(e.message || 'Erreur de connexion');
    } finally { setLoading(false); }
  }

  return (
    <div className="container-edit py-20 max-w-md">
      <span className="eyebrow">Espace personnel</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">Bon retour.</h1>

      <form onSubmit={submit} className="mt-10 card p-8 space-y-5">
        <div>
          <label className="label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" autoComplete="current-password" />
          <Link to="/auth/forgot" className="text-xs text-cafe-700 hover:text-bordeaux-700 mt-2 inline-block">Mot de passe oublié ?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
        <p className="text-sm text-center text-cafe-700">
          Pas encore de compte ? <Link to="/auth/signup" className="text-bordeaux-700 underline">Inscrivez-vous</Link>
        </p>
      </form>
    </div>
  );
}
