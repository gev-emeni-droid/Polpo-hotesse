import { ensureHotesseSchema } from './schema.js';

export const onRequestGet = async ({ env }) => {
  try {
    await ensureHotesseSchema(env.DB);

    // Fetch GLOBAL theme from settings
    const result = await env.DB.prepare(
      `SELECT theme_id FROM hotesse_settings WHERE id = 'global'`
    ).first();

    const themeId = result?.theme_id || 'sage-stone';

    return new Response(JSON.stringify({ ok: true, theme_id: themeId }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    });
  } catch (e) {
    console.error('Theme endpoint error:', e.message, e.stack);
    return new Response(
      JSON.stringify({ ok: false, error: e.message || 'error', theme_id: 'navy', source: 'error' }),
      { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-cache, no-store, must-revalidate', 'access-control-allow-origin': '*' } }
    );
  }
};

export const onRequestPut = async ({ env, request }) => {
  try {
    await ensureHotesseSchema(env.DB);

    const body = await request.json().catch(() => ({}));
    const themeId = body.theme_id || 'sage-stone';
    const now = new Date().toISOString();

    // Upsert GLOBAL theme in settings
    await env.DB.prepare(
      `INSERT INTO hotesse_settings (id, theme_id, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         theme_id = excluded.theme_id,
         updated_at = excluded.updated_at`
    )
      .bind('global', themeId, now)
      .run();

    return new Response(JSON.stringify({ ok: true, theme_id: themeId }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, PUT, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  } catch (e) {
    console.error('Theme PUT error:', e.message);
    return new Response(
      JSON.stringify({ ok: false, error: e.message || 'error' }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
      }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, PUT, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
};
