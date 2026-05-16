-- ============================================================
-- Vite & Gourmand — Schéma BDD relationnelle (PostgreSQL)
-- ECF Studi TP-DWWM — Conforme MCD annexe 1
-- ============================================================

-- ROLES
CREATE TABLE role (
  role_id   SERIAL PRIMARY KEY,
  libelle   VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO role (libelle) VALUES
  ('utilisateur'), ('employe'), ('administrateur');

-- UTILISATEURS
CREATE TABLE utilisateur (
  utilisateur_id   SERIAL PRIMARY KEY,
  email            VARCHAR(150) NOT NULL UNIQUE,
  password_hash    VARCHAR(255) NOT NULL,
  nom              VARCHAR(80)  NOT NULL,
  prenom           VARCHAR(80)  NOT NULL,
  telephone        VARCHAR(20),
  adresse_postale  VARCHAR(255),
  ville            VARCHAR(80),
  pays             VARCHAR(80) DEFAULT 'France',
  role_id          INTEGER NOT NULL REFERENCES role(role_id),
  est_actif        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_role  ON utilisateur(role_id);

-- THEMES
CREATE TABLE theme (
  theme_id  SERIAL PRIMARY KEY,
  libelle   VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO theme (libelle) VALUES ('classique'),('noel'),('paques'),('evenement');

-- REGIMES
CREATE TABLE regime (
  regime_id SERIAL PRIMARY KEY,
  libelle   VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO regime (libelle) VALUES
  ('classique'),('vegetarien'),('vegan'),('sans-gluten'),('halal'),('casher');

-- ALLERGENES
CREATE TABLE allergene (
  allergene_id SERIAL PRIMARY KEY,
  libelle      VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO allergene (libelle) VALUES
  ('gluten'),('crustacés'),('œufs'),('poissons'),('arachides'),
  ('soja'),('lait'),('fruits à coque'),('céleri'),('moutarde'),
  ('sésame'),('sulfites'),('lupin'),('mollusques');

-- PLATS
CREATE TABLE plat (
  plat_id    SERIAL PRIMARY KEY,
  libelle    VARCHAR(120) NOT NULL,
  description TEXT,
  type       VARCHAR(20) NOT NULL CHECK (type IN ('entree','plat','dessert')),
  photo_url  VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE plat_allergene (
  plat_id      INTEGER NOT NULL REFERENCES plat(plat_id) ON DELETE CASCADE,
  allergene_id INTEGER NOT NULL REFERENCES allergene(allergene_id) ON DELETE CASCADE,
  PRIMARY KEY (plat_id, allergene_id)
);

-- MENUS
CREATE TABLE menu (
  menu_id                  SERIAL PRIMARY KEY,
  titre                    VARCHAR(120) NOT NULL,
  description              TEXT,
  theme_id                 INTEGER NOT NULL REFERENCES theme(theme_id),
  nombre_personne_minimum  INTEGER NOT NULL CHECK (nombre_personne_minimum > 0),
  prix_par_personne        DECIMAL(10,2) NOT NULL CHECK (prix_par_personne > 0),
  conditions               TEXT,
  quantite_restante        INTEGER NOT NULL DEFAULT 0 CHECK (quantite_restante >= 0),
  galerie_urls             TEXT[] DEFAULT '{}',
  est_actif                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_menu_theme ON menu(theme_id);
CREATE INDEX idx_menu_actif ON menu(est_actif);

CREATE TABLE menu_plat (
  menu_id  INTEGER NOT NULL REFERENCES menu(menu_id) ON DELETE CASCADE,
  plat_id  INTEGER NOT NULL REFERENCES plat(plat_id) ON DELETE CASCADE,
  PRIMARY KEY (menu_id, plat_id)
);

CREATE TABLE menu_regime (
  menu_id    INTEGER NOT NULL REFERENCES menu(menu_id) ON DELETE CASCADE,
  regime_id  INTEGER NOT NULL REFERENCES regime(regime_id) ON DELETE CASCADE,
  PRIMARY KEY (menu_id, regime_id)
);

-- COMMANDES
CREATE TABLE commande (
  commande_id           SERIAL PRIMARY KEY,
  numero_commande       VARCHAR(50) NOT NULL UNIQUE,
  utilisateur_id        INTEGER NOT NULL REFERENCES utilisateur(utilisateur_id),
  menu_id               INTEGER NOT NULL REFERENCES menu(menu_id),
  nombre_personne       INTEGER NOT NULL CHECK (nombre_personne > 0),
  prix_menu             DECIMAL(10,2) NOT NULL,
  prix_livraison        DECIMAL(10,2) NOT NULL DEFAULT 0,
  remise_pct            DECIMAL(5,2) NOT NULL DEFAULT 0,
  prix_total            DECIMAL(10,2) NOT NULL,
  adresse_livraison     VARCHAR(255) NOT NULL,
  ville_livraison       VARCHAR(80) NOT NULL,
  date_prestation       DATE NOT NULL,
  heure_livraison       TIME NOT NULL,
  statut                VARCHAR(50) NOT NULL DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente','accepte','en_preparation','en_cours_de_livraison','livre','en_attente_retour_materiel','terminee','annulee')),
  pret_materiel         BOOLEAN NOT NULL DEFAULT FALSE,
  restitution_materiel  BOOLEAN NOT NULL DEFAULT FALSE,
  motif_annulation      TEXT,
  mode_contact_annulation VARCHAR(20),
  date_commande         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_commande_user   ON commande(utilisateur_id);
CREATE INDEX idx_commande_statut ON commande(statut);
CREATE INDEX idx_commande_date   ON commande(date_prestation);

-- AVIS
CREATE TABLE avis (
  avis_id     SERIAL PRIMARY KEY,
  commande_id INTEGER NOT NULL UNIQUE REFERENCES commande(commande_id) ON DELETE CASCADE,
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateur(utilisateur_id),
  note        INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  statut      VARCHAR(20) NOT NULL DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente','valide','refuse')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  moderated_at TIMESTAMPTZ
);
CREATE INDEX idx_avis_statut ON avis(statut);

-- HORAIRES
CREATE TABLE horaire (
  horaire_id       SERIAL PRIMARY KEY,
  jour             VARCHAR(20) NOT NULL UNIQUE
    CHECK (jour IN ('lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche')),
  heure_ouverture  TIME,
  heure_fermeture  TIME,
  est_ferme        BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO horaire (jour, heure_ouverture, heure_fermeture, est_ferme) VALUES
  ('lundi','09:00','18:00',FALSE),
  ('mardi','09:00','18:00',FALSE),
  ('mercredi','09:00','18:00',FALSE),
  ('jeudi','09:00','18:00',FALSE),
  ('vendredi','09:00','19:00',FALSE),
  ('samedi','10:00','17:00',FALSE),
  ('dimanche',NULL,NULL,TRUE);

-- RESET PASSWORD
CREATE TABLE password_reset_token (
  token_id       SERIAL PRIMARY KEY,
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateur(utilisateur_id) ON DELETE CASCADE,
  token          VARCHAR(128) NOT NULL UNIQUE,
  expires_at     TIMESTAMPTZ NOT NULL,
  used_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_token_user ON password_reset_token(utilisateur_id);

-- CONTACT
CREATE TABLE contact_message (
  contact_id SERIAL PRIMARY KEY,
  email      VARCHAR(150) NOT NULL,
  titre      VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  traite     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRIGGER updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_utilisateur_updated_at BEFORE UPDATE ON utilisateur
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_menu_updated_at BEFORE UPDATE ON menu
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_commande_updated_at BEFORE UPDATE ON commande
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
