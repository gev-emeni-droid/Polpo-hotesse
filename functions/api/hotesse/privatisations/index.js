import { ensureHotesseSchema } from '../schema.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export const onRequest = async ({ env, request }) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  try {
    await ensureHotesseSchema(env.DB);
    
    const body = await request.json().catch(() => ({}));
    console.log('Privatisation POST received:', body);
    
    const {
      id,
      calendar_id,
      name,
      people,
      date,
      start,
      end,
      period,
      color,
      prise_par,
      commentaire,
      hostesses = [],
    } = body;
    
    if (!id || !calendar_id || !name) {
      return new Response(JSON.stringify({ error: 'missing required fields' }), {
        status: 400,
        headers: {
          'content-type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const debugLogs = [];
    debugLogs.push(`>>> Creating privatisation: ${id}`);
    
    // Insert privatisation
    const privResult = await env.DB.prepare(
      `INSERT INTO hotesse_privatisations (id, calendar_id, name, people, date, start, end, period, color, prise_par, commentaire)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      calendar_id,
      name,
      people || null,
      date || null,
      start || null,
      end || null,
      period || null,
      color || 'bleu',
      prise_par || null,
      commentaire || null
    ).run();
    
    debugLogs.push(`>>> Privatisation created: ${id}`);
    
    // Insert hostesses if provided
    if (Array.isArray(hostesses) && hostesses.length > 0) {
      for (const hostessName of hostesses) {
        if (hostessName && hostessName.trim()) {
          await env.DB.prepare(
            'INSERT INTO hotesse_privatisations_hostesses (priv_id, hostess_name) VALUES (?, ?)'
          ).bind(id, hostessName).run();
        }
      }
      debugLogs.push(`>>> Added ${hostesses.length} hostesses`);
    }
    
    // AUTO-CREATE ENTREPRISE CLIENT if name is provided
    if (name && name.trim()) {
      // Check if entreprise client already exists
      const existing = await env.DB.prepare(
        `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'entreprise'`
      ).bind(name).first();
      
      if (!existing) {
        // Create new entreprise client (prenom and telephone can be NULL for entreprise)
        const clientId = `client_${Math.random().toString(36).substr(2, 9)}`;
        await env.DB.prepare(
          `INSERT INTO hotesse_clients (id, nom, entreprise, type, prenom, telephone, created_at, updated_at)
           VALUES (?, ?, ?, 'entreprise', NULL, NULL, datetime('now'), datetime('now'))`
        ).bind(clientId, name, name).run();
        
        debugLogs.push(`>>> Created entreprise client: ${clientId} (${name})`);
      } else {
        debugLogs.push(`>>> Entreprise client already exists: ${existing.id}`);
      }
    }
    
    debugLogs.push(`>>> Save complete`);
    
    return new Response(JSON.stringify({ success: true, debug_logs: debugLogs }), {
      status: 201,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (e) {
    console.error('Error in privatisations POST:', e.message);
    console.error('Stack:', e.stack);
    return new Response(JSON.stringify({ error: e.message || 'error' }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};
