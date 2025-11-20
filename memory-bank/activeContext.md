# Active Context

Contexte courant (au 2025-10-27):

- Incident de sécurité / outage (2025-10-25 → 2025-10-27) causé par une campagne de migrations REVOKE (Rounds 1-17) qui a supprimé des GRANTs table-level sur ~73 objets. Conséquence: erreurs PostgreSQL 42501 et indisponibilité de la homepage.
- Actions réalisées depuis l'incident:
  - Migrations d'urgence ajoutées pour restaurer les GRANTs critiques et EXECUTE sur fonctions (20251027020000 → 20251027022500).
  - CI: ajout d'un workflow de monitoring `monitor-detect-revoke` (cron daily) pour surveiller les runs et créer une issue si des échecs sont détectés.

Prochaines étapes immédiates:

- Surveiller `detect-revoke` pendant 7 jours; affiner les règles et régler les faux positifs.
- Documenter la procédure d'ajout à l'allowlist (PR + justification + approbation DB/infra).
- Ajouter tests d'intégration CI pour vérifier accès DAL (anon/authenticated) après modifications de migrations.

## Références (commits & migrations)

Commits récents pertinents (branche `feature/backoffice`):

- ci(monitor): add scheduled monitor for detect-revoke workflow — https://github.com/YanBerdin/rougecardinalcompany/commit/c74115e4ea9c847d8748411372b841c8f1e294b4 (YanBerdin)
- ci(security): fail CI when changed migrations contain REVOKE — https://github.com/YanBerdin/rougecardinalcompany/commit/e6b5249686a2482dd3bfd1e94f15270e6b865edf (YanBerdin)
- chore(ci): add README for allowed_exposed_objects and warn-only workflow — https://github.com/YanBerdin/rougecardinalcompany/commit/e0f09163b1ca075d1b5c0e9e8391b0620b46a70e (YanBerdin)
- add detected exposed DB objects to allowlist — https://github.com/YanBerdin/rougecardinalcompany/commit/3e160a842fba05c637c64237421b71cd90cd3aa0 (YanBerdin)
- chore(ci): allowlist known restored DB objects in audit — https://github.com/YanBerdin/rougecardinalcompany/commit/d1cfaadc8a5b776eea3867faeb7a842296e68360 (YanBerdin)
- chore(migrations): add warning headers & move dangerous revoke\_\* to legacy — https://github.com/YanBerdin/rougecardinalcompany/commit/8b9df198de4716ec7e9f45820c8141f3142e356a (YanBerdin)

Migrations d'urgence (résolution GRANTs & RLS) :

- `supabase/migrations/20251026180000_apply_spectacles_partners_rls_policies.sql`
- `supabase/migrations/20251026181000_apply_missing_rls_policies_home_content.sql`
- `supabase/migrations/20251026183000_restore_grants_critical_anon_tables.sql`
- `supabase/migrations/20251027020000_restore_grants_membres_equipe_spectacles.sql`
- `supabase/migrations/20251027021000_restore_grants_critical_functions.sql`
- `supabase/migrations/20251027022000_restore_grants_critical_anon_tables_final.sql`
- `supabase/migrations/20251027022500_restore_execute_grant_get_media_simple.sql`

## Phase 1 — Vitrine + Schéma déclaratif

Phase 1 — Vitrine + Schéma déclaratif finalisé. Documentation technique complète (24 instructions + memory-bank).

## Travaux novembre 2025

