export const onRequestPost = async ({ env, params }) => {
  const id = params.id;
  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE tables SET archived_at = NULL, updated_at = ? WHERE id = ?').bind(now, id).run();
  return new Response(null, { status: 204 });
};
