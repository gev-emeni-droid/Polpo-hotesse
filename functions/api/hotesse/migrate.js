import { ensureHotesseSchema } from './schema.js';

/**
 * Endpoint to bulk import data from old D1 to new D1
 * POST /api/hotesse/migrate with JSON body containing table data
 */
export const onRequestPost = async ({ env, request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    
    if (!body.tables || !Array.isArray(body.tables)) {
      return new Response(JSON.stringify({
        error: 'Invalid format. Expected: { tables: [{ name, rows }, ...] }'
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Ensure schema exists first
    await ensureHotesseSchema(env.DB);

    const results = {};
    let totalInserted = 0;

    // Process each table
    for (const table of body.tables) {
      if (!table.name || !Array.isArray(table.rows)) {
        results[table.name] = { error: 'Invalid table format' };
        continue;
      }

      const tableName = table.name;
      const rows = table.rows;

      if (rows.length === 0) {
        results[tableName] = { inserted: 0 };
        continue;
      }

      try {
        // Get column names from first row
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const columnList = columns.join(', ');

        // Skip certain problematic tables
        if (['sqlite_sequence', 'settings'].includes(tableName)) {
          results[tableName] = { skipped: true, reason: 'Legacy table' };
          continue;
        }

        // Insert rows
        let insertedCount = 0;
        for (const row of rows) {
          const values = columns.map(col => row[col] ?? null);
          try {
            await env.DB.prepare(
              `INSERT OR REPLACE INTO ${tableName} (${columnList}) VALUES (${placeholders})`
            ).bind(...values).run();
            insertedCount++;
          } catch (e) {
            console.error(`Error inserting row into ${tableName}:`, e.message);
            // Continue with next row
          }
        }

        results[tableName] = { inserted: insertedCount, total: rows.length };
        totalInserted += insertedCount;
      } catch (e) {
        results[tableName] = { error: e.message };
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Migration completed',
      totalInserted,
      results
    }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    console.error('❌ Migration error:', e);
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};

export const onRequestGet = async ({ env }) => {
  return new Response(JSON.stringify({
    instructions: [
      'POST /api/hotesse/migrate with JSON body:',
      '{',
      '  "tables": [',
      '    {',
      '      "name": "hotesse_calendars",',
      '      "rows": [ { id: "...", month: 4, ... }, ... ]',
      '    },',
      '    ...',
      '  ]',
      '}'
    ],
    note: 'Use wrangler d1 export to get the data from old D1, then POST it here'
  }), {
    headers: { 'content-type': 'application/json' }
  });
};
