const ensureSchema = async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_clients (
      id TEXT PRIMARY KEY,
      prenom TEXT,
      nom TEXT NOT NULL,
      telephone TEXT,
      mail TEXT,
      adresse_postale TEXT,
      entreprise TEXT,
      type TEXT DEFAULT 'client',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `).run();
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const { searchParams } = url;
  
  const db = context.env.DB;
  
  try {
    await ensureSchema(db);
  } catch (error) {
    console.error('Error ensuring schema:', error);
  }

  const method = request.method.toUpperCase();
  
  if (method === 'GET') {
    return handleGet(db, searchParams);
  }
  
  if (method === 'POST' || method === 'PUT') {
    return handlePost(db, request);
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleGet(db, searchParams) {
  try {
    // Simple: just return all clients, no complex params
    const result = await db.prepare(`
      SELECT id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at
      FROM hotesse_clients
      ORDER BY type DESC, nom ASC, prenom ASC
    `).all();

    const clients = result.results || [];
    const total = clients.length;
    const page = 1;
    const pageSize = 30;
    const totalPages = Math.ceil(total / pageSize);

    return new Response(JSON.stringify({
      clients,
      total,
      page,
      pageSize,
      totalPages
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('handleGet error:', error.message, error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePost(db, request) {
  try {
    const body = await request.json();
    const { prenom, nom, telephone, mail, adresse_postale, entreprise, type = 'client' } = body;

    console.error('POST /clients - Received:', { prenom, nom, telephone, mail, type });

    // nom is required
    if (!nom) {
      return new Response(JSON.stringify({ error: 'nom is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const now = new Date().toISOString();

    // Check if exists - detection logic depends on type
    let existing = null;
    
    if (type === 'entreprise') {
      // For entreprise: only check by nom to avoid duplicates
      console.error('Checking existing entreprise by nom:', nom);
      existing = await db.prepare(
        `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'entreprise'`
      ).bind(nom).first();
    } else {
      // For client: check by prenom + nom + telephone to keep different people separate
      console.error('Checking existing client by prenom/nom/telephone:', { prenom, nom, telephone });
      
      if (prenom && telephone) {
        existing = await db.prepare(
          `SELECT id FROM hotesse_clients WHERE prenom = ? AND nom = ? AND telephone = ? AND type = 'client'`
        ).bind(prenom, nom, telephone).first();
      } else if (prenom) {
        existing = await db.prepare(
          `SELECT id FROM hotesse_clients WHERE prenom = ? AND nom = ? AND type = 'client'`
        ).bind(prenom, nom).first();
      } else {
        existing = await db.prepare(
          `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'client'`
        ).bind(nom).first();
      }
    }

    console.error('Existing check result:', existing ? 'Found' : 'Not found');

    if (existing) {
      // Update
      console.error('Updating client:', existing.id);
      await db.prepare(
        `UPDATE hotesse_clients 
         SET mail = ?, adresse_postale = ?, entreprise = ?, updated_at = ?
         WHERE id = ?`
      ).bind(mail || null, adresse_postale || null, entreprise || null, now, existing.id).run();

      return new Response(JSON.stringify({ success: true, id: existing.id, action: 'updated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Insert
      const id = crypto.randomUUID();
      console.error('Inserting new client:', { id, prenom, nom, telephone, type });
      await db.prepare(
        `INSERT INTO hotesse_clients 
         (id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, prenom || null, nom, telephone || null, mail || null, adresse_postale || null, entreprise || null, type, now, now).run();

      console.error('Client inserted successfully:', id);
      return new Response(JSON.stringify({ success: true, id, action: 'created' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error saving client:', error.message, error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
