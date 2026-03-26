import { ensureHotesseSchema } from './schema.js';

export async function onRequest(context) {
  const { env } = context;
  const db = env.DB;

  try {
    await ensureHotesseSchema(db);

    // Get all privatisations
    const privs = await db.prepare('SELECT name FROM hotesse_privatisations WHERE name IS NOT NULL').all();
    const privatisations = privs.results || [];

    let created = 0;
    let skipped = 0;

    // For each privatisation, ensure an entreprise client exists
    for (const priv of privatisations) {
      try {
        const name = priv.name;
        if (!name) continue;

        // Check if entreprise with this nom exists
        const existing = await db.prepare(
          "SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'entreprise'"
        ).bind(name).first();

        if (!existing) {
          // Create it
          const id = `client_${crypto.randomUUID()}`;
          const now = new Date().toISOString();
          await db.prepare(
            `INSERT INTO hotesse_clients 
             (id, nom, entreprise, type, created_at, updated_at)
             VALUES (?, ?, ?, 'entreprise', ?, ?)`
          ).bind(id, name, name, now, now).run();
          created++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error('Error creating client for privatisation:', priv.name, err);
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      message: `Migration complete. Created: ${created}, Skipped: ${skipped}`,
      created,
      skipped
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
