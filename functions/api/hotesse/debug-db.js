export async function onRequest(context) {
  const { env } = context;
  const db = env.DB;

  try {
    // Get all data from hotesse_clients
    const clients = await db.prepare(`
      SELECT id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at
      FROM hotesse_clients
    `).all();

    // Get count
    const count = await db.prepare(`
      SELECT COUNT(*) as total FROM hotesse_clients
    `).first();

    console.error('=== DEBUG DB ===');
    console.error('Total clients:', count?.total);
    console.error('Clients data:', JSON.stringify(clients.results, null, 2));

    return new Response(JSON.stringify({
      ok: true,
      totalClients: count?.total || 0,
      clients: clients.results || [],
      message: 'Check server logs for details'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
