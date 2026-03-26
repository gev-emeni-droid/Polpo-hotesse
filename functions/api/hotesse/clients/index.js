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

    // nom is required
    if (!nom) {
      return new Response(JSON.stringify({ error: 'nom is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const now = new Date().toISOString();

    // Check if exists - detection logic depends on type
    let existsQuery = '';
    let existsParams = [];
    
    if (type === 'entreprise') {
      // For entreprise: only check by nom to avoid duplicates
      existsQuery = `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'entreprise'`;
      existsParams = [nom];
    } else {
      // For client: check by prenom + nom + telephone to keep different people separate
      existsQuery = `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'client'`;
      existsParams = [nom];
      
      if (prenom) {
        existsQuery += ` AND prenom = ?`;
        existsParams.push(prenom);
      }
      if (telephone) {
        existsQuery += ` AND telephone = ?`;
        existsParams.push(telephone);
      }
    }
    
    const existing = await db.prepare(existsQuery).bind(...existsParams).first();

    if (existing) {
      // Update
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
      await db.prepare(
        `INSERT INTO hotesse_clients 
         (id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, prenom || null, nom, telephone || null, mail || null, adresse_postale || null, entreprise || null, type, now, now).run();

      return new Response(JSON.stringify({ success: true, id, action: 'created' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error saving client:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
