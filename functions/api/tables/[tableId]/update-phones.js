export const onRequestPost = async ({ env, params, request }) => {
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
    const updates = Array.isArray(body.updates) ? body.updates : [];
    let updated = 0;
    for (const u of updates) {
      if (!u || !u.nom || !u.prenom) continue;
      const { results } = await env.DB.prepare(
        `SELECT id, data_json FROM rows WHERE table_id = ? AND json_extract(data_json, '$.nom') = ? AND json_extract(data_json, '$.prenom') = ?`
      ).bind(tableId, u.nom, u.prenom).all();
      for (const r of (results || [])) {
        const data = JSON.parse(r.data_json || '{}');
        data.tel = u.tel || '';
        const now = new Date().toISOString();
        await env.DB.prepare('UPDATE rows SET data_json = ?, updated_at = ? WHERE id = ?')
          .bind(JSON.stringify(data), now, r.id).run();
        updated += 1;
      }
    }
    return new Response(JSON.stringify({ ok: true, updated }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
