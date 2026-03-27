import { ensureHotesseSchema } from './schema.js';

export async function onRequest(context) {
  const { env } = context;
  const db = env.DB;

  try {
    await ensureHotesseSchema(db);

    // Try to create a test entreprise client
    const now = new Date().toISOString();
    const testId = `client_test_${Date.now()}`;
    const testName = `TEST_ENTREPRISE_${Date.now()}`;

    await db.prepare(
      `INSERT INTO hotesse_clients 
       (id, nom, entreprise, type, created_at, updated_at)
       VALUES (?, ?, ?, 'entreprise', ?, ?)`
    ).bind(testId, testName, testName, now, now).run();

    // Now try to read it back
    const result = await db.prepare(
      `SELECT * FROM hotesse_clients WHERE id = ?`
    ).bind(testId).first();

    return new Response(JSON.stringify({
      ok: true,
      message: 'Test insert successful',
      inserted: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Test insert error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
