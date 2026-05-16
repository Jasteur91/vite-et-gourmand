/**
 * Mentions légales + CGV, exportées comme deux pages distinctes.
 * Texte simplifié, conforme aux obligations classiques (loi Hamon, RGPD, livraison).
 */

export function MentionsLegales() {
  return (
    <article className="container-edit py-20 max-w-3xl">
      <span className="eyebrow">Légal</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">Mentions légales</h1>
      <div className="mt-10 space-y-8 text-cafe-800 leading-relaxed">
        <Section title="Éditeur du site">
          Vite &amp; Gourmand SAS<br />
          12 rue des Vendanges, 33000 Bordeaux<br />
          RCS Bordeaux 123 456 789 — SIRET 123 456 789 00012<br />
          Email : contact@vite-et-gourmand.fr<br />
          Téléphone : 05 56 00 00 00<br />
          Directeur de la publication : José ___
        </Section>
        <Section title="Hébergement">
          Frontend : Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
          Backend : Railway Corp. — 444 De Haro St #200, San Francisco, CA 94107, USA<br />
          Base de données relationnelle : Supabase Inc. — Région Paris (eu-west-3)<br />
          Base NoSQL : MongoDB Atlas
        </Section>
        <Section title="Propriété intellectuelle">
          L'ensemble des éléments du site (textes, photos, identité visuelle) est protégé.
          Toute reproduction, même partielle, est interdite sans autorisation préalable.
        </Section>
        <Section title="Données personnelles (RGPD)">
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression
          de vos données personnelles. Pour exercer ces droits : contact@vite-et-gourmand.fr.<br />
          Les données collectées (nom, prénom, email, téléphone, adresse) sont strictement nécessaires
          à l'exécution du contrat de prestation. Elles ne sont pas cédées à des tiers.
        </Section>
        <Section title="Cookies">
          Ce site n'utilise pas de cookies de suivi tiers. Seul un cookie de session est utilisé
          pour maintenir votre connexion. Aucun consentement préalable n'est requis.
        </Section>
      </div>
    </article>
  );
}

export function CGV() {
  return (
    <article className="container-edit py-20 max-w-3xl">
      <span className="eyebrow">Légal</span>
      <h1 className="display text-display-lg text-cafe-900 mt-3">Conditions générales de vente</h1>
      <div className="mt-10 space-y-8 text-cafe-800 leading-relaxed">
        <Section title="1. Objet">
          Les présentes CGV régissent la commande de prestations traiteur réalisées par Vite &amp; Gourmand
          via le site vite-et-gourmand.fr.
        </Section>
        <Section title="2. Commande">
          Toute commande doit être validée par le client dans son espace personnel.
          Le minimum de personnes est précisé pour chaque menu et doit être respecté.
        </Section>
        <Section title="3. Prix et paiement">
          Les prix s'entendent TTC, en euros. Une remise de 10% est automatiquement appliquée
          dès lors que la commande dépasse de 5 personnes le minimum requis.
          Le paiement s'effectue à la livraison.
        </Section>
        <Section title="4. Livraison">
          La livraison est gratuite dans la ville de Bordeaux. Hors Bordeaux, une participation
          forfaitaire de 5€ s'applique, majorée de 0,59€ par kilomètre parcouru.
        </Section>
        <Section title="5. Modification et annulation">
          Vous pouvez modifier ou annuler votre commande tant que celle-ci n'a pas été
          marquée comme "acceptée" par notre équipe. Au-delà, contactez-nous directement.
        </Section>
        <Section title="6. Prêt de matériel">
          Lorsqu'un matériel vous est prêté (vaisselle, mobilier, etc.), sa restitution doit
          intervenir dans un délai de <strong>10 jours ouvrés</strong> après la prestation.
          À défaut, des frais forfaitaires de <strong>600 €</strong> seront facturés.
        </Section>
        <Section title="7. Allergènes et régimes">
          Les allergènes présents dans nos plats sont indiqués sur chaque fiche menu.
          Pour toute intolérance particulière, contactez-nous avant validation de la commande.
        </Section>
        <Section title="8. Droit applicable et juridiction">
          Les présentes CGV sont régies par le droit français. Tout litige relèvera de la
          juridiction du Tribunal de commerce de Bordeaux.
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-bordeaux-700 mb-3">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
