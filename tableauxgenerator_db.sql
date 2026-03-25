PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE tables (   id TEXT PRIMARY KEY,   name TEXT NOT NULL,   archived_at TEXT,   created_at TEXT NOT NULL,   updated_at TEXT NOT NULL );
INSERT INTO "tables" VALUES('611820d0-5013-41a8-8b06-0cbe98f968d9','Saint-Sylvestre 2026',NULL,'2025-11-14T10:22:33.488Z','2025-11-18T17:23:42.017Z');
INSERT INTO "tables" VALUES('5cf2bae2-cbf9-413f-881a-68b8d638b3cb','St valentin 2026','2025-11-20T20:10:05.061Z','2025-11-15T08:47:33.712Z','2025-11-20T20:10:05.061Z');
CREATE TABLE table_params (   table_id TEXT NOT NULL,   key TEXT NOT NULL,   value_json TEXT NOT NULL,   PRIMARY KEY (table_id, key),   FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE );
CREATE TABLE rows (   id TEXT PRIMARY KEY,   table_id TEXT NOT NULL,   data_json TEXT NOT NULL,   created_at TEXT NOT NULL,   updated_at TEXT NOT NULL,   FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE );
INSERT INTO "rows" VALUES('9d0b1179-7e23-4c96-aedf-857ce80c3bce','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"9d0b1179-7e23-4c96-aedf-857ce80c3bce","nom":"BALLARIN","prenom":"Didier","tel":"+33 6 63 35 67 87","heure":"21:30","creation":"2025-11-07","paiement":"2025-11-07","comment":"","ad":2,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":196,"virm":0}','2025-11-14T12:14:10.340Z','2025-11-14T21:38:27.202Z');
INSERT INTO "rows" VALUES('50799176-6f59-4048-9fd4-977f7cfbff7c','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"50799176-6f59-4048-9fd4-977f7cfbff7c","nom":"FACI","prenom":"Laure","tel":"+33 6 95 16 53 53","heure":"19:30","creation":"2025-11-08","paiement":"2025-11-08","comment":"","ad":2,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":196,"virm":0}','2025-11-14T12:14:10.340Z','2025-11-14T21:20:52.927Z');
INSERT INTO "rows" VALUES('f80d681e-2eee-483a-8187-81c6ee2abbbb','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"f80d681e-2eee-483a-8187-81c6ee2abbbb","nom":"RADU","prenom":"Irina","tel":"+33 6 62 21 38 35","heure":"21:00","creation":"2025-11-07","paiement":"2025-11-07","comment":"","ad":8,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":784,"virm":0}','2025-11-14T12:14:10.340Z','2025-11-14T21:38:20.864Z');
INSERT INTO "rows" VALUES('eb540386-fe38-4590-bda2-4a8b41433b80','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"eb540386-fe38-4590-bda2-4a8b41433b80","nom":"HOSNI","prenom":"Karim","tel":"+33 6 61 75 25 39","heure":"21:00","creation":"2025-11-12","paiement":"2025-11-12","comment":"","ad":2,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":196,"virm":0}','2025-11-14T12:14:10.340Z','2025-11-14T21:20:38.875Z');
INSERT INTO "rows" VALUES('88f8edd5-acb7-4222-9c5d-7c30a56a759e','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"88f8edd5-acb7-4222-9c5d-7c30a56a759e","nom":"PIRIOU","prenom":"Martine","tel":"+33 6 86 88 67 60","heure":"19:00","creation":"2025-11-12","paiement":"2025-11-12","comment":"Cliente régulière","ad":6,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Shelihane","encaisserpar":"Shelihane","cb":588,"amex":0,"espece":0,"cheque":0,"zen":0,"virm":0}','2025-11-14T12:14:10.340Z','2025-11-15T15:49:45.573Z');
INSERT INTO "rows" VALUES('cc0716d1-a906-4b41-a5b4-246c3fa9b03e','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"res_1763480940855_0.05921296785000785","nom":"BOURBONNAIS","prenom":"Régis","tel":"+33 6 14 18 15 56","heure":"20:00","creation":"2025-11-18","paiement":"2025-11-18","comment":"","ad":3,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":294,"virm":0}','2025-11-18T17:42:04.756Z','2025-11-18T17:42:04.756Z');
INSERT INTO "rows" VALUES('208a593e-361e-43ea-b13c-b906619e7a83','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"res_1763390326834_0.19059260727077276","nom":"Pérez","prenom":"Antoine","tel":"+33 6 64 14 56 67","heure":"20:00","creation":"2025-11-16","paiement":"2025-11-16","comment":"","ad":2,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":196,"virm":0}','2025-11-19T01:42:44.449Z','2025-11-19T01:42:44.449Z');
INSERT INTO "rows" VALUES('5ecbb4b5-3490-4e6d-a946-3efc1ea08340','611820d0-5013-41a8-8b06-0cbe98f968d9','{"nom":"Monceau","prenom":"Marielle","tel":"+33 6 69 37 98 50","heure":"21:30","creation":"2025-11-18","paiement":"2025-11-18","comment":"","ad":2,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":196,"virm":0,"id":"res_1763517217539_0.9180512511209287"}','2025-11-19T01:53:38.034Z','2025-11-19T01:53:38.034Z');
INSERT INTO "rows" VALUES('1c07acb7-5123-4bd4-ba8f-a7d79fd7ca27','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"1c07acb7-5123-4bd4-ba8f-a7d79fd7ca27","nom":"KALWODA","prenom":"Nicole","tel":"+33 6 43 62 29 24","heure":"21:00","creation":"2025-11-16","paiement":"2025-11-16","comment":"","ad":2,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":196,"virm":0}','2025-11-19T02:13:06.061Z','2025-11-19T12:57:05.375Z');
INSERT INTO "rows" VALUES('05da00f8-3b86-47af-8bdd-15119bbb4073','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"res_1763804425270_0.3534801543891195","nom":"sergent","prenom":"william","tel":"+33 7 65 77 46 96","heure":"20:30","creation":"2025-11-21","paiement":"2025-11-21","comment":"","ad":4,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":392,"virm":0}','2025-11-22T10:38:42.826Z','2025-11-22T10:38:42.826Z');
INSERT INTO "rows" VALUES('691789c3-a798-4679-ac99-40885b548f66','611820d0-5013-41a8-8b06-0cbe98f968d9','{"nom":"CHAPLAIN","prenom":"Majda","tel":"+33 6 15 15 65 38","heure":"20:30","creation":"2025-11-23","paiement":"2025-11-23","comment":"","ad":2,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":196,"virm":0,"id":"res_1763894623375_0.1500626153994803"}','2025-11-23T10:43:43.409Z','2025-11-23T10:43:43.409Z');
INSERT INTO "rows" VALUES('728ac3b4-4b02-414a-be2c-d319beec5810','611820d0-5013-41a8-8b06-0cbe98f968d9','{"nom":"MONTEIRO","prenom":"Paula","tel":" +33 6 60 69 54 27","heure":"21:00","creation":"2025-11-22","paiement":"2025-11-22","comment":"","ad":2,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":196,"virm":0,"id":"res_1763894668016_0.15173314314637776"}','2025-11-23T10:44:28.056Z','2025-11-23T10:44:28.056Z');
INSERT INTO "rows" VALUES('97360288-5f1a-4545-a6ca-da11acce7acc','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"res_1763830102558_0.3467707578540973","nom":"BEN SIRAC","prenom":" NIAMIEN","tel":"+33 6 42 69 48 97","heure":"22:00","creation":"2025-11-22","paiement":"2025-11-22","comment":"","ad":2,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":196,"virm":0}','2025-11-23T10:44:42.468Z','2025-11-23T10:44:42.468Z');
INSERT INTO "rows" VALUES('1738e915-b9f4-4152-a6ff-ada895b2401a','611820d0-5013-41a8-8b06-0cbe98f968d9','{"id":"res_1763894759114_0.20567830161031841","nom":" PEAUCELLE","prenom":"Laurent","tel":"+33 6 07 91 44 76","heure":"21:30","creation":"2025-11-23","paiement":"2025-11-23","comment":"","ad":4,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":392,"virm":0}','2025-11-23T11:49:42.743Z','2025-11-23T11:49:42.743Z');
INSERT INTO "rows" VALUES('0fe8e89a-c0f1-4df7-b289-20451ff48303','611820d0-5013-41a8-8b06-0cbe98f968d9','{"nom":" PEAUCELLE","prenom":"Laurent","tel":"+33 6 07 91 44 76","heure":"21:30","creation":"2025-11-23","paiement":"2025-11-23","comment":"","ad":5,"enf":0,"tarifad":98,"tarifenf":49,"prisepar":"Zenchef","encaisserpar":"Zenchef","cb":0,"amex":0,"espece":0,"cheque":0,"zen":392,"virm":0}','2025-11-23T13:27:14.978Z','2025-11-23T13:27:14.978Z');
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
