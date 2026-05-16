import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { $ } from '../lib/api';

type PublicReview = {
  note: number;
  commentaire: string | null;
  created_at: string;
  utilisateur: { prenom: string };
};

export function Home() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);

  useEffect(() => {
    $.get<PublicReview[]>('/users/reviews/public').then(setReviews).catch(() => {});
  }, []);

  return (
    <>
      {/* ============= HERO ============= */}
      <section className="container-edit pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <motion.span
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="eyebrow block mb-6"
            >
              Bordeaux · Depuis 2001
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="display text-display-2xl text-bordeaux-700"
            >
              Le goût juste,<br />
              <em className="not-italic text-cafe-900">à votre table.</em>
            </motion.h1>
          </div>
          <div className="lg:col-span-5 lg:pb-3">
            <motion.p
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
              className="text-lg leading-relaxed text-cafe-800 max-w-md"
            >
              Julie &amp; José cuisinent pour vos évènements depuis vingt-cinq ans.
              Des menus de saison, conçus à la main, livrés chez vous.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/menus" className="btn-primary group">
                Découvrir les menus
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/contact" className="btn-ghost">Nous contacter</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============= MANIFESTE ============= */}
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

      {/* ============= TÉMOIGNAGES ============= */}
      {reviews.length > 0 && (
        <section className="container-edit py-24 lg:py-32">
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
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
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
        </section>
      )}

      {/* ============= CTA FINAL ============= */}
      <section className="bg-bordeaux-700 text-creme-100">
        <div className="container-edit py-24 text-center">
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
