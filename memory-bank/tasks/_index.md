# Tasks Index

## Completed

- `TASK001` Commit & annotate revoke migrations
- `TASK002` Adapt CI audit to allow known restored GRANTs
- `TASK003` Create CI gate for REVOKE detection
- `TASK004` Add README for allowlist
- `TASK005` Add runtime allowlist entries

# Index des Tâches

## En Cours

> _(aucune tâche en cours)_

## En Attente

- `TASK055` Admin Agenda Management - CRUD événements, lieux, intégration spectacles (P0-P2)
- `TASK005` Optimisation SEO et meta-tags dynamiques
- `TASK007` Tests automatisés et monitoring
- `TASK008` Configuration des redirections vers billetterie externe
- `TASK009` Gestion des partenaires et mécènes - ✅ Merged into TASK023
- `TASK010` Mise en place des toggles d'affichage dans le back-office
- `TASK015` Stratégie seeds cloud (sécurisée) + synchronisation
- `TASK016` Option: modélisation `partners.type` si requis par le design
- `TASK017` Retrait des délais artificiels (1200-1500ms) des containers
- `TASK054` LCP Optimization Phase 2 (CDN, BlurHash, srcset) - Optional improvements for <1000ms LCP

## Terminé

- `RLS-FIX-NEWSLETTER` Newsletter infinite recursion hotfix - Completed on 2026-01-06
- `RLS-FIX` RLS WITH CHECK vulnerabilities fix - Completed on 2026-01-06
- `TASK046` Rate-limiting handlers contact/newsletter - Completed on 2026-01-04
- `TASK000` Configuration initiale du projet - Completed on 2025-08-15
- `TASK001` Section Spectacles et Productions - Completed on 2025-10-01 (UI + DAL + archive toggle)
- `TASK011` Intégration `home_hero_slides` (fetch + rendu + fenêtre visibilité) - Completed on 2025-09-23
- `TASK012` Intégration UI des `compagnie_stats` (accueil/compagnie) - Completed on 2025-09-23
- `TASK013` Écriture et exécution des scripts de seed (valeurs, stats, sections, hero) - Completed on 2025-09-23
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
- `TASK029` Media Library Complete Implementation - Completed on 2025-12-29, Finalized on 2025-12-30 (7 phases: Foundation (duplicate SHA-256), Tags & Folders (hierarchical), Bulk Operations (move/tag/delete), Rate Limiting (10/min), Thumbnails (Sharp 300x300), Animations (reduced-motion), Accessibility (WCAG 2.1 AA), Usage Tracking (7 tables, bulk optimization); **Storage/Folders Sync**: auto-assign folder_id via getFolderIdFromPath(), 9 base folders seeded, "Uploads génériques" UX, dynamic stats; 3 tables created, 6 migrations, 4 DAL modules (3500+ lines), 8 UI components, 15 RLS policies, 8 bugs resolved, branch feat-MediaLibrary pushed)
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
