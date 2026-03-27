import { ensureHotesseSchema } from '../schema.js';

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
    await ensureHotesseSchema(db);
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

    console.log(`>>> Fetching privatisations for client: ${clientId}, type: ${client.type}, nom: ${client.nom}, entreprise: ${client.entreprise}`);

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
      // For personal clients: search in TWO ways
      // 1. By client_info (their personal info)
      // 2. By their associated entreprise (if they have one)
      
      let clientPrivs = [];
      let entreprisePrivs = [];
      
      // Search by personal client info
      console.log(`>>> Searching privatisations by client info name: ${client.nom}`);
      if (client.prenom) {
        const privs = await db.prepare(`
          SELECT p.* FROM hotesse_privatisations p
          INNER JOIN hotesse_privatisations_client_info pci ON p.id = pci.priv_id
          WHERE pci.nom = ? AND pci.prenom = ? AND pci.telephone = ?
          ORDER BY p.date DESC
        `).bind(client.nom, client.prenom, client.telephone).all();
        clientPrivs = privs.results || [];
      } else if (client.telephone) {
        const privs = await db.prepare(`
          SELECT p.* FROM hotesse_privatisations p
          INNER JOIN hotesse_privatisations_client_info pci ON p.id = pci.priv_id
          WHERE pci.nom = ? AND pci.telephone = ?
          ORDER BY p.date DESC
        `).bind(client.nom, client.telephone).all();
        clientPrivs = privs.results || [];
      } else {
        const privs = await db.prepare(`
          SELECT p.* FROM hotesse_privatisations p
          INNER JOIN hotesse_privatisations_client_info pci ON p.id = pci.priv_id
          WHERE pci.nom = ?
          ORDER BY p.date DESC
        `).bind(client.nom).all();
        clientPrivs = privs.results || [];
      }
      
      console.log(`>>> Found ${clientPrivs.length} privatisations for client personal info`);
      
      // If client is associated with an entreprise, also fetch those privatisations
      if (client.entreprise && client.entreprise.trim()) {
        console.log(`>>> Searching privatisations by associated entreprise: ${client.entreprise}`);
        const privs = await db.prepare(`
          SELECT * FROM hotesse_privatisations
          WHERE name = ?
          ORDER BY date DESC
        `).bind(client.entreprise).all();
        
        entreprisePrivs = privs.results || [];
        console.log(`>>> Found ${entreprisePrivs.length} privatisations for associated entreprise`);
      }
      
      // Merge both lists, favoring unique by ID (in case a priv is in both)
      const privMap = new Map();
      clientPrivs.forEach(p => privMap.set(p.id, p));
      entreprisePrivs.forEach(p => privMap.set(p.id, p));
      
      privResults = Array.from(privMap.values()).sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
      
      console.log(`>>> Total unique privatisations: ${privResults.length}`);
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
