# Rapport d'échecs RLS — Tests permissions locaux

**Date** : 2026-03-16  
**Script** : `scripts/test-permissions-rls.ts`  
**Environnement** : Supabase local (`localhost:54321`)  
**Résultat initial** : 29/34 passent — 5 échecs  
**Résultat final** : **34/34 passent — 0 échec** ✅  
**Tâche de correction** : TASK080 (Completed)

---

## Résolution — 2026-03-16

> **Tous les 5 échecs ont été résolus.** Aucune modification de policies RLS ou de schéma n'a été nécessaire — les 28 policies étaient correctes. Les problèmes étaient 100% dans le script de test.

| Échec | Cause racine | Fix appliqué |
| ------- | ------------- | ------------- |
| RLS-001 | DB locale non réinitialisée après TASK077/079 | `supabase db reset` |
| RLS-009 | `signInAs()` mutait `anonClient` (session admin) | `tempClient` séparé pour sign-in |
| RLS-010 | Idem RLS-009 | Idem |
| RLS-011 | Idem RLS-009 | Idem |
| RLS-019 | Payload `{ title }` → colonne inexistante sur `evenements` | `{ spectacle_id, date_debut }` |

---

## Résumé exécutif (état initial)

Le script `test-permissions-rls.ts` couvre les sections 4.1 (anon, 14 tests), 4.2 (user authenticated, 12 tests) et 4.5 (fonctions SQL, 8 tests) du plan de test `specs/tests-permissions-et-rôles.md`. Sur 34 cas, **5 échecs** avaient été identifiés initialement, tous liés à des bugs dans le script de test (pas dans les policies RLS).

---

## Échecs détaillés

### RLS-001 — Anon voit des spectacles non-publics ou en draft

| Champ | Valeur |
| ------- | -------- |
| **Sévérité** | Moyenne |
| **Section** | 4.1 — Anon lecture publique |
| **Table** | `spectacles` |
| **Opération** | SELECT |
| **Erreur** | `2 rows with non-public or draft status returned` |
| **Comportement attendu** | Seuls les spectacles `public = true AND status IN ('published', 'archived')` visibles |

**Politique déclarative** (`61_rls_main_tables.sql`) :

```sql
create policy "Anon can view public spectacles"
on public.spectacles for select to anon
using ( public = true and status in ('published', 'archived') );
```

**Analyse** : La politique déclarative est correcte. L'échec indique que la DB locale n'a pas les dernières migrations appliquées (anciennes policies combinées `to anon, authenticated` encore en place), ou que `supabase db reset` n'a pas été exécuté après les corrections TASK077/TASK079.

**Action** : Exécuter `supabase db reset` et relancer le test. Si l'échec persiste, vérifier via `SELECT * FROM pg_policies WHERE tablename = 'spectacles'` que la bonne politique est active.

---

### RLS-009 — Anon voit 7 clés non-publiques dans configurations_site

| Champ | Valeur |
| ------- | -------- |
| **Sévérité** | Haute |
| **Section** | 4.1 — Anon lecture publique |
| **Table** | `configurations_site` |
| **Opération** | SELECT |
| **Erreur** | `7 non-public keys returned: site:maintenance_mode, site:version, app:max_upload_size, app:allowed_file_types, app:session_timeout, analytics:google_analytics, analytics:matomo` |
| **Comportement attendu** | Seules les clés `public:%` ou `display_toggle_%` visibles |

**Politique déclarative** (`10_tables_system.sql`) :

```sql
create policy "Anon can view public site configurations"
on public.configurations_site for select to anon
using ( key like 'public:%' or key like 'display_toggle_%' );
```

**Analyse** : La politique est correcte dans le schéma déclaratif. L'échec suggère que l'ancienne politique combinée (hotfix `20260304010000`) avec `is_admin()` n'a pas été correctement remplacée par la migration batch 2 (`20260315000238`). Sur la DB locale, la vieille politique permissive peut coexister avec la nouvelle.

**Action** : `supabase db reset` pour repartir d'un schéma propre. Vérifier que seule la politique séparée est active.

---

### RLS-010 — Anon peut INSERT dans spectacles, membres_equipe, partners

| Champ | Valeur |
| ------- | -------- |
| **Sévérité** | **Critique** |
| **Section** | 4.1 — Anon écriture bloquée |
| **Table** | `spectacles`, `membres_equipe`, `partners` |
| **Opération** | INSERT |
| **Erreur** | `SECURITY: spectacles INSERT allowed, membres_equipe INSERT allowed, partners INSERT allowed` |
| **Comportement attendu** | Toutes les INSERT bloquées pour anon |

**Politiques INSERT déclaratives** :

- `spectacles` : `to authenticated WITH CHECK (has_min_role('editor'))` — aucune policy pour anon
- `membres_equipe` : `to authenticated WITH CHECK (is_admin())` — aucune policy pour anon
- `partners` : `to authenticated WITH CHECK (is_admin())` — aucune policy pour anon

**Analyse** : Aucune politique INSERT n'existe pour `anon` sur ces tables — RLS devrait bloquer par défaut (deny). Le fait que l'INSERT passe signifie soit :

1. **RLS désactivé** sur ces tables dans la DB locale
2. **GRANT INSERT accordé à `anon`** par une migration auto-générée (ex: `supabase db diff` ajoute parfois des GRANTs larges)
3. **Politique résiduelle permissive** non nettoyée

**Action** : Vérifier `SELECT relrowsecurity FROM pg_class WHERE relname IN ('spectacles', 'membres_equipe', 'partners')` pour confirmer RLS activé. Vérifier les GRANTs avec `SELECT * FROM information_schema.table_privileges WHERE grantee = 'anon' AND table_name IN (...)`. Révoquer tout GRANT INSERT pour `anon` sur ces tables si présent.

