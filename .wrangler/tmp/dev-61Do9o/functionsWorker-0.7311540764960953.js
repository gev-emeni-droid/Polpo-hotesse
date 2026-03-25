var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-HeITZ3/functionsWorker-0.7311540764960953.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var onRequestPost = /* @__PURE__ */ __name2(async ({ env, params }) => {
  const id = params.id;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare("UPDATE tables SET archived_at = ?, updated_at = ? WHERE id = ?").bind(now, now, id).run();
  return new Response(null, { status: 204 });
}, "onRequestPost");
var onRequestPost2 = /* @__PURE__ */ __name2(async ({ env, params, request }) => {
  const tableId = params.id;
  const body = await request.json();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO rows (id, table_id, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").bind(id, tableId, JSON.stringify(body.data || {}), now, now).run();
  return new Response(JSON.stringify({ id }), { headers: { "content-type": "application/json" }, status: 201 });
}, "onRequestPost");
var onRequestPost3 = /* @__PURE__ */ __name2(async ({ env, params }) => {
  const id = params.id;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare("UPDATE tables SET archived_at = NULL, updated_at = ? WHERE id = ?").bind(now, id).run();
  return new Response(null, { status: 204 });
}, "onRequestPost");
var onRequestGet = /* @__PURE__ */ __name2(async ({ env, params }) => {
  const { tableId } = params;
  const ensureSchema3 = /* @__PURE__ */ __name2(async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rows (
        id TEXT PRIMARY KEY,
        table_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();
  }, "ensureSchema");
  try {
    await ensureSchema3(env.DB);
    const mapping = [
      { nom: "BALLARIN", prenom: "Didier", tel: "+33 6 63 35 67 87" },
      { nom: "FACI", prenom: "Laure", tel: "+33 6 95 16 53 53" },
      { nom: "RADU", prenom: "Irina", tel: "+33 6 62 21 38 35" },
      { nom: "HOSNI", prenom: "Karim", tel: "661752539" },
      { nom: "PIROU", prenom: "Martine", tel: "+33 6 86 88 67 60" }
    ];
    let updated = 0;
    for (const u of mapping) {
      const { results } = await env.DB.prepare(
        `SELECT id, data_json FROM rows WHERE table_id = ? AND json_extract(data_json, '$.nom') = ? AND json_extract(data_json, '$.prenom') = ?`
      ).bind(tableId, u.nom, u.prenom).all();
      for (const r of results || []) {
        const data = JSON.parse(r.data_json || "{}");
        data.tel = u.tel;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await env.DB.prepare("UPDATE rows SET data_json = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(data), now, r.id).run();
        updated += 1;
      }
    }
    return new Response(JSON.stringify({ ok: true, updated }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}, "onRequestGet");
var onRequestPost4 = /* @__PURE__ */ __name2(async ({ env, request, params }) => {
  const { tableId } = params;
  const ensureSchema3 = /* @__PURE__ */ __name2(async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rows (
        id TEXT PRIMARY KEY,
        table_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();
  }, "ensureSchema");
  try {
    await ensureSchema3(env.DB);
    const body = await request.json().catch(() => ({}));
    const data = body && body.data ? body.data : {};
    const id = crypto.randomUUID();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare("INSERT INTO rows (id, table_id, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").bind(id, tableId, JSON.stringify(data), now, now).run();
    return new Response(JSON.stringify({ ok: true, id }), { headers: { "content-type": "application/json" }, status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "error" }), { headers: { "content-type": "application/json" }, status: 500 });
  }
}, "onRequestPost");
var onRequestGet2 = /* @__PURE__ */ __name2(async ({ env, params }) => {
  const { tableId } = params;
  const ensureSchema3 = /* @__PURE__ */ __name2(async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rows (
        id TEXT PRIMARY KEY,
        table_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();
  }, "ensureSchema");
  try {
    await ensureSchema3(env.DB);
    const rows = [
      { nom: "BALLARIN", prenom: "Didier", tel: "", heure: "21:30", creation: "2025-11-07", paiement: "2025-11-07", comment: "ras", ad: 2, enf: 0, tarifad: 98, tarifenf: 49, prisepar: "Zenchef", encaisserpar: "Zenchef", cb: 196, amex: 0, espece: 0, cheque: 0, zen: 0, virm: 0 },
      { nom: "FACI", prenom: "Laure", tel: "", heure: "19:30", creation: "2025-11-08", paiement: "2025-11-08", comment: "", ad: 2, enf: 0, tarifad: 98, tarifenf: 49, prisepar: "Zenchef", encaisserpar: "Zenchef", cb: 196, amex: 0, espece: 0, cheque: 0, zen: 0, virm: 0 },
      { nom: "RADU", prenom: "Irina", tel: "", heure: "21:00", creation: "2025-11-07", paiement: "2025-11-07", comment: "ras", ad: 8, enf: 0, tarifad: 98, tarifenf: 49, prisepar: "Zenchef", encaisserpar: "Zenchef", cb: 784, amex: 0, espece: 0, cheque: 0, zen: 0, virm: 0 },
      { nom: "HOSNI", prenom: "Karim", tel: "", heure: "21:00", creation: "2025-11-12", paiement: "2025-11-12", comment: "", ad: 2, enf: 0, tarifad: 98, tarifenf: 49, prisepar: "Zenchef", encaisserpar: "Zenchef", cb: 196, amex: 0, espece: 0, cheque: 0, zen: 0, virm: 0 },
      { nom: "PIROU", prenom: "Martine", tel: "", heure: "19:00", creation: "2025-11-12", paiement: "2025-11-12", comment: "Cliente r\xE9guli\xE8re", ad: 6, enf: 0, tarifad: 98, tarifenf: 49, prisepar: "Manager", encaisserpar: "Zenchef", cb: 588, amex: 0, espece: 0, cheque: 0, zen: 0, virm: 0 }
    ];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const r of rows) {
      const id = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO rows (id, table_id, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").bind(id, tableId, JSON.stringify(r), now, now).run();
    }
    return new Response(JSON.stringify({ ok: true, inserted: rows.length }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}, "onRequestGet");
var onRequestPost5 = /* @__PURE__ */ __name2(async ({ env, params, request }) => {
  const { tableId } = params;
  const ensureSchema3 = /* @__PURE__ */ __name2(async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rows (
        id TEXT PRIMARY KEY,
        table_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `).run();
  }, "ensureSchema");
  try {
    await ensureSchema3(env.DB);
    const body = await request.json().catch(() => ({}));
    const updates = Array.isArray(body.updates) ? body.updates : [];
    let updated = 0;
    for (const u of updates) {
      if (!u || !u.nom || !u.prenom) continue;
      const { results } = await env.DB.prepare(
        `SELECT id, data_json FROM rows WHERE table_id = ? AND json_extract(data_json, '$.nom') = ? AND json_extract(data_json, '$.prenom') = ?`
      ).bind(tableId, u.nom, u.prenom).all();
      for (const r of results || []) {
        const data = JSON.parse(r.data_json || "{}");
        data.tel = u.tel || "";
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await env.DB.prepare("UPDATE rows SET data_json = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(data), now, r.id).run();
        updated += 1;
      }
    }
    return new Response(JSON.stringify({ ok: true, updated }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}, "onRequestPost");
var onRequest = /* @__PURE__ */ __name2(async (ctx) => {
  const { request, env, params } = ctx;
  const { tableId } = params;
  const ensureSchema3 = /* @__PURE__ */ __name2(async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS table_params (
        table_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value_json TEXT NOT NULL,
        PRIMARY KEY (table_id, key)
      );
    `).run();
  }, "ensureSchema");
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  try {
    await ensureSchema3(env.DB);
    if (method === "GET") {
      const { results } = await env.DB.prepare("SELECT key, value_json FROM table_params WHERE table_id = ?").bind(tableId).all();
      const obj = {};
      for (const r of results || []) {
        try {
          obj[r.key] = JSON.parse(r.value_json);
        } catch {
          obj[r.key] = r.value_json;
        }
      }
      return new Response(JSON.stringify({ ok: true, params: obj }), { headers: { "content-type": "application/json" } });
    }
    if (method === "PUT" || method === "POST") {
      const body = await request.json().catch(() => ({}));
      const paramsObj = body && body.params && typeof body.params === "object" ? body.params : {};
      const tx = await env.DB.prepare("BEGIN").run();
      try {
        for (const [k, v] of Object.entries(paramsObj)) {
          await env.DB.prepare("INSERT OR REPLACE INTO table_params (table_id, key, value_json) VALUES (?, ?, ?)").bind(tableId, k, JSON.stringify(v)).run();
        }
        await env.DB.prepare("COMMIT").run();
      } catch (e) {
        await env.DB.prepare("ROLLBACK").run();
        return new Response(JSON.stringify({ ok: false, error: e.message || "db_error" }), { status: 500, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), { status: 405, headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}, "onRequest");
var onRequest2 = /* @__PURE__ */ __name2(async ({ env, request, params }) => {
  const { tableId } = params;
  const ensureSchema3 = /* @__PURE__ */ __name2(async (db) => {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        table_id TEXT PRIMARY KEY,
        prise_par_json TEXT NOT NULL DEFAULT '[]',
        encaisser_par_json TEXT NOT NULL DEFAULT '[]',
        updated_at TEXT NOT NULL
      );
    `).run();
  }, "ensureSchema");
  try {
    await ensureSchema3(env.DB);
    const method = request.method.toUpperCase();
    if (method === "GET") {
      const row = await env.DB.prepare(
        "SELECT prise_par_json, encaisser_par_json, updated_at FROM settings WHERE table_id = ?"
      ).bind(tableId).first();
      const prise_par = row ? JSON.parse(row.prise_par_json || "[]") : [];
      const encaisser_par = row ? JSON.parse(row.encaisser_par_json || "[]") : [];
      return new Response(
        JSON.stringify({ ok: true, settings: { prise_par, encaisser_par, updated_at: row?.updated_at || null } }),
        { headers: { "content-type": "application/json", "cache-control": "no-store" } }
      );
    }
    if (method === "PUT" || method === "POST") {
      const body = await request.json().catch(() => ({}));
      const prise_par = Array.isArray(body.prise_par) ? body.prise_par : [];
      const encaisser_par = Array.isArray(body.encaisser_par) ? body.encaisser_par : [];
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await env.DB.prepare(
        `INSERT INTO settings (table_id, prise_par_json, encaisser_par_json, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(table_id) DO UPDATE SET
           prise_par_json = excluded.prise_par_json,
           encaisser_par_json = excluded.encaisser_par_json,
           updated_at = excluded.updated_at`
      ).bind(tableId, JSON.stringify(prise_par), JSON.stringify(encaisser_par), now).run();
      return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), { status: 405, headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}, "onRequest");
var ensureSchema = /* @__PURE__ */ __name2(async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS rows (
      id TEXT PRIMARY KEY,
      table_id TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `).run();
}, "ensureSchema");
var onRequestPatch = /* @__PURE__ */ __name2(async ({ env, params, request }) => {
  try {
    await ensureSchema(env.DB);
    const rowId = params.rowId;
    const body = await request.json().catch(() => ({}));
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare("UPDATE rows SET data_json = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(body.data || {}), now, rowId).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "error" }), { status: 500, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  }
}, "onRequestPatch");
var onRequestDelete = /* @__PURE__ */ __name2(async ({ env, params }) => {
  try {
    await ensureSchema(env.DB);
    const rowId = params.rowId;
    await env.DB.prepare("DELETE FROM rows WHERE id = ? OR json_extract(data_json, '$.id') = ?").bind(rowId, rowId).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "error" }), { status: 500, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  }
}, "onRequestDelete");
var onRequestGet3 = /* @__PURE__ */ __name2(async ({ env, params }) => {
  const id = params.id;
  const table = await env.DB.prepare("SELECT id, name, archived_at, created_at, updated_at FROM tables WHERE id = ?").bind(id).first();
  if (!table) return new Response(null, { status: 404 });
  const paramsRows = await env.DB.prepare("SELECT key, value_json FROM table_params WHERE table_id = ?").bind(id).all();
  const rows = await env.DB.prepare("SELECT id, data_json, created_at, updated_at FROM rows WHERE table_id = ? ORDER BY created_at ASC").bind(id).all();
  const paramsObj = Object.fromEntries((paramsRows.results || []).map((r) => [r.key, JSON.parse(r.value_json)]));
  const dataRows = (rows.results || []).map((r) => ({ id: r.id, ...JSON.parse(r.data_json) }));
  return new Response(JSON.stringify({ ...table, params: paramsObj, rows: dataRows }), { headers: { "content-type": "application/json" } });
}, "onRequestGet");
var onRequestPatch2 = /* @__PURE__ */ __name2(async ({ env, params, request }) => {
  const id = params.id;
  const body = await request.json();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name) await env.DB.prepare("UPDATE tables SET name = ?, updated_at = ? WHERE id = ?").bind(name, now, id).run();
  }
  if (body.params && typeof body.params === "object") {
    for (const [k, v] of Object.entries(body.params)) {
      await env.DB.prepare("INSERT INTO table_params (table_id, key, value_json) VALUES (?, ?, ?) ON CONFLICT(table_id, key) DO UPDATE SET value_json = excluded.value_json").bind(id, k, JSON.stringify(v)).run();
    }
  }
  return new Response(null, { status: 204 });
}, "onRequestPatch");
var onRequestDelete2 = /* @__PURE__ */ __name2(async ({ env, params }) => {
  const id = params.id;
  await env.DB.prepare("DELETE FROM tables WHERE id = ?").bind(id).run();
  return new Response(null, { status: 204 });
}, "onRequestDelete");
var onRequestGet4 = /* @__PURE__ */ __name2(async ({ env, params }) => {
  const { tableId } = params;
  const ensureSchema3 = /* @__PURE__ */ __name2(async (db) => {
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
  }, "ensureSchema");
  try {
    await ensureSchema3(env.DB);
    const table = await env.DB.prepare("SELECT id, name, archived_at, created_at, updated_at FROM tables WHERE id = ?").bind(tableId).first();
    if (!table) {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    const { results } = await env.DB.prepare("SELECT id, data_json FROM rows WHERE table_id = ? ORDER BY created_at ASC").bind(tableId).all();
    const rows = (results || []).map((r) => ({ ...JSON.parse(r.data_json || "{}"), id: r.id }));
    return new Response(JSON.stringify({ table, rows }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "error" }), { status: 500, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  }
}, "onRequestGet");
var ensureSchema2 = /* @__PURE__ */ __name2(async (db) => {
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
    CREATE TABLE IF NOT EXISTS table_params (
      table_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value_json TEXT NOT NULL,
      PRIMARY KEY (table_id, key)
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
}, "ensureSchema");
var onRequestGet5 = /* @__PURE__ */ __name2(async ({ env, request }) => {
  await ensureSchema2(env.DB);
  const url = new URL(request.url);
  const archived = url.searchParams.get("archived");
  const where = archived === "true" ? "archived_at IS NOT NULL" : archived === "false" ? "archived_at IS NULL" : "1=1";
  const stmt = env.DB.prepare(`SELECT id, name, archived_at, created_at, updated_at FROM tables WHERE ${where} ORDER BY created_at DESC`);
  const { results } = await stmt.all();
  return new Response(JSON.stringify(results), { headers: { "content-type": "application/json" } });
}, "onRequestGet");
var onRequestPost6 = /* @__PURE__ */ __name2(async ({ env, request }) => {
  await ensureSchema2(env.DB);
  const body = await request.json();
  const id = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const name = (body.name || "").trim();
  if (!name) return new Response(JSON.stringify({ error: "name required" }), { status: 400 });
  await env.DB.prepare("INSERT INTO tables (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)").bind(id, name, now, now).run();
  if (body.params && typeof body.params === "object") {
    for (const [k, v] of Object.entries(body.params)) {
      await env.DB.prepare("INSERT INTO table_params (table_id, key, value_json) VALUES (?, ?, ?)").bind(id, k, JSON.stringify(v)).run();
    }
  }
  if (Array.isArray(body.rows)) {
    for (const r of body.rows) {
      const rid = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO rows (id, table_id, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").bind(rid, id, JSON.stringify(r), now, now).run();
    }
  }
  return new Response(JSON.stringify({ id }), { headers: { "content-type": "application/json" }, status: 201 });
}, "onRequestPost");
var routes = [
  {
    routePath: "/api/tables/:id/archive",
    mountPath: "/api/tables/:id",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/tables/:id/rows",
    mountPath: "/api/tables/:id",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/tables/:id/unarchive",
    mountPath: "/api/tables/:id",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/tables/:tableId/apply-phones",
    mountPath: "/api/tables/:tableId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/tables/:tableId/rows",
    mountPath: "/api/tables/:tableId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/tables/:tableId/seed-nouvel-an",
    mountPath: "/api/tables/:tableId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/tables/:tableId/update-phones",
    mountPath: "/api/tables/:tableId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/tables/:tableId/params",
    mountPath: "/api/tables/:tableId",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/tables/:tableId/settings",
    mountPath: "/api/tables/:tableId",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/rows/:rowId",
    mountPath: "/api/rows",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/rows/:rowId",
    mountPath: "/api/rows",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch]
  },
  {
    routePath: "/api/tables/:id",
    mountPath: "/api/tables",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/tables/:id",
    mountPath: "/api/tables",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/tables/:id",
    mountPath: "/api/tables",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch2]
  },
  {
    routePath: "/api/tables/:tableId",
    mountPath: "/api/tables/:tableId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/tables",
    mountPath: "/api/tables",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/tables",
    mountPath: "/api/tables",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-tgePrL/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-tgePrL/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.7311540764960953.js.map
