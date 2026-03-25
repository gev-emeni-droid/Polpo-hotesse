export const onRequestGet = async ({ env, params }) => {
  const { tableId } = params;
  const ensureSchema = async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS tables (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        archived_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();
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
    const table = await env.DB.prepare('SELECT id, name, archived_at, created_at, updated_at FROM tables WHERE id = ?')
      .bind(tableId).first();
    if (!table) {
      return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }
    const { results } = await env.DB.prepare('SELECT id, data_json FROM rows WHERE table_id = ? ORDER BY created_at ASC')
      .bind(tableId).all();
    const rows = (results || []).map(r => ({ ...JSON.parse(r.data_json || '{}'), id: r.id }));
    return new Response(JSON.stringify({ table, rows }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'error' }), { status: 500, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
};
