-- ============================================================
-- Seed data — Vite & Gourmand
-- 3 comptes de test (admin, employé, utilisateur), 12 plats, 4 menus.
-- Mots de passe respectent la politique : 10 chars min, 1 maj, 1 min, 1 chiffre, 1 spécial.
--
-- Comptes :
--   admin    : jose@vite-et-gourmand.fr        / AdminViteG2026!
--   employé  : julie@vite-et-gourmand.fr       / EmployeViteG2026!
--   user     : jean.dupont@example.com         / DemoUser2026!
-- ============================================================

INSERT INTO utilisateur (email, password_hash, nom, prenom, telephone, adresse_postale, ville, role_id) VALUES
  ('jose@vite-et-gourmand.fr',  '$2b$12$HhReIAIYsRlsWkBGjuREsuP.nWidA9IsK6Jozw0M1aDBnc9URw7wi', 'Lopez',   'José',  '0556000001', '12 rue des Vendanges', 'Bordeaux',
    (SELECT role_id FROM role WHERE libelle = 'administrateur')),
  ('julie@vite-et-gourmand.fr', '$2b$12$QaozeMrWZjMHhUSWyBwJm.v1PPuCCnvLNIxlV2Hos0Xh37TqiPrVO', 'Martin',  'Julie', '0556000002', '12 rue des Vendanges', 'Bordeaux',
    (SELECT role_id FROM role WHERE libelle = 'employe')),
  ('jean.dupont@example.com',   '$2b$12$vynyVs2.8vWfdCB3GQwOfe1Nh7u.I5Jd8Po5.g5P/1JXqVfIqbVg.', 'Dupont',  'Jean',  '0612345678', '24 quai des Chartrons', 'Bordeaux',
    (SELECT role_id FROM role WHERE libelle = 'utilisateur'));

