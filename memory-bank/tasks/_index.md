# Tasks Index

## Completed

- `TASK001` Commit & annotate revoke migrations
- `TASK002` Adapt CI audit to allow known restored GRANTs
- `TASK003` Create CI gate for REVOKE detection
- `TASK004` Add README for allowlist
- `TASK005` Add runtime allowlist entries

# Index des Tâches

## En Cours

- `TASK046` Rate-limiting handlers contact/newsletter (middleware ou inside handler)
- `TASK047` Extraire `NewsletterSubscriptionSchema` vers `lib/schemas/newsletter.ts`

## En Attente

- `TASK005` Optimisation SEO et meta-tags dynamiques
- `TASK007` Tests automatisés et monitoring
- `TASK008` Configuration des redirections vers billetterie externe
- `TASK009` Gestion des partenaires et mécènes
- `TASK010` Mise en place des toggles d'affichage dans le back-office
- `TASK015` Stratégie seeds cloud (sécurisée) + synchronisation
- `TASK016` Option: modélisation `partners.type` si requis par le design
- `TASK017` Retrait des délais artificiels (1200-1500ms) des containers

## Terminé

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
- `TASK024` Scripts admin email et documentation clés Supabase - Completed on 2025-10-13 (check-email-logs.ts, support dual format JWT/Simplified, 4 docs créés)
- `TASK025` Résolution problèmes sécurité et performance RLS - Completed on 2025-10-23 (3 issues résolus: Articles vides, SECURITY DEFINER views, Multiple permissive policies; 4 migrations créées; documentation exhaustive)
- `TASK025B` Campagne sécurité audit database complet - Completed on 2025-10-26 (73 objets sécurisés sur 17 rounds, Round 12 critique storage.objects ALL PRIVILEGES corrigé, CI PASSED, PR #25 merged, issues #26/#27/#28 créées, documentation SECURITY_AUDIT_SUMMARY.md) - Issue #24
- `TASK026B` Database Functions Compliance - Completed on 2025-11-15 (28/28 functions compliant, SET search_path applied via SQL Editor hotfix) - Issue #26
- `TASK027B` Security Definer Rationale Headers - Completed on 2025-11-15 (6 functions documented with explicit justification headers, template created, security checklist added) - Issue #27
- `TASK028B` Cleanup Obsolete Scripts - Completed on 2025-11-15 (3 audit scripts removed, already deleted on 26 oct 2025, documentation updated) - Issue #28
- `TASK021` Admin Backoffice Spectacles CRUD - Completed on 2025-11-16 (Phases 1+2+3: DAL + API Routes + Admin UI, RLS 42501 bug resolved, admin registration procedure documented, commit 96c32f3, pushed to GitHub) - Issue #1 CLOSED
- `TASK029` Admin User Invitation Flow - Completed on 2025-11-22 (RLS 42501 resolved with migration + DAL upsert, admin profile creation procedure documented, flow tested and working) - _Integrated in TASK032_
- `TASK030` Invitation Email Render Test + CI - Completed on 2025-11-22 (Standalone render test created and passing, CI workflow added for push/PR, email rendering validated) - _Integrated in TASK032_
- `TASK031` Project Architecture & Folder Blueprint v3 - Completed on 2025-11-22 (Generated using architecture-blueprint-generator.prompt.md, published in doc/architecture/ and memory-bank/architecture/, commit 8a34f8e, pushed to GitHub)
- `TASK032` Admin User Invitation System - Completed on 2025-11-23 (Complete end-to-end invitation system: DAL, email templates, UI, RLS policies, 404 fix, CI tests, production-ready) - Issue #12 CLOSED
- `TASK033` Admin Sidebar Updated - Completed on 2025-11-22 ("Utilisateurs" menu added with UserCog icon, links to /admin/users) - _Integrated in TASK032_
- `TASK026` Homepage Content Management - Completed on 2025-11-23, Refined on 2025-11-27 (Complete CRUD system: Hero Slides with DnD reordering, About Section editor, character counters, media picker, RLS policies, 27 components created, TypeScript/ESLint OK, production-ready) — **Clean Code Conformity applied**: Server Actions migration, UI schemas pattern, component split (<300 lines)
- `TASK034` DAL SOLID Refactoring - Completed on 2025-11-30 (92% SOLID compliance: 17/17 DAL with DALResult<T>, 0 revalidatePath in DAL, 0 email imports, 11 schemas centralized, DAL helpers created in lib/dal/helpers/, props colocated, Server Actions colocated, 4 architecture blueprints updated)
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
- `TASK036` Security Audit - Completed on 2026-01-03 (OWASP Top 10 audit 35%→100%: 4 audit scripts created (audit-cookie-flags.ts, audit-secrets-management.ts, test-cookie-security.ts, test-env-validation.ts with 4+4+3+6 tests), 3 documentation files (OWASP-AUDIT-RESULTS.md 8/10 controls, PRODUCTION-READINESS-CHECKLIST.md 85% ready, TASK036-SECURITY-AUDIT-SUMMARY.md executive summary), 6 security headers added to next.config.ts (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), subtasks 1.6/1.7/1.8/1.10 completed, dual testing approach (static + integration), T3 Env validation, secrets management audit, production readiness 85%, commit 79ea5b8)
