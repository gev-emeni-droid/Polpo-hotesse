import { ensureHotesseSchema } from './schema.js';

export const onRequestPost = async ({ env, request }) => {
  try {
    // Ensure schema is created first
    await ensureHotesseSchema(env.DB);

    const action = new URL(request.url).searchParams.get('action') || 'full';

    // Step 1: Cleanup orphaned data
    console.log('🧹 Step 1: Removing orphaned privatisations...');
    await env.DB.prepare(`
      DELETE FROM hotesse_privatisations 
      WHERE calendar_id IS NULL 
      OR calendar_id NOT IN (SELECT id FROM hotesse_calendars)
    `).run();

    // Step 2: Cleanup orphaned privatisations_hostesses
    console.log('🧹 Step 2: Removing orphaned hostess assignments...');
    await env.DB.prepare(`
      DELETE FROM hotesse_privatisations_hostesses 
      WHERE priv_id NOT IN (SELECT id FROM hotesse_privatisations)
    `).run();

    // Step 3: Cleanup orphaned client_info
    console.log('🧹 Step 3: Removing orphaned client info...');
    await env.DB.prepare(`
      DELETE FROM hotesse_privatisations_client_info 
      WHERE priv_id NOT IN (SELECT id FROM hotesse_privatisations)
    `).run();

    // Step 4: Cleanup orphaned documents
    console.log('🧹 Step 4: Removing orphaned documents...');
    await env.DB.prepare(`
      DELETE FROM hotesse_privatisations_documents 
      WHERE priv_id NOT IN (SELECT id FROM hotesse_privatisations)
    `).run();

    // Step 5: Drop old unused tables if requested
    let droppedTables = [];
    if (action === 'full') {
      console.log('🧹 Step 5: Removing legacy tables...');
      
      const oldTables = ['tables', 'table_params', 'rows'];
      for (const table of oldTables) {
        try {
          await env.DB.prepare(`DROP TABLE IF EXISTS ${table}`).run();
          droppedTables.push(table);
        } catch (e) {
          console.log(`Could not drop ${table}: ${e.message}`);
        }
      }
    }

    // Step 6: Get cleanup statistics
    console.log('📊 Getting cleanup statistics...');
    const stats = {
      calendars: (await env.DB.prepare('SELECT COUNT(*) as count FROM hotesse_calendars').first()).count,
      privatisations: (await env.DB.prepare('SELECT COUNT(*) as count FROM hotesse_privatisations').first()).count,
      hostess_options: (await env.DB.prepare('SELECT COUNT(*) as count FROM hotesse_hostess_options').first()).count,
      prise_par_options: (await env.DB.prepare('SELECT COUNT(*) as count FROM hotesse_prise_par_options').first()).count,
      notif_contacts: (await env.DB.prepare('SELECT COUNT(*) as count FROM hotesse_notif_contacts').first()).count,
      hostess_assignments: (await env.DB.prepare('SELECT COUNT(*) as count FROM hotesse_privatisations_hostesses').first()).count,
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'Database cleanup completed',
      droppedTables,
      stats,
    }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error('❌ Cleanup error:', e);
    return new Response(JSON.stringify({
      success: false,
      error: e.message,
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const onRequestGet = async ({ env }) => {
  try {
    await ensureHotesseSchema(env.DB);

    // Get database integrity report
    const calendars = await env.DB.prepare('SELECT COUNT(*) as count FROM hotesse_calendars').first();
    const privatisations = await env.DB.prepare('SELECT COUNT(*) as count FROM hotesse_privatisations').first();
    const orphaned = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM hotesse_privatisations 
      WHERE calendar_id NOT IN (SELECT id FROM hotesse_calendars)
    `).first();

    return new Response(JSON.stringify({
      database_integrity: {
        total_calendars: calendars.count,
        total_privatisations: privatisations.count,
        orphaned_privatisations: orphaned.count,
        status: orphaned.count === 0 ? 'HEALTHY ✓' : 'NEEDS CLEANUP ⚠'
      },
      instructions: [
        'GET  /api/hotesse/cleanup - View database integrity report',
        'POST /api/hotesse/cleanup?action=orphans - Clean orphaned data only',
        'POST /api/hotesse/cleanup?action=full - Full cleanup including legacy tables',
      ],
    }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error('❌ Report error:', e);
    return new Response(JSON.stringify({
      error: e.message,
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
