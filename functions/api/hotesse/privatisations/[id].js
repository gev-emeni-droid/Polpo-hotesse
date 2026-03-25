import { ensureHotesseSchema } from '../schema.js';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export const onRequest = async ({ env, request, params }) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Handle DELETE
  if (request.method === 'DELETE') {
    try {
      console.log('DELETE request received');
      console.log('Params:', params);
      console.log('Request URL:', request.url);
      
      await ensureHotesseSchema(env.DB);
      
      // Récupérer l'ID du paramètre de route ou de l'URL
      let id = params?.id;
      console.log('ID from params:', id);
      
      if (!id) {
        const url = new URL(request.url);
        const parts = url.pathname.split('/');
        id = parts[parts.length - 1];
        console.log('ID from URL:', id);
      }
      
      id = id ? decodeURIComponent(id) : null;
      console.log('Final ID (decoded):', id);
      
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
      
      const result1 = await env.DB.prepare('DELETE FROM hotesse_privatisations WHERE id = ?').bind(id).run();
      console.log('Delete from hotesse_privatisations result:', result1);
      
      const result2 = await env.DB.prepare('DELETE FROM hotesse_privatisations_hostesses WHERE priv_id = ?').bind(id).run();
      console.log('Delete from hotesse_privatisations_hostesses result:', result2);
      
      console.log('Privatisation deleted successfully:', id);
      
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    } catch (e) {
      console.error('Error in privatisations DELETE:', e.message);
      console.error('Stack:', e.stack);
      return new Response(JSON.stringify({ error: e.message || 'error' }), {
        status: 500,
        headers: {
          'content-type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  }

  // Handle other methods
  return new Response(JSON.stringify({ error: 'method not allowed' }), {
    status: 405,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders,
    },
  });
};
