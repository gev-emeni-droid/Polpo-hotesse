import { onRequestPost as __api_tables__id__archive_js_onRequestPost } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[id]\\archive.js"
import { onRequestPost as __api_tables__id__rows_js_onRequestPost } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[id]\\rows.js"
import { onRequestPost as __api_tables__id__unarchive_js_onRequestPost } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[id]\\unarchive.js"
import { onRequestGet as __api_tables__tableId__apply_phones_js_onRequestGet } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[tableId]\\apply-phones.js"
import { onRequestPost as __api_tables__tableId__rows_js_onRequestPost } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[tableId]\\rows.js"
import { onRequestGet as __api_tables__tableId__seed_nouvel_an_js_onRequestGet } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[tableId]\\seed-nouvel-an.js"
import { onRequestPost as __api_tables__tableId__update_phones_js_onRequestPost } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[tableId]\\update-phones.js"
import { onRequest as __api_tables__tableId__params_js_onRequest } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[tableId]\\params.js"
import { onRequest as __api_tables__tableId__settings_js_onRequest } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[tableId]\\settings.js"
import { onRequestDelete as __api_rows__rowId__js_onRequestDelete } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\rows\\[rowId].js"
import { onRequestPatch as __api_rows__rowId__js_onRequestPatch } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\rows\\[rowId].js"
import { onRequestDelete as __api_tables__id__js_onRequestDelete } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[id].js"
import { onRequestGet as __api_tables__id__js_onRequestGet } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[id].js"
import { onRequestPatch as __api_tables__id__js_onRequestPatch } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[id].js"
import { onRequestGet as __api_tables__tableId__index_js_onRequestGet } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\[tableId]\\index.js"
import { onRequestGet as __api_tables_index_js_onRequestGet } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\index.js"
import { onRequestPost as __api_tables_index_js_onRequestPost } from "C:\\Users\\heslo\\CascadeProjects\\splitwise\\suivi-des-reservations-polpo-cloudflare\\functions\\api\\tables\\index.js"

export const routes = [
    {
      routePath: "/api/tables/:id/archive",
      mountPath: "/api/tables/:id",
      method: "POST",
      middlewares: [],
      modules: [__api_tables__id__archive_js_onRequestPost],
    },
  {
      routePath: "/api/tables/:id/rows",
      mountPath: "/api/tables/:id",
      method: "POST",
      middlewares: [],
      modules: [__api_tables__id__rows_js_onRequestPost],
    },
  {
      routePath: "/api/tables/:id/unarchive",
      mountPath: "/api/tables/:id",
      method: "POST",
      middlewares: [],
      modules: [__api_tables__id__unarchive_js_onRequestPost],
    },
  {
      routePath: "/api/tables/:tableId/apply-phones",
      mountPath: "/api/tables/:tableId",
      method: "GET",
      middlewares: [],
      modules: [__api_tables__tableId__apply_phones_js_onRequestGet],
    },
  {
      routePath: "/api/tables/:tableId/rows",
      mountPath: "/api/tables/:tableId",
      method: "POST",
      middlewares: [],
      modules: [__api_tables__tableId__rows_js_onRequestPost],
    },
  {
      routePath: "/api/tables/:tableId/seed-nouvel-an",
      mountPath: "/api/tables/:tableId",
      method: "GET",
      middlewares: [],
      modules: [__api_tables__tableId__seed_nouvel_an_js_onRequestGet],
    },
  {
      routePath: "/api/tables/:tableId/update-phones",
      mountPath: "/api/tables/:tableId",
      method: "POST",
      middlewares: [],
      modules: [__api_tables__tableId__update_phones_js_onRequestPost],
    },
  {
      routePath: "/api/tables/:tableId/params",
      mountPath: "/api/tables/:tableId",
      method: "",
      middlewares: [],
      modules: [__api_tables__tableId__params_js_onRequest],
    },
  {
      routePath: "/api/tables/:tableId/settings",
      mountPath: "/api/tables/:tableId",
      method: "",
      middlewares: [],
      modules: [__api_tables__tableId__settings_js_onRequest],
    },
  {
      routePath: "/api/rows/:rowId",
      mountPath: "/api/rows",
      method: "DELETE",
      middlewares: [],
      modules: [__api_rows__rowId__js_onRequestDelete],
    },
  {
      routePath: "/api/rows/:rowId",
      mountPath: "/api/rows",
      method: "PATCH",
      middlewares: [],
      modules: [__api_rows__rowId__js_onRequestPatch],
    },
  {
      routePath: "/api/tables/:id",
      mountPath: "/api/tables",
      method: "DELETE",
      middlewares: [],
      modules: [__api_tables__id__js_onRequestDelete],
    },
  {
      routePath: "/api/tables/:id",
      mountPath: "/api/tables",
      method: "GET",
      middlewares: [],
      modules: [__api_tables__id__js_onRequestGet],
    },
  {
      routePath: "/api/tables/:id",
      mountPath: "/api/tables",
      method: "PATCH",
      middlewares: [],
      modules: [__api_tables__id__js_onRequestPatch],
    },
  {
      routePath: "/api/tables/:tableId",
      mountPath: "/api/tables/:tableId",
      method: "GET",
      middlewares: [],
      modules: [__api_tables__tableId__index_js_onRequestGet],
    },
  {
      routePath: "/api/tables",
      mountPath: "/api/tables",
      method: "GET",
      middlewares: [],
      modules: [__api_tables_index_js_onRequestGet],
    },
  {
      routePath: "/api/tables",
      mountPath: "/api/tables",
      method: "POST",
      middlewares: [],
      modules: [__api_tables_index_js_onRequestPost],
    },
  ]