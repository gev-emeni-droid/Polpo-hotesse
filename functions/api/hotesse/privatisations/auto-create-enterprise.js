import { ensureHotesseSchema } from '../schema.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export const onRequest = async ({ env, request }) => {
  console.log('>>> auto-create-enterprise endpoint called');
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }

  try {
    await ensureHotesseSchema(env.DB);
    
    const body = await request.json().catch(() => ({}));
    const { priv_name } = body;
    
    console.log('>>> auto-create-enterprise - priv_name:', priv_name);
    
    if (!priv_name || !priv_name.trim()) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'priv_name is required',
        debug_logs: ['No priv_name provided']
      }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }

    const debugLogs = [];
    const now = new Date().toISOString();
    debugLogs.push(`>>> auto-create-enterprise: START - priv_name="${priv_name}"`);

    // Check if enterprise already exists
    debugLogs.push(`>>> Checking if entreprise exists: nom="${priv_name}", type='entreprise'`);
    const existing = await env.DB.prepare(
      `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'entreprise'`
    ).bind(priv_name).first();
    
    if (existing) {
      debugLogs.push(`>>> ✅ Entreprise ALREADY EXISTS: ${existing.id}`);
      return new Response(JSON.stringify({
        success: true,
        client_id: existing.id,
        action: 'already_exists',
        debug_logs: debugLogs
      }), {
        status: 200,
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }

    // Create new entreprise client
    debugLogs.push(`>>> Entreprise DOES NOT EXIST, creating new...`);
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    debugLogs.push(`>>> Generated clientId: ${clientId}`);
    
    const insertResult = await env.DB.prepare(
      `INSERT INTO hotesse_clients (id, nom, entreprise, type, prenom, telephone, created_at, updated_at)
       VALUES (?, ?, ?, 'entreprise', NULL, NULL, ?, ?)`
    ).bind(clientId, priv_name, priv_name, now, now).run();
    
    debugLogs.push(`>>> ✅ Entreprise CREATED SUCCESSFULLY`);
    debugLogs.push(`>>> INSERT result: ${JSON.stringify(insertResult.meta)}`);
    debugLogs.push(`>>> Client ID: ${clientId}`);
    debugLogs.push(`>>> Enterprise will appear in "Fichiers Clients" immediately`);

    return new Response(JSON.stringify({
      success: true,
      client_id: clientId,
      action: 'created',
      debug_logs: debugLogs
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  } catch (e) {
    console.error('>>> auto-create-enterprise ERROR:', e.message);
    return new Response(JSON.stringify({
      success: false,
      error: e.message || 'Failed to auto-create enterprise',
      debug_logs: [`ERROR: ${e.message}`]
    }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders }
    });
  }
};
