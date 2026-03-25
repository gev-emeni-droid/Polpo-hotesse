export const onRequestGet = async ({ env, params }) => {
  const { calendarId } = params;
  
  try {
    // Ensure table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS hotesse_theme_settings (
        calendar_id TEXT PRIMARY KEY,
        theme_id TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();

    // Get theme for this calendar
    const row = await env.DB.prepare(
      'SELECT theme_id FROM hotesse_theme_settings WHERE calendar_id = ?'
    ).bind(calendarId).first();

    const themeId = row ? row.theme_id : 'navy'; // default theme

    return new Response(
      JSON.stringify({ ok: true, theme_id: themeId }),
      { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message || 'error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
};

export const onRequestPut = async ({ env, params, request }) => {
  const { calendarId } = params;

  try {
    // Ensure table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS hotesse_theme_settings (
        calendar_id TEXT PRIMARY KEY,
        theme_id TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();

    const body = await request.json().catch(() => ({}));
    const themeId = body.theme_id || 'navy';
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO hotesse_theme_settings (calendar_id, theme_id, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(calendar_id) DO UPDATE SET
        theme_id = excluded.theme_id,
        updated_at = excluded.updated_at
    `).bind(calendarId, themeId, now).run();

    return new Response(
      JSON.stringify({ ok: true, theme_id: themeId }),
      { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message || 'error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
};
