-- Transférer toutes les données de tableauxgenerator vers polpo-hotesse

-- D'abord, mettre à jour les calendriers existants avec les bons comptes
UPDATE calendars SET privatization_count = 13 WHERE id = 1; -- Décembre
UPDATE calendars SET privatization_count = 4 WHERE id = 2; -- Novembre

-- Vider les events existants pour éviter les doublons
DELETE FROM privatization_events WHERE calendar_id IN (1, 2);

-- Insérer toutes les privatisations pour Décembre (calendar_id = 1)
INSERT INTO privatization_events (id, calendar_id, title, type, pax, start_time, end_time, date, hostesses, taken_by, notes, hostess_count)
VALUES 
  (1, 1, 'SEE ELECTRICIEN', 'restaurant', 250, '19:00', '00:00', '2025-12-02', '[]', NULL, NULL, '0'),
  (2, 1, 'LEVALLOIS DECOUVERTE', 'restaurant', 300, '12:00', '16:00', '2025-12-04', '["Chloé","Emeni","Shelihane"]', NULL, '4hotesse', '3'),
  (3, 1, 'BNP', 'restaurant', 315, '19:00', '01:00', '2025-12-04', '["1 LBE","Chloé","Emeni","Shelihane"]', NULL, NULL, '4'),
  (4, 1, 'BUSINESS PROFILERS x COVEA', 'restaurant', 150, '19:00', '02:00', '2025-12-09', '["Emeni","Shelihane"]', NULL, NULL, '2'),
  (5, 1, 'BP x TOTAL ENERGIE', 'restaurant', 40, '19:00', '00:00', '2025-12-10', '["Juliette"]', 'Juliette', NULL, '1'),
  (6, 1, 'BP x ENGIE', 'restaurant', 170, '19:00', '02:00', '2025-12-10', '["Emeni","Shelihane"]', NULL, NULL, '2'),
  (7, 1, 'DOCTOLIB', 'restaurant', 50, '19:00', '00:00', '2025-12-11', '["Juliette"]', 'Juliette', NULL, '1'),
  (8, 1, 'FEEL GOOD EVENTS', 'restaurant', 350, '19:30', '01:00', '2025-12-11', '["1 LBE","Chloé","Emeni","Shelihane"]', NULL, NULL, '4'),
  (9, 1, 'ATHLON', 'restaurant', 260, '18:30', '02:00', '2025-12-16', '["2 LBE","Emeni","Shelihane"]', 'Maëlle', NULL, '3'),
  (10, 1, 'SUCCES DES STIM', 'restaurant', 180, '19:00', '02:00', '2025-12-17', '["Emeni","Shelihane"]', NULL, NULL, '2'),
  (11, 1, 'EET', 'restaurant', 55, '19:00', '00:00', '2025-12-17', '["Maëlle"]', 'Maëlle', NULL, '1'),
  (12, 1, 'KACTUS x CYBERLIFT', 'restaurant', 50, '18:30', '00:00', '2025-12-18', '["Maëlle"]', 'Maëlle', NULL, '1'),
  (13, 1, 'CAP EVENTS', 'restaurant', 160, '19:00', '02:00', '2025-12-18', '["Emeni","Shelihane"]', NULL, NULL, '2');

-- Insérer toutes les privatisations pour Novembre (calendar_id = 2)
INSERT INTO privatization_events (id, calendar_id, title, type, pax, start_time, end_time, date, hostesses, taken_by, notes, hostess_count)
VALUES 
  (14, 2, 'DEF', 'restaurant', 50, '19:00', '00:00', '2025-11-20', '["Maëlle"]', 'Maëlle', NULL, '1'),
  (15, 2, 'KACTUS x RATP', 'restaurant', 380, '19:00', '02:00', '2025-11-20', '["2 LBE","Emeni","Shelihane"]', NULL, NULL, '3'),
  (16, 2, 'LEVALLOIS DECOUVERTE', 'restaurant', 300, '12:00', '16:00', '2025-11-27', '["1 LBE","Emeni","Shelihane"]', 'Juliette', NULL, '3'),
  (17, 2, 'FDJ', 'restaurant', 120, '19:00', '02:00', '2025-11-27', '["Emeni","Shelihane"]', 'Maëlle', NULL, '2');
