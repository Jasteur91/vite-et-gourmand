import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { $, setToken, getToken } from '../lib/api';

export type AuthUser = {
  id: number;
  email: string;
  prenom: string;
  role: 'utilisateur' | 'employe' | 'administrateur';
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupPayload) => Promise<void>;
  logout: () => void;
};

type SignupPayload = {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse_postale: string;
  ville: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    $.get<{ utilisateur_id: number; email: string; prenom: string; role: { libelle: string } }>(`/users/me`)
      .then((u) => setUser({ id: u.utilisateur_id, email: u.email, prenom: u.prenom, role: u.role.libelle as AuthUser['role'] }))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await $.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
  }

  async function signup(data: SignupPayload) {
    const res = await $.post<{ token: string; user: AuthUser }>('/auth/signup', data);
    setToken(res.token);
    setUser(res.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
