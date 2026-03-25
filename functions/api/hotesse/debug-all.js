import { ensureHotesseSchema } from './schema.js';

export const onRequestGet = async ({ env }) => {
  await ensureHotesseSchema(env.DB);
  
  const calendars = await env.DB.prepare(
    'SELECT * FROM hotesse_calendars'
  ).all();
  
  const privs = await env.DB.prepare(
    'SELECT * FROM hotesse_privatisations'
  ).all();
  
  return new Response(
    JSON.stringify({
      calendars: calendars.results || [],
      privatisations: privs.results || [],
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }
  );
};
