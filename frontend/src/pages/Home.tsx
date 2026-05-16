import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, ArrowRight, Users, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import type { MenuItem } from '../components/MenuCard';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { MagneticCard } from '../components/MagneticCard';

type PublicReview = {
  note: number;
  commentaire: string | null;
  created_at: string;
  utilisateur: { prenom: string };
};

const HERO_IMG = 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1600&q=90&auto=format';
const ATELIER_IMG_1 = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&q=85';
const ATELIER_IMG_2 = 'https://images.unsplash.com/photo-1543352634-99a5d50ae78e?w=900&q=85';
const ATELIER_IMG_3 = 'https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?w=900&q=85';
const ATELIER_IMG_4 = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=85';

export function Home() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroOverlayOpacity = useTransform(scrollY, [0, 400], [0.25, 0.6]);

  useEffect(() => {
    api<PublicReview[]>('/users/reviews/public').then(setReviews).catch(() => {});
    api<MenuItem[]>('/menus').then((m) => setFeatured(m.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <>
      {/* ============================================================
          HERO — split editorial avec photo plein cadre + parallax
          ============================================================ */}
      <section className="relative overflow-hidden">
        <div className="container-edit pt-16 pb-12 lg:pt-24 lg:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-6 relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="eyebrow block mb-6"
            >
              Bordeaux · Depuis 2001
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
              className="display text-display-2xl text-bordeaux-700"
            >
              Le goût juste,<br />
              <em className="not-italic text-cafe-900">à votre table.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 text-lg leading-relaxed text-cafe-800 max-w-md"
            >
              Julie &amp; José cuisinent pour vos évènements depuis vingt-cinq ans.
              Des menus de saison, conçus à la main, livrés chez vous.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Link to="/menus" className="btn-primary group">
                Découvrir les menus
                <ArrowRight size={16} className="transition-transform duration-300 ease-gourmand group-hover:translate-x-1" />
              </Link>
              <Link to="/contact" className="btn-ghost">Demande sur-mesure</Link>
            </motion.div>

            {/* Sub-figures */}
            <motion.dl
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-12 lg:mt-16 grid grid-cols-3 gap-6 max-w-md"
            >
              <Fig num="25" label="ans d'expérience" />
              <Fig num="120+" label="évènements/an" />
              <Fig num="5★" label="avis clients" />
            </motion.dl>
          </div>

          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] rounded-card overflow-hidden shadow-pop"
            >
              <motion.img
                src={HERO_IMG} alt="Plat signature Vite & Gourmand"
                className="w-full h-full object-cover"
                style={{ y: heroImgY }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-cafe-900/60 via-transparent to-transparent"
                style={{ opacity: heroOverlayOpacity }}
              />
              <div className="absolute bottom-6 left-6 text-creme-100">
                <p className="eyebrow text-or-500">Plat du jour</p>
                <p className="font-display text-2xl mt-1">Cabillaud, beurre blanc</p>
              </div>
            </motion.div>

            {/* Petite card flottante "5 étoiles" */}
            <motion.aside
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.6 }}
              className="absolute -bottom-6 -left-4 lg:left-auto lg:-right-6 bg-creme-100 rounded-card shadow-card p-5 max-w-[220px]"
            >
              <div className="flex gap-0.5 text-or-500">
                {[1,2,3,4,5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="font-display text-lg text-cafe-900 mt-2 leading-tight">« Un service irréprochable. »</p>
              <p className="text-xs text-cafe-700 mt-1">— Sophie L., mariage 2026</p>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* ============================================================
          MENUS SELECTION DU MOMENT
          ============================================================ */}
      {featured.length > 0 && (
        <section className="container-edit py-24 lg:py-32">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <span className="eyebrow">Sélection du moment</span>
              <h2 className="display text-display-lg text-cafe-900 mt-3">
                Nos <em className="not-italic text-bordeaux-700">propositions</em>.
              </h2>
            </div>
            <Link to="/menus" className="text-sm font-medium text-bordeaux-700 inline-flex items-center gap-1 group">
              Voir tous les menus <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((m, i) => <FeaturedMenu key={m.menu_id} menu={m} index={i} />)}
          </div>
        </section>
      )}

      {/* ============================================================
          MANIFESTE — bandeau crème avec dropcap
          ============================================================ */}
      <section className="bg-creme-100 border-y border-cafe-900/8 py-24">
        <div className="container-edit grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <span className="eyebrow">Notre approche</span>
            <h2 className="display text-display-lg text-cafe-900 mt-4">
              Vingt-cinq ans <em className="not-italic text-bordeaux-700">d'évidence</em>.
            </h2>
          </div>
          <div className="lg:col-span-8 lg:pt-2">
            <p className="dropcap text-lg leading-relaxed text-cafe-800">
              Nous croyons aux choses simples. Un produit choisi auprès d'un maraîcher qu'on connaît par son prénom.
              Une cuisson surveillée. Une nappe qu'on dresse soi-même. Vingt-cinq ans plus tard, ces évidences
              dessinent encore nos menus. Du mariage intime au dîner de Noël, chaque prestation est pensée comme
              un service personnel — parce que c'est ce que nous savons faire le mieux.
            </p>
            <div className="rule-gold mt-10" />
          </div>
        </div>
      </section>

      {/* ============================================================
          ATELIER — collage photo asymétrique
          ============================================================ */}
      <section className="container-edit py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <span className="eyebrow">L'atelier</span>
            <h2 className="display text-display-lg text-cafe-900 mt-3">
              Notre cuisine, <em className="not-italic text-bordeaux-700">en images</em>.
            </h2>
            <p className="mt-6 text-cafe-800 leading-relaxed max-w-md">
              Chaque jour avant 6h, José est aux Capucins. Chaque jour, Julie dresse l'ardoise des plats du moment.
              Ce qui finit dans votre assiette commence dans nos paniers.
            </p>
            <Link to="/contact" className="btn-ghost mt-8 inline-flex">Visiter l'atelier</Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-6 gap-3 lg:gap-4">
            <AtelierImg src={ATELIER_IMG_1} className="col-span-4 row-span-2 aspect-square" />
            <AtelierImg src={ATELIER_IMG_2} className="col-span-2 aspect-[3/4]" />
            <AtelierImg src={ATELIER_IMG_3} className="col-span-2 aspect-[3/4]" />
            <AtelierImg src={ATELIER_IMG_4} className="col-span-6 aspect-[16/7]" />
          </div>
        </div>
      </section>

      {/* ============================================================
          TÉMOIGNAGES
          ============================================================ */}
      {reviews.length > 0 && (
        <section className="bg-creme-100 border-y border-cafe-900/8 py-24 lg:py-32">
          <div className="container-edit">
            <div className="text-center mb-16">
              <span className="eyebrow">Ce qu'on dit de nous</span>
              <h2 className="display text-display-lg text-cafe-900 mt-4">
                Les <em className="not-italic text-bordeaux-700">voix</em> de nos clients.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((r, i) => (
                <motion.figure
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className="card p-7"
                >
                  <div className="flex gap-1 text-or-500 mb-4">
                    {Array.from({ length: r.note }).map((_, k) => <Star key={k} size={14} fill="currentColor" />)}
                    {Array.from({ length: 5 - r.note }).map((_, k) => <Star key={`e${k}`} size={14} />)}
                  </div>
                  <blockquote className="text-cafe-800 leading-relaxed">
                    « {r.commentaire || 'Excellent service, à recommander.'} »
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-cafe-700">
                    — <span className="font-medium text-cafe-900">{r.utilisateur.prenom}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          CTA FINAL
          ============================================================ */}
      <section className="relative overflow-hidden bg-bordeaux-700 text-creme-100">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=85")`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-bordeaux-900/70 via-bordeaux-700/60 to-bordeaux-700/80" />
        <div className="container-edit py-24 lg:py-32 text-center relative">
          <h2 className="display text-display-lg text-creme-100">
            Une <em className="not-italic text-or-500">occasion</em> à célébrer ?
          </h2>
          <p className="mt-6 text-creme-200 max-w-xl mx-auto">
            Découvrez nos menus de saison ou contactez-nous pour un évènement sur-mesure.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/menus" className="btn-gold">Voir tous les menus</Link>
            <Link to="/contact" className="btn-ghost border-creme-100/30 text-creme-100 hover:bg-creme-100 hover:text-bordeaux-700">
              Demande sur-mesure
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================ */

function Fig({ num, label }: { num: string; label: string }) {
  // num like "25", "120+", "5★" — parse it
  const match = num.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1] || '0', 10) : 0;
  const suffix = match ? match[2] || '' : num;

  return (
    <div>
      <p className="font-display text-3xl text-bordeaux-700 leading-none">
        <AnimatedCounter target={target} suffix={suffix} />
      </p>
      <p className="text-xs text-cafe-700 mt-1.5 leading-tight">{label}</p>
    </div>
  );
}

function AtelierImg({ src, className }: { src: string; className: string }) {
  return (
    <motion.div
      whileInView={{ opacity: [0, 1], scale: [0.95, 1] }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-card group ${className}`}
    >
      <img src={src} alt="" loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 ease-gourmand group-hover:scale-105" />
    </motion.div>
  );
}

function FeaturedMenu({ menu, index }: { menu: MenuItem; index: number }) {
  const cover = menu.galerie_urls?.[0];
  const regimes = (menu.menu_regime || []).map((r) => r.regime.libelle);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link to={`/menus/${menu.menu_id}`} className="block">
        <MagneticCard intensity={6} className="relative aspect-[4/5] rounded-card overflow-hidden bg-creme-300 shadow-card">
          {cover && (
            <motion.img
              src={cover} alt={menu.titre} loading="lazy"
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full object-cover transition-transform duration-700 ease-gourmand group-hover:scale-105"
              style={{ transform: 'translateZ(0)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-cafe-900/80 via-cafe-900/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-creme-100" style={{ transform: 'translateZ(20px)' }}>
            {menu.theme && <span className="eyebrow text-or-500 capitalize">{menu.theme.libelle}</span>}
            <h3 className="font-display text-2xl mt-2 leading-tight">{menu.titre}</h3>
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1 flex-wrap">
                {regimes.slice(0, 2).map((r) => (
                  <span key={r} className="tag bg-creme-50/20 text-creme-100 border-creme-100/20 capitalize text-[10px] backdrop-blur">{r}</span>
                ))}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-creme-100/70">à partir de</p>
                <p className="font-display text-2xl text-or-500 leading-none">{menu.prix_par_personne.toFixed(0)}€</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-creme-100/80">
              <Users size={12} /> {menu.nombre_personne_minimum}+ pers.
            </div>
          </div>
        </MagneticCard>
      </Link>
    </motion.article>
  );
}
