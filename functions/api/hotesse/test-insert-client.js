import { ensureHotesseSchema } from './schema.js';

export async function onRequest(context) {
  const { env } = context;
  const db = env.DB;

  try {
    await ensureHotesseSchema(db);

    console.error('=== TEST INSERT START ===');

    // Try to insert a test client directly
    const testId = `client_test_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    console.error('About to INSERT test client:', testId);

    const result = await db.prepare(
      `INSERT INTO hotesse_clients 
       (id, prenom, nom, telephone, mail, adresse_postale, entreprise, type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(testId, 'Toto', 'TEST', '0123456789', 'test@test.com', '123 rue test', 'TestCorp', 'client', now, now).run();

    console.error('INSERT result:', result);

    // Now verify it was inserted
    const verify = await db.prepare(
      `SELECT * FROM hotesse_clients WHERE id = ?`
    ).bind(testId).first();

    console.error('Verification SELECT:', verify);

    return new Response(JSON.stringify({
      ok: true,
      message: 'Test insert completed',
      inserted: {
        id: testId,
        prenom: 'Toto',
        nom: 'TEST',
        type: 'client',
        created_at: now
      },
      verificationResult: verify,
      insertResult: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Test INSERT error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message,
      stack: error.stack,
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