- ✅ **16 novembre — TASK021 Admin Backoffice Spectacles CRUD COMPLÉTÉ (Phases 1+2+3)** :
  - **Issue** : #1 - Content Management CRUD avec gestion spectacles complète
  - **Phases complétées** :
    - ✅ **Phase 1 - DAL Spectacles** : Toutes fonctions Clean Code compliant (≤ 30 lignes)
    - ✅ **Phase 2 - API Routes** : 5 endpoints (GET list, POST create, GET detail, PATCH update, DELETE)
    - ✅ **Phase 3 - Admin UI** : 7 composants (SpectacleForm, SpectaclesTable, SpectacleCard, etc.)
  - **Bug découvert & résolu** : Erreur RLS 42501 "row-level security policy violation"
    - **Root Cause** : Missing profile entry in `profiles` table with `role='admin'`
    - **Investigation** : Debug logs → Discovered user authenticated but `is_admin()` returns false
    - **Solution** : Created admin profile via SQL Editor: `INSERT INTO profiles (user_id, role) VALUES (...)`
  - **Refactoring clé** : `insertSpectacle()` preserve Supabase client context throughout operation
    - Helper function `performAuthenticatedInsert()` with client parameter passing
    - Single client instance prevents auth context loss
  - **Migration créée** : `20251116160000_fix_spectacles_insert_policy.sql`
    - Documents RLS policy fix (use `is_admin()` instead of `auth.uid()`)
    - Hotfix migration (Cloud already has correct policy via declarative schema)
  - **Procédure documentée** : `memory-bank/procedures/admin-user-registration.md`
    - Complete step-by-step guide for registering new admin users
    - Troubleshooting section with common issues
    - Security notes and architecture documentation
  - **Validation complète** :
    - CREATE: ✅ Spectacle créé avec succès
    - READ: ✅ Liste et détails fonctionnels
    - UPDATE: ✅ Modifications enregistrées
    - DELETE: ✅ Suppression opérationnelle
  - **Code quality** :
    - TypeScript: ✅ 0 errors (`pnpm tsc --noEmit`)
    - Clean Code: ✅ All functions ≤ 30 lines
    - Production-ready: ✅ Debug logs removed
  - **Commit** : `96c32f3` - "fix(dal): preserve Supabase client auth context + add RLS policy migration"
    - 4 files changed, 77 insertions(+), 45 deletions(-)

  - **Push GitHub** : ✅ Commits poussés vers `feature/backoffice` (Everything up-to-date)
  - **Impact** : Admin backoffice spectacles fully functional, ready for production use

- ✅ **15 novembre — TASK027B SECURITY DEFINER Rationale Headers COMPLÉTÉ** :
  - **Issue** : #27 - Require explicit SECURITY DEFINER justification in function headers
  - **Résultat** : 6 fonctions documentées avec headers de justification explicites
  - **Fonctions modifiées** :
    - Auth/Profiles sync triggers : `handle_new_user()`, `handle_user_deletion()`, `handle_user_update()`
    - Core helpers : `is_admin()`, `get_current_timestamp()`
    - Admin RPC : `reorder_team_members(jsonb)`
  - **Template header** : Rationale, Risks Evaluated, Validation, Grant Policy
  - **Documentation** : `.github/instructions/Database_Create_functions.instructions.md` mis à jour
  - **Checklist sécurité** : 10 items pour code review
  - **Issue GitHub** : #27 fermée avec rapport complet (15 nov 2025)
  - **Impact** : Traçabilité améliorée, code reviews facilités, aucun impact runtime

- ✅ **15 novembre — TASK028B Cleanup Scripts Obsolètes COMPLÉTÉ** :
  - **Issue** : #28 - Suppression de 3 scripts d'audit temporaires Round 7
  - **Résultat** : Fichiers déjà supprimés le 26 oct 2025 (commit `20ecfbb`)
  - **Fichiers supprimés** :
    - `supabase/scripts/quick_audit_test.sql` (version simplifiée redondante)
    - `supabase/scripts/check_round7b_grants.sh` (script bash Round 7b)
    - `supabase/migrations/verify_round7_grants.sql` (vérification ponctuelle)
  - **Outils conservés** : `audit_grants.sql`, `quick_check_all_grants.sql`, `audit_grants_filtered.sql`
  - **Documentation** : Section "Cleanup Post-Audit" ajoutée dans `migrations.md`
  - **Issue GitHub** : #28 fermée avec rapport complet (15 nov 2025)
  - **Impact** : Repository nettoyé, maintenance simplifiée, scripts archivés dans Git

