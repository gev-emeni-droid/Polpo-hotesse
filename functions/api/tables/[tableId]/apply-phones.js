export const onRequestGet = async ({ env, params }) => {
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
    const mapping = [
      { nom: 'BALLARIN', prenom: 'Didier',  tel: '+33 6 63 35 67 87' },
      { nom: 'FACI',     prenom: 'Laure',   tel: '+33 6 95 16 53 53' },
      { nom: 'RADU',     prenom: 'Irina',   tel: '+33 6 62 21 38 35' },
      { nom: 'HOSNI',    prenom: 'Karim',   tel: '661752539' },
      { nom: 'PIROU',    prenom: 'Martine', tel: '+33 6 86 88 67 60' },
    ];
    let updated = 0;
    for (const u of mapping) {
      const { results } = await env.DB.prepare(
        `SELECT id, data_json FROM rows WHERE table_id = ? AND json_extract(data_json, '$.nom') = ? AND json_extract(data_json, '$.prenom') = ?`
      ).bind(tableId, u.nom, u.prenom).all();
      for (const r of (results || [])) {
        const data = JSON.parse(r.data_json || '{}');
        data.tel = u.tel;
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
