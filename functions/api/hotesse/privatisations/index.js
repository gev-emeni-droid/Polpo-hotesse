import { ensureHotesseSchema } from '../schema.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export const onRequest = async ({ env, request }) => {
  console.log('>>> Privatisations index.js - method:', request.method, 'URL:', request.url);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    console.log('>>> Handling OPTIONS');
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    console.log('>>> Method not allowed:', request.method);
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  try {
    console.log('>>> Starting POST handler');
    await ensureHotesseSchema(env.DB);
    
    const body = await request.json().catch(() => ({}));
    console.log('>>> Privatisation POST received:', body);
    
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
    // This MUST work every time a privatisation is created
    if (name && name.trim()) {
      try {
        debugLogs.push(`>>> AUTO-CREATE ENTREPRISE: Starting for name="${name}"`);
        
        // Check if entreprise client already exists
        const existing = await env.DB.prepare(
          `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'entreprise'`
        ).bind(name).first();
        
        if (!existing) {
          debugLogs.push(`>>> AUTO-CREATE: ${name} does NOT exist, creating...`);
          // Create new entreprise client (prenom and telephone can be NULL for entreprise)
          const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          
          try {
            const insertResult = await env.DB.prepare(
              `INSERT INTO hotesse_clients (id, nom, entreprise, type, prenom, telephone, created_at, updated_at)
               VALUES (?, ?, ?, 'entreprise', NULL, NULL, datetime('now'), datetime('now'))`
            ).bind(clientId, name, name).run();
            
            debugLogs.push(`>>> AUTO-CREATE: ✅ Successfully created entreprise: ${clientId}`);
            debugLogs.push(`>>> AUTO-CREATE: nom="${name}", type="entreprise"`);
            debugLogs.push(`>>> AUTO-CREATE: DB meta changes: ${insertResult.meta?.changes || 0}`);
          } catch (insertErr) {
            debugLogs.push(`>>> AUTO-CREATE: ❌ INSERT failed: ${insertErr.message}`);
            throw insertErr;
          }
        } else {
          debugLogs.push(`>>> AUTO-CREATE: ✅ Entreprise already exists: ${existing.id}`);
        }
      } catch (autoCreateErr) {
        debugLogs.push(`>>> AUTO-CREATE: ⚠️  Error during auto-create: ${autoCreateErr.message}`);
        // Don't throw - allow privatisation to be created even if entreprise creation fails
        console.error('>>> AUTO-CREATE ERROR (non-blocking):', autoCreateErr);
      }
    } else {
      debugLogs.push(`>>> AUTO-CREATE: Skipped - name is empty or null`);
    }
    
    debugLogs.push(`>>> Save complete`);
    
    console.log('>>> Returning successful response with', debugLogs.length, 'logs');
    const responseBody = { 
      id, 
      success: true,
      endpoint: 'privatisations-index-js-POST',
      debug_logs: debugLogs 
    };
    console.log('>>> Response body:', JSON.stringify(responseBody));
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'x-debug-endpoint': 'privatisations-index-js',
        ...corsHeaders,
      },
    });
  } catch (e) {
    console.error('>>> Error in privatisations POST:', e.message);
    console.error('>>> Stack:', e.stack);
    return new Response(JSON.stringify({ error: e.message || 'error', success: false }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};
