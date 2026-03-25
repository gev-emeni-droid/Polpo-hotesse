const ensureSchema = async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_privatisations_documents (
      id TEXT PRIMARY KEY,
      priv_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_data TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
      file_size INTEGER,
      uploaded_at TEXT NOT NULL,
      uploaded_by TEXT,
      FOREIGN KEY (priv_id) REFERENCES hotesse_privatisations(id) ON DELETE CASCADE
    );
  `).run();
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const { searchParams } = url;
  
  // Extraire privId du path: /api/hotesse/privatisations/PRIVID/document
  const privId = pathParts[4];
  const docId = searchParams.get('doc_id');

  if (!privId || !docId) {
    return new Response(JSON.stringify({ error: 'priv_id and doc_id are required' }), {
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
      const document = await db.prepare(
        `SELECT id, file_name, file_data, mime_type 
         FROM hotesse_privatisations_documents 
         WHERE id = ? AND priv_id = ?`
      ).bind(docId, privId).first();

      if (!document) {
        return new Response(JSON.stringify({ error: 'Document not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Return the document with file_data for client-side download
      return new Response(JSON.stringify({
        id: document.id,
        file_name: document.file_name,
        file_data: document.file_data,
        mime_type: document.mime_type
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching document:', error);
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
