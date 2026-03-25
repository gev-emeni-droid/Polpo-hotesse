-- Migration des données de l'ancienne base vers la nouvelle (sans foreign key constraints)

-- Insertion des calendriers
INSERT OR IGNORE INTO hotesse_calendars (id, month, year, title, created_at, is_archived)
VALUES 
  ('cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 11, 2025, 'Privatisation Décembre 2025', '2025-11-16T00:56:22.129Z', 0),
  ('cal_3f4dbe07-0c89-40f9-994f-8d740d010da5', 10, 2025, 'Privatisation Novembre 2025', '2025-11-16T16:07:39.741Z', 1);

-- Insertion des options d'hôtesses
INSERT OR IGNORE INTO hotesse_hostess_options (id, name)
VALUES 
  (1, 'Emeni'),
  (2, 'Shelihane'),
  (3, '1 LBE'),
  (4, '2 LBE'),
  (5, '3 LBE'),
  (6, '4 LBE'),
  (7, 'Chloé');

-- Insertion des options "prise par"
INSERT OR IGNORE INTO hotesse_prise_par_options (id, name)
VALUES 
  (1, 'Juliette'),
  (3, 'Maëlle');

-- Insertion des privatisations
INSERT OR IGNORE INTO hotesse_privatisations (id, calendar_id, name, people, date, start, end, period, color, prise_par, commentaire)
VALUES 
  ('priv_1763293542026', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'LEVALLOIS DECOUVERTE', 300, '2025-12-04', '12:00', '16:00', 'midi', 'bleu', NULL, '4hotesse'),
  ('priv_1763311287667', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'LEVALLOIS DECOUVERTE', 300, '2025-12-04', '12:00', '16:00', 'midi', 'bleu', NULL, '4hotesse'),
  ('priv_1763311342836', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'LEVALLOIS DECOUVERTE', 300, '2025-12-04', '12:00', '16:00', 'midi', 'bleu', NULL, '4hotesse'),
  ('priv_1763312102252', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'LEVALLOIS DECOUVERTE', 300, '2025-12-04', '12:00', '16:00', 'midi', 'bleu', NULL, '4hotesse'),
  ('priv_1763312261453', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'BNP', 315, '2025-12-04', '19:00', '01:00', 'soir', 'bleu', NULL, NULL),
  ('priv_1763312338206', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'BUSINESS PROFILERS x COVEA', 150, '2025-12-09', '19:00', '02:00', 'soir', 'bleu', NULL, NULL),
  ('priv_1763312362081', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'BP x TOTAL ENERGIE', 40, '2025-12-10', '19:00', '00:00', 'soir', 'violet', 'Juliette', NULL),
  ('priv_1763312491378', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'BP x ENGIE', 170, '2025-12-10', '19:00', '02:00', 'soir', 'bleu', NULL, NULL),
  ('priv_1763312539619', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'DOCTOLIB', 50, '2025-12-11', '19:00', '00:00', 'soir', 'violet', 'Juliette', NULL),
  ('priv_1763312724375', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'FEEL GOOD EVENTS', 350, '2025-12-11', '19:30', '01:00', 'soir', 'bleu', NULL, NULL),
  ('priv_1763312781630', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'SUCCES DES STIM', 180, '2025-12-17', '19:00', '02:00', 'soir', 'bleu', NULL, NULL),
  ('priv_1763312828156', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'EET', 55, '2025-12-17', '19:00', '00:00', 'soir', 'violet', 'Maëlle', NULL),
  ('priv_1764148913939', 'cal_ddd13614-7d7d-4a67-9186-483adb1b24b7', 'ATHLON', 260, '2025-12-16', '18:30', '02:00', 'soir', 'bleu', 'Maëlle', NULL);

-- Insertion des settings
INSERT OR IGNORE INTO hotesse_settings (id, notif_contacts_json, updated_at)
VALUES 
  ('global', '[{"id":"contact_1763304012616","name":"Maëlle MINIAOU","email":"m.miniaou@groupe-bertrand.com","phone":"+33663520581"},{"id":"contact_1763304340966","name":"EMENI HESLOT","email":"polpo.managers@groupe-bertrand.com","phone":"+33744280362"}]', '2025-11-17T09:54:39.474Z');
