# File Tree: rougecardinalcompany

Generated on: 8/29/2025, 4:16:43 AM
Root path: `/home/yandev/projets/rougecardinalcompany`

```json
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 .github/
│   ├── 📁 copilot/
│   │   ├── 📝 1-clean-code.instructions.md
│   │   ├── 📝 2-typescript.instructions.md
│   │   ├── 📝 4-package-installation.instructions.md
│   │   ├── 📝 Bootstrap_Next.js_app_with_Supabase_Auth.md
│   │   ├── 📝 Create_RLS_policies.Instructions.md
│   │   ├── 📝 Create_migration.instructions.md
│   │   ├── 📝 Database_Create_functions.Instructions.md
│   │   ├── 📝 Declarative_Database_Schema.Instructions.md
│   │   ├── 📝 Postgres_SQL_Style_Guide.Instructions.md
│   │   ├── 📝 a11y.instructions.md
│   │   ├── 📝 copilot-instructions.md
│   │   ├── 📝 edge-functions.instructions.md
│   │   ├── 📝 knowledge-base-170825-0035.md
│   │   ├── 📝 memory-bank.instructions.md
│   │   ├── 📝 nextjs-supabase-auth.instructions.md
│   │   ├── 📝 nextjs.instructions.md
│   │   ├── 📝 nextjs15-backend.instructions.md
│   │   └── 📝 security-and-owasp.instructions.md
│   └── 📁 workflows/
├── 📁 .next/ 🚫 (auto-hidden)
├── 📁 .vscode/ 🚫 (auto-hidden)
├── 📁 app/
│   ├── 📁 agenda/
│   │   └── 📄 page.tsx
│   ├── 📁 auth/
│   │   ├── 📁 confirm/
│   │   │   └── 📄 route.ts
│   │   ├── 📁 error/
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 forgot-password/
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 login/
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 sign-up/
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 sign-up-success/
│   │   │   └── 📄 page.tsx
│   │   └── 📁 update-password/
│   │       └── 📄 page.tsx
│   ├── 📁 compagnie/
│   │   └── 📄 page.tsx
│   ├── 📁 contact/
│   │   └── 📄 page.tsx
│   ├── 📁 presse/
│   │   ├── 📄 metadata.ts
│   │   └── 📄 page.tsx
│   ├── 📁 protected/
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 spectacles/
│   │   └── 📄 page.tsx
│   ├── 📁 test-connection/
│   │   └── 📄 page.tsx
│   ├── 🖼️ favicon.ico
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   ├── 🖼️ opengraph-image.png
│   ├── 📄 page.tsx
│   └── 🖼️ twitter-image.png
├── 📁 components/
│   ├── 📁 features/
│   │   └── 📁 public-site/
│   │       ├── 📁 agenda/
│   │       │   ├── 📄 AgendaContainer.tsx
│   │       │   ├── 📄 AgendaView.tsx
│   │       │   ├── 📄 hooks.ts
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 types.ts
│   │       ├── 📁 compagnie/
│   │       │   ├── 📄 CompagnieContainer.tsx
│   │       │   ├── 📄 CompagnieView.tsx
│   │       │   ├── 📄 hooks.ts
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 types.ts
│   │       ├── 📁 contact/
│   │       │   ├── 📄 ContactPageContainer.tsx
│   │       │   ├── 📄 ContactPageView.tsx
│   │       │   ├── 📄 contact-hooks.ts
│   │       │   └── 📄 contact-types.ts
│   │       ├── 📁 home/
│   │       │   ├── 📁 about/
│   │       │   │   ├── 📄 AboutContainer.tsx
│   │       │   │   ├── 📄 AboutView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 hero/
│   │       │   │   ├── 📄 HeroContainer.tsx
│   │       │   │   ├── 📄 HeroView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 news/
│   │       │   │   ├── 📄 NewsContainer.tsx
│   │       │   │   ├── 📄 NewsView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 newsletter/
│   │       │   │   ├── 📄 NewsletterContainer.tsx
│   │       │   │   ├── 📄 NewsletterView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 partners/
│   │       │   │   ├── 📄 PartnersContainer.tsx
│   │       │   │   ├── 📄 PartnersView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 shows/
│   │       │   │   ├── 📄 ShowsContainer.tsx
│   │       │   │   ├── 📄 ShowsView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 types.ts
│   │       ├── 📁 presse/
│   │       │   ├── 📄 PresseContainer.tsx
│   │       │   ├── 📄 PresseView.tsx
│   │       │   ├── 📄 hooks.ts
│   │       │   └── 📄 types.ts
│   │       └── 📁 spectacles/
│   │           ├── 📄 SpectaclesContainer.tsx
│   │           ├── 📄 SpectaclesView.tsx
│   │           ├── 📄 hooks.ts
│   │           ├── 📄 index.ts
│   │           └── 📄 types.ts
│   ├── 📁 layout/
│   │   ├── 📄 footer.tsx
│   │   └── 📄 header.tsx
│   ├── 📁 skeletons/
│   │   ├── 📄 ShowsSkeleton.tsx
│   │   ├── 📄 about-skeleton.tsx
│   │   ├── 📄 agenda-skeleton.tsx
│   │   ├── 📄 compagnie-skeleton.tsx
│   │   ├── 📄 contact-skeleton.tsx
│   │   ├── 📄 hero-skeleton.tsx
│   │   ├── 📄 news-skeleton.tsx
│   │   ├── 📄 newsletter-skeleton.tsx
│   │   ├── 📄 partners-skeleton.tsx
│   │   ├── 📄 presse-skeleton.tsx
│   │   └── 📄 spectacles-skeleton.tsx
│   ├── 📁 tutorial/
│   │   ├── 📄 code-block.tsx
│   │   ├── 📄 connect-supabase-steps.tsx
│   │   ├── 📄 fetch-data-steps.tsx
│   │   ├── 📄 sign-up-user-steps.tsx
│   │   └── 📄 tutorial-step.tsx
│   ├── 📁 ui/
│   │   ├── 📄 alert.tsx
│   │   ├── 📄 badge.tsx
│   │   ├── 📄 button.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 checkbox.tsx
│   │   ├── 📄 dropdown-menu.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 label.tsx
│   │   ├── 📄 select.tsx
│   │   ├── 📄 skeleton.tsx
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
├── 📁 doc/
│   ├── 📝 Project_Architecture_Blueprint.md
│   ├── 📝 Project_Folders_Structure_Blueprint(24-08-25).md
│   ├── 📝 conventional-commit-cheatsheet.md
│   ├── 🗄️ empty-database-schema-recap.sql
│   ├── 📝 mcp-context-flow.md
│   ├── 📝 regles_copilot.md
│   └── 📝 visuel-blueprintGenerator.md
├── 📁 doc-perso/
│   ├── 📁 deleted comp/
│   │   ├── 📁 compagnie/
│   │   │   ├── 📄 client-page.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 sections/
│   │   │   ├── 📄 about-preview.tsx
│   │   │   ├── 📄 featured-news.tsx
│   │   │   ├── 📄 hero.tsx
│   │   │   ├── 📄 newsletter.tsx
│   │   │   ├── 📄 partners.tsx
│   │   │   └── 📄 upcoming-shows.tsx
│   │   ├── 📁 spectacles/
│   │   │   └── 📄 client-page.tsx
│   │   ├── 📄 hero.tsx
│   │   ├── 📄 next-logo.tsx
│   │   └── 📄 supabase-logo.tsx
│   ├── 📁 prompts-custom-claude/
│   │   └── 📝 feature_based_prompt.md
│   ├── 📁 prompts-custom-copilot-pc/
│   │   └── 📝 0-clean-architecture-nextjs.md
│   ├── 📝 1-naming-conventions.instructions.md
│   ├── 📝 2-typescript-naming-conventions.md
│   ├── 📝 Project_Folders_Structure_Blueprint.md
│   ├── 📝 cahier-des-charges.md
│   ├── 📝 progress.md
│   ├── 📝 update-node-18to-22.md
│   ├── 📝 updated_copilot_instructions(4).md
│   └── 📝 updated_copilot_instructions.md
├── 📁 lib/
│   ├── 📁 supabase/
│   │   ├── 📁 schemas/
│   │   │   ├── 🗄️ 00_extensions.sql
│   │   │   ├── 🗄️ 01_tables_core.sql
│   │   │   ├── 🗄️ 02_tables_joins.sql
│   │   │   ├── 🗄️ 03_functions_triggers.sql
│   │   │   ├── 🗄️ 04_indexes_fulltext.sql
│   │   │   ├── 🗄️ 05_rls_policies.sql
│   │   │   ├── 🗄️ 06_comments_and_metadata.sql
│   │   │   └── 🗄️ 07_seed.sql
│   │   ├── 📄 client.ts
│   │   ├── 📄 middleware.ts
│   │   └── 📄 server.ts
│   └── 📄 utils.ts
├── 📁 memory-bank/
│   ├── 📁 architecture/
│   │   ├── 📝 Project_Architecture_Blueprint.md
│   │   └── 📝 Project_Folders_Structure_Blueprint.md
│   ├── 📁 epics/
│   │   ├── 📁 details/
│   │   │   ├── 📝 14.1-page-accueil(Home).md
│   │   │   ├── 📝 14.2-page-presentation-companie.md
│   │   │   ├── 📝 14.3-page-spectacles-(événements).md
│   │   │   ├── 📝 14.4-page-agenda.md
│   │   │   ├── 📝 14.5-page-presse.md
│   │   │   ├── 📝 14.6-contact-newsletter.md
│   │   │   └── 📝 14.7-back‑office.md
│   │   └── ⚙️ epics-map.yaml
│   ├── 📁 tasks/
│   │   └── 📝 _index.md
│   ├── 📝 activeContext.md
│   ├── 📝 productContext.md
│   ├── 📝 progress.md
│   ├── 📝 projectbrief.md
│   ├── 📝 systemPatterns.md
│   └── 📝 techContext.md
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 prompts-github/
│   ├── 📝 architecture-blueprint-generator.prompt.md
│   ├── 📝 conventional-commit.prompt.md
│   ├── 📝 copilot-instructions-blueprint-generator.prompt.md
│   ├── 📝 copilot-thought-logging.instructions.md
│   └── 📝 folder-structure-blueprint-generator.prompt.md
├── 📁 public/
│   └── 🖼️ logo-florian.png
├── 📁 scripts/
├── 📁 supabase/
│   ├── 📁 migrations/
│   │   ├── 📖 README.md
│   │   └── 🗄️ sync_existing_profiles.sql
│   ├── 📁 schemas/
│   │   ├── 🗄️ 01_extensions.sql
│   │   ├── 🗄️ 02_table_profiles.sql
│   │   ├── 🗄️ 03_table_medias.sql
│   │   ├── 🗄️ 04_table_membres_equipe.sql
│   │   ├── 🗄️ 05_table_lieux.sql
│   │   ├── 🗄️ 06_table_spectacles.sql
│   │   ├── 🗄️ 07_table_evenements.sql
│   │   ├── 🗄️ 08_table_articles_presse.sql
│   │   ├── 🗄️ 09_tables_system.sql
│   │   ├── 🗄️ 10_tables_relations.sql
│   │   ├── 🗄️ 11_evenements_recurrence.sql
│   │   ├── 🗄️ 12_analytics_events.sql
│   │   ├── 🗄️ 13_categories_tags.sql
│   │   ├── 🗄️ 14_content_versioning.sql
│   │   ├── 🗄️ 15_seo_metadata.sql
│   │   ├── 🗄️ 20_functions_core.sql
│   │   ├── 🗄️ 21_functions_auth_sync.sql
│   │   ├── 🗄️ 30_triggers.sql
│   │   ├── 🗄️ 40_indexes.sql
│   │   ├── 🗄️ 50_constraints.sql
│   │   ├── 🗄️ 60_rls_profiles.sql
│   │   ├── 🗄️ 61_rls_main_tables.sql
│   │   ├── 🗄️ 62_rls_advanced_tables.sql
│   │   ├── 📖 README.md
│   │   └── 🗄️ empty-database-schema-recap.sql
│   ├── 📝 README-database-schema.md
│   └── 📝 README-migrations.md
├── 🔒 .env 🚫 (auto-hidden)
├── 📄 .env.example
├── 🚫 .gitignore
├── 📖 README.md
├── 📄 components.json
├── 📄 eslint.config.mjs
├── 📄 middleware.ts
├── 🔒 next-env.d.ts 🚫 (auto-hidden)
├── 📄 next.config.ts
├── 📄 package.json
├── ⚙️ pnpm-lock.yaml
├── 📄 postcss.config.mjs
├── 📄 tailwind.config.ts
└── 📄 tsconfig.json
```

---

Generated by FileTree Pro Extension
