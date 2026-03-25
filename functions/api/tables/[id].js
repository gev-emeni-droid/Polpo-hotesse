export const onRequestGet = async ({ env, params }) => {
  const id = params.id;
  const table = await env.DB.prepare('SELECT id, name, archived_at, created_at, updated_at FROM tables WHERE id = ?').bind(id).first();
  if (!table) return new Response(null, { status: 404 });
  const paramsRows = await env.DB.prepare('SELECT key, value_json FROM table_params WHERE table_id = ?').bind(id).all();
  const rows = await env.DB.prepare('SELECT id, data_json, created_at, updated_at FROM rows WHERE table_id = ? ORDER BY created_at ASC').bind(id).all();
  const paramsObj = Object.fromEntries((paramsRows.results || []).map(r => [r.key, JSON.parse(r.value_json)]));
  const dataRows = (rows.results || []).map(r => ({ id: r.id, ...JSON.parse(r.data_json) }));
  return new Response(JSON.stringify({ ...table, params: paramsObj, rows: dataRows }), { headers: { 'content-type': 'application/json' } });
};

export const onRequestPatch = async ({ env, params, request }) => {
  const id = params.id;
  const body = await request.json();
  const now = new Date().toISOString();
  if (typeof body.name === 'string') {
    const name = body.name.trim();
    if (name) await env.DB.prepare('UPDATE tables SET name = ?, updated_at = ? WHERE id = ?').bind(name, now, id).run();
  }
  if (body.params && typeof body.params === 'object') {
    for (const [k, v] of Object.entries(body.params)) {
      await env.DB.prepare('INSERT INTO table_params (table_id, key, value_json) VALUES (?, ?, ?) ON CONFLICT(table_id, key) DO UPDATE SET value_json = excluded.value_json')
        .bind(id, k, JSON.stringify(v)).run();
    }
  }
  return new Response(null, { status: 204 });
};

export const onRequestDelete = async ({ env, params }) => {
  const id = params.id;
  await env.DB.prepare('DELETE FROM tables WHERE id = ?').bind(id).run();
  return new Response(null, { status: 204 });
};
