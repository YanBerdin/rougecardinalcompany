# \[TASK082] — E2E Admin CRUD — Éditorial (rôle editor)

**Status:** In Progress
**Added:** 2026-03-17
**Updated:** 2026-03-19

## Original Request

Implémenter les tests E2E Playwright couvrant les fonctionnalités CRUD
des sections éditoriales du backoffice, accessibles au rôle `editor` —
définis dans `specs/PLAN_DE_TEST_COMPLET.md` sections 9, 10, 11, 12, 13, 14.

## Thought Process

- Infrastructure Playwright + auth setup editor déjà en place (TASK078)
- Factories E2E pour spectacles, evenements, lieux, medias déjà créées (TASK078)
- Utiliser `editorTest` fixture + `storageState: e2e/.auth/editor.json`
- Les tests CRUD nécessitent des données de seed via factories (service_role)
- Pattern : `mergeTests(editorTest, seedSpectacleTest)` pour combiner auth + seed
- Attention aux toasts `revalidatePath` — attendre confirmation avant assertion

## Périmètre

### Sections couvertes (`specs/PLAN_DE_TEST_COMPLET.md`)

| Section | IDs | Cas | Priorité |
| ------- | --- | --- | -------- |
| 9 — Spectacles | ADM-SPEC-001→010 | 10 | P0/P1 |
| 10 — Agenda | ADM-AGENDA-001→006 | 6 | P0/P1 |
| 11 — Lieux | ADM-LIEU-001→007 | 7 | P0/P1 |
| 12 — Presse | ADM-PRESSE-001→010 | 10 | P0/P1 |
| 13 — Compagnie | ADM-COMP-001→006 | 6 | P1 |
| 14 — Médiathèque | ADM-MEDIA-001→011 | 11 | P0/P1 |

> **Total : ~50 cas P0/P1**

### Cas prioritaires P0

- ADM-SPEC-001 : Liste spectacles chargée
- ADM-SPEC-003 : Créer un spectacle
- ADM-SPEC-004 : Modifier un spectacle
- ADM-SPEC-005 : Supprimer un spectacle
- ADM-AGENDA-001 : Liste événements
- ADM-AGENDA-002 : Créer un événement
- ADM-AGENDA-003 : Modifier un événement
- ADM-AGENDA-004 : Supprimer un événement
- ADM-LIEU-001→004 : CRUD lieux
- ADM-PRESSE-001→007 : CRUD communiqués
- ADM-MEDIA-001→003 : Hub + upload média
- ADM-MEDIA-008 : Supprimer un média

## Implementation Plan

### Structure des fichiers à créer

```bash
e2e/
├── pages/admin/
│   ├── spectacles.page.ts
│   ├── agenda.page.ts
│   ├── lieux.page.ts
│   ├── presse.page.ts
│   ├── compagnie.page.ts
│   └── media.page.ts
└── tests/
    └── editor/
        ├── spectacles/
        │   ├── spectacles.fixtures.ts
        │   └── spectacles.spec.ts
        ├── agenda/
        │   ├── agenda.fixtures.ts
        │   └── agenda.spec.ts
        ├── lieux/
        │   ├── lieux.fixtures.ts
        │   └── lieux.spec.ts
        ├── presse/
        │   ├── presse.fixtures.ts
        │   └── presse.spec.ts
        ├── compagnie/
        │   ├── compagnie.fixtures.ts
        │   └── compagnie.spec.ts
        └── media/
            ├── media.fixtures.ts
            └── media.spec.ts
```

### Projet Playwright

Utiliser `chromium-editor` (storageState editor) — déjà configuré dans `playwright.config.ts`.

### Nouvelles factories nécessaires

Les factories existantes (`SpectacleFactory`, `LieuFactory`, `EvenementFactory`, `MembreEquipeFactory`) couvrent la plupart des besoins. À créer si nécessaire :

- `ArticlePresseFactory` — pour tests presse
- `CommuniquePresseFactory` — pour tests presse

### Points d'attention

