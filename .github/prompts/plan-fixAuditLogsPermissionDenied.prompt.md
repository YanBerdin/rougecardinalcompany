# Plan : Fix `ERR_AUDIT_001` — permission denied for function

**Cause racine : double problème.**

---

## Diagnostic

### Problème 1 — `createAdminClient()` utilise le mauvais client SSR

`supabase/admin.ts` utilise `createServerClient` de `@supabase/ssr`. Quand un admin est connecté, ce client lit les cookies de session et envoie `Authorization: Bearer <user_jwt>` à PostgREST. PostgREST détermine le rôle = `authenticated`, pas `service_role`.

- ✅ Les appels `auth.admin.*` (GoTrue) fonctionnent — GoTrue vérifie l'header `apikey`
- ❌ Les appels `.rpc()` (PostgREST) échouent — PostgREST utilise le Bearer JWT = `authenticated`

### Problème 2 — Assomption fausse dans la migration `20260502140000`

Le commentaire affirmait *"service_role bypasses all PostgreSQL grants"*. C'est faux : `service_role` n'est pas superuser dans Supabase. Après `REVOKE FROM PUBLIC`, même `service_role` a besoin d'un `GRANT EXECUTE` explicite.

---

## Étapes

### Phase 1 — Hotfix migration *(débloque la prod immédiatement)*

1. Créer `supabase/migrations/20260517XXXXXX_grant_audit_logs_to_service_role.sql` avec :

   ```sql
   GRANT EXECUTE ON FUNCTION public.get_audit_logs_with_email(text, text, uuid, timestamptz, timestamptz, text, integer, integer) TO service_role;
   ```

### Phase 2 — Fix `createAdminClient()` *(corrige la cause racine)*

2. Réécrire `supabase/admin.ts` pour utiliser `createClient` de `@supabase/supabase-js` (non-SSR) sans gestion de cookies — ajouter `auth: { autoRefreshToken: false, persistSession: false }`. Garder la fonction `async` pour compatibilité.

### Phase 3 — Schéma déclaratif + commentaire

3. Mettre à jour `supabase/schemas/42_rpc_audit_logs.sql` : ajouter le `GRANT ... TO service_role` en fin de fichier + corriger le commentaire Security Model.

---

## Fichiers concernés

- `supabase/migrations/20260517XXXXXX_grant_audit_logs_to_service_role.sql` *(nouveau)*
- `supabase/admin.ts` *(rewrite sans SSR cookies)*
- `supabase/schemas/42_rpc_audit_logs.sql` *(GRANT + commentaire)*

## Vérification

1. `/admin/audit-logs` → plus d'erreur `ERR_AUDIT_001`
2. `/admin/users` fonctionne toujours (même `createAdminClient`, appels `auth.admin.*`)
3. `pnpm build` sans erreur TypeScript

### Phase 4 — Tests automatisés *(optionnel mais recommandé)*

Mettre à jour les tests d'intégration pour vérifier que les appels `.rpc()` fonctionnent avec `service_role` et que les appels `auth.admin.*` fonctionnent toujours :
- `scripts/test-audit-logs-cloud.ts`
- `scripts/test-audit-logs-schema.ts`
- `scripts/test-audit-logs.ts`

Mettre à jour supabase/schemas/README.md et supabase/migrations/migrations.md pour documenter le fix.

Mettre à jour memory-bank avec les détails de ce problème et de la solution pour référence future. 