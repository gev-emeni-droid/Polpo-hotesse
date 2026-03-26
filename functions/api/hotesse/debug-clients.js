import { ensureHotesseSchema } from './schema.js';

export async function onRequest(context) {
  const { env } = context;
  const db = env.DB;

  try {
    // Ensure schema
    await ensureHotesseSchema(db);

    // Try to get all clients - raw query
    const result = await db.prepare('SELECT * FROM hotesse_clients').all();
    
    return new Response(JSON.stringify({ 
      ok: true, 
      count: result.results?.length || 0,
      clients: result.results || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Debug clients error:', error);
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