- ✅ **15 novembre — TASK026B Database Functions Compliance COMPLÉTÉ** :
  - **Résultat final** : 100% compliance (28/28 fonctions avec `SET search_path = ''`)
  - **Fonction corrigée** : `public.reorder_team_members(jsonb)` dans `63_reorder_team_members.sql`
  - **Méthode** : Hotfix SQL Editor direct (Section 5.5 "Hotfix Migrations and Schema Synchronization")
  - **Justification** : 32 migrations Cloud manquantes (incident RLS 27 oct - campagne erronée déjà annulée)
  - **Migration locale** : `20251115150000_fix_reorder_team_members_search_path.sql` créée et documentée
  - **Schéma déclaratif** : `supabase/schemas/63_reorder_team_members.sql` synchronisé
  - **Documentation** :
    - `supabase/migrations/migrations.md` : Section "Corrections et fixes critiques" ajoutée
    - `memory-bank/tasks/TASK026B-db-functions-compliance.md` : Progress log complet
    - `doc-perso/TASK026B-cloud-fix-procedure.md` : Procédure hotfix validée
  - **Validation** : `SELECT proconfig FROM pg_proc WHERE proname = 'reorder_team_members'` → `{search_path=}` ✅
  - **Issue #26** : Commentaire complet (audit results + correction details + documentation) + closed with "completed"
  - **Commits** : 5 fichiers modifiés (`migrations.md, _index.md, _preview, TASK026B.md, GitHub comment/close`)
  - **Impact sécurité** : Protection contre injection schéma sur fonction SECURITY DEFINER admin
  - **Performance** : Zero downtime (remplacement à chaud)

- ✅ **14 novembre — API Code Quality Refactoring + Newsletter Migration** :
  - **Documentation** : Plan d'analyse et refactoring complet créé (`.github/prompts/plan-apiRefactoringReview.prompt.md`)
    - 10 fichiers analysés (8 API routes + 1 DAL + 1 helpers)
    - Score global : 9.4/10 (production-ready)
    - 22 issues identifiées (priorities 1-5)
    - Plan structuré en 3 phases avec checklists
  - **Phase 1 - ApiResponse Pattern Unification** :
    - `contact/route.ts` : Full ApiResponse migration (validationError, success, error)
    - `team/route.ts` : Hybrid approach pour backward compatibility (NextResponse.json pour arrays, ApiResponse.error pour erreurs)
    - `newsletter/route.ts` : Full ApiResponse migration (4 replacements - validation, DB error, success, catch)
    - Import cleanup : Suppression des imports inutilisés (NextResponse, PostgresError)
    - Fix import path : `@/types/contact.types` → `@/lib/email/schemas`
  - **Phase - DAL Type Naming Consistency** :
    - Suppression du type `DalResponse<T>` (duplication)
    - Unification sur `DALResult<null>` pour 4 fonctions (hardDelete, validate, perform, handleError)
    - Mise à jour des return statements : `{ success: true }` → `{ success: true, data: null }`
    - Type system 100% cohérent
  - **Phase 3 - JSDoc Comprehensive Documentation** :
    - 8 fonctions DAL documentées avec JSDoc complet
    - Tags ajoutés : `@param`, `@returns`, `@example`
    - ~69 lignes de documentation inline
    - IntelliSense IDE pleinement fonctionnel
  - **Validation Complète** :
    - TypeScript : `pnpm tsc --noEmit` ✅ (0 errors)
    - ESLint : `pnpm eslint --quiet` ✅ (0 warnings après fix 2 erreurs scripts)
    - Runtime : Tests browser ✅ (backward compatibility OK)
    - Tests DAL : `test-team-active-dal.ts` ✅ (5/5 passed - 1073ms total)
    - Tests API : `test-active-endpoint.ts` ✅ (17/17 passed avec auth admin)
      -Tests Newsletter : `test-newsletter-endpoint.ts` ✅ (6/6 passed - 1452ms total)
  - **Score improvement** : 9.4/10 → 9.8/10 (avec newsletter + validation complète)

- ✅ **13 novembre — Dashboard Refactoring COMPLET (3 phases)** :
  - **Phase 1 - Foundation** : ErrorBoundary réutilisable, types Zod, test script (100% pass)
  - **Phase 2 - Component Extraction** : StatsCard (29L), DAL dashboard.ts (54L), DashboardStatsContainer (45L)
    - admin/page.tsx : 133 → 69 lignes (-48%)
    - StatsCardsSkeleton extrait dans components/skeletons/
    - Pattern Smart/Dumb components respecté
    - Suspense + ErrorBoundary pour UX optimale
  - **Phase 3 - API Routes** : Contact + Newsletter refactored
    - parseFullName() helper (plus de parsing manuel)
    - isUniqueViolation() type guard (exit magic string '23505')
    - HttpStatus constants partout (400, 500 → HttpStatus.BAD_REQUEST, etc.)
    - 0 TypeScript errors, code DRY, maintainability++
  - **Tests** : 4/4 passing (800ms fetch, 524ms validation, 781ms parallel)
  - **Success Criteria** : 9/9 atteints ✨

