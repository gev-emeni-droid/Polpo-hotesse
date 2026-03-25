export const onRequestPost = async ({ env, params, request }) => {
  const { tableId } = params;

  const ensureSchema = async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS tables (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        archived_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rows (
        id TEXT PRIMARY KEY,
        table_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();
  };

  try {
    await ensureSchema(env.DB);

    const contentType = request.headers.get('content-type') || '';

    if (!env.AI) {
      return new Response(JSON.stringify({ error: 'Workers AI binding (env.AI) is not configured' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    let text; // réponse brute de l'IA (string)

    if (contentType.includes('application/json')) {
      // MODE TEXTE : { text: "..." }
      const body = await request.json().catch(() => null);
      const inputText = body && typeof body.text === 'string' ? body.text.trim() : '';
      if (!inputText) {
        return new Response(JSON.stringify({ error: 'Champ "text" requis pour le mode texte.' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        });
      }

      const textModel = env.ZENCHEF_TEXT_MODEL || '@cf/mistral/mistral-7b-instruct-v0.1';
      const prompt =
        'Tu reçois ci-dessous un texte brut représentant une liste de réservations Zenchef (noms, heures, statut, etc.). ' +
        'Analyse ce texte et retourne UNIQUEMENT un JSON valide, sans texte autour, au format:\n' +
        '[{ "nom": "...", "prenom": "...", "tel": "...", "heure": "HH:MM", "creation": "YYYY-MM-DD", "paiement": "YYYY-MM-DD" | "", "pax": nombre, "comment": "", "prepayee": true|false }]. ' +
        'Si tu n\'es pas sûr d\'une valeur, mets une chaîne vide ou 0. ' +
        'Pour chaque ligne où la garantie bancaire ou le statut indique "Prépayé", mets "prepayee": true et "paiement" = date de création de la réservation.\n\n' +
        'TEXTE ZENCHEF :\n' + inputText;

      const aiResponse = await env.AI.run(textModel, { prompt });

      if (typeof aiResponse === 'string') {
        text = aiResponse;
      } else if (aiResponse && typeof aiResponse.response === 'string') {
        text = aiResponse.response;
      } else {
        text = JSON.stringify(aiResponse);
      }
    } else if (contentType.includes('multipart/form-data')) {
      // MODE FICHIER IMAGE (PNG/JPEG)
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file) {
        return new Response(JSON.stringify({ error: 'file field is required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        });
      }

      const fileType = file.type || '';
      if (fileType === 'application/pdf') {
        return new Response(JSON.stringify({ error: 'Les PDF ne sont pas encore supportés par le modèle IA, utilisez une image (PNG/JPEG) du document Zenchef.' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        });
      }

      const model = env.ZENCHEF_IMPORT_MODEL;
      if (!model) {
        return new Response(JSON.stringify({ error: 'ZENCHEF_IMPORTED_MODEL env binding is not set' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        });
      }

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Convertir le fichier binaire en base64
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      // Construire une data URI, par ex. "data:image/jpeg;base64,..."
      const mime = fileType && fileType.startsWith('image/') ? fileType : 'image/png';
      const dataUri = `data:${mime};base64,${base64}`;

      const aiResponse = await env.AI.run(model, {
        image: dataUri,
        prompt:
          'Tu es un assistant qui extrait les réservations de restaurant à partir d\'un document (image Zenchef). ' +
          'Analyse le document et retourne UNIQUEMENT un JSON valide, sans texte autour, au format:\n' +
          '[{ "nom": "...", "prenom": "...", "tel": "...", "heure": "HH:MM", "creation": "YYYY-MM-DD", "paiement": "YYYY-MM-DD" | "", "pax": nombre, "comment": "", "prepayee": true|false }]. ' +
          'Si tu n\'es pas sûr d\'une valeur, mets une chaîne vide ou 0. ' +
          'Pour chaque ligne où la garantie bancaire ou le statut indique "Prépayé", mets "prepayee": true et "paiement" = date de création de la réservation.',
      });

      if (typeof aiResponse === 'string') {
        text = aiResponse;
      } else if (aiResponse && typeof aiResponse.response === 'string') {
        text = aiResponse.response;
      } else {
        text = JSON.stringify(aiResponse);
      }
    } else {
      return new Response(JSON.stringify({ error: 'Content-Type non supporté. Utilisez multipart/form-data (fichier) ou application/json (texte).' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    let reservationsRaw;
    try {
      reservationsRaw = JSON.parse(text);
    } catch {
      // Tenter d'extraire le JSON s'il y a du texte autour
      const match = text.match(/\[.*\]/s);
      if (!match) {
        return new Response(JSON.stringify({ error: 'AI response is not valid JSON', raw: text }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        });
      }
      reservationsRaw = JSON.parse(match[0]);
    }

    const reservations = Array.isArray(reservationsRaw)
      ? reservationsRaw.map((r) => ({
          nom: r.nom || '',
          prenom: r.prenom || '',
          tel: r.tel || '',
          heure: r.heure || '',
          creation: r.creation || '',
          paiement: r.prepayee && r.creation ? r.creation : (r.paiement || ''),
          pax: typeof r.pax === 'number' ? r.pax : Number(r.pax || 0) || 0,
          comment:
            r.prepayee
              ? (r.comment ? `${r.comment} | ` : '') + 'Prépayé Zenchef (total réglé)'
              : (r.comment || ''),
          // Ces champs seront complétés côté front pour correspondre au modèle de réservation.
          ad: undefined,
          enf: undefined,
          tarifad: r.tarifad || 0,
          tarifenf: r.tarifenf || 0,
          cb: r.cb || 0,
          amex: r.amex || 0,
          espece: r.espece || 0,
          cheque: r.cheque || 0,
          zen: r.zen || 0,
          virm: r.virm || 0,
          prisepar: r.prisepar || '',
          encaisserpar: r.encaisserpar || '',
        }))
      : [];

    return new Response(JSON.stringify({ reservations }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
