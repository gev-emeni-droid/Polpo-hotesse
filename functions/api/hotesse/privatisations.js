import { ensureHotesseSchema } from './schema.js';

export const onRequestPost = async ({ env, request }) => {
  try {
    await ensureHotesseSchema(env.DB);
    const body = await request.json().catch(() => ({}));

    const {
      id,
      calendar_id,
      name,
      people,
      date,
      start,
      end,
      period,
      color,
      prise_par,
      commentaire,
      hostesses,
    } = body;

    if (!calendar_id || !name || !date || !period || !color) {
      return new Response(JSON.stringify({ error: 'missing fields' }), {
        status: 400,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'access-control-allow-headers': 'content-type',
        },
      });
    }

    const privId = id && typeof id === 'string' ? id : `priv_${crypto.randomUUID()}`;

    await env.DB.prepare(
      `INSERT INTO hotesse_privatisations (id, calendar_id, name, people, date, start, end, period, color, prise_par, commentaire)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         calendar_id = excluded.calendar_id,
         name = excluded.name,
         people = excluded.people,
         date = excluded.date,
         start = excluded.start,
         end = excluded.end,
         period = excluded.period,
         color = excluded.color,
         prise_par = excluded.prise_par,
         commentaire = excluded.commentaire`
    )
      .bind(
        privId,
        calendar_id,
        name,
        people ?? null,
        date,
        start || null,
        end || null,
        period,
        color,
        prise_par || null,
        commentaire || null,
      )
      .run();

    // Synchroniser la table de jointure hôtesses
    await env.DB.prepare('DELETE FROM hotesse_privatisations_hostesses WHERE priv_id = ?')
      .bind(privId)
      .run();
    if (Array.isArray(hostesses)) {
      for (const h of hostesses) {
        const hostessName = String(h || '').trim();
        if (!hostessName) continue;
        await env.DB.prepare(
          'INSERT INTO hotesse_privatisations_hostesses (priv_id, hostess_name) VALUES (?, ?)'
        ).bind(privId, hostessName).run();
      }
    }

    // Automatically create client from privatisation name (without phone to avoid duplicates)
    if (name) {
      try {
        const now = new Date().toISOString();
        const clientId = `client_${crypto.randomUUID()}`;
        
        // Check if client with this nom exists (without requiring phone)
        const existingClient = await env.DB.prepare(
          'SELECT id FROM hotesse_clients WHERE nom = ?'
        ).bind(name).first();
        
        if (!existingClient) {
          // Insert new client
          await env.DB.prepare(
            `INSERT INTO hotesse_clients 
             (id, nom, entreprise, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`
          ).bind(clientId, name, name, now, now).run();
        }
      } catch (err) {
        console.error('Warning: Failed to create client from privatisation:', err);
      }
    }

    return new Response(JSON.stringify({ id: privId }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  } catch (e) {
    console.error('Error in privatisations POST:', e.message);
    return new Response(JSON.stringify({ error: e.message || 'error' }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }
};
