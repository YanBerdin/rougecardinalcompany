# Tasks Index

## Completed

- `TASK086` Pipeline CI/CD E2E GitHub Actions — **CI vert en 10m 31s ✅** (2026-03-23) — `e2e.yml` 12 étapes, Supabase dynamique via `jq`, comptes idempotents, fix tilde vs /root — Rapport: `memory-bank/tasks/TASK086-ci-cd-pipeline-e2e.md`
- `TASK001` Commit & annotate revoke migrations
- `TASK002` Adapt CI audit to allow known restored GRANTs
- `TASK003` Create CI gate for REVOKE detection
- `TASK004` Add README for allowlist
- `TASK005` Add runtime allowlist entries
- `TASK079` Fix RLS Remaining Combined Policies (Batch 2) — 21 policies séparées en 42, migration `20260315000238`, 0 violations restantes

# Index des Tâches

## En Cours

**_(aucune tâche en cours)_**

## En Attente

- `TASK005` Optimisation SEO et meta-tags dynamiques
- `TASK007` Tests automatisés et monitoring
- `TASK008` Configuration des redirections vers billetterie externe
- `TASK009` Gestion des partenaires et mécènes - ✅ Merged into TASK023
- `TASK010` Mise en place des toggles d'affichage dans le back-office - ✅ Merged into TASK030
- `TASK015` Stratégie seeds cloud (sécurisée) + synchronisation
- `TASK016` Option: modélisation `partners.type` si requis par le design
- `TASK017` Retrait des délais artificiels (1200-1500ms) des containers
- `TASK054` LCP Optimization Phase 2 (CDN, BlurHash, srcset) - Optional improvements for <1000ms LCP
- `TASK056` Remplacer les données de seed par des fichiers valides - Low Priority (4 images manquantes dans Storage, thumbnails échouées)

## Terminé

