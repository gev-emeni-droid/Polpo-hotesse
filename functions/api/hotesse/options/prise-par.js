import { ensureHotesseSchema } from '../schema.js';

export const onRequestGet = async ({ env }) => {
  try {
    await ensureHotesseSchema(env.DB);
    const { results } = await env.DB.prepare('SELECT name FROM hotesse_prise_par_options ORDER BY name ASC').all();
    return new Response(JSON.stringify((results || []).map(r => r.name)), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  } catch (e) {
    console.error('Error in prise-par GET:', e.message);
    return new Response(JSON.stringify({ error: e.message || 'error' }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }
};

export const onRequestPost = async ({ env, request }) => {
  await ensureHotesseSchema(env.DB);
  const body = await request.json().catch(() => ({}));
  const name = (body.name || '').trim();
  if (!name) {
    return new Response(JSON.stringify({ error: 'name required' }), {
      status: 400,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }
  await env.DB.prepare('INSERT INTO hotesse_prise_par_options (name) VALUES (?) ON CONFLICT(name) DO NOTHING').bind(name).run();
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
};

export const onRequestDelete = async ({ env, request }) => {
  try {
    await ensureHotesseSchema(env.DB);
    const body = await request.json().catch(() => ({}));
    const name = (body.name || '').trim();
    if (!name) {
      return new Response(JSON.stringify({ error: 'name required' }), {
        status: 400,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'access-control-allow-headers': 'content-type',
        },
      });
    }
    await env.DB.prepare('DELETE FROM hotesse_prise_par_options WHERE name = ?').bind(name).run();
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  } catch (e) {
    console.error('Error in prise-par DELETE:', e.message);
    return new Response(JSON.stringify({ error: e.message || 'error' }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }
};
