-- Migration 0013: Add missing fields to client table (civilite, ville, code_postal)
-- This migration adds support for civilité, ville, and code_postal fields in the clients table

-- For hotesse_clients table
ALTER TABLE hotesse_clients ADD COLUMN IF NOT EXISTS civilite TEXT DEFAULT 'Mme';
ALTER TABLE hotesse_clients ADD COLUMN IF NOT EXISTS ville TEXT;
ALTER TABLE hotesse_clients ADD COLUMN IF NOT EXISTS code_postal TEXT;

-- For hotesse_privatisations_client_info table (same fields)
ALTER TABLE hotesse_privatisations_client_info ADD COLUMN IF NOT EXISTS civilite TEXT DEFAULT 'Mme';
ALTER TABLE hotesse_privatisations_client_info ADD COLUMN IF NOT EXISTS ville TEXT;
ALTER TABLE hotesse_privatisations_client_info ADD COLUMN IF NOT EXISTS code_postal TEXT;