- `TASK085` E2E Admin — Analytics (rôle admin) — **3/3 passent ✅** — Completed 2026-03-23 (ADM-ANALYTICS-001→003, strict mode fix (#main-content), Rapport: `doc/tests/E2E-ADMIN-ANALYTICS-TASK085-REPORT.md`)
- `TASK084` E2E Transversaux Erreurs & Performance — **7/7 passent ✅** — Completed 2026-03-22 (CROSS-ERR-001→003, CROSS-PERF-001→003, Server Actions abort pattern, warmup dev mode, Rapport: `doc/tests/E2E-ERRORS-PERFORMANCE-TASK084-REPORT.md`)
- `TASK038` Responsive Testing & Accessibilité — **16/16 passent ✅** — Completed 2026-03-21 (responsive 5 + a11y 7 + thème 3 + bonus 1, 7 bugs corrigés, Rapport: `doc/tests/E2E-CROSS-CUTTING-TASK038-REPORT.md`)
- `TASK083` E2E Admin CRUD Admin-only — **56/56 passent ✅ (0 fixme)** — Completed 2026-03-21 (7 sessions, 13 correctifs, Rapport: `doc/tests/E2E-ADMIN-CRUD-ADMIN-ONLY-TASK083-REPORT.md`)
- `TASK082` E2E Admin CRUD Éditorial — **51/51 passent ✅** — Completed 2026-03-20 (5 sessions, Rapports: `doc/tests/E2E-ADMIN-CRUD-EDITORIAL-TASK082-REPORT.md`, `doc/tests/audit-e2e-skipped-tests-TASK082.md`)
- `TASK078` Implémentation tests permissions et rôles — 239 cas — **UNIT : 42/42 ✅ + DAL : 80/80 ✅ + RLS : 114/114 ✅ + E2E : 23/23 ✅** — Completed 2026-03-17
- `TASK080` Fix 5 échecs RLS policies — résolus dans TASK078 (signInAs fix + db reset) — Completed 2026-03-16
- `TASK082C` Patch sécurité flatted 3.4.1→3.4.2 (Prototype Pollution CVE, Dependabot #38) — Completed 2026-03-19 (commit ce7ec9b, [fichier](tasks-completed/TASK082C-security-flatted-prototype-pollution.md))
- `TASK082B` Upgrade Next.js 16.1.5→16.1.7 (5 CVEs patchés) — Completed 2026-03-17 (PR #33, commit 5abf71f)
- `AUDIT-TRIGGER-FIX` Audit Trigger Bugfix (tg_op + auth.uid()) - Completed on 2026-02-11 (Two critical bugs fixed: tg_op case sensitivity causing record_id/new_values NULL + auth.uid() type mismatch causing user_id NULL; Migration 20260211005525 applied local + cloud via MCP; User validated: email now displays instead of "Système")
- `TASK057` Spectacle Landscape Photos Integration - Completed on 2026-02-01 (2 photos paysage par spectacle, BigInt fix TASK055 pattern, migrations cloud via MCP, DAL + Server Actions + API route, Admin UI avec MediaLibraryPicker, Public display dans SpectacleDetailView)
- `RLS-FIX-NEWSLETTER` Newsletter infinite recursion hotfix - Completed on 2026-01-06
- `RLS-FIX` RLS WITH CHECK vulnerabilities fix - Completed on 2026-01-06
- `TASK046` Rate-limiting handlers contact/newsletter - Completed on 2026-01-04
- `TASK000` Configuration initiale du projet - Completed on 2025-08-15
- `TASK001` Section Spectacles et Productions - Completed on 2025-10-01 (UI + DAL + archive toggle)
- `TASK011` Intégration `home_hero_slides` (fetch + rendu + fenêtre visibilité) - Completed on 2025-09-23
- `TASK012` Intégration UI des `compagnie_stats` (accueil/compagnie) - Completed on 2025-09-23
- `TASK013` Écriture et exécution des scripts de seed (valeurs, stats, sections, hero) - Completed on 2025-09-23
- `TASK014` Toggles centralisés (Agenda/Accueil/Contact newsletter) - ✅ Implemented via TASK030 on 2026-01-01 (10 display toggles, configurations_site table, admin UI, DAL site-config.ts)
- `TASK018` Intégration système d'emailing (newsletter, contacts) - Completed on 2025-12-13 (factorisation handlers, DAL idempotent, Server Actions)
- `TASK019` Fix spectacles archivés (public=true approach) - Completed on 2025-10-01
- `TASK020` Alignement UI press releases (flexbox pattern) - Completed on 2025-10-01
- `TASK020B` Documentation Docker (volumes, disk space, prune) - Completed on 2025-10-01
- `TASK020C` Documentation Supabase CLI (workflow déclaratif) - Completed on 2025-10-01
- `TASK022` Team Management (CRUD équipe + photos + rôles + ordre) - Completed on 2025-10-22 (Médiathèque fonctionnelle, Storage bucket déployé, Admin Dashboard, upload photos avec validation, TypeScript/ESLint OK)
- `TASK023` Nettoyage architecture auth et optimisation performance - Completed on 2025-10-13 (~400 lignes supprimées, getClaims 100x plus rapide, header réactif)
- `TASK024` Press Management - ✅ Completed on 2026-01-21 (3 modules: Communiqués de presse, Articles de presse, Contacts presse; 31 files created: 3 schemas, 3 DAL, 11 Server Actions, 10 routes, 13 components; PDF support migration; Tabs navigation; preview page; workflow brouillon/publié)
- `TASK024B` Scripts admin email et documentation clés Supabase - Completed on 2025-10-13 (check-email-logs.ts, support dual format JWT/Simplified, 4 docs créés)
- `TASK025` Résolution problèmes sécurité et performance RLS - Completed on 2025-10-23 (3 issues résolus: Articles vides, SECURITY DEFINER views, Multiple permissive policies; 4 migrations créées; documentation exhaustive)
- `TASK025B` Campagne sécurité audit database complet - Completed on 2025-10-26 (73 objets sécurisés sur 17 rounds, Round 12 critique storage.objects ALL PRIVILEGES corrigé, CI PASSED, PR #25 merged, issues #26/#27/#28 créées, documentation SECURITY_AUDIT_SUMMARY.md) - Issue #24
- `TASK026B` Database Functions Compliance - Completed on 2025-11-15 (28/28 functions compliant, SET search_path applied via SQL Editor hotfix) - Issue #26
- `TASK027B` Security Definer Rationale Headers - Completed on 2025-11-15 (6 functions documented with explicit justification headers, template created, security checklist added) - Issue #27
- `TASK028B` Cleanup Obsolete Scripts - Completed on 2025-11-15 (3 audit scripts removed, already deleted on 26 oct 2025, documentation updated) - Issue #28
- `TASK021` Admin Backoffice Spectacles CRUD - Completed on 2025-11-16 (Phases 1+2+3: DAL + API Routes + Admin UI, RLS 42501 bug resolved, admin registration procedure documented, commit 96c32f3, pushed to GitHub) - Issue #1 CLOSED- `TASK033` Audit Logs Viewer Interface - Completed on 2026-01-03 (Interface admin complète : rétention 90j, résolution email, filtres avancés, export CSV paginé, UI responsive + skeleton, synchronisation filtres via URL) - Issue #13- `TASK029` Admin User Invitation Flow - Completed on 2025-11-22 (RLS 42501 resolved with migration + DAL upsert, admin profile creation procedure documented, flow tested and working) - _Integrated in TASK032_
- `TASK030` Invitation Email Render Test + CI - Completed on 2025-11-22 (Standalone render test created and passing, CI workflow added for push/PR, email rendering validated) - _Integrated in TASK032_
- `TASK031` Project Architecture & Folder Blueprint v3 - Completed on 2025-11-22 (Generated using architecture-blueprint-generator.prompt.md, published in doc/architecture/ and memory-bank/architecture/, commit 8a34f8e, pushed to GitHub)
- `TASK032` Admin User Invitation System - Completed on 2025-11-23 (Complete end-to-end invitation system: DAL, email templates, UI, RLS policies, 404 fix, CI tests, production-ready) - Issue #12 CLOSED
- `TASK033` Admin Sidebar Updated - Completed on 2025-11-22 ("Utilisateurs" menu added with UserCog icon, links to /admin/users) - _Integrated in TASK032_
- `TASK026` Homepage Content Management - Completed on 2025-11-23, Refined on 2025-11-27 (Complete CRUD system: Hero Slides with DnD reordering, About Section editor, character counters, media picker, RLS policies, 27 components created, TypeScript/ESLint OK, production-ready) — **Clean Code Conformity applied**: Server Actions migration, UI schemas pattern, component split (<300 lines)
- `TASK034` DAL SOLID Refactoring - Completed on 2025-11-30 (92% SOLID compliance: 17/17 DAL with DALResult<T>, 0 revalidatePath in DAL, 0 email imports, 11 schemas centralized, DAL helpers created in lib/dal/helpers/, props colocated, Server Actions colocated, 4 architecture blueprints updated)
- `TASK027` Company Content Management - ✅ Completed on 2026-01-25 (Edit company values, stats, presentation sections with admin interface)
- `TASK028` Content Versioning UI - ✅ Completed on 2026-01-25 (View history, compare versions, restore content with versioning interface)
- `TASK034` Performance Optimization - ✅ Completed on 2026-01-16 (All 8 phases implemented: removed artificial delays (5-8s gain), SELECT * → explicit columns (30-50% bandwidth), ISR on public pages (revalidate=60), partial index spectacles.slug (20% improvement), Presse streaming with Suspense (TTI improved), bundle analyzer installed, revalidateTag + unstable_cache (granular invalidation), React cache() wrapper on 21 DAL functions (request-scoped memoization); test-all-dal-functions.ts documentation script created)
- `TASK035` Testing Suite - ✅ Completed on 2026-01-25 (Unit, integration and E2E tests for admin flows with comprehensive coverage)
- `TASK041` Team CRUD Migration to Server Actions - Completed on 2025-12-02 (Migration inline form → pages dédiées /admin/team/new et /admin/team/\[id]/edit, suppression 3 API Routes obsolètes, refactoring react-hook-form + zodResolver, ajout optionalUrlSchema + sanitizePayload, 3 bugs corrigés, documentation architecture mise à jour)
- `TASK042` Next.js 16 Migration - Completed on 2025-12-02 (Upgrade 15.4.5 → 16.0.6 via @next/codemod, middleware.ts → proxy.ts rename, 6 pages with dynamic='force-dynamic' for Supabase cookies, CVE-2025-57822 SSRF fixed, CVE-2025-64718 js-yaml fixed with pnpm override, 0 audit vulnerabilities, Turbopack default)
- `TASK043` Hero Slides Clean Code Refactoring - Completed on 2025-12-06 (lib/constants/hero-slides.ts created, 4 hooks extracted to lib/hooks/, CtaFieldGroup DRY component, HeroSlideForm 232→117 lines, HeroSlideFormFields 237→127 lines, HeroSlidesView 315→241 lines, all files <300 lines, no magic numbers, blueprints updated to v5.2/v2.2)
- `TASK044B` Contact/Newsletter Handler Factorization - Completed on 2025-12-13 (lib/actions/contact-server.ts + newsletter-server.ts créés, lib/dal/newsletter-subscriber.ts avec gestion idempotente, Server Actions pour progressive enhancement, routes API simplifiées, blueprints v5 mis à jour)
- `TASK045B` Next.js Security Update 16.0.10 - Completed on 2025-12-13 (Upgrade 16.0.7 → 16.0.10, 10/10 Dependabot alerts fixed, commit 8a8c37c)
- `TASK044` ImageFieldGroup v2 - Completed on 2025-12-13 (Composant réutilisable MediaLibraryPicker + validateImageUrl + alt text, validation SSRF intégrée, DRY pour tous formulaires admin)
- `TASK045` Validation publique + Upload générique - Completed on 2025-12-13 (uploadMediaImage générique, deleteMediaImage, ActionResult<T> types, progressive validation spectacles, Clear URL button)
- `TASK048` T3 Env Implementation - Completed on 2025-12-20 (Type-safe environment variables with @t3-oss/env-nextjs, validation runtime Zod, removal hasEnvVars pattern, 12 files migrated, 2 commits created, TypeScript/Build PASS)
- `TASK030` Display Toggles Epic Alignment - Completed on 2026-01-01 (10 toggles across 5 categories, Phase 11 Presse fix: split into Media Kit + Press Releases, migration 20260101220000, component fixes, utility scripts, commit b27059f)
- `TASK029` Media Library Complete Implementation - Completed on 2025-12-29, Finalized on 2025-12-30, **Thumbnails Fix on 2026-01-30** (7 phases: Foundation (duplicate SHA-256), Tags & Folders (hierarchical), Bulk Operations (move/tag/delete), Rate Limiting (10/min), Thumbnails (Sharp 300x300), Animations (reduced-motion), Accessibility (WCAG 2.1 AA), Usage Tracking (7 tables, bulk optimization); **Storage/Folders Sync**: auto-assign folder_id via getFolderIdFromPath(), 9 base folders seeded, "Uploads génériques" UX, dynamic stats; **Thumbnail Backfill**: 3 bugs fixed in media-actions.ts (HTTP check, type conversion, T3 Env), 4 utility scripts created (check/regenerate local/remote), 7/11 thumbnails regenerated successfully in production, 4 documentation files; 3 tables created, 6 migrations, 4 DAL modules (3500+ lines), 8 UI components, 15 RLS policies, 8 bugs resolved, branch feat-MediaLibrary pushed)
- `TASK049` Database Security - RLS & SECURITY INVOKER Fixes - Completed on 2025-12-31 (2 migrations: fix RLS policies active filter + enforce SECURITY INVOKER on 11 views, 13/13 security tests passed, 7 obsolete docs deleted, 3 obsolete migrations removed, complete documentation in doc/SUPABASE-VIEW-SECURITY/, schémas déclaratifs synchronisés, commit 35daa55)
- `TASK036` Security Audit - ✅ 100% Complete on 2026-01-03 (OWASP Top 10 audit 35%→100%: ALL 10 subtasks completed across 4 phases - Database Security (1.1-1.3), Dependencies & Auth (1.4-1.5), Security Controls (1.6-1.9), Production Readiness (1.10); 4 audit scripts created, 3 documentation files, 6 security headers added to next.config.ts, 10/10 acceptance criteria met, production readiness 85%, commit 79ea5b8)
- `TASK037` Admin Views Security Hardening - ✅ Complete on 2026-01-05 (Fixed empty array vulnerability: created admin_views_owner role, transferred ownership of 7 admin views, updated 5 declarative schemas, migration 20260105120000 applied to local + cloud, 3 validation scripts created/updated, 13/13 security tests passed, comprehensive documentation, production ready)
- `RLS-FIX` RLS WITH CHECK (true) Vulnerabilities - ✅ Complete on 2026-01-06 (Fixed 4 public tables: newsletter email validation + anti-duplicate, contact RGPD consent + fields, audit logs SECURITY DEFINER trigger, analytics event/entity type whitelists; bug event_date fixed; migration 20260106190617 applied local + cloud; 13/13 tests passed)
- `TASK051` Error Monitoring & Alerting (P0) - ✅ Complete on 2026-01-14 (4 phases: Sentry Integration (DSN + 4 config files + Supabase integration), Error Boundaries (3 levels + error.tsx), Alert Configuration (P0/P1 rules + email notifications tested <2min), Incident Response (runbook + severity levels); SENTRY_AUTH_TOKEN configured in GitHub secrets; production-ready)
- `TASK050` Database Backup & Recovery Strategy (P0) - ✅ Complete on 2026-01-14 (4 components: backup-database.ts script with pg_dump + gzip compression, Storage bucket 'backups' with RLS policies, GitHub Actions weekly workflow (Sunday 3:00 AM UTC), PITR restoration runbook; Connection pooler port 6543 configuration, Node.js 18+ Buffer compatibility, rotation keeps 4 backups; migration 20260114152153, workflow tested successfully, 3 GitHub secrets configured, production-ready)
- `TASK031` Analytics Dashboard - ✅ Complete on 2026-01-17 (8 steps implemented: shadcn Chart component, analytics_summary_90d view, Zod schemas (12+), DAL with 5 cached functions, Sentry API integration (14d limit), Dashboard UI (6 sub-components), CSV/JSON export Server Actions, sidebar navigation; date filters 7/30/90 days, production-ready)
- `TASK047` Newsletter Schema Extraction - ✅ Complete on 2026-01-17 (Extracted NewsletterSubscriptionSchema from contact.ts to dedicated newsletter.ts file, updated barrel exports, 3 commits: create/refactor/cleanup, TypeScript + build + schema validation tests passed, ~25 min execution time)
- `TASK053` Data Retention Automation - ✅ Complete on 2026-01-18 (Automated RGPD-compliant data retention: 3 SQL schemas (21_tables, 22_functions, 41_views), DAL with 12 functions, 8 Zod schemas, Edge Function scheduled-cleanup (first in project), migration 20260117234007 (698 lines), 8/8 tests passed, 5 tables configured (logs_audit 90d, abonnes_newsletter 90d, messages_contact 365d, analytics_events 90d, data_retention_audit 365d), RGPD documentation complete)
- `TASK053-P1` LCP Optimization Phase 1 - ✅ Complete on 2026-01-21 (Hero image optimization: background-image CSS → next/image with priority/fetchPriority/eager, removed manual preload (handled by next/image), LCP improved from ~3200ms (dev) to ~1650ms (prod) = -48%, TTFB improved from 298ms to 46-61ms = -80%, CLS maintained at 0.00)
\n- `TASK055` Admin Agenda Management - ✅ Complete on 2026-01-26 (Phase 1: Events CRUD - 8 DAL functions, dedicated pages, spectacle/lieu selects, date/time handling; Phase 2: Lieux CRUD - 5 DAL functions, dedicated pages, combobox integration; **BigInt Serialization Fix**: ActionResult simplified {success only}, EventDataTransport pattern (string IDs), strict type separation Server (bigint) vs UI (number), project-wide pattern established for all CRUD with bigint IDs; 38 files created/modified, 2128+ lines added, SOLID compliance maintained)
- `TASK061` Spectacles Additional Paragraphs - ✅ Complete on 2026-02-02 (3 phases: PHASE0 SpectacleForm refactoring 578→233 lines (Clean Code), PHASE1 Backend (schema, Zod, DAL, views, forms), PHASE2 Migration Database; **Features**: +2 text fields paragraph_2/paragraph_3 for enriched content, visual flow Desc→Photo1→P2→Photo2→P3, optional fields no max length, security_invoker bug corrected on 4 views, migration 20260202200333 applied local+cloud; 15 sub-tasks completed, 3 sub-components created, 6 backend files modified, 2 frontend files extended, 113-line migration, TypeScript 0 errors, SOLID compliance maintained)
- `TASK062` Upload Pipeline Security Hardening - ✅ Complete on 2026-02-18 (Audit 3 points: magic bytes MIME verification via `verifyFileMime()` (lib/utils/mime-verify.ts), taille max 10MB, sanitisation filename `sanitizeFilename()` path traversal + whitelist chars + 100 chars; Format expansion: GIF + SVG + PDF ajoutés (7 types MIME total); incohérence corrigée: AVIF ajouté dans validate-image-url.ts; types TypeScript: AllowedUploadMimeType/AllowedDocumentMimeType/isAllowedUploadMimeType; UI MediaUploadDialog mise à jour; commit 3a64cdb, 14 files changed, 0 TypeScript errors)
- `TASK031-FIX` Analytics Code Quality + Bugfixes — ✅ Completed on 2026-02-27 (7 corrections planifiées : import ReactNode, suppression cn local, clé stable composite, handleExport(format) factorisé, useTransition, aria-hidden icônes, role="img" graphique + suppression import mort ; 2 bugfixes non planifiés : export JSON client-side (commit d71163b, sérialisation RSC défaillante avec Date), DAL uniqueVisitors=0 (user_id→session_id dans 3 fonctions) ; infrastructure tracking : PageViewTracker + trackPageView Server Action + migration RLS 20260227210418)
- `TASK063` Media Admin Audit Violations Fix — ✅ Completed on 2026-02-28 (12-step refactoring of components/features/admin/media/: formatFileSize DRY, MediaFolderFormDialog+MediaTagFormDialog, BulkTagSelector+TagActionBadge, aria-required+aria-label, constants.ts, MediaDetailsPanel→details/ split, ImageFieldGroup→image-field/ split, MediaCard→Thumbnail+Footer, useMediaLibraryState hook, index.ts barrel; 2 React Hooks lint bugs fixed (conditional useCallback→async, setState in useEffect→derived state), BulkDeleteDialog extracted (324→267 lines); 28 files changed, 2342 insertions, 1455 deletions, 0 lint errors, build compiled successfully; branch refactor/media-admin-audit-violations, commit 5db3b25)
- `TASK033-FIX` Audit Logs Code Quality Violations — ✅ Completed on 2026-02-26 (7 corrections sur 6 fichiers : util `parseAuditLogFilters()`, suppression fake loading 800ms + 2×setTimeout 500ms, accessibilité clavier WCAG 2.2 SC 2.1.1, `?? {}` remplace non-null assertions, clés sémantiques skeleton ; fix 2 scripts test : T3 Env → dotenv/config, RPC → requête directe `logs_audit` ; +3 scripts npm ; branche fix/audit-logs-violations, 4 commits, lint 0 erreurs)
- `TASK065` Admin Press Audit Violations Fix — ✅ Completed on 2026-02-28 (14 étapes, 12 violations (3 P0, 6 P1, 3 P2) corrigées, 23 fichiers ; split actions.ts→3 fichiers, DAL cache()+dalSuccess/dalError+codes erreur, ActionResult<T> conditionnel, formatDateFr, RawPressReleaseRow interface ; score ~75%→≥95% ; branche fix/admin-press-audit-violations, commit 1ff52a3)
- `TASK064` Admin Partners Audit Fix — ✅ Completed on 2026-02-28 (18 étapes : 16 violations corrigées (2 CRITIQUES, 6 HAUTES, 4 MOYENNES, 4 BASSES) + 3 post-fix (hydration DndContext, Image sizes, CSP Google Fonts + scroll-behavior) ; DAL refactoring complet (mapToPartnerDTO, dalSuccess/dalError, cache(), .parseAsync(), <30 lignes/fn), SortablePartnerCard extrait (427→228 lignes), types.ts colocalisé, cast Resolver supprimé, import "server-only", script test 6/6 ; branche fix/admin-partners-audit-violations)
- `AUDIT-SPECTACLES` Admin Spectacles Audit Remediation — ✅ Completed on 2026-03-01 (13 étapes, 15 violations : SEC-01/02 requireAdmin() actions+pages, NEXT-01 dynamic/revalidate, CLEAN-01 8 console.log supprimés, CLEAN-02a split spectacle-photo-actions.ts, CLEAN-02b SortableGalleryCard extrait, UX-01 AlertDialog remplace confirm(), TS-01 prop inutilisée, DRY-01 formatSpectacleDetailDate, ARCH-01 types.ts colocalisé 9 interfaces, CLEAN-04 STATUS 12→3, ARCH-02 .ts→.tsx JSX natif, CLEAN-05+PERF-01 useWatch+toast inliné ; 19 fichiers, pnpm lint 0 erreurs, tsc 0 erreurs, commit f2c6059 branche fix/admin-spectacles-audit-remediation)
- `AUDIT-SITE-CONFIG` Audit conformité admin/site-config — ✅ Completed on 2026-03-01 (8 violations corrigées (1 CRITIQUE, 2 HAUTES, 3 MOYENNES, 2 BASSES) ; console.log supprimé, ToggleSection.tsx extrait (DRY), 4 useEffect→1, getPathsForToggle 10/10, SECTION_NAMES 10/10, types retour explicites, WCAG aria-labelledby+contextuel ; 6 fichiers modifiés + 1 créé)
- `TASK066-audit-admin-team-violations` Admin Team Audit Violations Fix — Completed on 2026-03-01 (13 violations corrigées, ~84%→~95%, plan-fixAdminTeamAuditViolations.prompt.md, 9/10 étapes, pnpm build ✅ pnpm lint ✅ — 4 déviations du plan documentées dans TASK066-audit-admin-team-violations.md)
- `TASK067` Audit conformité admin/users feature + scripts — ✅ Completed on 2026-03-02 (13 violations feature corrigées ~60%→~95%, 6 sous-composants extraits View 548→191 lignes, types.ts+InviteUserSchema partagés ; 8 scripts audités (20 violations mineures), 6 scripts ajoutés à package.json ; branche fix/admin-team-audit-violations)
- `TASK068` Audit conformité public/agenda + Composition Patterns — Completed on 2026-03-02 (17 violations corrigées, monolithe 285L→5 compound components, 14→3 props, hooks.ts code mort supprimé, DAL import fix, branche refactor/public-agenda-composition-patterns)
- `TASK069` Audit conformité public/compagnie - Completed on 2026-03-02 (17 violations corrigées : monolithe 242L→49L SECTION_RENDERERS map, 6 composants section, WCAG 2.2 AA, force-dynamic, fallback DAL, 0 cast `as unknown as`. Branche `refactor/public-compagnie-audit-violations`)
- `TASK070` Admin Compagnie CRUD — Completed on 2026-03-03 (Page tabulée `/admin/compagnie` Présentation+Valeurs, Stats→Home, 3 DAL + 3 Actions + 14 composants, 5 migrations, bug Zod `.partial()+.default()` corrigé, commit `8455837` branche `feat/task070-admin-compagnie`)
- `TASK071` Audit conformité public/contact — Completed on 2026-03-03 (12 violations corrigées : monolithe 495L→58L, 4 composants extraits, rate limiting OWASP 5/15min, WCAG 2.2 AA complet, dead code supprimé, bug NewsletterCard fix, TypeScript strict ActionResult+type guards, tsc 0 erreurs. Branche `docs/task071-contact-audit-memory-bank`)
- `TASK072` Audit conformité public/home — Completed on 2026-03-03 (7 étapes, 6 sous-modules, 17 violations : 5 hooks.ts dead code purgés, 4 monolithes splittés, carousel a11y WCAG complet, NewsletterContext zéro prop drilling, withDisplayToggle RSC helper, SRP Hero↔Partners, fix cascading AgendaNewsletter. 22 modifiés, 6 supprimés, 14 créés, net -983L. Branche `refactor/task072-audit-home-public-site`)
- `BUGFIX-HOME-NEWS` Section "À la Une" articles_presse + liens /presse — Completed on 2026-03-03 (DAL corrigé : `communiques_presse` → `articles_presse`, suppression filtre 30j ; liens `/actualites` → `/presse`/`source_url` ; 5 fichiers, commit `1344ae5`, branche `fix/home-news-articles-presse`)
- `TASK074` Audit Feature public-site/spectacles — Completed on 2026-03-04 (16 violations : 2 CRITICAL (force-dynamic/revalidate, console.log DAL), 7 MAJOR (next/image, dead code hooks.ts, buildMediaPublicUrl, formatDate/Duration, SpectacleCTABar, HTML nesting, mapping sémantique), 4 MINOR, 2 SUGGESTIONS + pipeline ticket_url evenements→DAL→CTA (hors scope initial) ; 27 fichiers, +1422/-509 lignes, build/lint ✅ ; branche `refactor/task074-audit-public-spectacles`, commit `ba6dd70`)
- `TASK075` Refactoring Media Admin — Completed on 2026-03-05 (4 phases : bug fixes (AlertDialog manquants folders+tags, fantôme availableTags, useEffect deps) + MediaLibraryContext/Provider (9 props éliminées) + MediaDetailsContext/Provider (8+ props éliminées) + ImageField compound component (4 booleans → API composable, 10 consommateurs migrés, ImageFieldGroup.tsx supprimé) ; 36 fichiers, +1542/-636L, build/lint/tsc ✅ ; branche `refactor/task075-media-admin-composition-patterns`, commit `55f21ce`)
- `TASK075` Refactoring Media Admin : React Composition Patterns - Completed on 2026-03-05 (4 phases: bug fixes AlertDialog + MediaLibraryContext + MediaDetailsContext + ImageField compound; 36 fichiers +1542/-636L, commit 55f21ce, branch refactor/task075-media-admin-composition-patterns)
- `BUGFIX-PRESS-SELECT` DAL press select options fix — Completed on 2026-03-07 (8 corrections colonnes/filtres/ordre/labels dans admin-press-select-options.ts, join spectacles(title) pour événements label "Spectacle — date", commit a307ae3)
- `BUGFIX-RLS-DISPLAY-TOGGLES` RLS display_toggle visibility fix — Completed on 2026-03-07 (Policy SELECT configurations_site corrigée : ajout `key like 'display_toggle_%'` + GRANT SELECT anon/authenticated, 2 migrations 20260304000000+20260304010000, schéma déclaratif synchronisé, commit 16e545d)
- `TASK037A` Audit Accessibilité Site Public - ✅ Completed on 2026-03-08 (2C+6M+11M — ShowCard overlay focus-within, emojis ContactPresseSection role=img, carousel WCAG, focus management, liens HTML valides ; fixes intégrés dans TASK072/TASK074)
- `TASK037B` Audit Accessibilité Modules Admin - ✅ Completed on 2026-03-08 (3C+8M+10M tous corrigés — skip-link + main#main-content, breadcrumb factice, aria-label 4 champs recherche, tailles boutons 44px, role=alert ×5, AlertDialog, DialogDescription, aria-describedby forms Presse, aria-labels contextuels CRUD+Dashboard, aria-hidden icônes, aria-live loading+upload ; branche feat/task037b-a11y-admin-fixes)
- `TASK076` Editor Role Permissions + Trigger Extension — migration complète (15 phases 2026-03-11 + extension triggers 9 tables 2026-03-13). Auth model: `user < editor < admin`. New `has_min_role()` SQL, `roles.ts` TS guards, all DAL/actions/pages/sidebar/middleware migrated. `is-admin.ts` deprecated. Migration `20260313120000` : triggers `trg_audit`/`trg_update_updated_at` sur 9 tables manquantes.
- `TASK077` Fix Violation MIG-005 (Batch 1 — 13 tables) — Séparation des 13 policies RLS `to anon, authenticated` en policies distinctes par rôle. 4 fichiers schema modifiés (60, 61, 62, 08). Migration manuelle `20260315001500` (13 drops + 26 creates + 1 rename). Testée db reset. TASK079 créée pour les 21 violations restantes.

---

## Archives — `tasks-completed/`

Fichiers de détail archivés dans le dossier `memory-bank/tasks/tasks-completed/`.

### Divers / Résolutions ponctuelles

- [RESOLVED_db_reconstruction_2025-11-18.md](tasks-completed/RESOLVED_db_reconstruction_2025-11-18.md) — Reconstruction BDD locale 2025-11-18
- [_archived_TASK025-communications-dashboard.md](tasks-completed/_archived_TASK025-communications-dashboard.md) — Dashboard communications (abandonné)

### TASK007 – Memory Bank

- [TASK007-update-memory-bank.md](tasks-completed/TASK007-update-memory-bank.md)

### TASK011–TASK014 – Intégrations initiales

- [TASK011-integration-home-hero-slides.md](tasks-completed/TASK011-integration-home-hero-slides.md)
- [TASK012-integration-ui-compagnie-stats.md](tasks-completed/TASK012-integration-ui-compagnie-stats.md)
- [TASK013-seeds-nouvelles-tables.md](tasks-completed/TASK013-seeds-nouvelles-tables.md)
- [TASK014-backoffice-toggles-centralises.md](tasks-completed/TASK014-backoffice-toggles-centralises.md)

### TASK019–TASK021 – Spectacles & premiers CRUDs

- [TASK019-fix-spectacles-archives.md](tasks-completed/TASK019-fix-spectacles-archives.md)
- [TASK020-alignement-ui-presse.md](tasks-completed/TASK020-alignement-ui-presse.md)
- [TASK021-admin-backoffice-spectacles.md](tasks-completed/TASK021-admin-backoffice-spectacles.md)
- [TASK021-admin-spectacles-crud.md](tasks-completed/TASK021-admin-spectacles-crud.md)
- [TASK021-content-management-crud.md](tasks-completed/TASK021-content-management-crud.md)
- [TASK021-documentation-docker.md](tasks-completed/TASK021-documentation-docker.md)
- [TASK021B-documentation-supabase-cli.md](tasks-completed/TASK021B-documentation-supabase-cli.md)
- [TASK021C-auth-cleanup-and-optimization.md](tasks-completed/TASK021C-auth-cleanup-and-optimization.md)

### TASK022–TASK024 – Team, Partenaires & Presse

- [TASK022-team-management.md](tasks-completed/TASK022-team-management.md)
- [TASK022-implementation-summary.md](tasks-completed/TASK022-implementation-summary.md)
- [TASK022-REVIEW.md](tasks-completed/TASK022-REVIEW.md)
- [TASK023-partners-management.md](tasks-completed/TASK023-partners-management.md)
- [TASK024-press-management.md](tasks-completed/TASK024-press-management.md)
- [TASK024-press-management-summary.md](tasks-completed/TASK024-press-management-summary.md)
- [TASK024B-admin-email-scripts.md](tasks-completed/TASK024B-admin-email-scripts.md)

### TASK025–TASK028 – Sécurité & Conformité DB

- [TASK025-rls-security-performance-fixes.md](tasks-completed/TASK025-rls-security-performance-fixes.md)
- [TASK025B-security-audit-campaign.md](tasks-completed/TASK025B-security-audit-campaign.md)
- [TASK026-homepage-content-management.md](tasks-completed/TASK026-homepage-content-management.md)
- [TASK026-COMPLIANCE-FIXES.md](tasks-completed/TASK026-COMPLIANCE-FIXES.md)
- [TASK026-FINAL-STATUS.md](tasks-completed/TASK026-FINAL-STATUS.md)
- [TASK026B-db-functions-compliance.md](tasks-completed/TASK026B-db-functions-compliance.md)
- [TASK026B-cloud-fix-procedure.md](tasks-completed/TASK026B-cloud-fix-procedure.md)
- [TASK027-company-content-management.md](tasks-completed/TASK027-company-content-management.md)
- [TASK027B-security-definer-rationale.md](tasks-completed/TASK027B-security-definer-rationale.md)
- [TASK028-content-versioning-ui.md](tasks-completed/TASK028-content-versioning-ui.md)
- [TASK028B-cleanup-obsolete-scripts.md](tasks-completed/TASK028B-cleanup-obsolete-scripts.md)

### TASK029–TASK034 – Médiathèque, Toggles, Analytics, Invitations

- [TASK029-media-library.md](tasks-completed/TASK029-media-library.md)
- [TASK030-display-toggles.md](tasks-completed/TASK030-display-toggles.md)
- [TASK031-analytics-dashboard.md](tasks-completed/TASK031-analytics-dashboard.md)
- [TASK032-user-role-management.md](tasks-completed/TASK032-user-role-management.md)
- [TASK032-user-role-management-FINAL.md](tasks-completed/TASK032-user-role-management-FINAL.md)
- [TASK033-audit-logs-viewer.md](tasks-completed/TASK033-audit-logs-viewer.md)
- [TASK033-AUDIT-LOGS-IMPLEMENTATION-SUMMARY.md](tasks-completed/TASK033-AUDIT-LOGS-IMPLEMENTATION-SUMMARY.md)
- [TASK034-performance-optimization.md](tasks-completed/TASK034-performance-optimization.md)

### TASK036–TASK037 – Audit Sécurité & Accessibilité

- [TASK036-security-audit.md](tasks-completed/TASK036-security-audit.md)
- [TASK036-OWASP-AUDIT-RESULTS.md](tasks-completed/TASK036-OWASP-AUDIT-RESULTS.md)
- [TASK036-SECURITY-AUDIT-SUMMARY.md](tasks-completed/TASK036-SECURITY-AUDIT-SUMMARY.md)
- [TASK036-PRODUCTION-READINESS-CHECKLIST.md](tasks-completed/TASK036-PRODUCTION-READINESS-CHECKLIST.md)
- [TASK037-admin-views-security-hardening.md](tasks-completed/TASK037-admin-views-security-hardening.md)
- [TASK037-ADMIN-VIEWS-SECURITY-HARDENING-SUMMARY.md](tasks-completed/TASK037-ADMIN-VIEWS-SECURITY-HARDENING-SUMMARY.md)
- [TASK037-accessibility-compliance.md](tasks-completed/TASK037-accessibility-compliance.md)
- [TASK037A-AUDIT-A11Y-PUBLIC-SITE.md](tasks-completed/TASK037A-AUDIT-A11Y-PUBLIC-SITE.md)
- [TASK037B-AUDIT-A11Y-ADMIN.md](tasks-completed/TASK037B-AUDIT-A11Y-ADMIN.md)

### TASK046–TASK053 – Rate Limiting, T3 Env, DB Backup, Rétention

- [TASK046-rate-limiting-handlers.md](tasks-completed/TASK046-rate-limiting-handlers.md)
- [TASK046-RATE-LIMITING.md](tasks-completed/TASK046-RATE-LIMITING.md)
- [TASK046-RATE-LIMITING-TESTING.md](tasks-completed/TASK046-RATE-LIMITING-TESTING.md)
- [TASK047-newsletter-schema-extraction.md](tasks-completed/TASK047-newsletter-schema-extraction.md)
- [TASK048-t3-env-implementation.md](tasks-completed/TASK048-t3-env-implementation.md)
- [TASK049-database-security-rls-security-invoker.md](tasks-completed/TASK049-database-security-rls-security-invoker.md)
- [TASK050-database-backup-recovery.md](tasks-completed/TASK050-database-backup-recovery.md)
- [TASK050_RUNBOOK_PITR_restore.md](tasks-completed/TASK050_RUNBOOK_PITR_restore.md)
- [TASK051-error-monitoring-alerting.md](tasks-completed/TASK051-error-monitoring-alerting.md)
- [TASK053-data-retention-automation.md](tasks-completed/TASK053-data-retention-automation.md)

### TASK055–TASK062 – Agenda, Photos Spectacles, Sécurité Upload

- [TASK055-admin-agenda-management.md](tasks-completed/TASK055-admin-agenda-management.md)
- [TASK055-bigint-fix.md](tasks-completed/TASK055-bigint-fix.md)
- [TASK057-spectacle-landscape-photos.md](tasks-completed/TASK057-spectacle-landscape-photos.md)
- [TASK061-spectacle-additional-paragraphs.md](tasks-completed/TASK061-spectacle-additional-paragraphs.md)
- [TASK062-upload-security-hardening.md](tasks-completed/TASK062-upload-security-hardening.md)

### TASK063–TASK075 – Audits de conformité & Composition Patterns

- [TASK063-media-admin-audit-violations.md](tasks-completed/TASK063-media-admin-audit-violations.md)
- [TASK064-admin-partners-audit-fix.md](tasks-completed/TASK064-admin-partners-audit-fix.md)
- [TASK065-admin-press-audit-violations.md](tasks-completed/TASK065-admin-press-audit-violations.md)
- [TASK066-audit-admin-team-violations.md](tasks-completed/TASK066-audit-admin-team-violations.md)
- [TASK067-audit-admin-users-feature.md](tasks-completed/TASK067-audit-admin-users-feature.md)
- [TASK068-audit-public-agenda-composition.md](tasks-completed/TASK068-audit-public-agenda-composition.md)
- [TASK069-audit-public-compagnie.md](tasks-completed/TASK069-audit-public-compagnie.md)
- [TASK070-adminCompagnie.md](tasks-completed/TASK070-adminCompagnie.md)
- [TASK071-audit-public-contact.md](tasks-completed/TASK071-audit-public-contact.md)
- [TASK072-audit-home-public-site.md](tasks-completed/TASK072-audit-home-public-site.md)
- [TASK073-audit-public-presse.md](tasks-completed/TASK073-audit-public-presse.md)
- [TASK074-audit-public-spectacles.md](tasks-completed/TASK074-audit-public-spectacles.md)
- [TASK074-audit-public-spectacles-v1.md](tasks-completed/TASK074-audit-public-spectacles-v1.md)
- [TASK075-audit-admin-media.md](tasks-completed/TASK075-audit-admin-media.md)

### TASK076–TASK082 – Rôles Éditeur, RLS, Tests Permissions

- [TASK076-editor-role-permissions.md](tasks-completed/TASK076-editor-role-permissions.md)
- [TASK077-fix-declarative-schema-Violation.md](tasks-completed/TASK077-fix-declarative-schema-Violation.md)
- [TASK078-implement-permissions-tests.md](tasks-completed/TASK078-implement-permissions-tests.md)
- [TASK079-fix-rls-remaining-combined-policies.md](tasks-completed/TASK079-fix-rls-remaining-combined-policies.md)
- [TASK080-fix-rls-policy-failures.md](tasks-completed/TASK080-fix-rls-policy-failures.md)
- [TASK081-e2e-authentication.md](tasks-completed/TASK081-e2e-authentication.md)
- [TASK082B-security-nextjs-upgrade.md](tasks-completed/TASK082B-security-nextjs-upgrade.md)
- [TASK082C-security-flatted-prototype-pollution.md](tasks-completed/TASK082C-security-flatted-prototype-pollution.md)
