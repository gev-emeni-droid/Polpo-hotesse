export const onRequest = async ({ env, request, params }) => {
  const { tableId } = params;

  const ensureSchema = async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        table_id TEXT PRIMARY KEY,
        prise_par_json TEXT NOT NULL DEFAULT '[]',
        encaisser_par_json TEXT NOT NULL DEFAULT '[]',
        updated_at TEXT NOT NULL
      );
    `).run();
  };

  try {
    await ensureSchema(env.DB);
    const method = request.method.toUpperCase();

    if (method === 'GET') {
      const row = await env.DB.prepare(
        'SELECT prise_par_json, encaisser_par_json, updated_at FROM settings WHERE table_id = ?'
      ).bind(tableId).first();
      const prise_par = row ? JSON.parse(row.prise_par_json || '[]') : [];
      const encaisser_par = row ? JSON.parse(row.encaisser_par_json || '[]') : [];
      return new Response(
        JSON.stringify({ ok: true, settings: { prise_par, encaisser_par, updated_at: row?.updated_at || null } }),
        { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }
      );
    }

    if (method === 'PUT' || method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const prise_par = Array.isArray(body.prise_par) ? body.prise_par : [];
      const encaisser_par = Array.isArray(body.encaisser_par) ? body.encaisser_par : [];
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO settings (table_id, prise_par_json, encaisser_par_json, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(table_id) DO UPDATE SET
           prise_par_json = excluded.prise_par_json,
           encaisser_par_json = excluded.encaisser_par_json,
           updated_at = excluded.updated_at`
      ).bind(tableId, JSON.stringify(prise_par), JSON.stringify(encaisser_par), now).run();
      return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }

    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
