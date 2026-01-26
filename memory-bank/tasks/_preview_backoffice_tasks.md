# Aperçu — Tâches Back‑office (Milestones 2–4)

Ce fichier est une prévisualisation consolidée des 20 tâches générées à partir de l'épic `14.7-back‑office`.

| id      | titre                       |  statut |     ajouté | mis à jour | description courte                                       | fichier                                                    | issue |
| ------- | --------------------------- | ------: | ---------: | ---------: | -------------------------------------------------------- | ---------------------------------------------------------- |
| TASK021 | Content Management CRUD     | In Progress | 2025-10-16 | 2025-11-15 | CRUD for shows, events, articles                         | `memory-bank/tasks/TASK021-content-management-crud.md`     | #1 CLOSED |
| TASK022 | Team Management             | Completed | 2025-10-16 | 2025-10-22 | CRUD for team members with photos and roles              | `memory-bank/tasks/TASK022-team-management.md`             | - |
| TASK023 | Partners Management         | Completed | 2025-10-16 | 2026-01-19 | CRUD for partners with logos, drag-and-drop, Media Library | `memory-bank/tasks/TASK023-partners-management.md`         | #3 CLOSED |
| TASK024 | Press Management            | Completed | 2025-10-16 | 2026-01-21 | 3 modules: Communiqués, Articles, Contacts presse | `memory-bank/tasks/tasks-completed/TASK024-press-management.md`            | #4 CLOSED |
| TASK025 | RLS Security & Performance Fixes | Completed  | 2025-10-22 | 2025-10-23 | Fix RLS policies, SECURITY INVOKER views, performance optimization (~40% gain) | `memory-bank/tasks/TASK025-rls-security-performance-fixes.md` | #5 CLOSED |
| TASK025B | Database Security Audit Campaign | Completed | 2025-10-26 | 2025-10-26 | Complete database security audit (73 objects secured, Round 17 CI passed) | `memory-bank/tasks/completed-tasks/TASK025B-security-audit-campaign.md` | Issue #24 CLOSED |
| TASK026 | Homepage Content Management | Pending | 2025-10-16 | 2025-11-15 | Edit hero slides, about section, news highlights         | `memory-bank/tasks/TASK026-homepage-content-management.md` | #6 |
| TASK026B | Database Functions Compliance | Completed | 2025-10-26 | 2025-11-15 | 28/28 functions with SET search_path (applied via SQL Editor hotfix) | `memory-bank/tasks/completed-tasks/TASK026B-db-functions-compliance.md` | #26 CLOSED |
| TASK027 | Company Content Management  | Completed | 2025-10-16 | 2026-01-25 | Edit company values, stats, presentation sections        | `memory-bank/tasks/tasks-completed/TASK027-company-content-management.md`  | #7 CLOSED |
| TASK027B | Security Definer Rationale | Completed | 2025-10-26 | 2025-11-15 | Require explicit SECURITY DEFINER rationale in function headers | `memory-bank/tasks/tasks-completed/TASK027B-security-definer-rationale.md` | Issue #27 CLOSED |
| TASK028 | Content Versioning UI       | Completed | 2025-10-16 | 2026-01-25 | View history, compare versions, restore                  | `memory-bank/tasks/tasks-completed/TASK028-content-versioning-ui.md`       | #8 CLOSED |
| TASK028B | Cleanup Obsolete Scripts | Completed | 2025-10-26 | 2025-11-15 | Propose deletion of obsolescent audit scripts (Round7 artifacts) | `memory-bank/tasks/tasks-completed/TASK028B-cleanup-obsolete-scripts.md` | Issue #28 CLOSED |
| TASK029 | Media Library               | Completed | 2025-10-16 | 2025-12-29 | Upload, organize, tag and manage media files             | `memory-bank/tasks/TASK029-media-library.md`               | #9 (OPEN) |
| TASK030 | Display Toggles             | Completed | 2025-10-16 | 2026-01-01 | 10 toggles (5 categories), Phase 11 Presse fix (2 toggles) | `memory-bank/tasks/TASK030-display-toggles.md`             | #10 (OPEN) |
| TASK031 | Analytics Dashboard         | Completed | 2025-10-16 | 2026-01-17 | Admin dashboard: metrics, charts, Sentry, CSV/JSON export | `memory-bank/tasks/TASK031-analytics-dashboard.md`         | #11 |
| TASK032 | Admin User Invitation System | Completed | 2025-10-16 | 2025-11-23 | Complete end-to-end invitation system with emails, DAL, RLS, UI, 404 fix | `memory-bank/tasks/completed-tasks/TASK032-user-role-management-FINAL.md` | #12 CLOSED |
| TASK033 | Audit Logs Viewer Interface | Completed | 2025-10-16 | 2026-01-03 | Complete audit logs interface: 90d retention, email resolution, 5 filters, CSV export (10k paginated), responsive UI, URL-based state | `memory-bank/tasks/TASK033-audit-logs-viewer.md` | #13 OPEN |
| TASK034 | Performance Optimization    | Completed | 2025-10-16 | 2026-01-16 | 8 phases: artificial delays removal, explicit SELECT, ISR, indexes, Suspense, cache() | `memory-bank/tasks/tasks-completed/TASK034-performance-optimization.md`    | #14 CLOSED |
| TASK035 | Testing Suite               | Completed | 2025-10-16 | 2026-01-25 | Unit, integration and E2E tests for admin flows          | `memory-bank/tasks/tasks-completed/TASK035-testing-suite.md`               | #15 CLOSED |
| TASK036 | Security Audit              | Completed | 2025-10-16 | 2026-01-03 | OWASP Top 10 audit (8/10), 4 scripts, 3 docs, 85% production ready | `memory-bank/tasks/tasks-completed/TASK036-security-audit.md`              | #16 CLOSED |
| TASK037 | Admin Views Security Hardening | Completed | 2025-10-16 | 2026-01-03 | Admin views isolation, GRANT revokes, security audits | `memory-bank/tasks/tasks-completed/TASK037-admin-views-security-hardening.md` | #17 CLOSED |
| TASK038 | Responsive Testing          | Pending | 2025-10-16 | 2025-10-16 | Cross-device and cross-browser validation                | `memory-bank/tasks/TASK038-responsive-testing.md`          | #18 |
| TASK039 | Production Deployment       | Pending | 2025-10-16 | 2025-10-16 | CI/CD, env setup, monitoring, migrations                 | `memory-bank/tasks/TASK039-production-deployment.md`       | #19 |
| TASK040 | Documentation               | Pending | 2025-10-16 | 2025-10-16 | Admin guides, technical docs and runbooks                | `memory-bank/tasks/TASK040-documentation.md`               | #20 |
| TASK046 | Rate-limiting handlers contact/newsletter | Completed | 2025-12-13 | 2026-01-04 | Add rate-limiting to public handlers to prevent abuse (contact/newsletter) | `memory-bank/tasks/completed-tasks/TASK046-rate-limiting-handlers.md` | - |
| TASK047 | Newsletter Schema Extraction | Completed | 2025-12-13 | 2026-01-17 | Extract NewsletterSubscriptionSchema to dedicated file | `memory-bank/tasks/tasks-completed/TASK047-newsletter-schema-extraction.md` | - |
| TASK050 | Database Backup & Recovery Strategy | Completed | 2026-01-14 | 2026-01-14 | Weekly automated database backups with pg_dump, Storage upload, rotation, PITR runbook | `memory-bank/tasks/TASK050-database-backup-recovery.md` | - |
| TASK051 | Error Monitoring & Alerting | Completed | 2025-10-16 | 2026-01-14 | Sentry integration, error boundaries, P0/P1 alerts, incident response runbook | `memory-bank/tasks/TASK051-error-monitoring-alerting.md` | - |
| TASK053 | Data Retention Automation | Completed | 2026-01-17 | 2026-01-18 | RGPD compliance: 4 migrations, Edge Function, pg_cron daily 2AM UTC, 5 tables configured | `memory-bank/tasks/tasks-completed/TASK053-data-retention-automation.md` | - |
| TASK048 | T3 Env Implementation | Completed | 2025-12-20 | 2025-12-20 | Type-safe environment variables with Zod validation | `memory-bank/tasks/tasks-completed/TASK048-t3-env-implementation.md` | - |
| TASK049 | Database Security RLS SECURITY INVOKER | Completed | 2025-12-31 | 2025-12-31 | 11 public views enforced with SECURITY INVOKER, GRANT permissions fixed | `memory-bank/tasks/tasks-completed/TASK049-database-security-rls-security-invoker.md` | - |
| TASK055 | Admin Agenda Management | Completed | 2026-01-26 | 2026-01-26 | Phase 1 Events + Phase 2 Lieux CRUD, BigInt serialization fix pattern | `memory-bank/tasks/tasks-completed/TASK055-admin-agenda-management.md` | - |

---

Fichier CSV : `memory-bank/tasks/_preview_backoffice_tasks.csv`
