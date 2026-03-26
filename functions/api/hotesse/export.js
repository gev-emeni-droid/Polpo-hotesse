import { ensureHotesseSchema } from './schema.js';

/**
 * Endpoint to export all data for migration
 * GET /api/hotesse/export
 */
export const onRequestGet = async ({ env }) => {
  try {
    await ensureHotesseSchema(env.DB);

    const tablesToExport = [
      'hotesse_calendars',
      'hotesse_privatisations',
      'hotesse_hostess_options',
      'hotesse_prise_par_options',
      'hotesse_privatisations_hostesses',
      'hotesse_notif_contacts',
      'hotesse_settings',
      'hotesse_theme_settings',
      'hotesse_privatisations_client_info',
      'hotesse_privatisations_documents',
      'hotesse_clients'
    ];

    const tables = [];

    for (const tableName of tablesToExport) {
      try {
        const result = await env.DB.prepare(`SELECT * FROM ${tableName}`).all();
        tables.push({
          name: tableName,
          rows: result.results || []
        });
      } catch (e) {
        console.log(`Table ${tableName} not found or error: ${e.message}`);
      }
    }

    return new Response(JSON.stringify({
      export_date: new Date().toISOString(),
      source_db: env.DB,
      tables
    }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    console.error('❌ Export error:', e);
    return new Response(JSON.stringify({
      error: e.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
