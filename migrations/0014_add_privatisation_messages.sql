-- Migration: Add message table for privatisations
-- Purpose: Store a single optional internal message per privatisation in D1

CREATE TABLE IF NOT EXISTS hotesse_privatisations_messages (
  priv_id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (priv_id) REFERENCES hotesse_privatisations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_priv_messages_priv_id ON hotesse_privatisations_messages(priv_id);