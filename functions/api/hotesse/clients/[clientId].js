const ensureSchema = async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_clients (
      id TEXT PRIMARY KEY,
      prenom TEXT NOT NULL,
      nom TEXT NOT NULL,
      telephone TEXT NOT NULL,
      mail TEXT,
      adresse_postale TEXT,
      entreprise TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(prenom, nom, telephone)
    );
  `).run();
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  // Extract clientId from path: /api/hotesse/clients/CLIENTID
  const clientId = pathParts[4];

  if (!clientId) {
    return new Response(JSON.stringify({ error: 'client_id is required' }), {
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

  const method = request.method.toUpperCase();
  
  if (method === 'GET') {
    return handleGet(db, clientId);
  }

  if (method === 'DELETE') {
    return handleDelete(db, clientId);
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleDelete(db, clientId) {
  try {
    // Delete the client
    const result = await db.prepare(
      `DELETE FROM hotesse_clients WHERE id = ?`
    ).bind(clientId).run();

    return new Response(JSON.stringify({ success: true, deleted: result.meta?.changes || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleGet(db, clientId) {
  try {
    // Get client info
    const client = await db.prepare(
      `SELECT * FROM hotesse_clients WHERE id = ?`
    ).bind(clientId).first();

    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`>>> Fetching privatisations for client: ${clientId}, type: ${client.type}, nom: ${client.nom}`);

    // Get all privatisations for this client based on type
    let privResults = [];

    if (client.type === 'entreprise') {
      // For enterprise clients: search by privatisation name
      console.log(`>>> Searching privatisations by entreprise name: ${client.nom}`);
      const privs = await db.prepare(`
        SELECT * FROM hotesse_privatisations
        WHERE name = ?
        ORDER BY date DESC
      `).bind(client.nom).all();
      
      privResults = privs.results || [];
      console.log(`>>> Found ${privResults.length} privatisations for entreprise`);
    } else {
      // For personal clients: search in client_info table
      console.log(`>>> Searching privatisations by client info name: ${client.nom}`);
      
      let privs;
      if (client.prenom) {
        privs = await db.prepare(`
          SELECT p.* FROM hotesse_privatisations p
          INNER JOIN hotesse_privatisations_client_info pci ON p.id = pci.priv_id
          WHERE pci.nom = ? AND pci.prenom = ? AND pci.telephone = ?
          ORDER BY p.date DESC
        `).bind(client.nom, client.prenom, client.telephone).all();
      } else {
        // If prenom is NULL, search without it
        privs = await db.prepare(`
          SELECT p.* FROM hotesse_privatisations p
          INNER JOIN hotesse_privatisations_client_info pci ON p.id = pci.priv_id
          WHERE pci.nom = ? AND pci.prenom IS NULL AND pci.telephone = ?
          ORDER BY p.date DESC
        `).bind(client.nom, client.telephone).all();
      }
      
      privResults = privs.results || [];
      console.log(`>>> Found ${privResults.length} privatisations for client`);
    }

    // Fetch documents for each privatisation
    const privatisations = [];
    for (const priv of privResults) {
      const docs = await db.prepare(`
        SELECT id, file_name, mime_type, file_size, file_data, uploaded_at, uploaded_by
        FROM hotesse_privatisations_documents
        WHERE priv_id = ?
        ORDER BY uploaded_at DESC
      `).bind(priv.id).all();

      // Map documents to include file_type for frontend compatibility
      const mappedDocs = (docs.results || []).map(doc => ({
        ...doc,
        file_type: doc.mime_type
      }));

      privatisations.push({
        ...priv,
        documents: mappedDocs
      });
    }

    console.log(`>>> Returning ${privatisations.length} privatisations with documents`);

    return new Response(JSON.stringify({
      client,
      privatisations
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching client details:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
