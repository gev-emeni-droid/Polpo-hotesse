export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response("ok", { status: 200 });
    }
    if (url.pathname === "/db-info") {
      const row = await env.DB.prepare('SELECT COUNT(*) as table_count FROM tables').first().catch(() => null);
      return new Response(JSON.stringify(row || {}), { headers: { 'content-type': 'application/json' } });
    }
    return new Response("worker up", { status: 200 });
  }
};
