import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

const BRAND = {
  name: 'Vite & Gourmand',
  bordeaux: '#6B1F2A',
  creme: '#F4ECDD',
  cafe: '#2D1810',
  or: '#C8A35A',
};

function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;background:${BRAND.creme};font-family:Georgia,serif;color:${BRAND.cafe}">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${BRAND.bordeaux};margin:0">${BRAND.name}</p>
      <div style="height:1px;width:48px;background:${BRAND.or};margin:12px auto"></div>
    </div>
    <div style="background:#FDFBF6;border-radius:16px;padding:32px;line-height:1.6">${body}</div>
    <p style="text-align:center;font-size:11px;color:${BRAND.cafe}88;margin-top:24px">
      ${BRAND.name} · Traiteur événementiel à Bordeaux depuis 25 ans
    </p>
  </div>
</body></html>`;
}

async function send(to: string, subject: string, html: string) {
  if (env.NODE_ENV === 'development' && !env.RESEND_API_KEY.startsWith('re_')) {
    console.log(`📧 [dev] Mail simulé → ${to} : ${subject}`);
    return;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: `Vite & Gourmand <${env.RESEND_FROM}>`,
      to,
      subject,
      html,
    });
    if (error) console.error('❌ Resend error:', error);
    return data;
  } catch (e) {
    console.error('❌ Mail send failed:', e);
  }
}

export const emailService = {
  async welcome(to: string, prenom: string) {
    return send(
      to,
      'Bienvenue chez Vite & Gourmand',
      shell(
        'Bienvenue',
        `<h2 style="font-weight:400;font-size:28px;margin-top:0">Bienvenue, ${prenom}.</h2>
         <p>Votre compte vient d'être créé sur <strong>vite-et-gourmand.fr</strong>.</p>
         <p>Vous pouvez désormais commander nos menus de saison et suivre vos commandes en temps réel.</p>
         <p style="margin-top:24px"><a href="${env.APP_URL}/menus" style="background:${BRAND.bordeaux};color:${BRAND.creme};padding:12px 24px;border-radius:999px;text-decoration:none;display:inline-block">Découvrir les menus</a></p>`,
      ),
    );
  },

  async orderConfirmation(to: string, opts: { prenom: string; numero: string; menu: string; total: number; date: string }) {
    return send(
      to,
      `Confirmation de commande ${opts.numero}`,
      shell(
        'Confirmation',
        `<h2 style="font-weight:400;font-size:28px;margin-top:0">Merci ${opts.prenom}.</h2>
         <p>Votre commande <strong>${opts.numero}</strong> est bien reçue.</p>
         <table style="width:100%;margin-top:16px;border-collapse:collapse">
           <tr><td style="padding:8px 0;color:${BRAND.cafe}99">Menu</td><td style="text-align:right">${opts.menu}</td></tr>
           <tr><td style="padding:8px 0;color:${BRAND.cafe}99">Date prestation</td><td style="text-align:right">${opts.date}</td></tr>
           <tr><td style="padding:8px 0;border-top:1px solid #00000010;color:${BRAND.cafe}99">Total</td><td style="text-align:right;border-top:1px solid #00000010;font-weight:600">${opts.total.toFixed(2)} €</td></tr>
         </table>
         <p style="margin-top:24px">Vous recevrez un nouvel email à chaque changement de statut.</p>`,
      ),
    );
  },

  async statusChanged(to: string, opts: { prenom: string; numero: string; statut: string }) {
    const human = {
      accepte: 'acceptée',
      en_preparation: 'en préparation',
      en_cours_de_livraison: 'en cours de livraison',
      livre: 'livrée',
      en_attente_retour_materiel: 'en attente du retour de matériel',
      terminee: 'terminée',
      annulee: 'annulée',
    }[opts.statut] || opts.statut;
    return send(
      to,
      `Commande ${opts.numero} : ${human}`,
      shell(
        'Mise à jour commande',
        `<h2 style="font-weight:400;font-size:28px;margin-top:0">Votre commande est ${human}.</h2>
         <p>Numéro : <strong>${opts.numero}</strong></p>
         <p>Connectez-vous à votre espace pour consulter le détail.</p>
         <p style="margin-top:24px"><a href="${env.APP_URL}/espace" style="background:${BRAND.bordeaux};color:${BRAND.creme};padding:12px 24px;border-radius:999px;text-decoration:none;display:inline-block">Voir ma commande</a></p>`,
      ),
    );
  },

  async materialReturnReminder(to: string, opts: { prenom: string; numero: string }) {
    return send(
      to,
      `Retour de matériel — ${opts.numero}`,
      shell(
        'Retour de matériel',
        `<h2 style="font-weight:400;font-size:28px;margin-top:0">${opts.prenom}, restitution du matériel attendue.</h2>
         <p>Suite à votre commande <strong>${opts.numero}</strong>, du matériel doit être restitué.</p>
         <p>Sans restitution sous <strong>10 jours ouvrés</strong>, des frais de <strong>600 €</strong> seront appliqués (cf. CGV).</p>
         <p>Merci de prendre contact avec nous pour organiser la restitution.</p>`,
      ),
    );
  },

  async reviewInvitation(to: string, opts: { prenom: string; numero: string }) {
    return send(
      to,
      `Votre avis sur votre commande ${opts.numero}`,
      shell(
        'Votre avis',
        `<h2 style="font-weight:400;font-size:28px;margin-top:0">Comment c'était, ${opts.prenom} ?</h2>
         <p>Votre commande <strong>${opts.numero}</strong> est terminée. Votre avis nous aide à progresser.</p>
         <p style="margin-top:24px"><a href="${env.APP_URL}/espace" style="background:${BRAND.bordeaux};color:${BRAND.creme};padding:12px 24px;border-radius:999px;text-decoration:none;display:inline-block">Donner mon avis</a></p>`,
      ),
    );
  },

  async passwordReset(to: string, opts: { prenom: string; token: string }) {
    const link = `${env.APP_URL}/auth/reset?token=${opts.token}`;
    return send(
      to,
      'Réinitialisation de votre mot de passe',
      shell(
        'Mot de passe',
        `<h2 style="font-weight:400;font-size:28px;margin-top:0">Bonjour ${opts.prenom},</h2>
         <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
         <p>Ce lien est valable <strong>1 heure</strong>.</p>
         <p style="margin-top:24px"><a href="${link}" style="background:${BRAND.bordeaux};color:${BRAND.creme};padding:12px 24px;border-radius:999px;text-decoration:none;display:inline-block">Réinitialiser</a></p>
         <p style="margin-top:24px;font-size:12px;color:${BRAND.cafe}88">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
      ),
    );
  },

  async employeeAccountCreated(to: string, opts: { adminEmail: string }) {
    return send(
      to,
      'Votre compte employé Vite & Gourmand',
      shell(
        'Compte employé',
        `<h2 style="font-weight:400;font-size:28px;margin-top:0">Compte créé.</h2>
         <p>Un compte employé vient d'être créé pour vous chez Vite & Gourmand.</p>
         <p>Pour des raisons de sécurité, votre mot de passe initial ne figure pas dans cet email.</p>
         <p>Veuillez prendre contact avec l'administrateur (${opts.adminEmail}) pour l'obtenir.</p>`,
      ),
    );
  },

  async contactReceived(to: string, opts: { titre: string; description: string; from: string }) {
    return send(
      to,
      `Nouveau message : ${opts.titre}`,
      shell(
        'Message reçu',
        `<h2 style="font-weight:400;font-size:28px;margin-top:0">${opts.titre}</h2>
         <p style="color:${BRAND.cafe}99">De : ${opts.from}</p>
         <p style="border-left:3px solid ${BRAND.or};padding-left:16px;margin-top:16px">${opts.description}</p>`,
      ),
    );
  },
};
