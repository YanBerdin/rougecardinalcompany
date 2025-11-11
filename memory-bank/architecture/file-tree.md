# File Tree: rougecardinalcompany

**Generated:** 11/11/2025, 4:15:54 PM
**Root Path:** `/home/yandev/projets/rougecardinalcompany`

```bash
├── 📁 .github
│   ├── 📁 copilot
│   ├── 📁 instructions
│   │   ├── ⚙️ .markdownlint.jsonc
│   │   ├── 📝 1-clean-code.instructions.md
│   │   ├── 📝 2-typescript.instructions.md
│   │   ├── 📝 Create_migration.instructions.md
│   │   ├── 📝 Declarative_Database_Schema.Instructions.md
│   │   ├── 📝 Postgres_SQL_Style_Guide.Instructions.md
│   │   ├── 📝 README.md
│   │   ├── 📝 a11y.instructions.md
│   │   ├── 📝 knowledge-base-170825-0035.md
│   │   ├── 📝 memory-bank.instructions.md
│   │   ├── 📝 next-backend.instructions.md
│   │   ├── 📝 nextjs-supabase-auth-2025.instructions.md
│   │   ├── 📝 nextjs.instructions.md
│   │   ├── 📝 nextjs15-backend-with-supabase.instructions.md
│   │   ├── 📝 security-and-owasp.instructions.md
│   │   ├── 📝 touch_hitbox.instructions.md
│   │   └── 📝 wcag_target_size.instructions.md
│   ├── 📁 workflows
│   │   ├── ⚙️ detect-revoke-warn.yml
│   │   ├── ⚙️ monitor-detect-revoke.yml
│   │   └── ⚙️ reorder-sql-tests.yml
│   ├── 📝 SECRETS_EXAMPLES.md
│   └── 📝 copilot-instructions.md
├── 📁 app
│   ├── 📁 (admin)
│   │   ├── 📁 admin
│   │   │   ├── 📁 team
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 loading.tsx
│   │   │   └── 📄 page.tsx
│   │   └── 📄 layout.tsx
│   ├── 📁 (marketing)
│   │   ├── 📁 agenda
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 compagnie
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 contact
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 presse
│   │   │   ├── 📄 metadata.ts
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 protected
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 spectacles
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 layout.tsx
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
│   │   ├── 📁 debug-auth
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
│   ├── 📁 debug-auth
│   │   └── 📄 page.tsx
│   ├── 📁 test-connection
│   │   └── 📄 page.tsx
│   ├── 📄 favicon.ico
│   ├── 📄 global.d.ts
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   ├── 📄 layout.tsx.backup
│   ├── 🖼️ opengraph-image.png
│   └── 🖼️ twitter-image.png
├── 📁 components
│   ├── 📁 admin
│   │   ├── 📄 AdminAuthRow.tsx
│   │   └── 📄 AdminSidebar.tsx
│   ├── 📁 dev
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
│   │   ├── 📄 breadcrumb.tsx
│   │   ├── 📄 button.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 checkbox.tsx
│   │   ├── 📄 dialog.tsx
│   │   ├── 📄 dropdown-menu.tsx
│   │   ├── 📄 form.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 label.tsx
│   │   ├── 📄 select.tsx
│   │   ├── 📄 separator.tsx
│   │   ├── 📄 sheet.tsx
│   │   ├── 📄 sidebar.tsx
│   │   ├── 📄 skeleton.tsx
│   │   ├── 📄 sonner.tsx
│   │   ├── 📄 switch.tsx
│   │   ├── 📄 tabs.tsx
│   │   ├── 📄 textarea.tsx
│   │   └── 📄 tooltip.tsx
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
│   ├── 📁 API-keys
│   │   └── 📝 scripts-troubleshooting.md
│   ├── 📁 SQL-schema-Compliancy-report
│   │   ├── 📝 create-functions-compliance-report.md
│   │   ├── 📝 create-migration-compliance-report.md
│   │   ├── 📝 create-rls-policies-compliance-report.md
│   │   ├── 📝 declarative-schema-compliance-report.md
│   │   └── 📝 postgres-sql-style-compliance-report.md
│   ├── 📁 copilot
│   │   ├── 📝 4-package-installation.instructions.md
│   │   ├── 📝 Create_RLS_policies.Instructions.md
│   │   ├── 📝 Database_Create_functions.Instructions.md
│   │   ├── 📝 edge-functions.instructions.md
│   │   └── 📝 shadcn-mcp.instructions.md
│   ├── 📁 linting
│   │   ├── 📝 LINTING_CONFIGURATION.md
│   │   └── 📝 MARKDOWN_ERRORS_REPORT.md
│   ├── 📁 migrations-doc
│   │   ├── 📁 legacy-migrations
│   │   │   ├── 📁 DEPRECATED
│   │   │   │   ├── 📝 RLS_POLICIES_HOTFIX_2025-10-26.md
│   │   │   │   └── 📝 SECURITY_AUDIT_SUMMARY.md
│   │   │   ├── 📄 20251024215030_run_reorder_tests.sql
│   │   │   ├── 📄 20251024215130_check_grants_membres_equipe.sql
│   │   │   ├── 📄 20251024231855_restrict_reorder_execute.sql
│   │   │   ├── 📄 20251025160000_revoke_exposed_grants.sql
│   │   │   ├── 📄 20251025161000_revoke_pg_stat_statements.sql
│   │   │   ├── 📄 20251025163000_revoke_pg_stat_statements_objects.sql
│   │   │   ├── 📄 20251025164500_revoke_articles_tables.sql
│   │   │   ├── 📄 20251025170000_apply_revoke_public_anon.sql
│   │   │   ├── 📄 20251025170100_proposed_revoke_public_anon.sql
│   │   │   ├── 📄 20251025173000_revoke_communiques_privileges.sql
│   │   │   ├── 📄 20251025174500_revoke_information_schema_and_role_memberships.sql
│   │   │   ├── 📄 20251025175500_revoke_additional_authenticated_grants.sql
│   │   │   ├── 📄 20251025180000_revoke_more_authenticated_grants.sql
│   │   │   ├── 📄 20251025181000_revoke_final_exposed_objects.sql
│   │   │   ├── 📄 20251025182000_revoke_new_exposed_objects.sql
│   │   │   ├── 📄 20251025183000_revoke_membres_messages_views.sql
│   │   │   ├── 📄 20251025184000_revoke_final_round_partners_profiles.sql
│   │   │   ├── 📄 20251025185000_revoke_seo_spectacles_final.sql
│   │   │   ├── 📄 20251025190000_revoke_junction_tables_final.sql
│   │   │   ├── 📄 20251025191000_revoke_realtime_schema.sql
│   │   │   ├── 📄 20251025192000_revoke_realtime_subscription_authenticated.sql
│   │   │   ├── 📄 20251026080000_revoke_articles_presse_functions.sql
│   │   │   ├── 📄 20251026090000_revoke_categories_analytics_functions.sql
│   │   │   ├── 📄 20251026100000_revoke_storage_search_functions.sql
│   │   │   ├── 📄 20251026110000_revoke_storage_analytics_persistent_functions.sql
│   │   │   ├── 📄 20251026120000_revoke_storage_objects_business_functions.sql
│   │   │   ├── 📄 20251026130000_revoke_storage_prefixes_versioning_functions.sql
│   │   │   ├── 📄 20251026140000_revoke_storage_multipart_auth_triggers.sql
│   │   │   ├── 📄 20251026150000_revoke_storage_multipart_parts_utility_functions.sql
│   │   │   ├── 📄 20251026160000_revoke_remaining_versioning_triggers.sql
│   │   │   ├── 📄 20251026170000_revoke_check_communique_has_pdf_function.sql
│   │   │   ├── 📝 INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
│   │   │   ├── 📝 SECURITY_INCIDENT_2025-10-27.md
│   │   │   ├── 📝 rls-policies-troubleshooting.md
│   │   │   └── 📝 supabase-view-security-invoker-caveat.md
│   │   └── 📝 README.md
│   ├── 📁 prompts-github
│   │   ├── 📝 architecture-blueprint-generator.prompt.md
│   │   ├── 📝 conventional-commit.prompt.md
│   │   ├── 📝 copilot-instructions-blueprint-generator.prompt.md
│   │   ├── 📝 copilot-thought-logging.instructions.md
│   │   └── 📝 folder-structure-blueprint-generator.prompt.md
│   ├── 📁 resend_integration
│   │   ├── 📁 contact-resend
│   │   │   ├── 📝 API-Contact-Test-Results.md
│   │   │   └── 📝 Fix-Contact-Email-Missing.md
│   │   ├── 📁 newsletter-resend
│   │   │   └── 📝 API-Newsletter-Test-Results.md
│   │   ├── 📝 Complete-Session-Summary-RGPD-Contact.md
│   │   ├── 📝 RGPD-Compliance-Validation.md
│   │   ├── 📝 Session-RGPD-Summary-2025-10-10.md
│   │   └── 📝 resend_supabase_integration_prompt.md
│   ├── 📝 Architecture-Blueprints-Update-Log-2025-10-13.md
│   ├── 📝 Architecture-Update-Auth-Cleanup-2025-10-13.md
│   ├── 📝 Code-Cleanup-Auth-Session-2025-10-13.md
│   ├── 📝 Project_Folders_Structure_Blueprint.md
│   ├── 📝 README.md
│   ├── 📝 conventional-commit-cheatsheet.md
│   ├── 📝 regles_copilot.md
│   ├── 📝 supabase-typescript-guide.md
│   └── 📝 visuel-blueprintGenerator.md
├── 📁 doc-perso
│   ├── 📁 Appliquer-instructions-plan
│   │   ├── 📝 TASK022-CLEANUP-NOM-ALIAS.md
│   │   ├── 📝 TASK022-CORRECTIONS.md
│   │   ├── 📝 TASK022-MAPPING-FIXES.md
│   │   ├── 📝 TASK022-REVIEW.md
│   │   ├── 📝 TASK022-SCHEMA-COHERENCE.md
│   │   ├── 📝 TASK022-SUMMARY-MAPPING-CHECK.md
│   │   ├── 📝 TASK022-team-management-instructions.md
│   │   ├── 📝 demande-en-attente.md
│   │   ├── 📝 feature.Instructions.md
│   │   └── 📝 fetch-media-articles-progress.md
│   ├── 📁 Schema_et_migrations
│   │   └── 📝 terminal-schema-progress.md
│   ├── 📁 Supabase API Keys 
│   │   ├── 📝 Fix-Legacy-API-Keys-2025-10-13.md
│   │   └── 📝 Supabase-API-Keys-Formats-2025-10-13.md
│   ├── 📁 Team-DAL-refacto-
│   │   ├── 📝 3-suite-terminal.md
│   │   ├── 📝 suite-terminal.md
│   │   └── 📝 terminal-progress.md
│   ├── 📁 conversation Coplilot
│   │   ├── 📝 bug-typescript-et-migration.md
│   │   ├── 📝 bug-wsl.md
│   │   └── 📝 declarative-schema-hotfix.md
│   ├── 📁 feat-Admin-discuss
│   │   └── 📝 sync_existing_profiles_guide.md
│   ├── 📁 fix-declarative-schema-report
│   │   ├── 📝 20251007-migration-supabase-cloud-success.md
│   │   ├── 📝 DECISION-hotfix-migrations-synchronization.md
│   │   └── 📝 declarative-schema-hotfix-workflow.md
│   ├── 📁 lancement-supabase-cloud
│   │   ├── 📝 CLI-Supabase-Cloud.md
│   │   └── 📝 docker-volume-backed-up.md
│   ├── 📁 lancement-supabase-local
│   │   ├── 📝 CLI-Supabase-Local.md
│   │   └── 📝 docker-install.md
│   ├── 📁 linting-conversation
│   │   └── 📝 linting-conversation.md
│   ├── 📁 prompts-custom-claude
│   │   └── 📝 feature_based_prompt.md
│   ├── 📁 prompts-custom-copilot-pc
│   │   └── 📝 0-clean-architecture-nextjs.md
│   ├── 📁 resend-integration
│   │   ├── 📁 MISE_A_JOUR_RESEND_discussion.md
│   │   │   ├── 📝 0-RGPD-Compliance-discuss-conformité.md
│   │   │   ├── 📝 1-resend-update-discuss.md
│   │   │   ├── 📝 2-progress-and-test-resend.md
│   │   │   ├── 📝 3-eslint-discuss.md
│   │   │   ├── 📝 4-useNewsletterSubscription to useNewsletterSubscribe.md
│   │   │   ├── 📝 5-articles_presse_rls-DAL-contact.md
│   │   │   ├── 📝 6-newsletter-log-test-fix-rgpd.md
│   │   │   ├── 📝 7-DAL-contact.md
│   │   │   └── 📝 8-eslint-types-error-todo.md
│   │   └── 📁 resend-implementation-plan
│   │       ├── 📝 COMPATIBILITY_ISSUES.md
│   │       ├── 📝 MISE_A_JOUR_RESEND_INTEGRATION.md
│   │       └── 📝 resend_supabase_integration.md
│   ├── 📝 1-naming-conventions.instructions.md
│   ├── 📝 2-typescript-naming-conventions.md
│   ├── 📝 DECISION-hotfix-migrations-synchronization.md
│   ├── 📝 README-CORRECTIONS-CONFORMITE.md
│   ├── 📝 cahier-des-charges.md
│   ├── 📝 copilot-extensions-espace-disk.md
│   ├── 📄 global;css
│   ├── 📝 many-to-many.md
│   ├── 📝 mcp-context-flow.md
│   ├── ⚙️ mcp.json
│   ├── 📝 nextjs.instructions.md
│   ├── 📝 progress.md
│   ├── 📝 shadcn-mcp.md
│   ├── 📝 update-node-18to-22.md
│   ├── 📝 updated_copilot_instructions(4).md
│   └── 📝 updated_copilot_instructions.md
├── 📁 emails
│   ├── 📁 utils
│   │   ├── 📄 components.utils.tsx
│   │   └── 📄 email-layout.tsx
│   ├── 📄 contact-message-notification.tsx
│   └── 📄 newsletter-confirmation.tsx
├── 📁 hooks
│   └── 📄 use-mobile.ts
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
│   │   ├── 📝 TASK007-update-memory-bank.md
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
│   ├── 📝 Memory-Bank-Update-Session-2025-10-26.md
│   ├── 📝 activeContext.md
│   ├── 📝 productContext.md
│   ├── 📝 progress.md
│   ├── 📝 projectbrief.md
│   ├── 📝 systemPatterns.md
│   └── 📝 techContext.md
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
│   ├── 📄 check-security-audit.sh
│   ├── 📄 create_issues.sh
│   ├── 📄 diagnose-server-auth.ts
│   ├── 📄 test-all-dal-functions.ts
│   ├── 📄 test-email-integration.ts
│   ├── 📄 test-evenements-access.ts
│   ├── 📄 test-fetch-media-articles.ts
│   ├── 📄 test-views-security-invoker.ts
│   ├── 📄 test-webhooks.ts
│   └── 📄 verify-view-security-invoker.ts
├── 📁 supabase
│   ├── 📁 .branches
│   │   └── 📄 _current_branch
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
│   │   ├── 📄 20251022000001_create_medias_storage_bucket.sql
│   │   ├── 📄 20251022120000_fix_articles_presse_public_security_invoker.sql
│   │   ├── 📄 20251022140000_grant_select_articles_presse_anon.sql
│   │   ├── 📄 20251022150000_apply_articles_presse_rls_policies.sql
│   │   ├── 📄 20251022160000_fix_all_views_security_invoker.sql
│   │   ├── 📄 20251022170000_optimize_articles_presse_rls_policies.sql
│   │   ├── 📄 20251024214802_reorder_team_members.sql
│   │   ├── 📄 20251024214930_grant_select_membres_equipe.sql
│   │   ├── 📄 20251026180000_apply_spectacles_partners_rls_policies.sql
│   │   ├── 📄 20251026181000_apply_missing_rls_policies_home_content.sql
│   │   ├── 📄 20251027000000_create_is_admin_function.sql
│   │   ├── 📄 20251027010000_recreate_all_rls_policies.sql
│   │   ├── 📄 20251027020000_restore_basic_grants_for_rls.sql
│   │   ├── 📄 20251027021000_restore_remaining_grants.sql
│   │   ├── 📄 20251027021500_restore_views_grants.sql
│   │   ├── 📄 20251027022000_fix_logs_audit_grants.sql
│   │   ├── 📄 20251027022500_grant_execute_all_trigger_functions.sql
│   │   ├── 📝 ROUND_7B_ANALYSIS.md
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
│   │   ├── 📄 63_reorder_team_members.sql
│   │   └── 📝 README.md
│   ├── 📁 scripts
│   │   ├── 📝 allowed_exposed_objects.README.md
│   │   ├── 📄 allowed_exposed_objects.txt
│   │   ├── 📄 analyze_remaining_grants.sh
│   │   ├── 📄 audit_grants.sql
│   │   ├── 📄 audit_grants_filtered.sql
│   │   ├── 📄 check_rls_coverage.sh
│   │   ├── 📄 check_rls_policies.sql
│   │   ├── 📄 diagnose_admin_access.sql
│   │   ├── 📄 quick_check_all_grants.sql
│   │   ├── 📄 test_rls_anon_access.sql
│   │   ├── 📄 verify_policies_applied.sql
│   │   └── 📄 verify_rls_policies.sql
│   ├── 📁 tests
│   │   ├── 📄 20251025_test_reorder_and_views.sql
│   │   ├── 📝 README.md
│   │   ├── 📄 ci-run.sh
│   │   ├── 📄 run_audit_grants.sh
│   │   └── 📄 run_reorder_tests.sh
│   ├── 📄 client.ts
│   ├── 📄 middleware.ts
│   └── 📄 server.ts
├── 📁 swark-output
│   ├── 📝 2025-11-11__15-47-43__diagram.md
│   ├── 📝 2025-11-11__15-47-43__log.md
│   ├── 📝 2025-11-11__15-51-52__diagram.md
│   ├── 📝 2025-11-11__15-51-52__log.md
│   ├── 📝 2025-11-11__15-52-57__diagram.md
│   └── 📝 2025-11-11__15-52-57__log.md
├── 📁 types
│   ├── 📄 database.types.ts
│   └── 📄 email.d.ts
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── ⚙️ .markdownlint.jsonc
├── 📝 README.md
├── 📝 TESTING_RESEND.md
├── ⚙️ components.json
├── 📄 eslint.config.mjs
├── 📄 middleware.ts
├── 📄 migrate-route-groups.sh
├── 📄 next.config.ts
├── ⚙️ package.json
├── ⚙️ pnpm-lock.yaml
├── 📄 postcss.config.mjs
├── 📄 tailwind.config.ts
├── 📄 test-email-simple.js
└── ⚙️ tsconfig.json
```
