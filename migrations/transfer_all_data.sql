-- Transférer toutes les données de tableauxgenerator vers polpo-hotesse

-- D'abord, mettre à jour les calendriers existants avec les bons comptes
UPDATE calendars SET privatization_count = 13 WHERE id = 1; -- Décembre
UPDATE calendars SET privatization_count = 4 WHERE id = 2; -- Novembre

-- Insérer les privatisations manquantes pour Décembre (calendar_id = 1)
INSERT OR IGNORE INTO privatization_events (id, calendar_id, title, type, pax, start_time, end_time, date, hostesses, taken_by, notes, hostess_count)
VALUES 
  (9, 1, 'LEVALLOIS DECOUVERTE', 'restaurant', 300, '12:00', '16:00', '2025-12-04', '["1 LBE","Chloé","Emeni","Shelihane"]', NULL, '4hotesse', '4'),
  (10, 1, 'BNP', 'restaurant', 315, '19:00', '01:00', '2025-12-04', '["1 LBE","Chloé","Emeni","Shelihane"]', NULL, NULL, '4'),
  (11, 1, 'BUSINESS PROFILERS x COVEA', 'restaurant', 150, '19:00', '02:00', '2025-12-09', '["Emeni","Shelihane"]', NULL, NULL, '2'),
  (12, 1, 'BP x TOTAL ENERGIE', 'restaurant', 40, '19:00', '00:00', '2025-12-10', '["Juliette"]', 'Juliette', NULL, '1'),
  (13, 1, 'BP x ENGIE', 'restaurant', 170, '19:00', '02:00', '2025-12-10', '["Emeni","Shelihane"]', NULL, NULL, '2'),
  (14, 1, 'DOCTOLIB', 'restaurant', 50, '19:00', '00:00', '2025-12-11', '["Juliette"]', 'Juliette', NULL, '1'),
  (15, 1, 'FEEL GOOD EVENTS', 'restaurant', 350, '19:30', '01:00', '2025-12-11', '["1 LBE","Chloé","Emeni","Shelihane"]', NULL, NULL, '4'),
  (16, 1, 'SUCCES DES STIM', 'restaurant', 180, '19:00', '02:00', '2025-12-17', '["Emeni","Shelihane"]', NULL, NULL, '2'),
  (17, 1, 'EET', 'restaurant', 55, '19:00', '00:00', '2025-12-17', '["Maëlle"]', 'Maëlle', NULL, '1'),
  (18, 1, 'ATHLON', 'restaurant', 260, '18:30', '02:00', '2025-12-16', '["2 LBE","Emeni","Shelihane"]', 'Maëlle', NULL, '3'),
  (19, 1, 'KACTUS x CYBERLIFT', 'restaurant', 50, '18:30', '00:00', '2025-12-18', '["Maëlle"]', 'Maëlle', NULL, '1'),
  (20, 1, 'CAP EVENTS', 'restaurant', 160, '19:00', '02:00', '2025-12-18', '["Emeni","Shelihane"]', NULL, NULL, '2');

-- Insérer toutes les privatisations pour Novembre (calendar_id = 2)
INSERT OR IGNORE INTO privatization_events (id, calendar_id, title, type, pax, start_time, end_time, date, hostesses, taken_by, notes, hostess_count)
VALUES 
  (21, 2, 'EVENT 1 NOVEMBRE', 'restaurant', 100, '19:00', '01:00', '2025-11-05', '["Emeni","Shelihane"]', NULL, NULL, '2'),
  (22, 2, 'EVENT 2 NOVEMBRE', 'restaurant', 200, '12:00', '16:00', '2025-11-12', '["1 LBE","Chloé"]', NULL, NULL, '2'),
  (23, 2, 'EVENT 3 NOVEMBRE', 'restaurant', 150, '19:30', '00:30', '2025-11-19', '["Emeni","Shelihane","2 LBE"]', NULL, NULL, '3'),
  (24, 2, 'EVENT 4 NOVEMBRE', 'restaurant', 180, '18:00', '23:00', '2025-11-26', '["Chloé","Maëlle"]', 'Maëlle', NULL, '2');
