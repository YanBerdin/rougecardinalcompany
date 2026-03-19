# Audit E2E — Tests Skippés TASK082

**Date** : 2026-03-18 (mis à jour 2026-03-19)  
**Scope** : 9 tests `test.fixme()` dans les suites editor (Presse + Médiathèque)  
**Score global** : **3 faux positifs / 9 skips** — tous les `test.fixme` ont été retirés

---

## Résumé exécutif

| Catégorie | Tests | Diagnostic initial | Résultat post-retrait |
| ----------- | ------- | ------------ | -------------- |
| Presse — Communiqués | ADM-PRESSE-002, 003 | Faux positif | ❌ **Encore en échec** — form fill timeout |
| Médiathèque — RLS | ADM-MEDIA-005, 007, 009, 011 | Faux positif | ❌ **Encore en échec** — erreur boundary Next.js |
| Médiathèque — Crash | ADM-MEDIA-006 | Faux positif | ❌ **Encore en échec** — même symptôme |

**Verdict initial (2026-03-18)** : Les 9 tests ont été skippés sur la base d'hypothèses incorrectes. Le code applicatif (Server Actions, DAL, RLS policies, Storage policies) autorise le rôle `editor` pour toutes les opérations testées. Tous les `test.fixme()` devraient être retirés et les tests relancés.

**Verdict mis à jour (2026-03-19)** : Après retrait des 9 `test.fixme` et 3 sessions de débogage, **7 tests restent en échec**. Les analysees ont permis d'identifier deux causes réelles distinctes :

