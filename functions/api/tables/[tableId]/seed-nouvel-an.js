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
    const rows = [
      { nom:'BALLARIN', prenom:'Didier', tel:'', heure:'21:30', creation:'2025-11-07', paiement:'2025-11-07', comment:'ras', ad:2, enf:0, tarifad:98, tarifenf:49, prisepar:'Zenchef', encaisserpar:'Zenchef', cb:196, amex:0, espece:0, cheque:0, zen:0, virm:0 },
      { nom:'FACI', prenom:'Laure', tel:'', heure:'19:30', creation:'2025-11-08', paiement:'2025-11-08', comment:'', ad:2, enf:0, tarifad:98, tarifenf:49, prisepar:'Zenchef', encaisserpar:'Zenchef', cb:196, amex:0, espece:0, cheque:0, zen:0, virm:0 },
      { nom:'RADU', prenom:'Irina', tel:'', heure:'21:00', creation:'2025-11-07', paiement:'2025-11-07', comment:'ras', ad:8, enf:0, tarifad:98, tarifenf:49, prisepar:'Zenchef', encaisserpar:'Zenchef', cb:784, amex:0, espece:0, cheque:0, zen:0, virm:0 },
      { nom:'HOSNI', prenom:'Karim', tel:'', heure:'21:00', creation:'2025-11-12', paiement:'2025-11-12', comment:'', ad:2, enf:0, tarifad:98, tarifenf:49, prisepar:'Zenchef', encaisserpar:'Zenchef', cb:196, amex:0, espece:0, cheque:0, zen:0, virm:0 },
      { nom:'PIROU', prenom:'Martine', tel:'', heure:'19:00', creation:'2025-11-12', paiement:'2025-11-12', comment:'Cliente régulière', ad:6, enf:0, tarifad:98, tarifenf:49, prisepar:'Manager', encaisserpar:'Zenchef', cb:588, amex:0, espece:0, cheque:0, zen:0, virm:0 },
    ];
    const now = new Date().toISOString();
    for (const r of rows) {
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO rows (id, table_id, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
        .bind(id, tableId, JSON.stringify(r), now, now).run();
    }
    return new Response(JSON.stringify({ ok: true, inserted: rows.length }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
