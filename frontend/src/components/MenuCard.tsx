import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';

export type MenuItem = {
  menu_id: number;
  titre: string;
  description: string;
  prix_par_personne: number;
  nombre_personne_minimum: number;
  quantite_restante: number;
  galerie_urls?: string[];
  theme?: { libelle: string };
  menu_regime?: Array<{ regime: { libelle: string } }>;
};

export function MenuCard({ menu, index = 0 }: { menu: MenuItem; index?: number }) {
  const cover = menu.galerie_urls?.[0];
  const regimes = (menu.menu_regime || []).map((r) => r.regime.libelle);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to={`/menus/${menu.menu_id}`} className="block">
        <div className="card overflow-hidden">
          <div className="aspect-[4/5] overflow-hidden bg-creme-300 relative">
            {cover ? (
              <img
                src={cover}
                alt={menu.titre}
                className="w-full h-full object-cover transition-transform duration-700 ease-gourmand group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cafe-700/30">
                <Sparkles size={36} />
              </div>
            )}
            {menu.theme && (
              <span className="absolute top-4 left-4 tag bg-creme-50/95 backdrop-blur capitalize">
                {menu.theme.libelle}
              </span>
            )}
          </div>

          <div className="p-6">
            <h3 className="font-display text-2xl text-cafe-900 leading-tight">{menu.titre}</h3>
            <p className="mt-2 text-sm text-cafe-700 line-clamp-2">{menu.description}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {regimes.map((r) => (
                <span key={r} className="tag-gold capitalize">{r}</span>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-cafe-900/8 flex items-end justify-between">
              <div>
                <p className="text-eyebrow uppercase text-cafe-700 mb-1">À partir de</p>
                <p className="font-display text-3xl text-bordeaux-700 leading-none">
                  {menu.prix_par_personne.toFixed(0)}<span className="text-xl text-cafe-700">€</span>
                </p>
                <p className="text-xs text-cafe-700 mt-0.5">par personne</p>
              </div>
              <div className="text-right text-xs text-cafe-700 flex items-center gap-1.5">
                <Users size={14} /> {menu.nombre_personne_minimum}+ pers.
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
