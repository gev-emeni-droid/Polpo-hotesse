-- Ensure hotesse_clients table has nullable prenom and telephone fields
-- This is retroactive in case the table was created with NOT NULL constraints

-- Recreate the table with correct schema if it exists
DROP TABLE IF EXISTS hotesse_clients_new;

CREATE TABLE hotesse_clients_new (
  id TEXT PRIMARY KEY,
  prenom TEXT,
  nom TEXT NOT NULL,
  telephone TEXT,
  mail TEXT,
  adresse_postale TEXT,
  entreprise TEXT,
  type TEXT DEFAULT 'client',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Copy over existing data
INSERT INTO hotesse_clients_new 
SELECT id, prenom, nom, telephone, mail, adresse_postale, entreprise, 
       COALESCE(type, 'client'), created_at, updated_at 
FROM hotesse_clients;

-- Drop old table and rename new one
DROP TABLE hotesse_clients;
ALTER TABLE hotesse_clients_new RENAME TO hotesse_clients;
