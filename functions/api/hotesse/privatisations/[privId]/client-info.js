const ensureSchema = async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_privatisations_client_info (
      priv_id TEXT PRIMARY KEY,
      nom TEXT,
      prenom TEXT,
      mail TEXT,
      telephone TEXT,
      adresse_postale TEXT,
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
  
  // Extraire privId du path: /api/hotesse/privatisations/PRIVID/client-info
  // Index positions: ['', 'api', 'hotesse', 'privatisations', 'PRIVID', 'client-info']
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
    console.error('Error ensuring schema:', error);
  }

  if (request.method === 'GET') {
    try {
      const clientInfo = await db.prepare(
        `SELECT * FROM hotesse_privatisations_client_info WHERE priv_id = ?`
      ).bind(privId).first();

      return new Response(JSON.stringify(clientInfo || {}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching client info:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const body = await request.json();
      const { nom, prenom, mail, telephone, adresse_postale } = body;
      const now = new Date().toISOString();

      // Check if exists
      const existing = await db.prepare(
        `SELECT priv_id FROM hotesse_privatisations_client_info WHERE priv_id = ?`
      ).bind(privId).first();

      if (existing) {
        // Update
        await db.prepare(
          `UPDATE hotesse_privatisations_client_info 
           SET nom = ?, prenom = ?, mail = ?, telephone = ?, adresse_postale = ?, updated_at = ?
           WHERE priv_id = ?`
        ).bind(nom, prenom, mail, telephone, adresse_postale, now, privId).run();
      } else {
        // Insert
        await db.prepare(
          `INSERT INTO hotesse_privatisations_client_info 
           (priv_id, nom, prenom, mail, telephone, adresse_postale, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(privId, nom, prenom, mail, telephone, adresse_postale, now, now).run();
      }

      // Automatically create/update clients in hotesse_clients table
      try {
        // Get privatisation name for entreprise client
        const privData = await db.prepare(
          `SELECT name FROM hotesse_privatisations WHERE id = ?`
        ).bind(privId).first();
        const privName = privData?.name;

        // Create/update client (type = "client") with personal info
        if (nom) {
          const clientId = `client_${prenom || ''}_${nom}_${telephone || ''}`.replace(/\s+/g, '_').toLowerCase();
          const existingClient = await db.prepare(
            `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'client'`
          ).bind(nom).first();

          if (existingClient) {
            // Update
            await db.prepare(
              `UPDATE hotesse_clients 
               SET prenom = ?, telephone = ?, mail = ?, adresse_postale = ?, entreprise = ?, updated_at = ?
               WHERE id = ?`
            ).bind(prenom || null, telephone || null, mail || null, adresse_postale || null, privName || null, now, existingClient.id).run();
          } else {
            // Create
            const newClientId = `client_${crypto.randomUUID()}`;
            await db.prepare(
              `INSERT INTO hotesse_clients 
               (id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'client', ?, ?)`
            ).bind(newClientId, prenom || null, nom, telephone || null, mail || null, adresse_postale || null, privName || null, now, now).run();
          }
        }

        // Create/update entreprise client from privatisation name
        if (privName) {
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
          }
        }
      } catch (clientErr) {
        console.error('Warning: Failed to auto-create clients:', clientErr);
      }

      return new Response(JSON.stringify({ success: true, priv_id: privId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error saving client info:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'DELETE') {
    try {
      await db.prepare(
        `DELETE FROM hotesse_privatisations_client_info WHERE priv_id = ?`
      ).bind(privId).run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error deleting client info:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
