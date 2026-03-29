const ensureSchema = async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_privatisations_messages (
      priv_id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (priv_id) REFERENCES hotesse_privatisations(id) ON DELETE CASCADE
    );
  `).run();
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const privId = pathParts[4];

  if (!privId) {
    return new Response(JSON.stringify({ error: 'priv_id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = context.env.DB;

  try {
    await ensureSchema(db);
  } catch (error) {
    console.error('Error ensuring message schema:', error);
  }

  if (request.method === 'GET') {
    try {
      const row = await db.prepare(
        `SELECT priv_id, message, created_at, updated_at FROM hotesse_privatisations_messages WHERE priv_id = ?`
      ).bind(privId).first();

      return new Response(JSON.stringify(row || {}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching privatisation message:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const body = await request.json();
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      const now = new Date().toISOString();

      if (!message) {
        await db.prepare(
          `DELETE FROM hotesse_privatisations_messages WHERE priv_id = ?`
        ).bind(privId).run();

        return new Response(JSON.stringify({ success: true, deleted: true, priv_id: privId }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const existing = await db.prepare(
        `SELECT priv_id FROM hotesse_privatisations_messages WHERE priv_id = ?`
      ).bind(privId).first();

      if (existing) {
        await db.prepare(
          `UPDATE hotesse_privatisations_messages
           SET message = ?, updated_at = ?
           WHERE priv_id = ?`
        ).bind(message, now, privId).run();
      } else {
        await db.prepare(
          `INSERT INTO hotesse_privatisations_messages (priv_id, message, created_at, updated_at)
           VALUES (?, ?, ?, ?)`
        ).bind(privId, message, now, now).run();
      }

      return new Response(JSON.stringify({ success: true, priv_id: privId, message }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error saving privatisation message:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'DELETE') {
    try {
      await db.prepare(
        `DELETE FROM hotesse_privatisations_messages WHERE priv_id = ?`
      ).bind(privId).run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error deleting privatisation message:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}