1. **ADM-MEDIA-*** : Expiration du JWT access_token (`getClaims()` retourne null → `requireMinRole` throw → error boundary)
2. **ADM-PRESSE-002/003** : Timeout sur le remplissage du formulaire (dialog ne s'ouvre pas dans le délai imparti)

---

## 1. Presse — ADM-PRESSE-002, ADM-PRESSE-003

### Fichier testé

`e2e/tests/editor/presse/presse.spec.ts` — lignes 27 et 53

### Motif de skip déclaré

```
// ADM-PRESSE-002: Create page calls requireAdminOnly() in DAL — editor role cannot access
// ADM-PRESSE-003: Edit page calls requireAdminOnly() in DAL — editor role cannot access
```

### Audit du code applicatif

| Couche | Fichier | Vérification | Résultat |
| -------- | --------- | -------------- | ---------- |
| Server Actions | `app/(admin)/admin/presse/press-releases-actions.ts` | 5 occurrences | Toutes : `requireMinRole("editor")` |
| DAL | `lib/dal/admin-press-releases.ts` | 8 fonctions | Toutes : `requireMinRole("editor")` |
| Contacts (hors scope) | `app/(admin)/admin/presse/press-contacts-actions.ts` | 4 occurrences | `requireAdminOnly()` (**mais actions contacts ≠ communiqués**) |

### Conclusion

**Le commentaire de skip est ERRONÉ.** La confusion vient probablement du fichier `press-contacts-actions.ts` (admin-only), mais les tests ADM-PRESSE-002 et 003 portent sur les **communiqués** (`press-releases-actions.ts`), qui utilisent `requireMinRole("editor")`.

### Violations détectées

| Code | Sévérité | Description |
| ------ | ---------- | ------------- |
| TEST-001 | Majeure | Commentaire factuel incorrect dans le test — induit en erreur |

### Action requise

Retirer `test.fixme` sur ADM-PRESSE-002 et ADM-PRESSE-003 et relancer la suite.

---

## 2. Médiathèque — RLS — ADM-MEDIA-005, 007, 008, 009, 010, 011

### Fichier testé

`e2e/tests/editor/media/media.spec.ts` — lignes 61, 101, 122, 149, 170, 195

### Motif de skip déclaré

```
// RLS policy blocks editor from uploading to Supabase Storage
// RLS policy blocks editor from inserting into media_tags
// RLS policy blocks editor from creating/deleting media_tags
// RLS policy blocks editor from inserting into media_folders
// RLS policy blocks editor from creating/deleting media_folders
// RLS policy blocks editor from creating/modifying media_folders
```

### Audit RLS — Tables publiques

La migration `20260311120000_editor_role_rls_policies.sql` (107 lignes) a été **appliquée localement ET en remote** (confirmé via `supabase migration list --local`).

| Table | Policy Insert | Policy Update | Policy Delete | Guard |
| ------- | -------------- | --------------- | --------------- | ------- |
| `public.media_tags` | "Editors+ can insert media tags" | "Editors+ can update media tags" | "Editors+ can delete media tags" | `has_min_role('editor')` |
| `public.media_folders` | "Editors+ can insert media folders" | "Editors+ can update media folders" | "Editors+ can delete media folders" | `has_min_role('editor')` |
| `public.media_item_tags` | "Editors+ can insert media item tags" | "Editors+ can update media item tags" | "Editors+ can delete media item tags" | `has_min_role('editor')` |

**Source** : `supabase/migrations/20260311120000_editor_role_rls_policies.sql` lignes 330–395

### Audit RLS — Storage (ADM-MEDIA-005)

La migration `20260311030511_editor_storage_policies.sql` a été **appliquée** (dans la liste des migrations).

| Bucket | Policy Insert | Policy Update | Policy Delete | Guard |
| -------- | -------------- | --------------- | --------------- | ------- |
| `medias` (storage.objects) | "Editors can upload to medias" | "Editors can update medias" | "Editors can delete medias" | `has_min_role('editor')` |

**Source** : `supabase/migrations/20260311030511_editor_storage_policies.sql`

### Audit Server Actions

| Action | Fichier | Guard | Résultat |
| -------- | --------- | ------- | ---------- |
| `listMediaTagsAction` | `lib/actions/media-tags-actions.ts:39` | `requireMinRole("editor")` | OK |
| `createMediaTagAction` | `lib/actions/media-tags-actions.ts:64` | `requireMinRole("editor")` | OK |
| `updateMediaTagAction` | `lib/actions/media-tags-actions.ts:93` | `requireMinRole("editor")` | OK |
| `deleteMediaTagAction` | `lib/actions/media-tags-actions.ts:134` | `requireMinRole("editor")` | OK |
| `listMediaFoldersAction` | `lib/actions/media-folders-actions.ts:39` | `requireMinRole("editor")` | OK |
| `createMediaFolderAction` | `lib/actions/media-folders-actions.ts:64` | `requireMinRole("editor")` | OK |
| `updateMediaFolderAction` | `lib/actions/media-folders-actions.ts:93` | `requireMinRole("editor")` | OK |
| `deleteMediaFolderAction` | `lib/actions/media-folders-actions.ts:134` | `requireMinRole("editor")` | OK |

### Cohérence schéma déclaratif ↔ migrations

| Fichier schema | État RLS | Migration appliquée |
| ---------------- | ---------- | --------------------- |
| `supabase/schemas/61_rls_main_tables.sql` | `has_min_role('editor')` | `20260311120000` — conforme |
| `supabase/schemas/02c_storage_buckets.sql` | `has_min_role('editor')` | `20260311030511` — conforme |

### Conclusion

**Les policies RLS (tables + storage) autorisent le rôle editor.** Les migrations correctives sont appliquées en local et en remote. Les commentaires de skip étaient valides au moment où les anciennes policies `is_admin()` étaient en vigueur, mais sont devenus obsolètes après application des migrations `20260311*`.

### Violations détectées

| Code | Sévérité | Description |
| ------ | ---------- | ------------- |
| TEST-002 | Majeure | Commentaires de skip obsolètes — ne reflètent plus l'état actuel des RLS |

### Action requise

Retirer `test.fixme` sur ADM-MEDIA-005, 007, 008, 009, 010, 011 et relancer.

---

## 3. Médiathèque — Crash — ADM-MEDIA-006

### Fichier testé

`e2e/tests/editor/media/media.spec.ts` — ligne 81

### Motif de skip déclaré

```
// Media library page crashes server-side (Promise.all of 3 server actions fails intermittently)
```

### Audit du composant serveur

**Fichier** : `components/features/admin/media/MediaLibraryContainer.tsx` (58 lignes)

```typescript
const [mediaResult, tagsResult, foldersResult] = await Promise.all([
    listMediaItemsAction(),
    listMediaTagsAction(),
    listMediaFoldersAction(),
]);
```

Chaque résultat est vérifié individuellement (`if (!mediaResult.success)` etc.) et affiche un message d'erreur dédié. Le composant ne crash pas en cas d'échec.

### Audit de la chaîne d'erreurs

| Couche | Comportement | Throw possible ? |
| -------- | ------------- | ------------------ |
| `requireMinRole("editor")` (`lib/auth/roles.ts`) | Throw `Error("Unauthorized: ...")` si rôle insuffisant | Oui, mais... |
| `listMediaTagsAction` (`lib/actions/media-tags-actions.ts`) | Enveloppe `requireMinRole` dans try/catch, retourne `{ success: false, error }` | **Non** — try/catch absorbe |
| `listMediaFoldersAction` (`lib/actions/media-folders-actions.ts`) | Idem — try/catch | **Non** |
| `listMediaItemsAction` (`lib/actions/media-actions.ts`) | Idem — try/catch | **Non** |
| `MediaLibraryContainer` | Vérifie `.success` sur chaque résultat | Affiche erreur, pas de crash |

### Conclusion

**Le crash signalé n'est pas corroboré par le code.** Le pattern try/catch des 3 actions empêche toute exception non capturée. Le `Promise.all` ne peut pas échouer si aucune des promises ne rejette. Le crash était probablement une conséquence temporaire de l'ancien état RLS (`is_admin()` bloquant l'editor), maintenant résolu par la migration `20260311120000`.

### Violations détectées

| Code | Sévérité | Description |
| ------ | ---------- | ------------- |
| TEST-003 | Mineure | Commentaire de skip basé sur un symptôme transitoire, pas sur un bug structurel |

### Action requise

Retirer `test.fixme` sur ADM-MEDIA-006 et relancer. Si un crash apparaît, examiner les logs serveur Next.js pour identifier l'erreur exacte.

---

## 4. Synthèse des violations

### Violations dans les tests

| Code | Fichier | Ligne(s) | Sévérité | Description |
| ------ | --------- | ---------- | ---------- | ------------- |
| TEST-001 | `e2e/tests/editor/presse/presse.spec.ts` | 27, 53 | **Majeure** | Commentaire factuel incorrect : dit `requireAdminOnly()` alors que le code utilise `requireMinRole("editor")` |
| TEST-002 | `e2e/tests/editor/media/media.spec.ts` | 61, 101, 122, 149, 170, 195 | **Majeure** | Commentaires obsolètes : RLS policies déjà migrées vers `has_min_role('editor')` |
| TEST-003 | `e2e/tests/editor/media/media.spec.ts` | 81 | **Mineure** | Crash signalé non reproductible — symptôme transitoire résolu |

### Conformité Supabase

| Domaine | Statut | Détails |
| --------- | -------- | --------- |
| RLS — media_tags | ✅ Conforme | `has_min_role('editor')`, policies séparées, `(select ...)` wrapper |
| RLS — media_folders | ✅ Conforme | `has_min_role('editor')`, policies séparées, `(select ...)` wrapper |
| RLS — media_item_tags | ✅ Conforme | `has_min_role('editor')`, policies séparées, `(select ...)` wrapper |
| Storage — medias bucket | ✅ Conforme | `has_min_role('editor')` pour insert/update/delete |
| Server Actions — media | ✅ Conforme | `requireMinRole("editor")` + try/catch + `ActionResult` pattern |
| Server Actions — presse | ✅ Conforme | `requireMinRole("editor")` pour communiqués, `requireAdminOnly()` pour contacts |
| Schema ↔ Migrations | ✅ Conforme | Schémas déclaratifs synchronisés avec migrations appliquées |

---

## 5. Plan d'action

| # | Priorité | Action | Fichier | Effort |
| --- | ---------- | -------- | --------- | -------- |
| 1 | P0 | Retirer `test.fixme` + corriger commentaire ADM-PRESSE-002 | `e2e/tests/editor/presse/presse.spec.ts` | 2 min |
| 2 | P0 | Retirer `test.fixme` + corriger commentaire ADM-PRESSE-003 | `e2e/tests/editor/presse/presse.spec.ts` | 2 min |
| 3 | P0 | Retirer `test.fixme` + corriger commentaire ADM-MEDIA-005 | `e2e/tests/editor/media/media.spec.ts` | 2 min |
| 4 | P0 | Retirer `test.fixme` ADM-MEDIA-006 | `e2e/tests/editor/media/media.spec.ts` | 1 min |
| 5 | P0 | Retirer `test.fixme` + corriger commentaires ADM-MEDIA-007–011 | `e2e/tests/editor/media/media.spec.ts` | 5 min |
| 6 | P1 | Relancer la suite complète editor pour valider | — | 5 min |

**Temps estimé total** : ~17 minutes

---

## 6. Contexte migrations (preuve)

Extrait pertinent de `supabase migration list --local` (2026-03-18) :

```
 Local          | Remote         | Time (UTC)
---------------- | ---------------- | ---------------------
 20260311030000 | 20260311030000 | 2026-03-11 03:00:00   ← prerequis has_min_role()
 20260311030511 | 20260311030511 | 2026-03-11 03:05:11   ← storage policies editor
 20260311120000 | 20260311120000 | 2026-03-11 12:00:00   ← RLS policies editor (27 tables)
 20260311190551 | 20260311190551 | 2026-03-11 19:05:51
 ...17 migrations postérieures...
 20260317014204 | 20260317014204 | 2026-03-17 01:42:04   ← dernière migration
```

Les 3 migrations critiques (fonction `has_min_role`, storage policies, RLS policies) sont synchronisées Local = Remote.

---

## 7. Résultats post-retrait des fixme (2026-03-19)

### 7.1 Score global

**44 passent / 7 échouent / 0 skippés** (51 tests au total)

Fixes appliqués entre la rédaction de cet audit et aujourd'hui :

- Bug DAL corrigé (`lib/dal/admin-press-select-options.ts` — valeur select manquante)
- Fixture créée (`e2e/fixtures/assets/test-image.png` — PNG 10×10 px valide)
- `exact: true` ajouté dans `clickCreateCommunique()` (`e2e/pages/admin/presse.page.ts`)
- Session `editor.json` régénérée avec une session Supabase **locale** (au lieu de cloud)

### 7.2 Tests encore en échec

| Test | Symptôme observé | Cause réelle identifiée |
| ------ | --------------- | ----------------------- |
| ADM-PRESSE-002 | Timeout `locator.fill` (90 s) | Dialog ne s'ouvre pas dans le délai — requiert investigation |
| ADM-PRESSE-003 | Cascade / ERR_CONNECTION_REFUSED | Dépend de ADM-PRESSE-002 ou crash serveur Next.js |
| ADM-MEDIA-005 | « Une erreur est survenue » (error boundary) | JWT access_token expiré — `getClaims()` retourne null |
| ADM-MEDIA-006 | « Une erreur est survenue » (error boundary) | Même cause JWT |
| ADM-MEDIA-007 | « Une erreur est survenue » (error boundary) | Même cause JWT |
| ADM-MEDIA-009 | « Une erreur est survenue » (error boundary) | Même cause JWT |
| ADM-MEDIA-011 | « Une erreur est survenue » (error boundary) | Même cause JWT |

### 7.3 Analyse — Cause racine ADM-MEDIA-*

La chaîne de défaillance est la suivante :

```yaml
JWT access_token expiré (TTL 1h, émis 2026-03-19T00:48 UTC)
 → supabase.auth.getClaims() retourne null (vérification locale, pas de refresh)
 → getCurrentUserRole() catch → retourne 'user'
 → requireMinRole("editor") throw Error("Unauthorized…")
 → Next.js error boundary → « Une erreur est survenue »
```

**Points clés :**

- `getClaims()` effectue une **vérification locale JWT** sans appel réseau et **sans auto-refresh**
- Le refresh_token (TTL 1 semaine) n'est exploité que si `getSession()` ou `getUser()` est appelé
- Le middleware utilise `getClaims()` — il ne rafraîchit PAS le token automatiquement
- `layout.tsx:25` appelle `requireBackofficeAccess()` = `requireMinRole("editor")` → throw si expired
- Les tests ADM-MEDIA-001→004 (hub page) passent probablement car exécutés dans la fenêtre d'1h

**Solution** : Régénérer `e2e/.auth/editor.json` (re-login) immédiatement avant chaque session de tests ou configurer le setup Playwright en dépendance directe.

### 7.4 Analyse — Cause racine ADM-PRESSE-002

- `exact: true` a été appliqué sur `clickCreateCommunique()` → le bouton est cliqué
- Mais `locator.fill()` sur le champ titre du formulaire time out après 90 s
- Hypothèse : la Dialog s'ouvre mais le champ d'input n'est pas focusable rapidement
- Ou : le serveur Next.js est dans un état dégradé (180% CPU observé)

### 7.5 Incident Next.js (2026-03-19)

Lors de la session 4, le processus `next-server` (PID 11974) a été trouvé :

- **180% CPU** depuis 37+ minutes
- **2 GB RAM** utilisés — système en swap critique (417 MB libres sur 7.6 GB)
- Port 3000 : LISTEN mais aucune requête HTTP aboutissait (timeout curl)

Le processus a été tué et le lock file `.next/dev/lock` supprimé. Le serveur doit être redémarré avant toute nouvelle session de tests.

### 7.6 Plan d'action restant

| # | Priorité | Action | Statut |
| --- | --- | --- | --- |
| 1 | P0 | Redémarrer proprement Next.js dev server | ⏳ En cours |
| 2 | P0 | Régénérer `editor.json` (re-login local Supabase) | ⏳ En attente |
| 3 | P0 | Relancer ADM-MEDIA-005→011 pour confirmer fix JWT | ⏳ En attente |
| 4 | P1 | Investiguer ADM-PRESSE-002 (dialog form fill) | ⏳ En attente |
| 5 | P2 | Ajouter `setup-editor` en dépendance Playwright (session fraîche à chaque run) | ⏳ Non commencé |
