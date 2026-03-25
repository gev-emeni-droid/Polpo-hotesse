const ensureHotesseSchema = async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_calendars (
      id TEXT PRIMARY KEY,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_archived INTEGER NOT NULL DEFAULT 0
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_privatisations (
      id TEXT PRIMARY KEY,
      calendar_id TEXT NOT NULL,
      name TEXT NOT NULL,
      people INTEGER,
      date TEXT NOT NULL,
      start TEXT,
      end TEXT,
      period TEXT NOT NULL,
      color TEXT NOT NULL,
      prise_par TEXT,
      FOREIGN KEY (calendar_id) REFERENCES hotesse_calendars(id)
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_hostess_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_prise_par_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_privatisations_hostesses (
      priv_id TEXT NOT NULL,
      hostess_name TEXT NOT NULL,
      PRIMARY KEY (priv_id, hostess_name),
      FOREIGN KEY (priv_id) REFERENCES hotesse_privatisations(id)
    );
  `).run();
};

export const onRequestGet = async ({ env }) => {
  try {
    await ensureHotesseSchema(env.DB);
    const { results } = await env.DB.prepare(
      `SELECT c.id,
              c.month,
              c.year,
              c.title,
              c.created_at,
              c.is_archived,
              COUNT(p.id) AS priv_count
       FROM hotesse_calendars c
       LEFT JOIN hotesse_privatisations p ON p.calendar_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    ).all();
    return new Response(JSON.stringify(results || []), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  } catch (e) {
    console.error('Error in calendars GET:', e.message);
    return new Response(JSON.stringify({ error: e.message || 'error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const onRequestPost = async ({ env, request }) => {
  await ensureHotesseSchema(env.DB);
  const body = await request.json().catch(() => ({}));
  const month = Number(body.month);
  const year = Number(body.year);
  const title = (body.title || '').trim();
  if (!Number.isInteger(month) || !Number.isInteger(year) || !title) {
    return new Response(JSON.stringify({ error: 'invalid payload' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  const id = body.id && typeof body.id === 'string' ? body.id : `cal_${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO hotesse_calendars (id, month, year, title, created_at, is_archived) VALUES (?, ?, ?, ?, ?, 0)'
  )
    .bind(id, month, year, title, createdAt)
    .run();

  return new Response(JSON.stringify({ id, month, year, title, created_at: createdAt }), {
    status: 201,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
};
