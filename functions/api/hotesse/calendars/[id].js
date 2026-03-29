import { ensureHotesseSchema } from '../schema.js';

export const onRequestGet = async ({ env, params }) => {
  await ensureHotesseSchema(env.DB);
  const id = params.id;
  const calendar = await env.DB.prepare(
    'SELECT id, month, year, title, created_at, is_archived FROM hotesse_calendars WHERE id = ?'
  ).bind(id).first();
  if (!calendar) return new Response(null, { status: 404 });

  const privs = await env.DB.prepare(
    `SELECT p.id, p.calendar_id, p.name, p.people, p.date, p.start, p.end, p.period, p.color, p.prise_par, p.commentaire,
            pm.message AS message,
            CASE WHEN pm.message IS NOT NULL AND TRIM(pm.message) <> '' THEN 1 ELSE 0 END AS has_message,
            CASE WHEN EXISTS (
              SELECT 1 FROM hotesse_privatisations_documents d WHERE d.priv_id = p.id
            ) THEN 1 ELSE 0 END AS has_documents
     FROM hotesse_privatisations p
     LEFT JOIN hotesse_privatisations_messages pm ON pm.priv_id = p.id
     WHERE p.calendar_id = ?
     ORDER BY p.date ASC`
  ).bind(id).all();

  // Fetch hostesses for each privatisation
  const privsWithHostesses = await Promise.all((privs.results || []).map(async (priv) => {
    const hostessRows = await env.DB.prepare(
      'SELECT hostess_name FROM hotesse_privatisations_hostesses WHERE priv_id = ?'
    ).bind(priv.id).all();
    return {
      ...priv,
      hostesses: (hostessRows.results || []).map(row => row.hostess_name),
      hostess: null, // deprecated, kept for compatibility
    };
  }));

  return new Response(
    JSON.stringify({ ...calendar, privatisations: privsWithHostesses }),
    { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }
  );
};

export const onRequestPut = async ({ env, params, request }) => {
  await ensureHotesseSchema(env.DB);
  const id = params.id;
  const body = await request.json().catch(() => ({}));
  const rawTitle = typeof body.title === 'string' ? body.title : '';
  const title = rawTitle.trim();

  const existing = await env.DB.prepare(
    'SELECT id, month, year, title, created_at, is_archived FROM hotesse_calendars WHERE id = ?'
  ).bind(id).first();

  if (!existing) {
    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  const hasIsArchived = typeof body.is_archived === 'number' || typeof body.is_archived === 'boolean';
  const newIsArchived = hasIsArchived
    ? (body.is_archived ? 1 : 0)
    : existing.is_archived;

  // Si aucun titre n'est fourni, garder l'ancien
  const finalTitle = title || existing.title;

  await env.DB.prepare('UPDATE hotesse_calendars SET title = ?, is_archived = ? WHERE id = ?')
    .bind(finalTitle, newIsArchived, id)
    .run();

  const updated = { ...existing, title: finalTitle, is_archived: newIsArchived };

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

export const onRequestDelete = async ({ env, params }) => {
  await ensureHotesseSchema(env.DB);
  const id = params.id;
  await env.DB.prepare('DELETE FROM hotesse_privatisations WHERE calendar_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM hotesse_calendars WHERE id = ?').bind(id).run();
  return new Response(null, { status: 204 });
};
