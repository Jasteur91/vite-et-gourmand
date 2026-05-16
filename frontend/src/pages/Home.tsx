import { motion } from 'framer-motion';

export function Home() {
  return (
    <main className="min-h-screen">
      {/* HERO éditorial */}
      <section className="container-edit pt-22 pb-16 lg:pt-32 lg:pb-24">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow block mb-6"
        >
          Bordeaux · Depuis 2001
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="display text-display-2xl text-bordeaux-700"
        >
          Le goût juste,<br />
          <em className="not-italic text-cafe-900">à votre table.</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-10 max-w-xl text-lg leading-relaxed text-cafe-800"
        >
          Julie & José cuisinent pour vos évènements depuis vingt-cinq ans.
          Des menus de saison, conçus à la main, livrés chez vous.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <a href="/menus" className="btn-primary">Découvrir les menus</a>
          <a href="/contact" className="btn-ghost">Nous contacter</a>
        </motion.div>
      </section>

      {/* En construction — preuve que le design system marche */}
      <section className="container-edit pb-32">
        <div className="rule-gold mb-8" />
        <p className="eyebrow mb-2">Projet ECF Studi</p>
        <p className="text-sm text-cafe-700">
          Squelette du design system prêt. Pages suivantes : menus, détail menu, commande, espaces.
        </p>
      </section>
    </main>
  );
}
