import { ensureHotesseSchema } from './schema.js';

export const onRequestGet = async ({ env }) => {
  try {
    await ensureHotesseSchema(env.DB);
    const { results } = await env.DB.prepare(
      'SELECT id, name, email, phone FROM hotesse_notif_contacts ORDER BY name ASC'
    ).all();
    return new Response(JSON.stringify(results || []), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  } catch (e) {
    console.error('Error in notif-contacts GET:', e.message);
    return new Response(JSON.stringify({ error: e.message || 'error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const onRequestPost = async ({ env, request }) => {
  try {
    await ensureHotesseSchema(env.DB);
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : `contact_${crypto.randomUUID()}`;
    const name = (body.name || '').trim();
    const email = (body.email || '').trim() || null;
    const phone = (body.phone || '').trim() || null;

    if (!name || (!email && !phone)) {
      return new Response(JSON.stringify({ error: 'missing fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    await env.DB.prepare(
      `INSERT INTO hotesse_notif_contacts (id, name, email, phone)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         email = excluded.email,
         phone = excluded.phone`
    ).bind(id, name, email, phone).run();

    return new Response(JSON.stringify({ id, name, email, phone }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  } catch (e) {
    console.error('Error in notif-contacts POST:', e.message);
    return new Response(JSON.stringify({ error: e.message || 'error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const onRequestDelete = async ({ env, request }) => {
  try {
    await ensureHotesseSchema(env.DB);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'missing id' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    await env.DB.prepare('DELETE FROM hotesse_notif_contacts WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  } catch (e) {
    console.error('Error in notif-contacts DELETE:', e.message);
    return new Response(JSON.stringify({ error: e.message || 'error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
