-- Migration: Backfill all existing privatisations as entreprise clients
-- Create or update entreprise clients for all privatisations that don't already exist

INSERT OR IGNORE INTO hotesse_clients (id, nom, entreprise, type, created_at, updated_at)
SELECT 
  'client_' || lower(hex(randomblob(16))),
  name,
  name,
  'entreprise',
  datetime('now'),
  datetime('now')
FROM hotesse_privatisations p
WHERE NOT EXISTS (
  SELECT 1 FROM hotesse_clients c 
  WHERE c.nom = p.name AND c.type = 'entreprise'
);
