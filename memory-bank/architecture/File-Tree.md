# File Tree: rougecardinalcompany

**Last Updated**: 02/10/2025, 03:00:00 PM  
**Root path**: `/home/yandev/projets/rougecardinalcompany`

## 📋 Changements Récents (Octobre 2025)

- ✅ **doc/** : Ajout dossier `SQL-schema-Compliancy-report/` avec 2 rapports de conformité
  - `declarative-schema-compliance-report.md` (100% conforme)
  - `postgres-sql-style-compliance-report.md` (100% conforme)
- ✅ **supabase/migrations/** : 13 fichiers (suppression de `20250921112000_add_home_about_content.sql`)

```bash
Generated on: 10/8/2025, 8:52:05 PM
Root path: `/home/yandev/projets/rougecardinalcompany`

├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 .github/
│   ├── 📁 instructions/
│   ├── 📁 workflows/
│   └── 📝 copilot-instructions.md
├── 📁 .next/ 🚫 (auto-hidden)
├── 📁 .vscode/ 🚫 (auto-hidden)
├── 📁 app
│   ├── 📁 admin
│   │   ├── 📁 team
│   │   │   ├── 📄 actions.ts
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 agenda
│   │   └── 📄 page.tsx
│   ├── 📁 api
│   │   ├── 📁 admin
│   │   │   └── 📁 team
│   │   │       ├── 📁 [id]
│   │   │       │   ├── 📁 active
│   │   │       │   │   └── 📄 route.ts
│   │   │       │   └── 📁 hard-delete
│   │   │       │       └── 📄 route.ts
│   │   │       └── 📄 route.ts
│   │   ├── 📁 contact
│   │   │   └── 📄 route.ts
│   │   ├── 📁 newsletter
│   │   │   └── 📄 route.ts
│   │   ├── 📁 test-email
│   │   │   └── 📄 route.ts
│   │   └── 📁 webhooks
│   │       └── 📁 resend
│   │           └── 📄 route.ts
│   ├── 📁 auth
│   │   ├── 📁 confirm
│   │   │   └── 📄 route.ts
│   │   ├── 📁 error
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 forgot-password
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 login
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 logout
│   │   ├── 📁 sign-up
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 sign-up-success
│   │   │   └── 📄 page.tsx
│   │   └── 📁 update-password
│   │       └── 📄 page.tsx
│   ├── 📁 compagnie
│   │   └── 📄 page.tsx
│   ├── 📁 contact
│   │   └── 📄 page.tsx
│   ├── 📁 presse
│   │   ├── 📄 metadata.ts
│   │   └── 📄 page.tsx
│   ├── 📁 protected
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 spectacles
│   │   └── 📄 page.tsx
│   ├── 📁 test-connection
│   │   └── 📄 page.tsx
│   ├── 📄 favicon.ico
│   ├── 📄 global.d.ts
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   ├── 🖼️ opengraph-image.png
│   ├── 📄 page.tsx
│   └── 🖼️ twitter-image.png
├── 📁 components
│   ├── 📁 features
│   │   ├── 📁 admin
│   │   │   └── 📁 team
│   │   │       ├── 📄 MediaPickerDialog.tsx
│   │   │       ├── 📄 TeamManagementContainer.tsx
│   │   │       ├── 📄 TeamMemberCard.tsx
│   │   │       ├── 📄 TeamMemberForm.tsx
│   │   │       └── 📄 TeamMemberList.tsx
│   │   └── 📁 public-site
│   │       ├── 📁 agenda
│   │       │   ├── 📄 AgendaClientContainer.tsx
│   │       │   ├── 📄 AgendaContainer.tsx
│   │       │   ├── 📄 AgendaView.tsx
│   │       │   ├── 📄 hooks.ts
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 types.ts
│   │       ├── 📁 compagnie
│   │       │   ├── 📁 data
│   │       │   │   └── 📄 presentation.ts
│   │       │   ├── 📄 CompagnieContainer.tsx
│   │       │   ├── 📄 CompagnieView.tsx
│   │       │   ├── 📝 MAPPING.md
│   │       │   ├── 📄 hooks.ts
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 types.ts
│   │       ├── 📁 contact
│   │       │   ├── 📄 ContactPageContainer.tsx
│   │       │   ├── 📄 ContactPageView.tsx
│   │       │   ├── 📄 ContactServerGate.tsx
│   │       │   ├── 📄 actions.ts
│   │       │   ├── 📄 contact-hooks.ts
│   │       │   └── 📄 contact-types.ts
│   │       ├── 📁 home
│   │       │   ├── 📁 about
│   │       │   │   ├── 📄 AboutContainer.tsx
│   │       │   │   ├── 📄 AboutView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 hero
│   │       │   │   ├── 📄 HeroClient.tsx
│   │       │   │   ├── 📄 HeroContainer.tsx
│   │       │   │   ├── 📄 HeroView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 news
│   │       │   │   ├── 📄 NewsContainer.tsx
│   │       │   │   ├── 📄 NewsView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 newsletter
│   │       │   │   ├── 📄 NewsletterClientContainer.tsx
│   │       │   │   ├── 📄 NewsletterContainer.tsx
│   │       │   │   ├── 📄 NewsletterView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 partners
│   │       │   │   ├── 📄 PartnersContainer.tsx
│   │       │   │   ├── 📄 PartnersView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 shows
│   │       │   │   ├── 📄 ShowsContainer.tsx
│   │       │   │   ├── 📄 ShowsView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 types.ts
│   │       ├── 📁 presse
│   │       │   ├── 📄 PresseContainer.tsx
│   │       │   ├── 📄 PresseServerGate.tsx
│   │       │   ├── 📄 PresseView.tsx
│   │       │   ├── 📄 hooks.ts
│   │       │   └── 📄 types.ts
│   │       └── 📁 spectacles
│   │           ├── 📄 SpectaclesContainer.tsx
│   │           ├── 📄 SpectaclesView.tsx
│   │           ├── 📄 hooks.ts
│   │           ├── 📄 index.ts
│   │           └── 📄 types.ts
│   ├── 📁 layout
│   │   ├── 📄 footer.tsx
│   │   └── 📄 header.tsx
│   ├── 📁 skeletons
│   │   ├── 📄 about-skeleton.tsx
│   │   ├── 📄 agenda-skeleton.tsx
│   │   ├── 📄 compagnie-skeleton.tsx
│   │   ├── 📄 contact-skeleton.tsx
│   │   ├── 📄 hero-skeleton.tsx
│   │   ├── 📄 news-skeleton.tsx
│   │   ├── 📄 newsletter-skeleton.tsx
│   │   ├── 📄 partners-skeleton.tsx
│   │   ├── 📄 presse-skeleton.tsx
│   │   ├── 📄 shows-skeleton.tsx
│   │   └── 📄 spectacles-skeleton.tsx
│   ├── 📁 tutorial
│   │   ├── 📄 code-block.tsx
│   │   ├── 📄 connect-supabase-steps.tsx
│   │   ├── 📄 fetch-data-steps.tsx
│   │   ├── 📄 sign-up-user-steps.tsx
│   │   └── 📄 tutorial-step.tsx
│   ├── 📁 ui
│   │   ├── 📄 alert.tsx
│   │   ├── 📄 avatar.tsx
│   │   ├── 📄 badge.tsx
│   │   ├── 📄 button.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 checkbox.tsx
│   │   ├── 📄 dialog.tsx
│   │   ├── 📄 dropdown-menu.tsx
│   │   ├── 📄 form.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 label.tsx
│   │   ├── 📄 select.tsx
│   │   ├── 📄 skeleton.tsx
│   │   ├── 📄 sonner.tsx
│   │   ├── 📄 switch.tsx
│   │   ├── 📄 tabs.tsx
│   │   └── 📄 textarea.tsx
│   ├── 📄 auth-button.tsx
│   ├── 📄 deploy-button.tsx
│   ├── 📄 env-var-warning.tsx
│   ├── 📄 forgot-password-form.tsx
│   ├── 📄 login-form.tsx
│   ├── 📄 logout-button.tsx
│   ├── 📄 sign-up-form.tsx
│   ├── 📄 theme-switcher.tsx
│   └── 📄 update-password-form.tsx
├── 📁 deprecated
│   └── 📁 types
│       └── 📄 database.types.legacy.ts
├── 📁 doc
│   ├── 📁 SQL-schema-Compliancy-report
│   ├── 📁 copilot
│   ├── 📁 linting
│   ├── 📁 resend_integration
│   │   ├── 📁 newsletter-resend
│   └── 📁 security
├── 📁 emails
│   ├── 📁 utils
│   │   ├── 📄 components.utils.tsx
│   │   └── 📄 email-layout.tsx
│   ├── 📄 contact-message-notification.tsx
│   └── 📄 newsletter-confirmation.tsx
├── 📁 lib
│   ├── 📁 auth
│   │   └── 📄 is-admin.ts
│   ├── 📁 dal
│   │   ├── 📄 agenda.ts
│   │   ├── 📄 compagnie-presentation.ts
│   │   ├── 📄 compagnie.ts
│   │   ├── 📄 contact.ts
│   │   ├── 📄 home-about.ts
│   │   ├── 📄 home-hero.ts
│   │   ├── 📄 home-news.ts
│   │   ├── 📄 home-newsletter.ts
│   │   ├── 📄 home-partners.ts
│   │   ├── 📄 home-shows.ts
│   │   ├── 📄 presse.ts
│   │   ├── 📄 spectacles.ts
│   │   └── 📄 team.ts
│   ├── 📁 email
│   │   ├── 📄 actions.ts
│   │   └── 📄 schemas.ts
│   ├── 📁 hooks
│   │   ├── 📄 useContactForm.ts
│   │   └── 📄 useNewsletterSubscribe.ts
│   ├── 📁 plugins
│   │   └── 📄 touch-hitbox-plugin.js
│   ├── 📁 schemas
│   │   └── 📄 team.ts
│   ├── 📄 database.types.ts
│   ├── 📄 resend.ts
│   ├── 📄 site-config.ts
│   └── 📄 utils.ts
├── 📁 memory-bank
│   ├── 📁 architecture
│   │   ├── 📝 Email_Service_Architecture.md
│   │   ├── 📝 File-Tree.md
│   │   ├── 📝 Project_Architecture_Blueprint.md
│   │   ├── 📝 Project_Architecture_Blueprint_v2.md
│   │   ├── 📝 Project_Folders_Structure_Blueprint.md
│   │   └── 📝 Project_Folders_Structure_Blueprint_v2.md
│   ├── 📁 epics
│   │   ├── 📁 details
│   │   │   ├── 📝 14.1-page-accueil(Home).md
│   │   │   ├── 📝 14.2-page-presentation-companie.md
│   │   │   ├── 📝 14.3-page-spectacles-(événements).md
│   │   │   ├── 📝 14.4-page-agenda.md
│   │   │   ├── 📝 14.5-page-presse.md
│   │   │   ├── 📝 14.6-contact-newsletter.md
│   │   │   └── 📝 14.7-back‑office.md
│   │   └── ⚙️ epics-map.yaml
│   ├── 📁 tasks
│   │   ├── 📝 TASK011-integration-home-hero-slides.md
│   │   ├── 📝 TASK012-integration-ui-compagnie-stats.md
│   │   ├── 📝 TASK013-seeds-nouvelles-tables.md
│   │   ├── 📝 TASK014-backoffice-toggles-centralises.md
│   │   ├── 📝 TASK019-fix-spectacles-archives.md
│   │   ├── 📝 TASK020-alignement-ui-presse.md
│   │   ├── 📝 TASK021-content-management-crud.md
│   │   ├── 📝 TASK021-documentation-docker.md
│   │   ├── 📝 TASK021B-documentation-supabase-cli.md
│   │   ├── 📝 TASK021C-auth-cleanup-and-optimization.md
│   │   ├── 📝 TASK022-REVIEW.md
│   │   ├── 📝 TASK022-implementation-summary.md
│   │   ├── 📝 TASK022-team-management-instructions.md
│   │   ├── 📝 TASK022-team-management.md
│   │   ├── 📝 TASK023-partners-management.md
│   │   ├── 📝 TASK024-admin-email-scripts.md
│   │   ├── 📝 TASK024-press-management.md
│   │   ├── 📝 TASK025-rls-security-performance-fixes.md
│   │   ├── 📝 TASK026-homepage-content-management.md
│   │   ├── 📝 TASK027-company-content-management.md
│   │   ├── 📝 TASK028-content-versioning-ui.md
│   │   ├── 📝 TASK029-media-library.md
│   │   ├── 📝 TASK030-display-toggles.md
│   │   ├── 📝 TASK031-analytics-dashboard.md
│   │   ├── 📝 TASK032-user-role-management.md
│   │   ├── 📝 TASK033-audit-logs-viewer.md
│   │   ├── 📝 TASK034-performance-optimization.md
│   │   ├── 📝 TASK035-testing-suite.md
│   │   ├── 📝 TASK036-security-audit.md
│   │   ├── 📝 TASK037-accessibility-compliance.md
│   │   ├── 📝 TASK038-responsive-testing.md
│   │   ├── 📝 TASK039-production-deployment.md
│   │   ├── 📝 TASK040-documentation.md
│   │   ├── 📝 _archived_TASK025-communications-dashboard.md
│   │   ├── 📝 _index.md
│   │   ├── 📝 _issues_preview.md
│   │   ├── 📄 _preview_backoffice_tasks.csv
│   │   └── 📝 _preview_backoffice_tasks.md
│   ├── 📝 Memory-Bank-Update-Session-2025-10-13.md
│   ├── 📝 activeContext.md
│   ├── 📝 productContext.md
│   ├── 📝 progress.md
│   ├── 📝 projectbrief.md
│   ├── 📝 systemPatterns.md
│   └── 📝 techContext.md
├── 📁 prompts-github
│   ├── 📝 architecture-blueprint-generator.prompt.md
│   ├── 📝 conventional-commit.prompt.md
│   ├── 📝 copilot-instructions-blueprint-generator.prompt.md
│   ├── 📝 copilot-thought-logging.instructions.md
│   └── 📝 folder-structure-blueprint-generator.prompt.md
├── 📁 public
│   └── 🖼️ logo-florian.png
├── 📁 scripts
│   ├── 📁 Test_fetchMediaArticles
│   │   ├── 📝 README.md
│   │   ├── 📄 apply-migration-articles-view.ts
│   │   ├── 📄 check-chapo-excerpt.ts
│   │   ├── 📄 check-rls-policies.ts
│   │   ├── 📄 test-chapo-and-excerpt-separate.ts
│   │   ├── 📄 test-dal-pattern.ts
│   │   ├── 📄 test-public-view.ts
│   │   ├── 📄 test-rls-articles copy.ts
│   │   └── 📄 test-rls-articles.ts
│   ├── 📝 README.md
│   ├── 📄 check-email-logs.ts
│   ├── 📄 create_issues.sh
│   ├── 📄 test-email-integration.ts
│   ├── 📄 test-fetch-media-articles.ts
│   ├── 📄 test-views-security-invoker.ts
│   ├── 📄 test-webhooks.ts
│   └── 📄 verify-view-security-invoker.ts
├── 📁 supabase
│   ├── 📁 .branches
│   │   └── 📄 _current_branch
│   ├── 📁 .temp/ 🚫 (auto-hidden)
│   ├── 📁 migrations
│   │   ├── 📄 20250918000000_fix_spectacles_versioning_trigger.sql
│   │   ├── 📄 20250918031500_seed_home_hero_slides.sql
│   │   ├── 📄 20250918094530_seed_core_content.sql
│   │   ├── 📄 20250918095610_seed_compagnie_values.sql
│   │   ├── 📄 20250918101020_seed_events_press_articles.sql
│   │   ├── 📄 20250918102240_seed_team_and_presentation.sql
│   │   ├── 📄 20250921110000_seed_compagnie_presentation_sections.sql
│   │   ├── 📄 20250921112900_add_home_about_content.sql
│   │   ├── 📄 20250921113000_seed_home_about_content.sql
│   │   ├── 📄 20250926153000_seed_spectacles.sql
│   │   ├── 📄 20250930120000_seed_lieux.sql
│   │   ├── 📄 20250930121000_seed_categories_tags.sql
│   │   ├── 📄 20250930122000_seed_configurations_site.sql
│   │   ├── 📄 20251002120000_seed_communiques_presse_et_media_kit.sql
│   │   ├── 📄 20251021000001_create_articles_presse_public_view.sql
│   │   ├── 📄 20251022000001_create_medias_storage_bucket.sql
│   │   ├── 📄 20251022120000_fix_articles_presse_public_security_invoker.sql
│   │   ├── 📄 20251022140000_grant_select_articles_presse_anon.sql
│   │   ├── 📄 20251022150000_apply_articles_presse_rls_policies.sql
│   │   ├── 📄 20251022160000_fix_all_views_security_invoker.sql
│   │   ├── 📄 20251022170000_optimize_articles_presse_rls_policies.sql
│   │   ├── 📝 migrations.md
│   │   └── 📄 sync_existing_profiles.sql
│   ├── 📁 schemas
│   │   ├── 📄 01_extensions.sql
│   │   ├── 📄 02_table_profiles.sql
│   │   ├── 📄 02b_functions_core.sql
│   │   ├── 📄 02c_storage_buckets.sql
│   │   ├── 📄 03_table_medias.sql
│   │   ├── 📄 04_table_membres_equipe.sql
│   │   ├── 📄 05_table_lieux.sql
│   │   ├── 📄 06_table_spectacles.sql
│   │   ├── 📄 07_table_evenements.sql
│   │   ├── 📄 07b_table_compagnie_content.sql
│   │   ├── 📄 07c_table_compagnie_presentation.sql
│   │   ├── 📄 07d_table_home_hero.sql
│   │   ├── 📄 07e_table_home_about.sql
│   │   ├── 📄 08_table_articles_presse.sql
│   │   ├── 📄 08b_communiques_presse.sql
│   │   ├── 📄 09_table_partners.sql
│   │   ├── 📄 10_tables_system.sql
│   │   ├── 📄 11_tables_relations.sql
│   │   ├── 📄 12_evenements_recurrence.sql
│   │   ├── 📄 13_analytics_events.sql
│   │   ├── 📄 14_categories_tags.sql
│   │   ├── 📄 15_content_versioning.sql
│   │   ├── 📄 16_seo_metadata.sql
│   │   ├── 📄 20_functions_core.sql
│   │   ├── 📄 21_functions_auth_sync.sql
│   │   ├── 📄 30_triggers.sql
│   │   ├── 📄 40_indexes.sql
│   │   ├── 📄 41_views_admin_content_versions.sql
│   │   ├── 📄 41_views_communiques.sql
│   │   ├── 📄 50_constraints.sql
│   │   ├── 📄 60_rls_profiles.sql
│   │   ├── 📄 61_rls_main_tables.sql
│   │   ├── 📄 62_rls_advanced_tables.sql
│   │   └── 📝 README.md
│   ├── 📄 client.ts
│   ├── 📄 middleware.ts
│   └── 📄 server.ts
├── 📁 types
│   ├── 📄 database.types.ts
│   └── 📄 email.d.ts
├── 🔒 .env 🚫 (auto-hidden)
├── 📄 .env.example
├── 📄 .env.local 🚫 (auto-hidden)
├── 🚫 .gitignore
├── 📄 .markdownlint.jsonc
├── 📖 README.md
├── 📝 TESTING_RESEND.md
├── ⚙️ components.json
├── 📄 eslint.config.mjs
├── 📄 middleware.ts
├── 📄 next-env.d.ts 🚫 (auto-hidden)
├── 📄 next.config.ts
├── ⚙️ package.json
├── ⚙️ pnpm-lock.yaml
├── 📄 postcss.config.mjs
├── 📄 tailwind.config.ts
├── 📄 test-email-simple.js
├── 📄 tsconfig.json
└── 📄 tsconfig.tsbuildinfo 🚫 (auto-hidden)
```
