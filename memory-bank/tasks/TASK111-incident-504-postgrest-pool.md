# TASK111 - Incident 504 production : pool PostgREST bloqué

**Status:** Completed  
**Added:** 2026-11-04  
**Updated:** 2026-11-04

## Original Request

Debug du `504 FUNCTION_INVOCATION_TIMEOUT` sur toutes les pages publiques de https://compagnie-rouge-cardinal.fr/ (alerte Sentry Uptime `ROUGE-CARDINAL-TEST-12`), puis application d'un timeout côté client Supabase et documentation de l'incident.

## Thought Process

- Symptôme : toutes les pages `(marketing)` (`force-dynamic`) renvoient 504 après ~10 s ; `/auth/login`, `/robots.txt`, `/sitemap.xml` (sans requête DB) répondent 200.
- Pas de régression de code : aucun commit depuis le 26/10.
- Vercel : middleware 200 en 17 ms, fonction `/` bloquée 10,02 s sur 8 GET sortants vers Supabase.
- Logs PostgREST (prod `hjmwctzqljfszuwkaadd`) : `PGRST003 "Timed out acquiring connection from connection pool"` dès ~17:26 UTC. Après l'activation de `hypopg` / `index_advisor` depuis le dashboard (21:02, déclenche un reload du schema cache), passage en 503 + `PGRST002 "Could not query the database for the schema cache"` + boucle `Attempting to reconnect`.
- Postgres sain : 12/60 connexions, aucun échec d'auth dans `postgres_logs`, aucune tentative de connexion de PostgREST visible. Le process PostgREST 14.5 (connexion `LISTEN pgrst` datant du 28/08) était bloqué côté service.
- Augmenter `maxDuration` Vercel (10 s) est inutile : PostgREST ne répond jamais, cela ne ferait que rallonger l'attente et le coût.

## Résolution

1. **Infra** : `Restart project` dans le dashboard Supabase (redémarre PostgREST ; `Restart server` ne redémarre que Postgres). Site rétabli.
2. **Code** : `supabase/server.ts` injecte `global.fetch` avec `AbortSignal.timeout(5000)` sur les seules requêtes `/rest/v1/` (Storage et Auth exclus pour ne pas couper les uploads). postgrest-js convertit l'abort en `{ error }`, donc les DAL renvoient `dalError` et les pages rendent leurs fallbacks au lieu d'un 504.

## Runbook (si le 504 revient)

- `curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" https://compagnie-rouge-cardinal.fr/`
- Logs PostgREST : `select timestamp, event_message from logs where source = 'postgrest_logs' order by timestamp desc limit 20` (outil MCP `query_logs`). Chercher `PGRST003` / `PGRST002`.
- Si Postgres est sain (`pg_stat_activity`, `postgres_logs`) : `Restart project` ; si persistant, ticket support Supabase.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID  | Description                                        | Status   | Updated    | Notes                         |
| --- | -------------------------------------------------- | -------- | ---------- | ----------------------------- |
| 1.1 | Diagnostic (Vercel, logs PostgREST/Postgres)       | Complete | 2026-11-04 | PGRST003 puis PGRST002        |
| 1.2 | Redémarrage projet Supabase                        | Complete | 2026-11-04 | Fait par l'utilisateur        |
| 1.3 | Timeout fetch REST dans `supabase/server.ts`       | Complete | 2026-11-04 | 5 s, `/rest/v1/` uniquement   |

## Progress Log

### 2026-11-04

- Diagnostic complet, cause racine : pool PostgREST bloqué (incident infra Supabase).
- Site rétabli après `Restart project`.
- Ajout du timeout REST côté serveur pour dégrader proprement en cas de récidive.
