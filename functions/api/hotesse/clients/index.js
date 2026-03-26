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
    const page = parseInt(searchParams.get('page')) || 1;
    const search = searchParams.get('search')?.toLowerCase() || '';
    const typeFilter = searchParams.get('type') || ''; // '' = all, 'client', or 'entreprise'
    const limit = 30;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    // Build WHERE clause with search and type filter
    let conditions = [];
    if (search) {
      conditions.push(`(nom LIKE ? OR LOWER(nom) LIKE ? OR telephone LIKE ? OR mail LIKE ? OR entreprise LIKE ?)`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (typeFilter) {
      conditions.push(`type = ?`);
      params.push(typeFilter);
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM hotesse_clients ${whereClause}`;
    const countResult = await db.prepare(countQuery).bind(...params).first();
    const total = countResult?.count || 0;

    // Get paginated results - prepare with all params including limit and offset
    const allParams = [...params, limit, offset];
    const query = `
      SELECT id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at
      FROM hotesse_clients
      ${whereClause}
      ORDER BY type DESC, nom ASC, prenom ASC
      LIMIT ? OFFSET ?
    `;
    
    const result = await db.prepare(query).bind(...allParams).all();
    const clients = result.results || [];

    return new Response(JSON.stringify({
      clients,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return new Response(JSON.stringify({ error: error.message }), {
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
