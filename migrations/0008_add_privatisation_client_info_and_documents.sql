-- Migration: Add client info and documents tables for privatisations
-- Purpose: Store client information and related documents for each privatization

CREATE TABLE hotesse_privatisations_client_info (
  priv_id TEXT PRIMARY KEY,
  nom TEXT,
  prenom TEXT,
  mail TEXT,
  telephone TEXT,
  adresse_postale TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (priv_id) REFERENCES hotesse_privatisations(id) ON DELETE CASCADE
);

CREATE TABLE hotesse_privatisations_documents (
  id TEXT PRIMARY KEY,
  priv_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_data TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  file_size INTEGER,
  uploaded_at TEXT NOT NULL,
  uploaded_by TEXT,
  FOREIGN KEY (priv_id) REFERENCES hotesse_privatisations(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_priv_client_info ON hotesse_privatisations_client_info(priv_id);
CREATE INDEX idx_priv_documents ON hotesse_privatisations_documents(priv_id);
CREATE INDEX idx_doc_uploaded_at ON hotesse_privatisations_documents(uploaded_at);
