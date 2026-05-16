import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { $ } from '../lib/api';
import { MenuCard, type MenuItem } from '../components/MenuCard';

type Theme = { theme_id: number; libelle: string };
type Regime = { regime_id: number; libelle: string };

export function Menus() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [regimes, setRegimes] = useState<Regime[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [prixMin, setPrixMin] = useState<string>('');
  const [prixMax, setPrixMax] = useState<string>('');
  const [nbPersonnesMin, setNbPersonnesMin] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [regime, setRegime] = useState<string>('');

  // Charge les référentiels (une fois)
  useEffect(() => {
    $.get<Theme[]>('/menus/ref/themes').then(setThemes).catch(() => {});
    $.get<Regime[]>('/menus/ref/regimes').then(setRegimes).catch(() => {});
  }, []);

  // Refetch dynamique à chaque changement de filtre (sans reload page)
  useEffect(() => {
    const params = new URLSearchParams();
    if (prixMin) params.set('prix_min', prixMin);
    if (prixMax) params.set('prix_max', prixMax);
    if (nbPersonnesMin) params.set('nb_personnes_min', nbPersonnesMin);
    if (theme) params.set('theme', theme);
    if (regime) params.set('regime', regime);

    setLoading(true);
    const ctl = new AbortController();
    fetch(`/api/menus?${params.toString()}`, { signal: ctl.signal })
      .then((r) => r.json())
      .then((data) => setMenus(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctl.abort();
  }, [prixMin, prixMax, nbPersonnesMin, theme, regime]);

  const activeCount = useMemo(
    () => [prixMin, prixMax, nbPersonnesMin, theme, regime].filter(Boolean).length,
    [prixMin, prixMax, nbPersonnesMin, theme, regime],
  );

  function resetFilters() {
    setPrixMin(''); setPrixMax(''); setNbPersonnesMin(''); setTheme(''); setRegime('');
  }

  return (
    <div className="container-edit py-16 lg:py-20">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="eyebrow">Carte du moment</span>
        <h1 className="display text-display-xl text-cafe-900 mt-3">
          Tous les <em className="not-italic text-bordeaux-700">menus</em>.
        </h1>
        <p className="mt-6 text-cafe-800 max-w-xl">
          Filtrez par thème, régime, prix ou nombre de personnes pour trouver le menu qui correspond
          à votre événement.
        </p>
      </div>

      {/* Bar filtres mobile */}
      <div className="lg:hidden mt-10 flex items-center justify-between">
        <button onClick={() => setFiltersOpen((v) => !v)} className="btn-ghost text-sm py-2 px-4">
          <SlidersHorizontal size={16} /> Filtres {activeCount > 0 && <span className="ml-1 text-bordeaux-700">({activeCount})</span>}
        </button>
        {activeCount > 0 && (
          <button onClick={resetFilters} className="text-sm text-cafe-700 underline">Réinitialiser</button>
        )}
      </div>

      <div className="mt-10 lg:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ====== FILTRES ====== */}
        <aside className={`lg:col-span-3 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <p className="eyebrow">Filtres</p>
              {activeCount > 0 && (
                <button onClick={resetFilters} className="text-xs text-cafe-700 hover:text-bordeaux-700 inline-flex items-center gap-1">
                  <X size={12} /> Tout effacer
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="label">Prix par personne</label>
                <div className="flex gap-2">
                  <input type="number" min="0" placeholder="Min" value={prixMin} onChange={(e) => setPrixMin(e.target.value)} className="input text-sm" />
                  <input type="number" min="0" placeholder="Max" value={prixMax} onChange={(e) => setPrixMax(e.target.value)} className="input text-sm" />
                </div>
              </div>

              <div>
                <label className="label">Min. personnes</label>
                <input type="number" min="1" placeholder="ex. 10" value={nbPersonnesMin} onChange={(e) => setNbPersonnesMin(e.target.value)} className="input text-sm" />
              </div>

              <div>
                <label className="label">Thème</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value)} className="input text-sm">
                  <option value="">Tous</option>
                  {themes.map((t) => <option key={t.theme_id} value={t.libelle} className="capitalize">{t.libelle}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Régime</label>
                <select value={regime} onChange={(e) => setRegime(e.target.value)} className="input text-sm">
                  <option value="">Tous</option>
                  {regimes.map((r) => <option key={r.regime_id} value={r.libelle} className="capitalize">{r.libelle}</option>)}
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* ====== RESULTATS ====== */}
        <div className="lg:col-span-9">
          <div className="flex items-baseline justify-between mb-6">
            <p className="text-sm text-cafe-700">
              {loading ? 'Recherche…' : `${menus.length} menu${menus.length > 1 ? 's' : ''}`}
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {menus.length === 0 && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="card p-12 text-center"
              >
                <p className="font-display text-2xl text-cafe-900">Aucun menu ne correspond.</p>
                <p className="text-cafe-700 mt-2">Essayez d'élargir vos critères.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {menus.map((m, i) => (
                  <MenuCard key={m.menu_id} menu={m} index={i} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
