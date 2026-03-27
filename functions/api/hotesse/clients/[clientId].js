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

    console.log(`>>> Fetching privatisations for client: ${clientId}, type: ${client.type}, nom: ${client.nom}, prenom: ${client.prenom}, telephone: ${client.telephone}`);

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
      // For personal clients: search in client_info table AND ALSO search by matching nom/prenom/telephone
      console.log(`>>> Searching privatisations for personal client: nom=${client.nom}, prenom=${client.prenom}, tel=${client.telephone}`);
      
      // Build dynamic WHERE clause based on available fields
      let whereConditions = [];
      let bindings = [];
      
      if (client.nom) {
        whereConditions.push('pci.nom = ?');
        bindings.push(client.nom);
      }
      if (client.prenom) {
        whereConditions.push('pci.prenom = ?');
        bindings.push(client.prenom);
      }
      if (client.telephone) {
        whereConditions.push('pci.telephone = ?');
        bindings.push(client.telephone);
      }
      
      let whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
      
      // Method 1: Search in privatisations_client_info (where info was explicitly saved)
      console.log(`>>> Method 1 WHERE clause: ${whereClause}`);
      let query1 = `
        SELECT DISTINCT p.* FROM hotesse_privatisations p
        INNER JOIN hotesse_privatisations_client_info pci ON p.id = pci.priv_id
        ${whereClause}
        ORDER BY p.date DESC
      `;
      
      const method1Results = await db.prepare(query1).bind(...bindings).all();
      const privsByClientInfo = method1Results.results || [];
      console.log(`>>> Method 1 found ${privsByClientInfo.length} privatisations in client_info`);
      
      // Method 2: Also search by name match in privatisations table itself (fallback for unlinked privats)
      // This handles cases where client participated but info wasn't explicitly saved
      if (client.nom) {
        console.log(`>>> Method 2: Also searching for privatisations by name fallback: ${client.nom}`);
        const method2Results = await db.prepare(`
          SELECT * FROM hotesse_privatisations
          WHERE name LIKE ?
          AND id NOT IN (SELECT priv_id FROM hotesse_privatisations_client_info WHERE nom = ?)
          ORDER BY date DESC
        `).bind(`%${client.nom}%`, client.nom).all();
        
        const privsByNameFallback = method2Results.results || [];
        console.log(`>>> Method 2 found ${privsByNameFallback.length} privatisations by name fallback`);
        
        // Merge results (Method 1 takes precedence, Method 2 adds extras)
        privResults = [
          ...privsByClientInfo,
          ...privsByNameFallback.filter(p => !privsByClientInfo.some(pci => pci.id === p.id))
        ];
      } else {
        privResults = privsByClientInfo;
      }
      
      console.log(`>>> Total: ${privResults.length} privatisations for personal client`);
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
