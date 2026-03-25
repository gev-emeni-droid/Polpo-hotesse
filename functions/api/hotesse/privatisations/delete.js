import { ensureHotesseSchema } from '../schema.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export const onRequest = async ({ env, request }) => {
  console.log('Delete endpoint called');
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Handle POST or DELETE
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    console.log('Wrong method:', request.method);
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  try {
    console.log('Starting delete handler');
    
    await ensureHotesseSchema(env.DB);
    console.log('Schema ensured');
    
    // Récupérer l'ID de la query string ou du body
    let id;
    
    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      id = url.searchParams.get('id');
      console.log('ID from query params:', id);
    } else {
      // POST
      const body = await request.json().catch(() => ({}));
      id = body.id;
      console.log('ID from body:', id);
    }
    
    console.log('Final ID:', id);
    
    if (!id) {
      console.error('No ID provided');
      return new Response(JSON.stringify({ error: 'missing id' }), {
        status: 400,
        headers: {
          'content-type': 'application/json',
          ...corsHeaders,
        },
      });
    }
    
    console.log('Deleting privatisation with ID:', id);
    
    // IMPORTANT: Supprimer d'abord les références (hostesses), PUIS la privatisation
    // Sinon on aura une erreur de clé étrangère
    const result2 = await env.DB.prepare('DELETE FROM hotesse_privatisations_hostesses WHERE priv_id = ?').bind(id).run();
    console.log('Delete from hotesse_privatisations_hostesses result:', result2);
    
    const result1 = await env.DB.prepare('DELETE FROM hotesse_privatisations WHERE id = ?').bind(id).run();
    console.log('Delete from hotesse_privatisations result:', result1);
    
    console.log('Privatisation deleted successfully:', id);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (e) {
    console.error('Error in privatisations delete:', e.message);
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

