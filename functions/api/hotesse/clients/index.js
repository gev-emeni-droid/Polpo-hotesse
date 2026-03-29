import { ensureHotesseSchema } from '../schema.js';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const { searchParams } = url;
  
  const db = context.env.DB;
  
  try {
    await ensureHotesseSchema(db);
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
    // Get search and filter parameters
    const searchTerm = (searchParams.get('search') || '').trim().toLowerCase();
    const typeFilter = (searchParams.get('type') || '').trim();
    const pageNum = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 30;

    console.log(`>>> GET /clients - search: "${searchTerm}", type: "${typeFilter}", page: ${pageNum}`);

    // Build WHERE clause
    let whereConditions = [];
    let bindParams = [];

    if (searchTerm) {
      // Search across all relevant fields (case-insensitive)
      whereConditions.push(`(LOWER(nom) LIKE ? OR LOWER(prenom) LIKE ? OR LOWER(telephone) LIKE ? OR LOWER(COALESCE(mail,'')) LIKE ? OR LOWER(COALESCE(entreprise,'')) LIKE ?)`);
      bindParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (typeFilter && (typeFilter === 'client' || typeFilter === 'entreprise')) {
      whereConditions.push(`type = ?`);
      bindParams.push(typeFilter);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM hotesse_clients ${whereClause}`;
    const countResult = await db.prepare(countQuery).bind(...bindParams).first();
    const total = countResult?.count || 0;

    // Get paginated results
    const offset = (pageNum - 1) * pageSize;
    const query = `
      SELECT id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at
      FROM hotesse_clients
      ${whereClause}
      ORDER BY type DESC, nom ASC, prenom ASC
      LIMIT ? OFFSET ?
    `;
    
    const result = await db.prepare(query).bind(...bindParams, pageSize, offset).all();
    const clients = result.results || [];

    const totalPages = Math.ceil(total / pageSize);

    console.log(`>>> GET /clients - Found ${clients.length} clients (total: ${total})`);

    return new Response(JSON.stringify({
      clients,
      total,
      page: pageNum,
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

    console.log('>>> POST /clients - Received:', { prenom, nom, telephone, mail, type });

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
      console.log('>>> Checking existing entreprise by nom:', nom);
      existing = await db.prepare(
        `SELECT id FROM hotesse_clients WHERE nom = ? AND type = 'entreprise'`
      ).bind(nom).first();
    } else {
      // For client: check by prenom + nom + telephone to keep different people separate
      console.log('>>> Checking existing client by prenom/nom/telephone:', { prenom, nom, telephone });
      
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

    console.log('>>> Existing check result:', existing ? 'Found - ' + existing.id : 'Not found');

    if (existing) {
      // Update
      console.log('>>> Updating client:', existing.id);
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
      console.log('>>> Inserting new client:', { id, prenom, nom, telephone, type });
      await db.prepare(
        `INSERT INTO hotesse_clients 
         (id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, prenom || null, nom, telephone || null, mail || null, adresse_postale || null, entreprise || null, type, now, now).run();

      console.log('>>> Client inserted successfully:', id);
      return new Response(JSON.stringify({ success: true, id, action: 'created' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('>>> Error saving client:', error.message, error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
