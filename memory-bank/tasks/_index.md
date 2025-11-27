# Tasks Index

## Completed

- `TASK001` Commit & annotate revoke migrations
- `TASK002` Adapt CI audit to allow known restored GRANTs
- `TASK003` Create CI gate for REVOKE detection
- `TASK004` Add README for allowlist
- `TASK005` Add runtime allowlist entries

# Index des Tâches

## En Cours

- `TASK004` Agenda des événements (DAL + containers + UI)
- `TASK014` Back‑office: centralisation et validation des toggles (Agenda/Accueil/Contact)

## En Attente

- `TASK005` Optimisation SEO et meta-tags dynamiques
- `TASK006` Médiathèque professionnelle (photos HD, vidéos)
- `TASK007` Tests automatisés et monitoring
- `TASK008` Configuration des redirections vers billetterie externe
- `TASK009` Gestion des partenaires et mécènes
- `TASK010` Mise en place des toggles d'affichage dans le back-office
- `TASK015` Stratégie seeds cloud (sécurisée) + synchronisation
- `TASK016` Option: modélisation `partners.type` si requis par le design
- `TASK017` Retrait des délais artificiels (1200-1500ms) des containers
- `TASK018` Intégration système d'emailing (newsletter, contacts)

## Terminé

- `TASK000` Configuration initiale du projet - Completed on 2025-08-15
- `TASK001` Section Spectacles et Productions - Completed on 2025-10-01 (UI + DAL + archive toggle)
- `TASK011` Intégration `home_hero_slides` (fetch + rendu + fenêtre visibilité) - Completed on 2025-09-23
- `TASK012` Intégration UI des `compagnie_stats` (accueil/compagnie) - Completed on 2025-09-23
- `TASK013` Écriture et exécution des scripts de seed (valeurs, stats, sections, hero) - Completed on 2025-09-23
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
