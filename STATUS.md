# Vite & Gourmand — Status projet

> Mis à jour : 2026-05-16
> Deadline : **20 mai 2026** (4 jours)
> Budget : ~10h

---

## ✅ Ce qui est fait (~1h)

### Infrastructure
- ✅ Repo GitHub PUBLIC : https://github.com/Jasteur91/vite-et-gourmand
- ✅ Gitflow : `main` + `develop` + branche `feature/database-schema`
- ✅ Supabase project créé : `vite-et-gourmand` (eu-west-3, ID `uwzagqbyauuvivcvhxye`)
- ✅ Sourcify waitlist **paused** (55 emails backupés dans `/Users/jassimelghaouti/Documents/sourcify-waitlist-backup-2026-05-16.json`)

### Base de données
- ✅ Schéma PostgreSQL appliqué : 15 tables (role, utilisateur, theme, regime, allergene, plat, plat_allergene, menu, menu_plat, menu_regime, commande, avis, horaire, password_reset_token, contact_message)
- ✅ Triggers `updated_at` automatiques
- ✅ Seed data : 3 rôles, 4 thèmes, 6 régimes, 14 allergènes, 7 horaires hebdo
- ✅ Indexes + contraintes CHECK
- ✅ Script SQL natif dans `database/migrations/001_initial_schema.sql`

### Backend (skeleton)
- ✅ Express + TypeScript + ESM
- ✅ Validation env vars avec Zod
- ✅ Client Supabase configuré
- ✅ Client MongoDB avec fallback `mongodb-memory-server` (dev) + Atlas (prod)
- ✅ Helmet + CORS sécurisés
- ✅ Healthcheck `/health`
- ✅ Resend API key configurée

### Frontend (skeleton)
- ✅ Vite + React 18 + TypeScript + Tailwind
- ✅ Design system **éditorial gourmand** (Fraunces + Inter, palette bordeaux/crème/or/café/terre)
- ✅ Components base (`.btn-primary`, `.card`, `.input`, `.tag`, etc.)
- ✅ Animations Framer Motion + courbe `gourmand`
- ✅ React Router + React Query + Sonner toasts
- ✅ Home page hero éditorial premium

---

## 🔧 Décisions techniques (à justifier dans la copie ECF)

| Choix | Pourquoi |
|---|---|
| **React + Vite + TS** | Stack moderne, DX rapide, écosystème large, maîtrise étudiant |
| **Tailwind** | Design system tokens forts, productivité, taille bundle optimale |
| **Express + TS** | Simple, mature, courbe d'apprentissage faible, jury familier |
| **Supabase PostgreSQL** | BDD relationnelle managée, gratuit, scripts SQL natifs en parallèle |
| **MongoDB + mongodb-memory-server** | NoSQL obligatoire ECF, mémoire en dev = zéro friction setup |
| **JWT custom + bcrypt** | Auth démontrant maîtrise sécurité (compétence évaluée) |
| **Resend** | Mails transactionnels modernes, free tier 100/j |
| **Vercel + Railway** | Déploiement instantané, gratuit, MCP intégré |

---

## ⏳ Ce qu'il reste (à brûler en ~9h)

### Backend features (~3h)
- [ ] Routes auth : signup (validation MDP), login, reset password, logout
- [ ] Middleware JWT + RBAC (utilisateur/employé/admin)
- [ ] Routes menus : CRUD + filtres dynamiques (prix, thème, régime, nombre personnes)
- [ ] Routes plats + allergènes
- [ ] Routes commandes : créer (calcul prix + livraison + réduction), modifier, annuler, suivi
- [ ] Routes user : profile, mes commandes, donner avis
- [ ] Routes employé : workflow statuts commande + modération avis
- [ ] Routes admin : créer/désactiver employé + dashboard stats (lecture Mongo)
- [ ] Routes contact : envoi formulaire → mail
- [ ] Service mails : welcome, confirmation commande, statut changé, prêt matériel
- [ ] Audit trail Mongo : log chaque changement statut commande

### Frontend features (~4h)
- [ ] Layout global : navbar (logo, menus, connexion, contact) + footer (horaires + mentions + CGV)
- [ ] Home : présentation + avis validés
- [ ] Liste menus + filtres dynamiques (sans reload)
- [ ] Détail menu + bouton commander
- [ ] Auth pages : signup, login, mdp oublié, reset
- [ ] Commande flow (informations, choix menu, nb personnes, validation)
- [ ] Espace utilisateur : profil, mes commandes, suivi, noter
- [ ] Espace employé : commandes (filtres statut/client), modifier statut, modérer avis
- [ ] Espace admin : créer employé + dashboard avec graphique (recharts) + CA filtré
- [ ] Page contact + page mentions légales + page CGV
- [ ] Test RGAA + lighthouse

### Livrables docs (~1h)
- [ ] Charte graphique PDF (palette + typo + composants — déjà 80% dans tailwind.config + index.css)
- [ ] 3 maquettes desktop + 3 mobile (Figma via MCP ou screenshots de l'app finie)
- [ ] Manuel utilisateur PDF avec identifiants test
- [ ] Doc technique PDF (MCD, diagrammes use case + séquence, archi, déploiement)
- [ ] Doc gestion projet (Notion → export PDF)

### Déploiement (~30 min)
- [ ] Push vers GitHub (déjà sur `feature/database-schema` + scaffold)
- [ ] Déploiement Vercel (frontend)
- [ ] Création MongoDB Atlas (cluster M0, 3 min user-action)
- [ ] Déploiement Railway (backend)
- [ ] Configuration domaines + env vars prod

### Soumission Studi (~30 min)
- [ ] Copie ECF Word `ECF_TPDeveloppeurWebEtWebMobile_copiearendre_ELGHAOUTI_Jassim`
- [ ] Justification choix techniques détaillée
- [ ] Sécurité détaillée
- [ ] Upload sur plateforme Studi
- [ ] Vérifier statut "Transmis pour correction"

---

## ⚠️ Blockers connus

1. **MongoDB Atlas prod** : tu dois créer le cluster M0 (3 min) quand on déploie. Je te guiderai. Pour dev, on est OK avec mongodb-memory-server.
2. **DATABASE_URL Supabase direct** : pas critique car on passe par le client Supabase. Si besoin de Prisma plus tard, il faudra reset DB password dans le dashboard.

---

## 🎯 Plan d'action recommandé pour les 9h restantes

**Session 1 (3h)** : Backend features complet + tests endpoints
**Session 2 (4h)** : Frontend pages + connecté à l'API
**Session 3 (2h)** : Déploiement + docs + soumission

Chaque session peut être une conversation Claude distincte. Le repo + cette doc servent de point de reprise.
