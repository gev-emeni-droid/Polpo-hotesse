import { ensureHotesseSchema } from '../schema.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export const onRequest = async ({ env, request }) => {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const db = env.DB;
    await ensureHotesseSchema(db);
    const url = new URL(request.url);
    const { searchParams } = url;
    
    const query = searchParams.get('q')?.trim() || '';
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!query || query.length < 2) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }

    // Search ONLY for enterprises (type = 'entreprise')
    const searchTerm = `%${query.toLowerCase()}%`;
    const result = await db.prepare(`
      SELECT id, nom, created_at
      FROM hotesse_clients
      WHERE type = 'entreprise' AND LOWER(nom) LIKE ?
      ORDER BY nom ASC
      LIMIT ?
    `).bind(searchTerm, limit).all();

    const enterprises = result.results || [];

    console.log(`>>> Enterprise search: query="${query}", found=${enterprises.length}`);

    return new Response(JSON.stringify(enterprises), {
      status: 200,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Error searching enterprises:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }
};
