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
    const logs = [];
    try {
      const body = await request.json();
      const { nom, prenom, mail, telephone, adresse_postale } = body;
      const now = new Date().toISOString();

      logs.push(`>>> POST /client-info - Body received: ${JSON.stringify(body)}`);
      logs.push(`>>> Extracted values - nom: ${JSON.stringify(nom)}, prenom: ${JSON.stringify(prenom)}, telephone: ${JSON.stringify(telephone)}`);

      // Check if exists
      const existing = await db.prepare(
        `SELECT * FROM hotesse_privatisations_client_info WHERE priv_id = ?`
      ).bind(privId).first();

      // Store OLD nom before updating (to potentially remove client association)
      const oldNom = existing?.nom;

      if (existing) {
        // Update
        logs.push('>>> Updating existing client_info');
        await db.prepare(
          `UPDATE hotesse_privatisations_client_info 
           SET nom = ?, prenom = ?, mail = ?, telephone = ?, adresse_postale = ?, updated_at = ?
           WHERE priv_id = ?`
        ).bind(nom, prenom, mail, telephone, adresse_postale, now, privId).run();
      } else {
        // Insert
        logs.push('>>> Inserting new client_info');
        await db.prepare(
          `INSERT INTO hotesse_privatisations_client_info 
           (priv_id, nom, prenom, mail, telephone, adresse_postale, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(privId, nom, prenom, mail, telephone, adresse_postale, now, now).run();
      }

      // Automatically create or update clients in hotesse_clients table
      if (nom && nom.trim()) {  // nom exists and is not just whitespace
        logs.push('>>> nom is truthy, proceeding with client creation');
        const privData = await db.prepare(
          `SELECT name FROM hotesse_privatisations WHERE id = ?`
        ).bind(privId).first();
        const privName = privData?.name;

        logs.push(`>>> privName: ${privName}, nom: ${nom}, prenom: ${prenom}, telephone: ${telephone}`);

        // 1. Create or UPDATE client (type = "client") with personal info
        try {
          // Check if client exists by prenom+nom+telephone
          let existingClient = null;
          
          // Build dynamic query based on available fields
          if (prenom && telephone) {
            logs.push('>>> Query: Search by prenom + nom + telephone');
            existingClient = await db.prepare(
              `SELECT id FROM hotesse_clients WHERE prenom = ? AND nom = ? AND telephone = ? AND type = 'client'`
            ).bind(prenom, nom, telephone).first();
          } else if (prenom) {
            logs.push('>>> Query: Search by prenom + nom');
            existingClient = await db.prepare(
              `SELECT id FROM hotesse_clients WHERE prenom = ? AND nom = ? AND type = 'client'`
            ).bind(prenom, nom).first();
          } else {
            logs.push('>>> Query: Search by nom only (no prenom)');
            existingClient = await db.prepare(
              `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'client' AND prenom IS NULL`
            ).bind(nom).first();
          }

          if (existingClient) {
            // Update existing client
            logs.push(`>>> Found existing client, updating: ${existingClient.id}`);
            await db.prepare(
              `UPDATE hotesse_clients 
               SET telephone = ?, mail = ?, adresse_postale = ?, entreprise = ?, updated_at = ?
               WHERE id = ?`
            ).bind(telephone || null, mail || null, adresse_postale || null, privName || null, now, existingClient.id).run();
            logs.push(`>>> Updated client: ${existingClient.id}`);
          } else {
            // Create new client
            const clientId = `client_${crypto.randomUUID()}`;
            logs.push(`>>> No existing client found, creating new one: ${clientId}`);
            logs.push(`>>> INSERT VALUES: ${JSON.stringify({ clientId, prenom: prenom || null, nom, telephone: telephone || null, mail: mail || null, adresse_postale: adresse_postale || null, entreprise: privName || null, type: 'client' })}`);
            
            const insertResult = await db.prepare(
              `INSERT INTO hotesse_clients 
               (id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'client', ?, ?)`
            ).bind(clientId, prenom || null, nom, telephone || null, mail || null, adresse_postale || null, privName || null, now, now).run();
            
            logs.push(`>>> INSERT result: ${JSON.stringify(insertResult)}`);
            logs.push(`>>> Created client (type=client): ${clientId}`);
          }
        } catch (err) {
          logs.push(`>>> ERROR creating/updating client: ${err.message}`);
        }

        // 2. Create or UPDATE entreprise client from privatisation name
        if (privName) {
          try {
            logs.push(`>>> Checking for existing entreprise: ${privName}`);
            const existingEntreprise = await db.prepare(
              `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'entreprise'`
            ).bind(privName).first();

            if (existingEntreprise) {
              logs.push(`>>> Found existing entreprise, updating: ${existingEntreprise.id}`);
              // Update existing entreprise (in case name changed elsewhere)
              await db.prepare(
                `UPDATE hotesse_clients 
                 SET entreprise = ?, updated_at = ?
                 WHERE id = ?`
              ).bind(privName, now, existingEntreprise.id).run();
              logs.push(`>>> Updated entreprise: ${existingEntreprise.id}`);
            } else {
              logs.push('>>> No existing entreprise found, creating new one');
              // Create new entreprise
              const entrepriseId = `client_${crypto.randomUUID()}`;
              logs.push(`>>> INSERT entreprise VALUES: ${JSON.stringify({ entrepriseId, nom: privName, entreprise: privName, type: 'entreprise' })}`);
              
              const insertResult = await db.prepare(
                `INSERT INTO hotesse_clients 
                 (id, nom, entreprise, type, created_at, updated_at)
                 VALUES (?, ?, ?, 'entreprise', ?, ?)`
              ).bind(entrepriseId, privName, privName, now, now).run();
              
              logs.push(`>>> INSERT result: ${JSON.stringify(insertResult)}`);
              logs.push(`>>> Created entreprise: ${entrepriseId}`);
            }
          } catch (err) {
            logs.push(`>>> ERROR creating/updating entreprise: ${err.message}`);
          }
        }
        
        logs.push('>>> Client creation completed');
      } else {
        logs.push(`>>> nom is EMPTY or whitespace - REMOVING client association: nom=${JSON.stringify(nom)}`);
        
        // If there was a previous nom, remove the entreprise association from that client
        if (oldNom && oldNom.trim()) {
          try {
            logs.push(`>>> Removing entreprise association from old client: ${oldNom}`);
            
            // Update client to remove entreprise (but keep the client itself)
            const updateResult = await db.prepare(
              `UPDATE hotesse_clients 
               SET entreprise = NULL, updated_at = ?
               WHERE nom = ? AND type = 'client' AND prenom IS NULL`
            ).bind(now, oldNom).run();
            
            logs.push(`>>> Updated clients, removed entreprise from ${updateResult.meta?.changes || 0} records`);
          } catch (err) {
            logs.push(`>>> ERROR removing entreprise association: ${err.message}`);
          }
        }
      }

      return new Response(JSON.stringify({ success: true, priv_id: privId, debug_logs: logs }), {
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
      // Get the client info to know which client to update
      const clientInfo = await db.prepare(
        `SELECT nom FROM hotesse_privatisations_client_info WHERE priv_id = ?`
      ).bind(privId).first();

      // Delete the client info record
      await db.prepare(
        `DELETE FROM hotesse_privatisations_client_info WHERE priv_id = ?`
      ).bind(privId).run();

      // If there was a client associated, remove the entreprise association from the client
      if (clientInfo?.nom) {
        // Update the client to remove entreprise association (but keep the client itself)
        await db.prepare(
          `UPDATE hotesse_clients 
           SET entreprise = NULL, updated_at = ?
           WHERE nom = ? AND type = 'client' AND prenom IS NULL`
        ).bind(new Date().toISOString(), clientInfo.nom).run();
      }

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
