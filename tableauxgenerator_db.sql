PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE hotesse_calendars (
      id TEXT PRIMARY KEY,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_archived INTEGER NOT NULL DEFAULT 0
    );
INSERT INTO "hotesse_calendars" VALUES('cal_ddd13614-7d7d-4a67-9186-483adb1b24b7',11,2025,'Privatisation Décembre 2025','2025-11-16T00:56:22.129Z',0);
INSERT INTO "hotesse_calendars" VALUES('cal_3f4dbe07-0c89-40f9-994f-8d740d010da5',10,2025,'Privatisation Novembre 2025','2025-11-16T16:07:39.741Z',1);
CREATE TABLE hotesse_privatisations (
      id TEXT PRIMARY KEY,
      calendar_id TEXT NOT NULL,
      name TEXT NOT NULL,
      people INTEGER,
      date TEXT NOT NULL,
      start TEXT,
      end TEXT,
      period TEXT NOT NULL,
      color TEXT NOT NULL,
      prise_par TEXT, comment TEXT, commentaire TEXT,
      FOREIGN KEY (calendar_id) REFERENCES hotesse_calendars(id)
    );
INSERT INTO "hotesse_privatisations" VALUES('priv_1763293497273','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','KACTUS x CYBERLIFT',50,'2025-12-18','18:30','00:00','soir','violet','Maëlle',NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763293542026','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','CAP EVENTS',160,'2025-12-18','19:00','02:00','soir','bleu',NULL,NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763311133570','cal_3f4dbe07-0c89-40f9-994f-8d740d010da5','DEF',50,'2025-11-20','19:00','00:00','soir','violet','Maëlle',NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763311173187','cal_3f4dbe07-0c89-40f9-994f-8d740d010da5','KACTUS x RATP',380,'2025-11-20','19:00','02:00','soir','bleu',NULL,NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763311287667','cal_3f4dbe07-0c89-40f9-994f-8d740d010da5','LEVALLOIS DECOUVERTE',300,'2025-11-27','12:00','16:00','midi','bleu','Juliette',NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763311342836','cal_3f4dbe07-0c89-40f9-994f-8d740d010da5','FDJ',120,'2025-11-27','19:00','02:00','soir','bleu','Maëlle',NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763311876002','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','SEE ELECTRICIEN',250,'2025-12-02','19:00','00:00','soir','bleu',NULL,NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763312065090','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','LEVALLOIS DECOUVERTE',300,'2025-12-04','12:00','16:00','midi','bleu',NULL,'4hotesse',NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763312102252','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','BNP',315,'2025-12-04','19:00','01:30','soir','bleu',NULL,NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763312261453','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','BUSINESS PROFILERS x COVEA',150,'2025-12-09','19:00','02:00','soir','bleu',NULL,NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763312338206','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','BP x TOTAL ENERGIE',40,'2025-12-10','19:00','00:00','soir','violet','Juliette',NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763312362081','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','BP x ENGIE',170,'2025-12-10','19:00','02:00','soir','bleu',NULL,NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763312491378','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','DOCTOLIB',50,'2025-12-11','19:00','00:00','soir','violet','Juliette',NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763312539619','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','FEEL GOOD EVENTS',350,'2025-12-11','19:30','01:00','soir','bleu',NULL,NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763312724375','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','SUCCES DES STIM',180,'2025-12-17','19:00','02:00','soir','bleu',NULL,NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1763312781630','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','EET',55,'2025-12-17','19:00','00:00','soir','violet','Maëlle',NULL,NULL);
INSERT INTO "hotesse_privatisations" VALUES('priv_1764148913939','cal_ddd13614-7d7d-4a67-9186-483adb1b24b7','ATHLON',260,'2025-12-16','18:30','02:00','soir','bleu','Maëlle',NULL,NULL);
CREATE TABLE hotesse_hostess_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
INSERT INTO "hotesse_hostess_options" VALUES(1,'Emeni');
INSERT INTO "hotesse_hostess_options" VALUES(2,'Shelihane');
INSERT INTO "hotesse_hostess_options" VALUES(3,'1 LBE');
INSERT INTO "hotesse_hostess_options" VALUES(4,'2 LBE');
INSERT INTO "hotesse_hostess_options" VALUES(5,'3 LBE');
INSERT INTO "hotesse_hostess_options" VALUES(6,'4 LBE');
INSERT INTO "hotesse_hostess_options" VALUES(7,'Chloé');
CREATE TABLE hotesse_prise_par_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
INSERT INTO "hotesse_prise_par_options" VALUES(1,'Juliette');
INSERT INTO "hotesse_prise_par_options" VALUES(3,'Maëlle');
CREATE TABLE hotesse_privatisations_hostesses (
      priv_id TEXT NOT NULL,
      hostess_name TEXT NOT NULL,
      PRIMARY KEY (priv_id, hostess_name),
      FOREIGN KEY (priv_id) REFERENCES hotesse_privatisations(id)
    );
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763311287667','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763311287667','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763311287667','1 LBE');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763311342836','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763311342836','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763293542026','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763293542026','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312724375','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312724375','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312261453','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312261453','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312362081','1 LBE');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312362081','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312362081','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312539619','1 LBE');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312539619','Chloé');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312539619','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312539619','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312065090','Chloé');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312065090','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312065090','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763311173187','2 LBE');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763311173187','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763311173187','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1764148913939','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1764148913939','Shelihane');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1764148913939','2 LBE');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312102252','1 LBE');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312102252','Chloé');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312102252','Emeni');
INSERT INTO "hotesse_privatisations_hostesses" VALUES('priv_1763312102252','Shelihane');
CREATE TABLE hotesse_notif_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    );
CREATE TABLE hotesse_settings (
      id TEXT PRIMARY KEY,
      notif_contacts_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    );
INSERT INTO "hotesse_settings" VALUES('global','[{"id":"contact_1763304012616","name":"Maëlle MINIAOU","email":"m.miniaou@groupe-bertrand.com","phone":"+33663520581"},{"id":"contact_1763304340966","name":"EMENI HESLOT","email":"polpo.managers@groupe-bertrand.com","phone":"+33744280362"}]','2025-11-17T09:54:39.474Z');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('hotesse_hostess_options',7);
INSERT INTO "sqlite_sequence" VALUES('hotesse_prise_par_options',3);
