export const onRequest = async ({ env, request, params }) => {
  const { id } = params;

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

    const method = request.method.toUpperCase();

    if (method === 'PATCH') {
      const body = await request.json().catch(() => ({}));
      const data = body && body.data ? body.data : {};
      const now = new Date().toISOString();

      // Vérifier que la ligne existe déjà
      const existing = await env.DB.prepare('SELECT id FROM rows WHERE id = ?').bind(id).first();
      if (!existing) {
        return new Response(JSON.stringify({ ok: false, error: 'not_found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        });
      }

      await env.DB.prepare('UPDATE rows SET data_json = ?, updated_at = ? WHERE id = ?')
        .bind(JSON.stringify(data), now, id).run();

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM rows WHERE id = ?').bind(id).run();
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