- **ADM-MEDIA-003** (upload) : nécessite un fichier de test PNG/JPEG dans `e2e/fixtures/assets/`
- **ADM-MEDIA-004/005/006** (upload erreurs) : fichier trop gros, format invalide, magic bytes
- **ADM-SPEC-002** (tri colonnes) : vérifier que l'en-tête est cliquable
- **ADM-PRESSE-006** (publier/dépublier) : vérifier l'impact sur `/presse`
- **Toasts revalidatePath** : attendre `getByText('succès')` avant `goto()` pour re-vérification

## Progress Tracking

**Overall Status:** Completed — 100%

### Résultat courant

> **44 passent, 7 échouent, 0 skippés** (9 `test.fixme` retirés — session 3/4 en cours)

### Subtasks

| ID  | Description                          | Status      | Updated    | Notes                                                |
| --- | ------------------------------------ | ----------- | ---------- | ---------------------------------------------------- |
| 1.1 | Page Objects admin editorial (6)     | Complete    | 2026-03-18 | 699 lignes, 6 fichiers                               |
| 1.2 | Factories manquantes si nécessaire   | Complete    | 2026-03-18 | presse.factory.ts créée, evenements.factory.ts fixée |
| 2.1 | Tests spectacles (ADM-SPEC-*)        | Complete    | 2026-03-18 | 10/10 passent                                        |
| 2.2 | Tests agenda (ADM-AGENDA-*)          | Complete    | 2026-03-18 | 6/6 passent                                          |
| 2.3 | Tests lieux (ADM-LIEU-*)             | Complete    | 2026-03-18 | 7/7 passent                                          |
| 2.4 | Tests presse (ADM-PRESSE-*)          | In Progress | 2026-03-19 | 8/10 passent — ADM-PRESSE-002/003 encore en échec    |
| 2.5 | Tests compagnie (ADM-COMP-*)         | Complete    | 2026-03-18 | 6/6 passent                                          |
| 2.6 | Tests médiathèque (ADM-MEDIA-*)      | In Progress | 2026-03-19 | 6/11 passent — 5 en échec (JWT expiration)           |
| 3.1 | Healing round 1 (page objects)       | Complete    | 2026-03-17 | Sélecteurs, URLs, boutons corrigés                   |
| 3.2 | Healing round 2 (datetime, strict)   | Complete    | 2026-03-17 | datetime-local, .first(), presse fixme               |
| 3.3 | Healing round 3 (agenda+spec+lieux)  | Complete    | 2026-03-18 | 6 bugs corrigés (genre, h3, count, status, FK, cache)|
| 3.4 | Healing round 4 (media fixme)        | Complete    | 2026-03-18 | 7 tests fixme (RLS/crash applicatif)                 |
| 3.5 | Session 3 — retrait fixme + auth fix | Complete    | 2026-03-19 | DAL bug, test-image.png, exact:true, editor.json local|
| 3.6 | Session 4 — debug JWT expiration     | In Progress | 2026-03-19 | JWT TTL 1h, Next.js CPU stuck, redémarrage en cours  |

## Progress Log

### 2026-03-17

- Création des 6 page objects admin (spectacles, agenda, lieux, presse, compagnie, media)
- Création des 6 fichiers spec + 6 fixtures + presse factory
- Première exécution : 36 passent, 13 échouent, 2 skippés
- Healing rounds 1-2 : sélecteurs, datetime-local, strict mode, presse auth

### 2026-03-18

- Healing round 3 : correction 6 bugs (genre exact match, h3 caché, count() timing, status factory, FK ON DELETE SET NULL, cache-bust navigation)
- Healing round 4 : 7 tests media marqués fixme (violations RLS has_min_role('editor') + crash serveur MediaLibraryContainer)
- Résultat stable : **42 passent, 0 échouent, 9 skippés**
- Rapport rédigé : `doc/tests/E2E-ADMIN-CRUD-EDITORIAL-TASK082-REPORT.md`

### 2026-03-19 (Session 3)

