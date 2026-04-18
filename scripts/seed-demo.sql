-- ==========================================================================
-- CabiPilot — Données de démo
-- À lancer APRÈS schema.sql, dans Supabase SQL Editor → Run
-- Crée 1 cabinet démo + 3 dossiers + factures factices + 1 relance draft
-- ==========================================================================

-- 1. Cabinet démo
insert into cabinets (id, name, siret, plan, pennylane_connected)
values (
  '11111111-1111-1111-1111-111111111111',
  'Cabinet Martin & Associés (DÉMO)',
  '12345678901234',
  'design_partner',
  true
)
on conflict (id) do nothing;

-- 2. 3 dossiers clients fictifs
insert into dossiers (id, cabinet_id, client_name, client_email, client_phone, regime_fiscal, secteur) values
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Boucherie Marcel SARL', 'boucherie.marcel@example.fr', '+33612345678', 'BIC Réel Simplifié', 'Commerce de détail viande'),
  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'SARL LAKELEC', 'contact@lakelec.fr', '+33786713467', 'BIC Réel Normal', 'Travaux d''électricité'),
  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Coiffure Élégance', 'elegance@example.fr', '+33475442462', 'BIC Micro', 'Coiffure')
on conflict (id) do nothing;

-- 3. Factures fictives pour les 3 dossiers (10 documents au total)
insert into documents (dossier_id, type, filename, extracted_text, metadata) values
  -- Boucherie Marcel — Q1 2026 présent, Q2 manquant
  ('22222222-0000-0000-0000-000000000001', 'facture', 'facture_grossiste_jan_2026.pdf',
   'Facture n°2026-0112 - Grossiste Viandes Ouest - 3247,50 € TTC (dont TVA 5.5% : 169,21 €) - Date : 12/01/2026',
   '{"montant_ttc": 3247.50, "tva": 169.21, "date": "2026-01-12", "fournisseur": "Grossiste Viandes Ouest", "mois": "2026-01"}'::jsonb),
  ('22222222-0000-0000-0000-000000000001', 'facture', 'facture_grossiste_fev_2026.pdf',
   'Facture n°2026-0218 - Grossiste Viandes Ouest - 2987,20 € TTC (dont TVA 5.5% : 155,69 €) - Date : 18/02/2026',
   '{"montant_ttc": 2987.20, "tva": 155.69, "date": "2026-02-18", "fournisseur": "Grossiste Viandes Ouest", "mois": "2026-02"}'::jsonb),
  ('22222222-0000-0000-0000-000000000001', 'fec', 'FEC_Q1_2026.csv',
   'TVA collectée Q1 2026 : Janvier 1412,20 € | Février 1338,91 € | Mars 1536,42 € | Total 4287,53 €. TVA déductible Q1 : 478,15 €. TVA nette à reverser : 3809,38 €.',
   '{"periode": "Q1 2026", "tva_collectee": 4287.53, "tva_deductible": 478.15, "tva_nette": 3809.38}'::jsonb),
  -- LAKELEC — rien pour mars/avril
  ('22222222-0000-0000-0000-000000000002', 'facture', 'facture_leroy_jan_2026.pdf',
   'Facture n°L-2026-0008 - Leroy Merlin Pro - 1872,40 € TTC (dont TVA 20% : 312,07 €) - Date : 15/01/2026',
   '{"montant_ttc": 1872.40, "tva": 312.07, "date": "2026-01-15", "fournisseur": "Leroy Merlin Pro", "mois": "2026-01"}'::jsonb),
  ('22222222-0000-0000-0000-000000000002', 'facture', 'facture_rexel_fev_2026.pdf',
   'Facture n°RX-2026-0033 - Rexel France - 3422,15 € TTC (dont TVA 20% : 570,36 €) - Date : 22/02/2026',
   '{"montant_ttc": 3422.15, "tva": 570.36, "date": "2026-02-22", "fournisseur": "Rexel France", "mois": "2026-02"}'::jsonb),
  ('22222222-0000-0000-0000-000000000002', 'releve', 'releve_LCL_fev_2026.pdf',
   'Relevé bancaire LCL - Février 2026 - Solde début 8 442,12 € - Solde fin 6 128,35 € - 34 opérations',
   '{"banque": "LCL", "mois": "2026-02", "solde_fin": 6128.35}'::jsonb),
  -- Coiffure Élégance — micro, peu de docs
  ('22222222-0000-0000-0000-000000000003', 'facture', 'facture_loreal_mars.pdf',
   'Facture L''Oréal Professionnel - 487,60 € TTC (dont TVA 20% : 81,27 €) - Date : 05/03/2026',
   '{"montant_ttc": 487.60, "tva": 81.27, "date": "2026-03-05", "fournisseur": "L''Oréal Professionnel", "mois": "2026-03"}'::jsonb),
  ('22222222-0000-0000-0000-000000000003', 'facture', 'facture_loyer_q1.pdf',
   'Quittance loyer Q1 2026 - SCI Valence Centre - 3 × 1200 € = 3 600 € HT - Date : 03/01/2026',
   '{"montant_ttc": 3600.00, "date": "2026-01-03", "fournisseur": "SCI Valence Centre", "periode": "Q1 2026"}'::jsonb),
  -- 2 docs supplémentaires pour variété
  ('22222222-0000-0000-0000-000000000001', 'contrat', 'bail_commercial_2023.pdf',
   'Bail commercial - Rue de la République Caen - Loyer mensuel 1450 € HT - Renouvellement 2031',
   '{"type_contrat": "bail", "loyer_mensuel": 1450}'::jsonb),
  ('22222222-0000-0000-0000-000000000002', 'devis', 'devis_refonte_atelier.pdf',
   'Devis n°LAK-2026-042 - Refonte électrique atelier - 12 450 € TTC - Accepté par client 03/04/2026',
   '{"montant_ttc": 12450.00, "date": "2026-04-03", "status": "accepte"}'::jsonb);

-- 4. Une relance draft pré-existante (pour démo)
insert into relances (dossier_id, reason, email_subject, content_email, content_whatsapp, status) values
  ('22222222-0000-0000-0000-000000000001',
   'Factures mars 2026 manquantes, Relevé bancaire mars 2026 manquant',
   'Boucherie Marcel — il me manque vos pièces de mars',
   'Bonjour Monsieur Dupont,

Il me manque vos factures fournisseurs de mars 2026 pour boucler votre TVA trimestrielle, ainsi que votre relevé bancaire de mars.

Pièces attendues :
• Factures d''achat viande (habituellement ~12 pièces)
• Relevé bancaire LCL mars 2026

Deadline : vendredi 24/04 pour que je puisse déposer votre TVA Q1 le 31 avril.

Pouvez-vous me les envoyer par retour de mail ? Merci d''avance.

Julie
Cabinet Martin & Associés',
   'Bonjour Monsieur Dupont,

Il me manque vos pièces de mars pour boucler votre TVA Q1 :
• Factures d''achat viande (habituellement ~12)
• Relevé bancaire LCL mars

Deadline vendredi 24/04 ⏰

Merci 🙏
Julie',
   'draft');

-- 5. Mise à jour du last_relance_at
update dossiers set last_relance_at = now() - interval '3 days'
where id = '22222222-0000-0000-0000-000000000001';

-- ==========================================================================
-- Vérification
-- ==========================================================================
-- Normalement tu vois 1 cabinet, 3 dossiers, 10 documents, 1 relance
select
  (select count(*) from cabinets) as cabinets_count,
  (select count(*) from dossiers) as dossiers_count,
  (select count(*) from documents) as documents_count,
  (select count(*) from relances) as relances_count;
