-- Migration: Fix hotesse_clients table - make prenom nullable
-- SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table

-- Create a new table with the correct schema
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

-- Copy all data from the old table
INSERT INTO hotesse_clients_new 
SELECT id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at 
FROM hotesse_clients;

-- Drop the old table
DROP TABLE hotesse_clients;

-- Rename the new table to the original name
ALTER TABLE hotesse_clients_new RENAME TO hotesse_clients;