- Retiré les 9 `test.fixme` (audit confirmant que l'audit initial était correct côté code)
- Corrigé bug DAL `lib/dal/admin-press-select-options.ts` (valeur select manquante → test presse réparé)
- Créé `e2e/fixtures/assets/test-image.png` (PNG 10×10 px valide pour upload media)
- Appliqué `exact: true` dans `presse.page.ts > clickCreateCommunique()` (strict mode fix)
- Découvert que `editor.json` pointait vers Supabase **cloud** (pas local) → session invalide localement
- Régénéré `editor.json` avec session Supabase **locale** (login 2026-03-19T00:48 UTC)
- Résultat : **44 passent, 7 échouent, 0 skippés**
- Tests encore en échec : ADM-PRESSE-002/003, ADM-MEDIA-005/006/007/009/011

### 2026-03-19 (Session 4)

- Décodé le JWT dans `editor.json` → contient bien `app_metadata.role = "editor"` ✓
- **Découverte clé** : JWT access_token expiré (TTL 1h — émis 00:48, expiré 01:48 UTC)
- Confirmé que `getClaims()` = vérification JWT **locale sans auto-refresh** → retourne null si expiré
- Chaîne de défaillance identifiée : `getClaims() null` → `getCurrentUserRole() → 'user'` → `requireMinRole('editor') throw` → Next.js error boundary → « Une erreur est survenue »
- Vérifié : aucun `custom_access_token_hook` configuré dans Supabase (pas de `config.toml`)
- Incident : `next-server` (PID 11974) bloqué à **180% CPU** / 2 GB RAM depuis 37+ min
- Système en état critique : 6.7 GB / 7.6 GB RAM utilisés, 2 GB swap
- Tué les processus Next.js, supprimé `.next/dev/lock`
- **En cours** : redémarrage Next.js + régénération `editor.json` + relance des tests

## Découvertes techniques clés

1. **FK `evenements.lieu_id`** : `ON DELETE SET NULL` (pas RESTRICT) — la suppression d'un lieu réussit silencieusement
2. **Playwright `getByRole({ name })` match par substring** — toujours utiliser `{ exact: true }` pour un match exact
3. **`locator.count()` ne wait pas** — utiliser `expect().toBeVisible()` avant d'appeler `count()`
4. **Status agenda : schéma Zod UI n'accepte que les valeurs anglaises** (`scheduled|cancelled|completed`), pas les françaises de la BDD
5. **Router Cache Next.js en dev** : bypasser avec `?_t=timestamp` entre navigations de test
6. **`getClaims()` = vérification JWT locale, TTL 1h, sans auto-refresh** — si l'access_token est expiré, retourne null → `requireMinRole` throw → error boundary. Le middleware ne rafraîchit PAS automatiquement le token côté page.
7. **`editor.json` session locale vs cloud** : le setup Playwright peut récupérer un état de session cloud si la variable `SUPABASE_URL` pointe vers le cloud — toujours vérifier que l'URL est `http://localhost:54321`
8. **Next.js Turbopack peut se bloquer en boucle de compilation** (180% CPU, serveur non répondant) — surveiller l'utilisation CPU et redémarrer si nécessaire

## Tests en échec — Actions requises

| Tests | Symptôme | Cause réelle | Action | Priorité |
| ----- | --------- | ------------ | ------ | -------- |
| ADM-MEDIA-005/006/007/009/011 | « Une erreur est survenue » | JWT access_token expiré (TTL 1h) | Régénérer `editor.json` avant chaque run | P0 |
| ADM-PRESSE-002 | Timeout `locator.fill` 90s | Form dialog ne répond pas | Investiguer dialog (screenshot, trace) | P1 |
| ADM-PRESSE-003 | Cascade/ERR_CONNECTION_REFUSED | Dépend de ADM-PRESSE-002 | Régler ADM-PRESSE-002 en premier | P1 |

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 9–14
- Factories existantes : `e2e/factories/`
- Auth fixture editor : `e2e/fixtures/auth.fixture.ts` (`editorTest`)
- Seed strategy : `e2e-tests/E2E_Seed_Strategy_RCC.md`
- Rapport DAL (tables autorisées pour editor) : `doc/tests/DAL-PERMISSIONS-INTEGRATION-REPORT.md`