INSERT INTO plat (libelle, description, type, photo_url) VALUES
  ('Velouté de potimarron, huile de noisette', 'Potimarron du marché de Pessac, noisette du Périgord torréfiée.', 'entree',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800'),
  ('Carpaccio de Saint-Jacques aux agrumes', 'Saint-Jacques crues d''Erquy, citron caviar, huile vierge.', 'entree',
    'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800'),
  ('Foie gras maison aux figues confites', 'Foie gras des Landes mi-cuit, chutney de figues violettes.', 'entree',
    'https://images.unsplash.com/photo-1592417817038-d13fd7342605?w=800'),
  ('Tartare de betterave et chèvre frais', 'Betteraves rôties, chèvre du Quercy, vinaigrette miel-moutarde.', 'entree',
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800'),
  ('Filet de bœuf de Bazas, sauce vin de Bordeaux', 'Bœuf de race bazadaise, jus corsé au Médoc, écrasé de pommes de terre.', 'plat',
    'https://images.unsplash.com/photo-1558030006-450675393462?w=800'),
  ('Dos de cabillaud, beurre blanc à l''estragon', 'Cabillaud de ligne, beurre blanc minute, riz noir vénéré.', 'plat',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800'),
  ('Poulet fermier en croûte d''herbes', 'Poulet de Saint-Sever, croûte de persillade, légumes oubliés.', 'plat',
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800'),
  ('Risotto crémeux à la truffe d''été', 'Riz Carnaroli, parmesan affiné 24 mois, copeaux de truffe.', 'plat',
    'https://images.unsplash.com/photo-1633964913295-ceb43826a07f?w=800'),
  ('Tarte fine aux pommes du Périgord', 'Pommes Reinettes caramélisées, pâte feuilletée pur beurre.', 'dessert',
    'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800'),
  ('Moelleux au chocolat noir 70%', 'Chocolat Valrhona, cœur coulant, crème anglaise vanille.', 'dessert',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800'),
  ('Pavlova aux fruits rouges du jardin', 'Meringue craquante, chantilly mascarpone, fraises et framboises.', 'dessert',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'),
  ('Canelé bordelais traditionnel', 'Canelés de Bordeaux maison, recette de famille (3 pièces par personne).', 'dessert',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800');

INSERT INTO plat_allergene (plat_id, allergene_id)
  SELECT (SELECT plat_id FROM plat WHERE libelle = 'Carpaccio de Saint-Jacques aux agrumes'),
         (SELECT allergene_id FROM allergene WHERE libelle = 'mollusques');
INSERT INTO plat_allergene (plat_id, allergene_id)
  SELECT plat_id, (SELECT allergene_id FROM allergene WHERE libelle = 'lait')
  FROM plat WHERE libelle IN ('Foie gras maison aux figues confites', 'Tartare de betterave et chèvre frais',
                              'Dos de cabillaud, beurre blanc à l''estragon', 'Risotto crémeux à la truffe d''été',
                              'Moelleux au chocolat noir 70%', 'Tarte fine aux pommes du Périgord');
INSERT INTO plat_allergene (plat_id, allergene_id)
  SELECT (SELECT plat_id FROM plat WHERE libelle = 'Pavlova aux fruits rouges du jardin'),
         (SELECT allergene_id FROM allergene WHERE libelle = 'œufs');
INSERT INTO plat_allergene (plat_id, allergene_id)
  SELECT (SELECT plat_id FROM plat WHERE libelle = 'Tarte fine aux pommes du Périgord'),
         (SELECT allergene_id FROM allergene WHERE libelle = 'gluten');
INSERT INTO plat_allergene (plat_id, allergene_id)
  SELECT (SELECT plat_id FROM plat WHERE libelle = 'Canelé bordelais traditionnel'),
         (SELECT allergene_id FROM allergene WHERE libelle = 'gluten');
INSERT INTO plat_allergene (plat_id, allergene_id)
  SELECT (SELECT plat_id FROM plat WHERE libelle = 'Canelé bordelais traditionnel'),
         (SELECT allergene_id FROM allergene WHERE libelle = 'œufs');
INSERT INTO plat_allergene (plat_id, allergene_id)
  SELECT (SELECT plat_id FROM plat WHERE libelle = 'Velouté de potimarron, huile de noisette'),
         (SELECT allergene_id FROM allergene WHERE libelle = 'fruits à coque');
INSERT INTO plat_allergene (plat_id, allergene_id)
  SELECT (SELECT plat_id FROM plat WHERE libelle = 'Dos de cabillaud, beurre blanc à l''estragon'),
         (SELECT allergene_id FROM allergene WHERE libelle = 'poissons');

INSERT INTO menu (titre, description, theme_id, nombre_personne_minimum, prix_par_personne, conditions, quantite_restante, galerie_urls) VALUES
  ('Menu Bordelais d''Été',
    'Une déclinaison gourmande des produits de saison du marché des Capucins, parfait pour un déjeuner d''été ou un dîner sur la terrasse. Service à l''assiette, dressage soigné.',
    (SELECT theme_id FROM theme WHERE libelle = 'classique'),
    10, 48.00,
    'Commande à passer 5 jours ouvrés à l''avance. Conservation au réfrigérateur jusqu''au service.',
    8,
    ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200','https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200']),
  ('Menu Festif de Noël',
    'Pour vos repas de fêtes, une carte généreuse autour du Sud-Ouest : foie gras maison, filet de bœuf bazadais, canelés. Idéal de 12 à 50 personnes.',
    (SELECT theme_id FROM theme WHERE libelle = 'noel'),
    12, 72.00,
    'Commande obligatoire avant le 15 décembre. Inclut une bouteille de vin de Bordeaux pour 4 convives.',
    15,
    ARRAY['https://images.unsplash.com/photo-1543352634-99a5d50ae78e?w=1200','https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?w=1200','https://images.unsplash.com/photo-1576749872435-ff88a71c1ae2?w=1200']),
  ('Menu Pâques Végétarien',
    'Une version 100% végétale et végétarienne de notre carte de printemps : risotto à la truffe, tartare de betterave, pavlova aux fruits rouges.',
    (SELECT theme_id FROM theme WHERE libelle = 'paques'),
    8, 42.00,
    'Sans viande, sans poisson. Précisez vos allergies à la commande.',
    10,
    ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200','https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200','https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=1200']),
  ('Menu Mariage — Grand Bordelais',
    'Notre menu signature pour les grandes occasions. Service en salle, ardoise des desserts, options personnalisables (allergies, régimes).',
    (SELECT theme_id FROM theme WHERE libelle = 'evenement'),
    30, 95.00,
    'Devis personnalisé sur demande. Inclut le service en salle (1 personne pour 20 convives), la vaisselle et le mobilier. Prêt de matériel : restitution sous 10 jours ouvrés.',
    4,
    ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200','https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200']);

-- Compositions menus + régimes : voir migration appliquée (cf. apply_migration MCP)
-- Pour rejouer en local, exécuter directement le bloc seed depuis Supabase Studio.
