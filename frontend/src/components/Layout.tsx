import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu as MenuIcon, X, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { $ } from '../lib/api';
import { cn } from '../lib/cn';

type Horaire = { jour: string; heure_ouverture: string | null; heure_fermeture: string | null; est_ferme: boolean };

export function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [horaires, setHoraires] = useState<Horaire[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    $.get<Horaire[]>('/menus/ref/horaires').then(setHoraires).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ========= NAVBAR ========= */}
      <header className="sticky top-0 z-40 bg-creme-200/85 backdrop-blur border-b border-cafe-900/8">
        <div className="container-edit flex items-center justify-between h-18 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="font-display text-2xl text-bordeaux-700 leading-none tracking-tight transition-transform group-hover:scale-[1.02]">
              Vite <span className="text-or-500 italic font-light">&amp;</span> Gourmand
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <NavItem to="/menus">Les menus</NavItem>
            <NavItem to="/contact">Contact</NavItem>
            {user?.role === 'employe' && <NavItem to="/employee">Espace pro</NavItem>}
            {user?.role === 'administrateur' && <NavItem to="/admin">Administration</NavItem>}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={user.role === 'utilisateur' ? '/espace' : (user.role === 'employe' ? '/employee' : '/admin')} className="flex items-center gap-2 text-sm font-medium text-cafe-900 hover:text-bordeaux-700">
                  <UserIcon size={16} />
                  <span>{user.prenom}</span>
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-cafe-700 hover:text-bordeaux-700">
                  Déconnexion
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm font-medium text-cafe-900 hover:text-bordeaux-700">Connexion</Link>
                <Link to="/auth/signup" className="btn-primary text-sm py-2 px-5">Créer un compte</Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button onClick={() => setOpen((v) => !v)} className="md:hidden p-2 -mr-2 text-cafe-900" aria-label="Menu">
            {open ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-creme-100 border-t border-cafe-900/8">
            <div className="container-edit py-4 flex flex-col gap-4">
              <MobileItem to="/" onClick={() => setOpen(false)}>Accueil</MobileItem>
              <MobileItem to="/menus" onClick={() => setOpen(false)}>Les menus</MobileItem>
              <MobileItem to="/contact" onClick={() => setOpen(false)}>Contact</MobileItem>
              {user ? (
                <>
                  <MobileItem to={user.role === 'utilisateur' ? '/espace' : (user.role === 'employe' ? '/employee' : '/admin')} onClick={() => setOpen(false)}>Mon espace</MobileItem>
                  <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="text-left py-2 text-cafe-700">Déconnexion</button>
                </>
              ) : (
                <>
                  <MobileItem to="/auth/login" onClick={() => setOpen(false)}>Connexion</MobileItem>
                  <Link to="/auth/signup" onClick={() => setOpen(false)} className="btn-primary self-start">Créer un compte</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========= MAIN ========= */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ========= FOOTER ========= */}
      <footer className="border-t border-cafe-900/8 bg-cafe-900 text-creme-200 mt-32">
        <div className="container-edit py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <p className="font-display text-3xl text-creme-100 leading-tight">
              Vite <span className="text-or-500 italic font-light">&amp;</span> Gourmand
            </p>
            <p className="mt-4 text-sm leading-relaxed text-creme-300 max-w-sm">
              Traiteur événementiel à Bordeaux depuis 2001.<br />
              Julie &amp; José cuisinent vos évènements avec des produits de saison.
            </p>
          </div>

          <div>
            <p className="eyebrow text-or-500 mb-4">Horaires</p>
            <ul className="space-y-1.5 text-sm">
              {horaires.map((h) => (
                <li key={h.jour} className="flex justify-between gap-4">
                  <span className="capitalize text-creme-300">{h.jour}</span>
                  <span className={cn(h.est_ferme ? 'text-creme-300/60' : 'text-creme-100')}>
                    {h.est_ferme ? 'Fermé' : `${h.heure_ouverture?.slice(0,5)} – ${h.heure_fermeture?.slice(0,5)}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-or-500 mb-4">Légal</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/mentions-legales" className="hover:text-or-500 transition-colors">Mentions légales</Link></li>
              <li><Link to="/cgv" className="hover:text-or-500 transition-colors">Conditions générales de vente</Link></li>
              <li><Link to="/contact" className="hover:text-or-500 transition-colors">Nous contacter</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-creme-200/10">
          <div className="container-edit py-6 text-xs text-creme-300/60 flex flex-wrap items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} Vite &amp; Gourmand — Bordeaux</span>
            <span>Projet ECF Studi — TP DWWM 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'text-sm font-medium transition-colors duration-200',
          isActive ? 'text-bordeaux-700' : 'text-cafe-800 hover:text-bordeaux-700',
        )
      }
    >
      {children}
    </NavLink>
  );
}

function MobileItem({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <NavLink to={to} onClick={onClick} className="block py-2 text-base font-medium text-cafe-900">
      {children}
    </NavLink>
  );
}
