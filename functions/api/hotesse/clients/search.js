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
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleGet(db, searchParams) {
  try {
    const query = searchParams.get('q')?.trim() || '';
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!query || query.length < 2) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Smart search: search by nom, prenom, AND telephone with intelligent matching
    // ONLY search for type='client' (personal clients, not enterprises)
    const searchTerm = `%${query.toLowerCase()}%`;
    
    // Search with priority:
    // 1. Exact matches on nom or prenom (highest priority)
    // 2. LIKE matches on nom or prenom  
    // 3. LIKE matches on telephone
    const result = await db.prepare(`
      SELECT 
        id, civilite, prenom, nom, telephone, mail, adresse_postale, ville, code_postal,
        -- Priority scoring for better sorting
        CASE 
          WHEN LOWER(nom) = ? THEN 1
          WHEN LOWER(prenom) = ? THEN 1
          WHEN LOWER(telephone) = ? THEN 2
          WHEN LOWER(nom) LIKE ? THEN 3
          WHEN LOWER(prenom) LIKE ? THEN 3
          WHEN LOWER(telephone) LIKE ? THEN 4
          ELSE 5
        END as priority
      FROM hotesse_clients
      WHERE 
        type = 'client'
        AND (
          LOWER(prenom) LIKE ? 
          OR LOWER(nom) LIKE ? 
          OR LOWER(telephone) LIKE ?
        )
      ORDER BY priority ASC, nom ASC, prenom ASC
      LIMIT ?
    `).bind(
      query.toLowerCase(),  // exact nom
      query.toLowerCase(),  // exact prenom
      query.toLowerCase(),  // exact telephone
      searchTerm,          // like nom
      searchTerm,          // like prenom
      searchTerm,          // like telephone
      searchTerm,          // where like prenom
      searchTerm,          // where like nom
      searchTerm,          // where like telephone
      limit
    ).all();

    const clients = result.results || [];
    
    // Remove priority field from response (internal only)
    const cleanedClients = clients.map(({ priority, ...rest }) => rest);

    console.log(`>>> Client search: query="${query}", found=${cleanedClients.length} clients`);

    return new Response(JSON.stringify(cleanedClients), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error searching clients:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
