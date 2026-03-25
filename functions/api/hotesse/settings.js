import { ensureHotesseSchema } from './schema.js';

export const onRequestGet = async ({ env }) => {
  try {
    await ensureHotesseSchema(env.DB);
    const row = await env.DB.prepare(
      'SELECT notif_contacts_json, custom_logo, sender_email, updated_at FROM hotesse_settings WHERE id = ?'
    ).bind('global').first();
    const notif_contacts = row ? JSON.parse(row.notif_contacts_json || '[]') : [];
    const custom_logo = row?.custom_logo || null;
    const sender_email = row?.sender_email || 'notifications@l-iamani.com';
    return new Response(
      JSON.stringify({ ok: true, settings: { notif_contacts, custom_logo, sender_email, updated_at: row?.updated_at || null } }),
      {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'access-control-allow-origin': '*',
        },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message || 'error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
};

export const onRequestPut = async ({ env, request }) => {
  try {
    await ensureHotesseSchema(env.DB);
    const body = await request.json().catch(() => ({}));
    const notif_contacts = Array.isArray(body.notif_contacts) ? body.notif_contacts : [];
    const custom_logo = body.custom_logo || null;
    const sender_email = body.sender_email || 'notifications@l-iamani.com';
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO hotesse_settings (id, notif_contacts_json, custom_logo, sender_email, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         notif_contacts_json = excluded.notif_contacts_json,
         custom_logo = excluded.custom_logo,
         sender_email = excluded.sender_email,
         updated_at = excluded.updated_at`
    ).bind('global', JSON.stringify(notif_contacts), custom_logo, sender_email, now).run();
    return new Response(
      JSON.stringify({ ok: true }),
      {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'access-control-allow-origin': '*',
        },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message || 'error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
};
