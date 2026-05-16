import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, ChevronLeft, Sparkles } from 'lucide-react';
import { $ } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type Plat = {
  plat: {
    plat_id: number; libelle: string; description: string; type: 'entree' | 'plat' | 'dessert'; photo_url: string | null;
    plat_allergene: Array<{ allergene: { allergene_id: number; libelle: string } }>;
  };
};

type MenuFull = {
  menu_id: number; titre: string; description: string; prix_par_personne: number; nombre_personne_minimum: number;
  quantite_restante: number; galerie_urls: string[]; conditions: string | null;
  theme: { libelle: string };
  menu_regime: Array<{ regime: { libelle: string } }>;
  menu_plat: Plat[];
};

const TYPE_LABEL: Record<string, string> = { entree: 'Entrée', plat: 'Plat', dessert: 'Dessert' };

export function MenuDetail() {
  const { id } = useParams<{ id: string }>();
  const [menu, setMenu] = useState<MenuFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    $.get<MenuFull>(`/menus/${id}`)
      .then(setMenu)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleOrder() {
    if (!menu) return;
    if (!user) {
      navigate(`/auth/login?next=/commander/${menu.menu_id}`);
      return;
    }
    navigate(`/commander/${menu.menu_id}`);
  }

  if (loading) return <div className="container-edit py-32 text-center text-cafe-700">Chargement…</div>;
  if (error || !menu) return <div className="container-edit py-32 text-center text-bordeaux-700">{error || 'Menu introuvable'}</div>;

  const cover = menu.galerie_urls?.[0];
  const others = menu.galerie_urls?.slice(1) || [];
  const platsByType: Record<string, Plat[]> = { entree: [], plat: [], dessert: [] };
  menu.menu_plat.forEach((mp) => {
    if (mp.plat) platsByType[mp.plat.type]?.push(mp);
  });

  return (
    <div className="pb-32">
      {/* Cover */}
      <div className="relative h-[60vh] min-h-[480px] bg-cafe-900 overflow-hidden">
        {cover ? (
          <img src={cover} alt={menu.titre} className="absolute inset-0 w-full h-full object-cover opacity-90" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-or-500/30">
            <Sparkles size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-cafe-900/30 via-transparent to-cafe-900/85" />

        <div className="absolute inset-x-0 bottom-0 container-edit pb-16">
          <Link to="/menus" className="inline-flex items-center gap-1.5 text-creme-200/80 hover:text-or-500 text-sm mb-6">
            <ChevronLeft size={14} /> Retour aux menus
          </Link>
          <motion.span
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow text-or-500 capitalize">{menu.theme.libelle}</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="display text-display-xl text-creme-100 mt-3 max-w-3xl">
            {menu.titre}
          </motion.h1>
        </div>
      </div>

      <div className="container-edit pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Colonne contenu */}
          <div className="lg:col-span-8 space-y-16">
            <section>
              <p className="text-lg leading-relaxed text-cafe-800">{menu.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {menu.menu_regime.map((mr) => (
                  <span key={mr.regime.libelle} className="tag-gold capitalize">{mr.regime.libelle}</span>
                ))}
              </div>
            </section>

            {/* Composition */}
            {(['entree','plat','dessert'] as const).map((type) =>
              platsByType[type] && platsByType[type].length > 0 ? (
                <section key={type}>
                  <h2 className="eyebrow mb-6">{TYPE_LABEL[type]}{platsByType[type].length > 1 ? 's' : ''}</h2>
                  <div className="space-y-6">
                    {platsByType[type].map((mp) => (
                      <article key={mp.plat.plat_id} className="border-l-2 border-or-500/40 pl-6 py-1">
                        <h3 className="font-display text-2xl text-cafe-900">{mp.plat.libelle}</h3>
                        {mp.plat.description && <p className="text-cafe-700 mt-1 leading-relaxed">{mp.plat.description}</p>}
                        {mp.plat.plat_allergene.length > 0 && (
                          <p className="text-xs text-cafe-700 mt-2">
                            <span className="font-medium">Allergènes :</span>{' '}
                            {mp.plat.plat_allergene.map((pa) => pa.allergene.libelle).join(', ')}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null,
            )}

            {/* Conditions */}
            {menu.conditions && (
              <section className="bg-bordeaux-50 border border-bordeaux-200 rounded-card p-6 flex gap-4">
                <AlertTriangle size={20} className="text-bordeaux-700 flex-shrink-0 mt-1" />
                <div>
                  <p className="eyebrow text-bordeaux-700 mb-2">Conditions du menu</p>
                  <p className="text-bordeaux-800 leading-relaxed">{menu.conditions}</p>
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section className="grid grid-cols-2 gap-4">
                {others.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full aspect-[4/5] object-cover rounded-card" loading="lazy" />
                ))}
              </section>
            )}
          </div>

          {/* Colonne commande (sticky) */}
          <aside className="lg:col-span-4">
            <div className="card p-8 lg:sticky lg:top-24">
              <p className="eyebrow">À partir de</p>
              <p className="font-display text-display-md text-bordeaux-700 leading-none mt-2">
                {menu.prix_par_personne.toFixed(2)}€
              </p>
              <p className="text-sm text-cafe-700 mt-1">par personne</p>

              <div className="mt-6 pt-6 border-t border-cafe-900/8 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-cafe-700 flex items-center gap-1.5"><Users size={14} /> Minimum</span>
                  <span className="text-cafe-900 font-medium">{menu.nombre_personne_minimum} personnes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cafe-700">Stock</span>
                  <span className={menu.quantite_restante > 3 ? 'text-cafe-900' : 'text-bordeaux-700 font-medium'}>
                    {menu.quantite_restante > 0 ? `${menu.quantite_restante} disponibles` : 'Épuisé'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cafe-700">Remise</span>
                  <span className="text-or-700 text-xs">-10% dès {menu.nombre_personne_minimum + 5} pers.</span>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={menu.quantite_restante <= 0}
                className="mt-8 btn-primary w-full"
              >
                Commander ce menu
              </button>
              {!user && (
                <p className="text-xs text-center text-cafe-700 mt-3">
                  Vous serez invité à vous connecter ou à créer un compte.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
