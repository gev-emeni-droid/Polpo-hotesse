export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, subject, message } = await context.request.json();

    if (!email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing email, subject, or message' }),
        { status: 400 }
      );
    }

    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    const SENDER_EMAIL = 'notifications@l-iamani.com';

    // Récupérer l'adresse mail du client depuis la DB si elle existe
    const settingsRes = await context.env.DB.prepare('SELECT sender_email FROM hotesse_settings WHERE id = ?').bind('global').first();
    const senderEmail = settingsRes?.sender_email || SENDER_EMAIL;

    // Appel API Resend pour envoyer l'email
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: senderEmail,
        to: email,
        subject: subject,
        html: message,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.json();
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to send email' }),
        { status: 500 }
      );
    }

    const result = await emailResponse.json();
    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
