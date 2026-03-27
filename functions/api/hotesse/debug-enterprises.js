import { ensureHotesseSchema } from './schema.js';

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
    await ensureHotesseSchema(env.DB);

    // Get ALL enterprise clients
    const result = await env.DB.prepare(`
      SELECT id, nom, created_at, updated_at FROM hotesse_clients 
      WHERE type = 'entreprise'
      ORDER BY created_at DESC
    `).all();

    const enterprises = result.results || [];
    
    // For each enterprise, count how many privatisations it has
    const enterprisesWithCount = await Promise.all(
      enterprises.map(async (ent) => {
        const privCount = await env.DB.prepare(`
          SELECT COUNT(*) as cnt FROM hotesse_privatisations WHERE name = ?
        `).bind(ent.nom).first();
        
        return {
          ...ent,
          privatisations_count: privCount?.cnt || 0
        };
      })
    );

    console.log(`>>> Found ${enterprises.length} enterprises`);
    
    return new Response(JSON.stringify({
      total: enterprises.length,
      enterprises: enterprisesWithCount
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  } catch (e) {
    console.error('Error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }
};
