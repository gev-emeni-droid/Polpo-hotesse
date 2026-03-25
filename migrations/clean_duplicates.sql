-- Nettoyage des doublons dans la base de données
-- Garder les tables existantes (calendars, privatization_events) et supprimer les tables hotesse_* en double

-- Supprimer les tables hotesse_* qui sont des doublons
DROP TABLE IF EXISTS hotesse_privatisations_hostesses;
DROP TABLE IF EXISTS hotesse_privatisations;
DROP TABLE IF EXISTS hotesse_prise_par_options;
DROP TABLE IF EXISTS hotesse_hostess_options;
DROP TABLE IF EXISTS hotesse_notif_contacts;
DROP TABLE IF EXISTS hotesse_settings;
DROP TABLE IF EXISTS hotesse_calendars;

-- Vérifier que les tables principales contiennent toutes les données
SELECT 'Calendars restants: ' || COUNT(*) FROM calendars;
SELECT 'Privatization events restants: ' || COUNT(*) FROM privatization_events;
