export const onRequestPost = async ({ env, request, params }) => {
  const { tableId } = params;
  const ensureSchema = async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rows (
        id TEXT PRIMARY KEY,
        table_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();
  };
  try {
    await ensureSchema(env.DB);
    const body = await request.json().catch(() => ({}));
    const data = body && body.data ? body.data : {};
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare('INSERT INTO rows (id, table_id, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, tableId, JSON.stringify(data), now, now).run();
    return new Response(JSON.stringify({ ok: true, id }), { headers: { 'content-type': 'application/json' }, status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'error' }), { headers: { 'content-type': 'application/json' }, status: 500 });
  }
};
