import { ensureHotesseSchema } from './schema.js';

export const onRequestGet = async ({ env }) => {
  try {
    await ensureHotesseSchema(env.DB);
    
    // Get first active calendar's theme
    const cal = await env.DB.prepare(
      `SELECT hc.id FROM hotesse_calendars hc 
       WHERE hc.is_archived = 0 
       ORDER BY hc.created_at ASC LIMIT 1`
    ).first();
    
    if (cal) {
      const theme = await env.DB.prepare(
        'SELECT theme_id FROM hotesse_theme_settings WHERE calendar_id = ?'
      ).bind(cal.id).first();
      
      if (theme) {
        return new Response(
          JSON.stringify({ ok: true, theme_id: theme.theme_id }),
          {
            headers: {
              'content-type': 'application/json',
              'cache-control': 'no-store',
              'access-control-allow-origin': '*',
            },
          }
        );
      }
    }
    
    // Default to navy if no theme found
    return new Response(
      JSON.stringify({ ok: true, theme_id: 'navy' }),
      {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'access-control-allow-origin': '*',
        },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message || 'error', theme_id: 'navy' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
};
