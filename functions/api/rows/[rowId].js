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

export const onRequestPatch = async ({ env, params, request }) => {
  try {
    await ensureSchema(env.DB);
    const rowId = params.rowId;
    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();
    await env.DB.prepare('UPDATE rows SET data_json = ?, updated_at = ? WHERE id = ?')
      .bind(JSON.stringify(body.data || {}), now, rowId).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'error' }), { status: 500, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
};

export const onRequestDelete = async ({ env, params }) => {
  try {
    await ensureSchema(env.DB);
    const rowId = params.rowId;
    // Supprimer par clé primaire OU par l'id présent dans data_json (compat rétro)
    await env.DB.prepare("DELETE FROM rows WHERE id = ? OR json_extract(data_json, '$.id') = ?")
      .bind(rowId, rowId).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'error' }), { status: 500, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
};