- ✅ **13 novembre — Refactoring complet API /active + suite de tests automatisés** :
  - **Endpoint refactorisé** : `/api/admin/team/[id]/active` avec validation Zod complète
    - Schema de transformation : accept boolean | "true"/"false" | 0/1
    - Transforme en boolean canonique avant DAL
    - Retours structurés avec status HTTP appropriés (200, 400, 422, 500)
    - Tests TypeScript intégrés : 4 scénarios (success, 404, 422, 500)
  - **Helpers API créés** : `lib/api/helpers.ts` (135 lignes)
    - HttpStatus constants (OK, BAD_REQUEST, NOT_FOUND, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR)
    - PostgresError constants (UNIQUE_VIOLATION, FOREIGN_KEY_VIOLATION, NOT_NULL_VIOLATION)
    - parseFullName() function (split firstName + lastName)
    - isUniqueViolation() type guard pour Supabase errors
    - ApiResponse helpers (success/error/validationError)
    - withAdminAuth wrapper pour protected routes
  - **Scripts de tests** : 5 nouveaux fichiers dans `scripts/`
    - `test-active-endpoint.ts` (client-like HTTP test)
    - `test-active-endpoint-admin.ts` (admin auth test)
    - `test-active-endpoint-comprehensive.ts` (4 scénarios complets)
    - `test-active-roundtrip-full.ts` (test E2E GET → PATCH → GET)
    - `test-email-integration.ts` (validation Resend)
  - **DAL team optimisé** : `lib/dal/team.ts` (42 lignes → 4 helpers < 30 lignes chacun)
    - getTeamMemberById() : fetch avec select minimal
    - updateTeamMemberActive() : PATCH avec revalidatePath
    - handleTeamMemberNotFound() : error helper
    - validateUpdateTeamMemberInput() : Zod validation + transformation
  - **Documentation mise à jour** :
    - Changelog avec architecture patterns (Smart/Dumb, DAL, ApiResponse)
    - Guide extraction cookie auth
    - Section admin management
    - Changelog 2025-11-13
  - **Commit créé** : c9a9ee7 "refactor(api): Complete refactoring of `/api/admin/team/[id]/active`"
    - 12 fichiers modifiés, 1186 lignes ajoutées, 63 supprimées
    - 6 nouveaux fichiers (helpers.ts + 5 scripts)
    - Qualité code : 10/10 (TypeScript + Clean Code)

- ✅ **13 novembre — Hard-delete endpoint pour membres d'équipe inactifs** :
  - **Nouveau endpoint** : `DELETE /api/admin/team/[id]/hard-delete`
    - Protection admin via `withAdminAuth` wrapper
    - Validation : membre doit exister + active=false
    - Test script TypeScript : 5 scénarios (inactive OK, active KO, 404, auth, errors)
    - Erreurs structurées avec status HTTP appropriés (200, 400, 403, 404, 422, 500)
  - **Sécurité RLS** :
    - Politique PostgreSQL sur `membres_equipe` : `is_admin()` requis pour DELETE
    - Double protection : API-level (withAdminAuth) + DB-level (RLS)
    - Logs serveur pour traçabilité des suppressions
  - **DAL team étendu** : `lib/dal/team.ts`
    - Nouvelle fonction `deleteTeamMember(id: bigint)` server-only
    - Gestion d'erreur avec PostgresError types
    - revalidatePath('/admin/team') après delete
  - **Documentation** :
    - README endpoint avec exemples curl
    - Guide de test avec `pnpm exec tsx scripts/test-hard-delete-endpoint.ts`
    - Instructions rollback (soft-delete = `UPDATE active = false`)
  - **Commit créé** : 61e9e6c "feat(api): Add hard-delete endpoint for inactive team members"
    - 147 lignes ajoutées, 38 supprimées
    - Production-ready avec garde-fous RGPD

