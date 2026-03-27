import { ensureHotesseSchema } from './schema.js';

export async function onRequest(context) {
  const { env } = context;
  const db = env.DB;

  try {
    await ensureHotesseSchema(db);

    console.error('=== DEBUG: Fetching ALL clients from hotesse_clients ===');

    // Get all clients - no filters
    const result = await db.prepare(`
      SELECT id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at
      FROM hotesse_clients
      ORDER BY type DESC, created_at DESC
    `).all();

    const clients = result.results || [];
    
    console.error(`Found ${clients.length} clients in DB`);
    clients.forEach((c, i) => {
      console.error(`[${i+1}] type=${c.type}, nom=${c.nom}, prenom=${c.prenom}, tel=${c.telephone}`);
    });

    return new Response(JSON.stringify({
      ok: true,
      total: clients.length,
      clients: clients,
      debug: {
        query: 'SELECT * FROM hotesse_clients ORDER BY type DESC, created_at DESC',
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