---

### RLS-011 — Anon peut SELECT des rows dans logs_audit

| Champ | Valeur |
| ------- | -------- |
| **Sévérité** | **Critique** |
| **Section** | 4.1 — Anon données sensibles bloquées |
| **Table** | `logs_audit` |
| **Opération** | SELECT |
| **Erreur** | `SECURITY: rows returned` |
| **Comportement attendu** | Aucune row visible pour anon (table admin-only) |

**Politique déclarative** (`10_tables_system.sql`) :

```sql
create policy "Admins can view audit logs"
on public.logs_audit for select to authenticated
using ( (select public.is_admin()) );
```

**Analyse** : Aucune politique SELECT pour `anon` — RLS deny-by-default devrait bloquer. Même investigation que RLS-010 : vérifier RLS activé et GRANTs. La migration `20260117234007_task053` contient `grant insert on "public"."logs_audit" to "anon"` — un `GRANT SELECT` similaire pourrait exister.

**Action** : `supabase db reset` puis vérifier. Si le problème persiste, ajouter une révocation explicite `REVOKE SELECT ON public.logs_audit FROM anon`.

---

### RLS-019 — User (authenticated) peut INSERT dans evenements

| Champ | Valeur |
| ------- | -------- |
| **Sévérité** | Haute |
| **Section** | 4.2 — User restrictions |
| **Table** | `evenements` |
| **Opération** | INSERT |
| **Erreur** | `SECURITY: RLS should have blocked before schema error` |
| **Comportement attendu** | RLS bloque avec "new row violates row-level security policy" |

**Politique INSERT déclarative** (`61_rls_main_tables.sql`) :

```sql
create policy "Editors+ can create events"
on public.evenements for insert to authenticated
with check ( (select public.has_min_role('editor')) );
```

**Analyse** : La politique est `to authenticated` (matche le rôle `user`), puis `WITH CHECK` vérifie `has_min_role('editor')` qui retourne `false` pour un user. Le RLS devrait retourner l'erreur "new row violates row-level security policy". Le test reçoit plutôt une erreur de contrainte schema (NOT NULL sur `spectacle_id` ou `date_debut`), ce qui signifie que PostgreSQL évalue les contraintes AVANT le WITH CHECK.

**Deux causes possibles** :

1. **Ordre d'évaluation PostgreSQL** : Les contraintes NOT NULL peuvent être évaluées avant WITH CHECK — c'est un comportement documenté de PostgreSQL. Dans ce cas, le **test doit être ajusté** pour accepter aussi les erreurs de contrainte comme un blocage valide.
2. **Politique non appliquée** : Si la DB locale a encore une ancienne politique permissive, le WITH CHECK ne bloque pas.

**Action** : Tester avec un INSERT complet (tous les champs requis remplis) pour isoler le comportement RLS du comportement contraintes. Ajuster le test si nécessaire.

---

## Analyse post-mortem

### Cause 1 — DB locale stale (RLS-001)

La DB locale n'avait pas été réinitialisée après les migrations TASK077/TASK079. Un `supabase db reset` a résolu RLS-001 (anciennes policies combinées `anon, authenticated` remplacées par policies séparées).

### Cause 2 — Bug `signInAs()` mutant le client anon (RLS-009, 010, 011)

La fonction `signInAs()` appelait `anonClient.auth.signInWithPassword()`, ce qui **mutait l'état interne** du client anon partagé. Après 3 sign-ins (user → editor → admin), `anonClient` avait une session admin. Les tests "anon" s'exécutaient donc en tant qu'admin → toutes les opérations réussissaient.

**Fix** : `signInAs()` crée désormais un `tempClient = createClient(...)` séparé pour le sign-in, sans toucher au client anon.

### Cause 3 — Colonne inexistante dans payload (RLS-019)

Le payload `{ title: "__rls_test__" }` pour `evenements` utilisait une colonne inexistante. PostgREST retournait PGRST204, qui matchait `error.message.includes("column")` → le test interprétait une erreur schema comme un bypass de sécurité.

**Fix** : Payload corrigé avec les colonnes réelles : `{ spectacle_id: 999999, date_debut: "2099-01-01T00:00:00" }`.

---

## Matrice des tables affectées

| Table | Opération | Rôle | Politique attendue | Échec |
| ------- | ----------- | ------ | -------------------- | ------- |
| `spectacles` | SELECT | anon | `public=true AND status IN(...)` | RLS-001 |
| `configurations_site` | SELECT | anon | `key LIKE 'public:%' OR 'display_toggle_%'` | RLS-009 |
| `spectacles` | INSERT | anon | Bloqué (deny default) | RLS-010 |
| `membres_equipe` | INSERT | anon | Bloqué (deny default) | RLS-010 |
| `partners` | INSERT | anon | Bloqué (deny default) | RLS-010 |
| `logs_audit` | SELECT | anon | Bloqué (deny default) | RLS-011 |
| `evenements` | INSERT | user | Bloqué (`has_min_role('editor')`) | RLS-019 |

---

## Prochaines étapes

1. ~~Exécuter `supabase db reset`~~ ✅ Fait
2. ~~Documenter les résultats post-reset~~ ✅ TASK080 Completed
3. ~~Corriger les échecs persistants~~ ✅ 3 fixes appliqués dans `scripts/test-permissions-rls.ts`
4. **Étendre le script** aux sections 4.3 (admin), 4.4 (editor éditorial), 4.6 (storage), 4.7 (views)
