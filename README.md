# Vite & Gourmand

> **Projet ECF Studi — TP Développeur Web et Web Mobile (RNCP 37674)**
> Application web pour un traiteur événementiel bordelais — Julie & José.
> Étudiant : Jassim Elghaouti — Mai 2026.

---

## 🌐 URLs publiques

- **Application** : https://vite-et-gourmand-drab.vercel.app
- **API backend** : https://vite-et-gourmand-api-three.vercel.app/api
- **Notion projet** : https://www.notion.so/3628e177f2a2815ab773e55b796f2602

---

## 🔑 Comptes de démo (pour le jury)

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `jose@vite-et-gourmand.fr` | `AdminViteG2026!` |
| Employé | `julie@vite-et-gourmand.fr` | `EmployeViteG2026!` |
| Utilisateur | `jean.dupont@example.com` | `DemoUser2026!` |

---

## 📚 Documents livrables

Tous dans `docs/livrables/` :

- 📄 [`ECF_TPDeveloppeurWebEtWebMobile_copiearendre_ELGHAOUTI_Jassim.pdf`](docs/livrables/ECF_TPDeveloppeurWebEtWebMobile_copiearendre_ELGHAOUTI_Jassim.pdf) — Copie à rendre
- 📄 [`doc-technique.pdf`](docs/livrables/doc-technique.pdf) — Documentation technique (MCD, diagrammes, sécurité, déploiement)
- 📄 [`manuel-utilisateur.pdf`](docs/livrables/manuel-utilisateur.pdf) — Manuel d'utilisation
- 📄 [`charte-graphique.pdf`](docs/livrables/charte-graphique.pdf) — Charte graphique + 6 maquettes (3 desktop + 3 mobile)
- 📄 [`gestion-projet.pdf`](docs/livrables/gestion-projet.pdf) — Méthodologie, planning, risques

---

## 🏗 Stack technique

| Couche | Outil | Justification |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind | Stack moderne, design tokens forts |
| Backend | Node.js + Express + TypeScript | Standard pro, courbe d'apprentissage faible |
| BDD relationnelle | PostgreSQL via Supabase (Paris) | Standard SQL, contraintes strictes |
| BDD NoSQL | MongoDB (Atlas en prod, memory-server en dev) | Audit trail + agrégations dashboard |
| Auth | JWT + bcrypt (cost 12) | Stateless, sécurisé |
| Mailer | Resend | API moderne, free tier 100/jour |
| Hébergement | Vercel (front + back serverless) | Déploiement git push |

---

## 🚀 Démarrer en local

### Prérequis
- Node.js ≥ 20
- npm ≥ 10
- git

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/Jasteur91/vite-et-gourmand.git
cd vite-et-gourmand

# 2. Installer les dépendances
cd backend && npm install
cd ../frontend && npm install
```

### Configuration

```bash
# Variables d'environnement backend
cd backend
cp .env.example .env
# → renseigner les secrets (Supabase URL/key, JWT secret, Resend API key, etc.)
```

### Lancer en dev

```bash
# Terminal 1 — backend (port 3001)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

Puis ouvrir [http://localhost:5173](http://localhost:5173).

---

## 🗄 Base de données

### PostgreSQL (Supabase)

Le schéma complet est dans [`database/migrations/001_initial_schema.sql`](database/migrations/001_initial_schema.sql) :
- 15 tables (utilisateur, role, menu, plat, theme, regime, allergene, commande, avis, horaire, etc.)
- Contraintes CHECK natives
- Indexes sur les colonnes filtrées
- Triggers `updated_at` automatiques
- Seed de référentiels (rôles, thèmes, régimes, allergènes, horaires)

Les données de démo (3 comptes + 12 plats + 4 menus de base + 4 menus filtres) sont dans [`database/seed/001_demo_data.sql`](database/seed/001_demo_data.sql).

### MongoDB

Utilisée pour :
- Audit trail des changements de statut de commande (collection `order_events`)
- Données agrégées du dashboard administrateur (via aggregation pipeline)

En dev, lancement automatique via `mongodb-memory-server` (binaire téléchargé à la première run).
En prod, URI Atlas dans `MONGODB_URI`.

---

## 🌳 Gitflow

```
main      ───●────────●──── (release stable)
              \        \
develop    ────●────●───●─── (intégration)
                \    \    \
features        ●    ●    ●  (feature/*)
```

- Une branche par fonctionnalité
- Merge dans `develop` après test
- Release vers `main` quand stable

---

## 🚀 Déploiement

L'application est déployée sur Vercel (front + back serverless).

### Frontend

```bash
cd frontend
npx vercel --prod
```

### Backend

```bash
cd backend
npx vercel --prod
# puis ajouter les env vars via le dashboard Vercel ou CLI
```

Détails complets dans [`docs/livrables/doc-technique.pdf`](docs/livrables/doc-technique.pdf) §9.

---

## 🔒 Sécurité

- Hashage **bcrypt cost 12** pour les mots de passe
- **JWT HS256** stateless, expiration 7j
- **Helmet** (15+ headers HTTP de sécurité)
- **express-rate-limit** anti brute-force (10 tentatives / 15 min sur `/api/auth/*`)
- **Validation Zod** exhaustive sur toutes les entrées
- **CORS strict** (allowlist Vercel + localhost)
- Politique mot de passe : 10 chars min, 1 maj, 1 min, 1 chiffre, 1 spécial
- Création de compte admin **impossible** depuis l'API (conformité énoncé)

---

## ♿ Accessibilité (RGAA)

- Sémantique HTML5 stricte
- Contrastes WCAG AA validés (ratio 12.4:1 pour le texte principal)
- Navigation 100% au clavier
- Focus visible (`:focus-visible`)
- Labels associés aux inputs
- `alt` sur toutes les images

---

## 📜 Licence

Projet pédagogique ECF Studi — usage non-commercial.

---

🤖 *Développé avec l'aide de Claude (Anthropic) en mode pair-programming.*
