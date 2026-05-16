import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayoutDashboard, Users as UsersIcon, ChefHat, Shield, MessageSquare } from 'lucide-react';
import { $ } from '../../lib/api';
import { EmployeeEspace } from '../employee/Espace';

type Employee = {
  utilisateur_id: number; email: string; nom: string; prenom: string;
  est_actif: boolean; created_at: string; role: { libelle: string };
};

type OrdersByMenu = { menu_id: number; titre: string; count: number };
type Revenue = { total_ca: number; par_menu: Array<{ menu_id: number; titre: string; ca: number; count: number }> };

const COLORS = ['#6B1F2A', '#C8A35A', '#E8704A', '#9B3344', '#A88436', '#7E2435', '#D8542B', '#967B47'];

export function AdminEspace() {
  const [tab, setTab] = useState<'dashboard' | 'employees' | 'operations'>('dashboard');

  return (
    <div className="container-edit py-16">
      <span className="eyebrow flex items-center gap-2"><Shield size={12} /> Administration</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">Tableau de bord administrateur</h1>

      <div className="mt-10 flex flex-wrap gap-2 border-b border-cafe-900/10">
        <Tab active={tab === 'dashboard'} onClick={() => setTab('dashboard')} icon={<LayoutDashboard size={14} />}>Statistiques</Tab>
        <Tab active={tab === 'employees'} onClick={() => setTab('employees')} icon={<UsersIcon size={14} />}>Employés</Tab>
        <Tab active={tab === 'operations'} onClick={() => setTab('operations')} icon={<ChefHat size={14} />}>Opérations</Tab>
      </div>

      {tab === 'dashboard' && <Dashboard />}
      {tab === 'employees' && <Employees />}
      {tab === 'operations' && <EmployeeEspace />}
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

function Dashboard() {
  const [since, setSince] = useState<string>('');
  const [until, setUntil] = useState<string>('');
  const [orders, setOrders] = useState<OrdersByMenu[]>([]);
  const [rev, setRev] = useState<Revenue | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (since) params.set('since', since);
    if (until) params.set('until', until);
    $.get<OrdersByMenu[]>(`/admin/dashboard/orders-by-menu?${params}`).then(setOrders);
    $.get<Revenue>(`/admin/dashboard/revenue?${params}`).then(setRev);
  }, [since, until]);

  const maxCount = useMemo(() => orders.reduce((m, o) => Math.max(m, o.count), 0), [orders]);

  return (
    <div className="mt-8 space-y-8">
      {/* Filtres période */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Depuis</label>
          <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className="input text-sm" />
        </div>
        <div>
          <label className="label">Jusqu'à</label>
          <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className="input text-sm" />
        </div>
        <button onClick={() => { setSince(''); setUntil(''); }} className="btn-ghost text-sm py-2 px-4">Reset</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI label="Chiffre d'affaires" value={rev ? `${rev.total_ca.toFixed(2)} €` : '—'} />
        <KPI label="Commandes" value={orders.reduce((s, o) => s + o.count, 0).toString()} />
        <KPI label="Menus actifs" value={orders.length.toString()} />
      </div>

      {/* Graphique commandes par menu */}
      <div className="card p-6">
        <p className="eyebrow mb-4">Commandes par menu</p>
        {orders.length === 0 ? (
          <p className="text-center py-12 text-cafe-700">Aucune donnée pour la période sélectionnée.</p>
        ) : (
          <div style={{ width: '100%', height: 360 }}>
            <ResponsiveContainer>
              <BarChart data={orders} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#2D1810" strokeOpacity={0.08} />
                <XAxis dataKey="titre" stroke="#2D1810" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis stroke="#2D1810" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(107,31,42,0.08)' }}
                  contentStyle={{ background: '#FDFBF6', border: '1px solid #2D181020', borderRadius: 12, fontFamily: 'Inter, sans-serif' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {orders.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="text-xs text-cafe-700 mt-4 italic">Données issues de la base NoSQL (MongoDB) — audit trail des changements de statut de commande.</p>
      </div>

      {/* CA par menu */}
      {rev && rev.par_menu.length > 0 && (
        <div className="card p-6">
          <p className="eyebrow mb-4">Chiffre d'affaires par menu</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-cafe-700 border-b border-cafe-900/8">
                <th className="py-3">Menu</th>
                <th className="py-3 text-right">Commandes</th>
                <th className="py-3 text-right">CA</th>
              </tr>
            </thead>
            <tbody>
              {rev.par_menu.map((m) => (
                <tr key={m.menu_id} className="border-b border-cafe-900/5">
                  <td className="py-3 text-cafe-900">{m.titre}</td>
                  <td className="py-3 text-right text-cafe-700">{m.count}</td>
                  <td className="py-3 text-right text-bordeaux-700 font-medium">{m.ca.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-6">
      <p className="eyebrow text-cafe-700">{label}</p>
      <p className="font-display text-display-md text-bordeaux-700 mt-2 leading-none">{value}</p>
    </div>
  );
}

function Employees() {
  const [list, setList] = useState<Employee[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nom: '', prenom: '' });

  function reload() { $.get<Employee[]>('/admin/employees').then(setList); }
  useEffect(reload, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      await $.post('/admin/employees', form);
      toast.success('Employé créé. Un mail lui a été envoyé.');
      setForm({ email: '', password: '', nom: '', prenom: '' });
      setCreating(false);
      reload();
    } catch (e: any) { toast.error(e.message); }
  }

  async function toggle(emp: Employee) {
    try {
      await $.post(`/admin/employees/${emp.utilisateur_id}/${emp.est_actif ? 'disable' : 'enable'}`);
      toast.success(emp.est_actif ? 'Compte désactivé' : 'Compte réactivé');
      reload();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cafe-700">{list.length} comptes</p>
        <button onClick={() => setCreating((v) => !v)} className="btn-primary text-sm py-2 px-4">
          {creating ? 'Annuler' : 'Créer un employé'}
        </button>
      </div>

      {creating && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Prénom" required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="input text-sm" />
            <input placeholder="Nom" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="input text-sm" />
            <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input text-sm col-span-2" />
            <input type="text" placeholder="Mot de passe initial (10+ chars, complexe)" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input text-sm col-span-2" />
          </div>
          <p className="text-xs text-cafe-700">Le MDP n'est PAS envoyé par mail (sécurité). Vous devrez le lui transmettre en direct.</p>
          <button type="submit" className="btn-primary">Créer le compte</button>
        </form>
      )}

      <div className="card divide-y divide-cafe-900/5">
        {list.map((e) => (
          <div key={e.utilisateur_id} className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-cafe-900 font-medium">{e.prenom} {e.nom} <span className="tag ml-2 capitalize">{e.role.libelle}</span></p>
              <p className="text-sm text-cafe-700">{e.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${e.est_actif ? 'text-or-700' : 'text-cafe-700/60'}`}>
                {e.est_actif ? 'Actif' : 'Désactivé'}
              </span>
              {e.role.libelle !== 'administrateur' && (
                <button onClick={() => toggle(e)} className="btn-ghost text-xs py-1.5 px-3">
                  {e.est_actif ? 'Désactiver' : 'Réactiver'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
