import { ensureHotesseSchema } from './schema.js';

export async function onRequest(context) {
  const { env } = context;
  const db = env.DB;

  try {
    await ensureHotesseSchema(db);

    // Get all privatisations
    const privsResult = await db.prepare(`
      SELECT id, name FROM hotesse_privatisations WHERE name IS NOT NULL
    `).all();
    const privatisations = privsResult.results || [];

    let createdEntreprises = 0;
    let createdClients = 0;
    let skipped = 0;

    // For each privatisation, create/update entreprise and personal clients if data exists
    for (const priv of privatisations) {
      try {
        const privName = priv.name?.trim();
        if (!privName) continue;

        const now = new Date().toISOString();

        // 1. Create entreprise client from privatisation name if not exists
        const existingEntreprise = await db.prepare(
          `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'entreprise'`
        ).bind(privName).first();

        if (!existingEntreprise) {
          const entrepriseId = `client_${crypto.randomUUID()}`;
          await db.prepare(
            `INSERT INTO hotesse_clients 
             (id, nom, entreprise, type, created_at, updated_at)
             VALUES (?, ?, ?, 'entreprise', ?, ?)`
          ).bind(entrepriseId, privName, privName, now, now).run();
          createdEntreprises++;
          console.log('Created entreprise:', privName);
        }

        // 2. Check if there's client info saved for this privatisation
        const clientInfo = await db.prepare(
          `SELECT prenom, nom, telephone, mail, adresse_postale FROM hotesse_privatisations_client_info WHERE priv_id = ?`
        ).bind(priv.id).first();

        if (clientInfo && clientInfo.nom) {
          // Check if client exists by prenom+nom
          const existingClient = await db.prepare(
            `SELECT id FROM hotesse_clients WHERE prenom = ? AND nom = ? AND type = 'client'`
          ).bind(clientInfo.prenom || null, clientInfo.nom).first();

          if (!existingClient) {
            const clientId = `client_${crypto.randomUUID()}`;
            await db.prepare(
              `INSERT INTO hotesse_clients 
               (id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'client', ?, ?)`
            ).bind(
              clientId,
              clientInfo.prenom || null,
              clientInfo.nom,
              clientInfo.telephone || null,
              clientInfo.mail || null,
              clientInfo.adresse_postale || null,
              privName,
              now,
              now
            ).run();
            createdClients++;
            console.log('Created client:', clientInfo.nom);
          }
        }
      } catch (err) {
        console.error('Error syncing privatisation:', priv.name, err);
        skipped++;
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      message: 'Sync complete',
      createdEntreprises,
      createdClients,
      skipped,
      total: privatisations.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
