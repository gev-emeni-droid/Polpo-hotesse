import { ensureHotesseSchema } from '../schema.js';

export const onRequestGet = async ({ env }) => {
  await ensureHotesseSchema(env.DB);
  
  const privs = await env.DB.prepare(
    'SELECT * FROM hotesse_privatisations'
  ).all();
  
  const hostesses = await env.DB.prepare(
    'SELECT * FROM hotesse_privatisations_hostesses'
  ).all();
  
  return new Response(
    JSON.stringify({
      privatisations: privs.results || [],
      hostesses: hostesses.results || [],
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }
  );
};
