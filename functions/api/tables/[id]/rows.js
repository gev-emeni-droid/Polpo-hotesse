export const onRequestPost = async ({ env, params, request }) => {
  const tableId = params.id;
  const body = await request.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO rows (id, table_id, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, tableId, JSON.stringify(body.data || {}), now, now).run();
  return new Response(JSON.stringify({ id }), { headers: { 'content-type': 'application/json' }, status: 201 });
};
