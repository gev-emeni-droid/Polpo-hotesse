export const ensureHotesseSchema = async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_calendars (
      id TEXT PRIMARY KEY,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_archived INTEGER NOT NULL DEFAULT 0
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_privatisations (
      id TEXT PRIMARY KEY,
      calendar_id TEXT NOT NULL,
      name TEXT NOT NULL,
      people INTEGER,
      date TEXT NOT NULL,
      start TEXT,
      end TEXT,
      period TEXT NOT NULL,
      color TEXT NOT NULL,
      prise_par TEXT,
      commentaire TEXT,
      FOREIGN KEY (calendar_id) REFERENCES hotesse_calendars(id)
    );
  `).run();

  // Ajout rétrocompatible de la colonne commentaire si la table existe déjà sans cette colonne
  try {
    await db.prepare('ALTER TABLE hotesse_privatisations ADD COLUMN commentaire TEXT').run();
  } catch (_) {
    // Ignore l'erreur si la colonne existe déjà
  }

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_hostess_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_prise_par_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_privatisations_hostesses (
      priv_id TEXT NOT NULL,
      hostess_name TEXT NOT NULL,
      PRIMARY KEY (priv_id, hostess_name),
      FOREIGN KEY (priv_id) REFERENCES hotesse_privatisations(id)
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_notif_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_settings (
      id TEXT PRIMARY KEY,
      notif_contacts_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hotesse_theme_settings (
      calendar_id TEXT PRIMARY KEY,
      theme_id TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `).run();
};
