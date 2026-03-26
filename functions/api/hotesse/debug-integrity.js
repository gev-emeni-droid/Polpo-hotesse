import { ensureHotesseSchema } from './schema.js';

export const onRequestGet = async ({ env }) => {
  try {
    await ensureHotesseSchema(env.DB);

    // Get all calendars
    const calendars = await env.DB.prepare('SELECT id, month, year, title FROM hotesse_calendars').all();
    
    // Get all privatisations with their calendar info
    const privs = await env.DB.prepare(`
      SELECT 
        p.id,
        p.calendar_id,
        p.name,
        p.date,
        p.period,
        c.id as cal_exists,
        c.title as cal_title
      FROM hotesse_privatisations p
      LEFT JOIN hotesse_calendars c ON p.calendar_id = c.id
      ORDER BY p.date
    `).all();

    // Find April calendars
    const aprilCals = (calendars.results || []).filter(cal => cal.month === 4);

    // Find privatisations for April calendars
    const aprilPrivs = (privs.results || []).filter(p => {
      const aprilCal = aprilCals.find(cal => cal.id === p.calendar_id);
      return !!aprilCal;
    });

    // Check for orphaned privatisations
    const orphanedPrivs = (privs.results || []).filter(p => !p.cal_exists);

    return new Response(JSON.stringify({
      debug_report: {
        total_calendars: calendars.results.length,
        april_calendars: aprilCals.length,
        april_calendar_ids: aprilCals.map(c => ({ id: c.id, title: c.title })),
        total_privatisations: privs.results.length,
        april_privatisations_count: aprilPrivs.length,
        april_privatisations: aprilPrivs.slice(0, 10),
        orphaned_privatisations_count: orphanedPrivs.length,
        orphaned_privatisations_sample: orphanedPrivs.slice(0, 5),
        issue_diagnosis: aprilPrivs.length === 0 ? 'NO PRIVATISATIONS LINKED TO APRIL CALENDARS' : 'Privatisations found'
      }
    }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error('❌ Debug error:', e);
    return new Response(JSON.stringify({
      error: e.message,
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