- ✅ **11 novembre — Migration route groups** : refactor des pages `/admin/*` et homepage `/` pour utiliser route groups (`(admin)` et `(marketing)`) conformément à l'architecture Next.js 15
  - **Commit** : 6a2c7d8 "refactor: migrate admin and marketing routes to route groups"
  - **Fichiers modifiés** :
    - `app/(admin)/admin/` : tous les fichiers déplacés depuis `app/admin/`
    - `app/(marketing)/page.tsx` : homepage (vitrine)
    - `app/(admin)/layout.tsx` : layout admin avec AppSidebar + ThemeProvider
    - `app/(marketing)/layout.tsx` : layout public (Header + Footer)
  - **Bénéfices** :
    - Séparation claire des layouts (admin vs marketing)
    - Respect des conventions Next.js 15 App Router
    - Meilleure organisation du code
    - Protection auth isolée au layout admin
  - **Notes** :
    - Route groups (`(nom)`) n'affectent pas l'URL
    - `/admin/team` reste `/admin/team` (pas de `/(admin)` dans l'URL)
    - Middleware adapté pour matcher les deux zones

- ✅ **20 novembre — Sécurité Database : Déplacement extensions vers schéma dédié** :
  - **Issue** : Warning Supabase MCP "Extension in public schema" (unaccent, pg_trgm, citext)
  - **Action** : Création schéma `extensions` et déplacement des extensions
  - **Migration** : `20251120120000_move_extensions_to_schema.sql`
    - Création schéma `extensions`
    - Grant usage à `postgres`, `anon`, `authenticated`, `service_role`
    - `ALTER EXTENSION ... SET SCHEMA extensions`
    - `ALTER DATABASE ... SET search_path TO public, extensions`
  - **Schéma déclaratif** :
    - `supabase/schemas/01_extensions.sql` : Ajout `WITH SCHEMA extensions`
    - `supabase/schemas/16_seo_metadata.sql` : Qualification `extensions.unaccent()`
  - **Impact** : Schéma `public` nettoyé, conformité recommandations sécurité Supabase

## Architecture actuelle

### Smart/Dumb Components (Dashboard)

- **Smart Components** : Containers qui fetch data (async Server Components)
  - Exemple : `DashboardStatsContainer.tsx` (45 lignes)
  - Rôle : appeler DAL, gérer ErrorBoundary, passer data aux dumb components
  - Pattern : `export async function ComponentContainer() { const data = await fetchFromDAL(); return <DumbComponent data={data} /> }`

- **Dumb Components** : Présentation pure (props → UI)
  - Exemple : `StatsCard.tsx` (29 lignes)
  - Rôle : afficher data reçue en props, pas de fetch, pas de state
  - Pattern : `export function StatsCard({ title, value, icon, href }: Props) { return <Card>...</Card> }`

- **Skeletons** : Loading states dans `components/skeletons/`
  - Exemple : `StatsCardsSkeleton.tsx` (27 lignes)
  - Utilisé avec Suspense : `<Suspense fallback={<Skeleton />}><Container /></Suspense>`

### Data Access Layer (DAL)

- **Localisation** : `lib/dal/*.ts` (server-only)
- **Directives** : `"use server"` + `import "server-only"`
- **Rôle** : centraliser accès BDD, validation Zod, error handling
- **Pattern** :

```typescript
export async function fetchData(): Promise<ValidatedType> {
  const supabase = await createClient();
  const [result1, result2] = await Promise.all([query1, query2]);
  // Error handling
  const errors = [result1.error, result2.error].filter(e => e !== null);
  if (errors.length > 0) throw new Error(...);
  // Validation
  return Schema.parse(data);
}
```

### API Routes Patterns

- **Helpers** : `lib/api/helpers.ts` (135 lignes)
  - HttpStatus constants (200, 400, 403, 404, 422, 500)
  - PostgresError constants ("23505", "23503", "23502")
  - Type guards : `isUniqueViolation()`, `isForeignKeyViolation()`
  - Parsers : `parseFullName()` (firstName + lastName)
  - ApiResponse : `success()`, `error()`, `validationError()`
  - Auth : `withAdminAuth()` wrapper

- **Route Handler Pattern** :

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = Schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error },
        { status: HttpStatus.BAD_REQUEST }
      );
    }
    // Business logic with DAL
    const result = await dalFunction(validated.data);
    return NextResponse.json(result, { status: HttpStatus.OK });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
