import { ensureHotesseSchema } from './schema.js';

/**
 * Debug endpoint to check calendar/privatisation associations
 */
export const onRequestGet = async ({ env, request }) => {
  try {
    await ensureHotesseSchema(env.DB);
    
    const calendarId = new URL(request.url).searchParams.get('calendar_id');

    if (calendarId) {
      // Check specific calendar
      const cal = await env.DB.prepare(
        'SELECT id, month, year, title FROM hotesse_calendars WHERE id = ?'
      ).bind(calendarId).first();

      const privs = await env.DB.prepare(
        'SELECT id, calendar_id, name, date FROM hotesse_privatisations WHERE calendar_id = ?'
      ).bind(calendarId).all();

      return new Response(JSON.stringify({
        calendar: cal,
        privatisations: privs.results,
        count: privs.results.length
      }), {
        headers: { 'content-type': 'application/json' }
      });
    }

    // Get all calendars with count
    const calendars = await env.DB.prepare(
      `SELECT c.id,
              c.month,
              c.year,
              c.title,
              c.created_at,
              COUNT(p.id) AS priv_count_calculated,
              COUNT(DISTINCT CASE WHEN p.calendar_id = c.id THEN p.id END) AS priv_count_distinct
       FROM hotesse_calendars c
       LEFT JOIN hotesse_privatisations p ON p.calendar_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    ).all();

    // Check for orphaned privatisations
    const orphaned = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM hotesse_privatisations 
       WHERE calendar_id NOT IN (SELECT id FROM hotesse_calendars)`
    ).first();

    // April calendar specifically
    const aprilCal = await env.DB.prepare(
      `SELECT c.id, c.month, c.year, c.title,
              COUNT(p.id) as count
       FROM hotesse_calendars c
       LEFT JOIN hotesse_privatisations p ON p.calendar_id = c.id
       WHERE c.month = 4 AND c.year = 2026
       GROUP BY c.id`
    ).first();

    return new Response(JSON.stringify({
      all_calendars: calendars.results,
      april_calendar: aprilCal,
      orphaned_privatisations: orphaned.count,
      note: 'Check if priv_count_calculated matches actual April privatisations'
    }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    console.error('❌ Debug error:', e);
    return new Response(JSON.stringify({
      error: e.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
