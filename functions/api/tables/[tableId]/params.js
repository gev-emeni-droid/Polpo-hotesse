export const onRequest = async (ctx) => {
  const { request, env, params } = ctx;
  const { tableId } = params;

  const ensureSchema = async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS table_params (
        table_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value_json TEXT NOT NULL,
        PRIMARY KEY (table_id, key)
      );
    `).run();
  };

  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  try {
    await ensureSchema(env.DB);

    if (method === 'GET') {
      const { results } = await env.DB.prepare('SELECT key, value_json FROM table_params WHERE table_id = ?')
        .bind(tableId).all();
      const obj = {};
      for (const r of results || []) {
        try { obj[r.key] = JSON.parse(r.value_json); } catch { obj[r.key] = r.value_json; }
      }
      return new Response(JSON.stringify({ ok: true, params: obj }), { headers: { 'content-type': 'application/json' } });
    }

    if (method === 'PUT' || method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const paramsObj = body && body.params && typeof body.params === 'object' ? body.params : {};
      const tx = await env.DB.prepare('BEGIN').run();
      try {
        for (const [k, v] of Object.entries(paramsObj)) {
          await env.DB.prepare('INSERT OR REPLACE INTO table_params (table_id, key, value_json) VALUES (?, ?, ?)')
            .bind(tableId, k, JSON.stringify(v)).run();
        }
        await env.DB.prepare('COMMIT').run();
      } catch (e) {
        await env.DB.prepare('ROLLBACK').run();
        return new Response(JSON.stringify({ ok: false, error: e.message || 'db_error' }), { status: 500, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