```

### Admin Authorization Pattern

**CRITICAL REQUIREMENT** : Admin users MUST have profile entry with `role='admin'`

**Architecture** :

- RLS policies use `public.is_admin()` function (SECURITY DEFINER)
- Function checks `profiles.role = 'admin'` for `auth.uid()`
- Without profile entry → `is_admin()` returns false → RLS blocks operations

**Profile Creation** :

```sql
INSERT INTO public.profiles (user_id, role, display_name)
VALUES (
  'UUID_FROM_AUTH_USERS',
  'admin',
  'Display Name'
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

**Complete Procedure** : See `memory-bank/procedures/admin-user-registration.md`

**Common Pitfall** : Authenticated user ≠ Authorized admin

- User exists in `auth.users` (Supabase Auth)
- User has session and JWT token
- BUT: No profile entry → `is_admin()` returns false → RLS error 42501

**Troubleshooting** :

```sql
-- Check if profile exists
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Test is_admin() (from application, NOT SQL Editor)
SELECT public.is_admin();
```

### Protected Routes (Admin)

- **Pattern 1 : withAdminAuth wrapper** (API routes)

```typescript
export const DELETE = withAdminAuth(async (req, { params }) => {
  // Already authenticated + admin verified
  // params.id is validated
});
```

- **Pattern 2 : Explicit check** (Server Components)

```typescript
export default async function AdminPage() {
  const supabase = await createClient();
  const claims = await supabase.auth.getClaims();
  if (!claims) redirect("/auth/login");
  const isAdmin = await checkAdminStatus(claims.sub);
  if (!isAdmin) redirect("/unauthorized");
  // Admin content
}
```

### Error Handling

- **ErrorBoundary** : `components/admin/ErrorBoundary.tsx` (105 lignes)
  - Usage : `<ErrorBoundary><Component /></ErrorBoundary>`
  - Custom fallback : `<ErrorBoundary fallback={(error, reset) => <Custom />}>`
  - Logs : `console.error("[ErrorBoundary] Caught error:", error)`

- **DAL Errors** : Throw errors, catch at boundary

```typescript
if (error) throw new Error(`Failed to fetch: ${error.message}`);
```

- **API Errors** : Return structured responses

```typescript
return NextResponse.json(
  { error: "Message", details: {...} },
  { status: HttpStatus.BAD_REQUEST }
);
```

### Testing Strategy

- **Scripts TypeScript** : `scripts/test-*.ts` (exécutés avec `pnpm exec tsx`)
- **Pattern** :

```typescript
interface TestResult {
  name: string;
  success: boolean;
  duration: number;
}

async function runTest(
  name: string,
  testFn: () => Promise<unknown>
): Promise<TestResult> {
  const start = Date.now();
  try {
    const data = await testFn();
    return { name, success: true, duration: Date.now() - start, data };
  } catch (error) {
    return {
      name,
      success: false,
      duration: Date.now() - start,
      error: error.message,
    };
  }
}
```

- **Scénarios testés** :
  - Fetch data (200 OK)
  - Validation Zod (input invalides → 400)
  - Not found (404)
  - Auth (401/403)
  - Server errors (500)
  - Parallel execution (performance)

### Performance

- **Parallel queries** : `Promise.all([query1, query2, ...])`
- **Caching** : React `cache()` pour DAL functions (à venir)
- **Suspense streaming** : `<Suspense fallback={<Skeleton />}>`
- **Revalidation** : `revalidatePath('/route')` après mutations

### Code Quality Metrics

- **Dashboard refactoring** :
  - admin/page.tsx : 133 → 69 lignes (-48%)
  - Tests : 4/4 passing (800ms fetch, 524ms validation)
  - Success criteria : 9/9 met

- **API /active refactoring** :
  - lib/dal/team.ts : 42 lignes → 4 helpers < 30 lignes each
  - Scripts de tests : 5 nouveaux fichiers
  - 0 TypeScript errors, 100% type safety

### Documentation

- **Instructions** : `.github/instructions/*.instructions.md` (24 fichiers)
  - Clean code, TypeScript, Next.js, Supabase, Security, Testing
- **Memory Bank** : `memory-bank/*.md`
  - activeContext.md (ce fichier)
  - systemPatterns.md (architecture)
  - techContext.md (stack)
  - progress.md (roadmap)
- **Copilot Instructions** : `.github/copilot-instructions.md`
  - Architectural knowledge
  - Coding patterns
  - Security rules

## Prochaines étapes (Phase 2 — Backoffice)

**Issues GitHub ouvertes (18 total)** :

**Priorité Haute** :

- Issue #3 : Partners Management (TASK023) - Prochaine tâche
- Issue #6 : Homepage Content Management (TASK026) - Haute priorité

**Back-office Tasks (Issues #1-20)** :

- ✅ #1 : TASK021 - Content Management CRUD (TERMINÉ 16 nov 2025)
- #3 : TASK023 - Partners Management
- #4 : TASK024 - Press Management
- #6 : TASK026 - Homepage Content Management
- #7 : TASK027 - Company Content Management
- #8 : TASK028 - Content Versioning UI
- #9 : TASK029 - Media Library
- #10 : TASK030 - Display Toggles
- #11 : TASK031 - Access Controls for Content
- #12 : TASK032 - Audit Log and Activity
- #13 : TASK033 - Bulk Import/Export
- #14 : TASK034 - Editorial Workflow
- #15 : TASK035 - UI Localization
- #16 : TASK036 - Notifications & Email Templates
- #17 : TASK037 - Data Retention & Purge
- #18 : TASK038 - Performance Optimisation
- #19 : TASK039 - Tests & QA
- #20 : TASK040 - Documentation

**Issues Fermées Récemment** :

- ✅ Issue #5 : TASK025 - RLS Security & Performance Fixes (23 oct 2025)
- ✅ Issue #24 : TASK025B - Security Audit Campaign (26 oct 2025 - fermée 15 nov 2025)
- ✅ Issue #26 : TASK026B - Database Functions Compliance (15 nov 2025)
- ✅ Issue #27 : TASK027B - SECURITY DEFINER Rationale Headers (fermée 15 nov 2025)
- ✅ Issue #28 : TASK028B - Cleanup Obsolete Scripts (26 oct 2025 - fermée 15 nov 2025)

1. **Gestion d'équipe** :
   - ✅ Hard-delete endpoint (fait)
   - ✅ Active/inactive toggle (fait)
   - ✅ Database functions compliance (TASK026B - fait)
   - TODO : UI React pour CRUD membres
   - TODO : Upload photos membres (Supabase Storage)

2. **Gestion spectacles** :
   - TODO : CRUD spectacles (titre, description, dates)
   - TODO : Relations spectacles ↔ membres (rôles)
   - TODO : Upload médias spectacles

3. **Gestion événements** :
   - TODO : CRUD événements (dates, lieux, statuts)
   - TODO : Relations événements ↔ spectacles

4. **Dashboard admin** :
   - ✅ Stats cards (fait)
   - TODO : Graphiques activité (Chart.js / Recharts)
   - TODO : Logs récents

5. **Testing & CI/CD** :
   - ✅ Scripts TypeScript pour endpoints (fait)
   - TODO : Playwright E2E tests
   - TODO : GitHub Actions CI (lint + tests)

6. **Performance** :
   - TODO : React cache() sur DAL functions
   - TODO : Image optimization (next/image)
   - TODO : Bundle analysis (next-bundle-analyzer)

## Notes techniques importantes

### Next.js 15 Breaking Changes

- **cookies() et headers()** : doivent être awaited

```typescript
const cookieStore = await cookies(); // Next.js 15
const headersList = await headers(); // Next.js 15
```

- **Route groups** : organisation recommandée

```bash
app/
  (admin)/
    layout.tsx        # Admin layout
    admin/page.tsx    # /admin
  (marketing)/
    layout.tsx        # Public layout
    page.tsx          # /
```

### Supabase Auth Optimized

- **getClaims()** : ~2-5ms (JWT local verification)
- **getUser()** : ~300ms (network call)
- **Règle** : Use getClaims() for auth checks, getUser() only when need full user data

### TypeScript Strict Mode

- **No `any`** : Use `unknown` for external data
- **Type guards** : `if (error instanceof Error)`, `isUniqueViolation(error)`
- **Zod validation** : Runtime type safety at boundaries

### Security Layers

1. **API-level** : `withAdminAuth()` wrapper
2. **DB-level** : RLS policies avec `is_admin()`
3. **Input validation** : Zod schemas
4. **Output sanitization** : Minimal DTOs, no sensitive data

### Git Workflow

- **Branche actuelle** : `feature/backoffice`
- **Commits récents** :
  - 61e9e6c : Hard-delete endpoint
  - c9a9ee7 : API /active refactoring
  - 6a2c7d8 : Route groups migration

---

**Dernière mise à jour** : 2025-11-16  
**Responsable** : YanBerdin  
**Statut** : TASK021 terminé, commits poussés, documentation mise à jour
