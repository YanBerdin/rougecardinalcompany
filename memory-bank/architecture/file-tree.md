# File Tree: rougecardinalcompany

**Generated:** 11/11/2025, 4:15:54 PM
**Root Path:** `/home/yandev/projets/rougecardinalcompany`

```bash
├── 📁 .github
│   ├── 📁 copilot
│   ├── 📁 instructions
│   ├── 📁 prompts
│   └──  📁 workflows
├── 📁 __tests__
│   └── 📁 emails
├── 📁 app
│   ├── 📁 (admin)
│   │   ├── 📁 admin
│   │   │   ├── 📁 debug-auth
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 spectacles
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   ├── 📁 edit
│   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 new
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 team
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 users
│   │   │   │   ├── 📁 invite
│   │   │   │   │   ├── 📄 actions.ts
│   │   │   │   │   └── 📄 page.tsx
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
│   │   │   ├── 📁 invite-user
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 spectacles
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
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
│   │   ├── 📁 public
│   │   │   └── 📁 spectacles
│   │   │       └── 📁 [id]
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
│   ├── 📁 debug-auth-before-admin
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
│   │   ├── 📁 dashboard
│   │   │   ├── 📄 DashboardStatsContainer.tsx
│   │   │   └── 📄 StatsCard.tsx
│   │   ├── 📄 AdminAuthRow.tsx
│   │   ├── 📄 AdminSidebar.tsx
│   │   └── 📄 ErrorBoundary.tsx
│   ├── 📁 dev
│   ├── 📁 features
│   │   ├── 📁 admin
│   │   │   ├── 📁 spectacles
│   │   │   │   ├── 📄 SortableHeader.tsx
│   │   │   │   ├── 📄 SpectacleForm.tsx
│   │   │   │   ├── 📄 SpectaclesManagementContainer.tsx
│   │   │   │   └── 📄 SpectaclesTable.tsx
│   │   │   ├── 📁 team
│   │   │   │   ├── 📄 MediaPickerDialog.tsx
│   │   │   │   ├── 📄 TeamManagementContainer.tsx
│   │   │   │   ├── 📄 TeamMemberCard.tsx
│   │   │   │   ├── 📄 TeamMemberForm.tsx
│   │   │   │   └── 📄 TeamMemberList.tsx
│   │   │   └── 📁 users
│   │   │       ├── 📄 InviteUserForm.tsx
│   │   │       ├── 📄 UsersManagementContainer.tsx
│   │   │       ├── 📄 UsersManagementSkeleton.tsx
│   │   │       ├── 📄 UsersManagementView.tsx
│   │   │       └── 📄 index.ts
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
│   │   ├── 📄 StatsCardsSkeleton.tsx
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
│   │   ├── 📄 alert-dialog.tsx
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
│   │   ├── 📄 table.tsx
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
├── 📁 doc
├── 📁 doc-perso
├── 📁 emails
│   ├── 📁 utils
│   │   ├── 📄 components.utils.tsx
│   │   └── 📄 email-layout.tsx
│   ├── 📄 contact-message-notification.tsx
│   ├── 📄 invitation-email.tsx
│   └── 📄 newsletter-confirmation.tsx
├── 📁 hooks
│   └── 📄 use-mobile.ts
├── 📁 lib
│   ├── 📁 api
│   │   ├── 📄 helpers.ts
│   │   └── 📄 spectacles-helpers.ts
│   ├── 📁 auth
│   │   └── 📄 is-admin.ts
│   ├── 📁 dal
│   │   ├── 📄 admin-users.ts
│   │   ├── 📄 agenda.ts
│   │   ├── 📄 compagnie-presentation.ts
│   │   ├── 📄 compagnie.ts
│   │   ├── 📄 contact.ts
│   │   ├── 📄 dashboard.ts
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
│   ├── 📁 forms
│   │   ├── 📁 __tests__
│   │   └── 📄 spectacle-form-helpers.ts
│   ├── 📁 hooks
│   │   ├── 📄 useContactForm.ts
│   │   └── 📄 useNewsletterSubscribe.ts
│   ├── 📁 plugins
│   │   └── 📄 touch-hitbox-plugin.js
│   ├── 📁 schemas
│   │   ├── 📄 spectacles.ts
│   │   └── 📄 team.ts
│   ├── 📁 tables
│   │   └── 📄 spectacle-table-helpers.ts
│   ├── 📄 database.types.ts
│   ├── 📄 resend.ts
│   ├── 📄 site-config.ts
│   └── 📄 utils.ts
├── 📁 memory-bank
├── 📁 public
├── 📁 scripts
│   ├── 📁 Test_fetchMediaArticles
├── 📁 supabase
│   ├── 📁 .branches
│   │   └── 📄 _current_branch
│   ├── 📁 migrations
│   ├── 📁 schemas
│   │   └── 📝 README.md
│   ├── 📁 scripts
│   ├── 📁 tests
│   └── 📝 README.md
├── 📁 types
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── ⚙️ .markdownlint.jsonc
├── 📝 README.md
├── 📝 TESTING_RESEND.md
├── 📄 check_spectacles_rls.sql
├── ⚙️ components.json
├── 📄 eslint.config.mjs
├── 📄 inspect-tables.sql
├── 📄 middleware.ts
├── 📄 migrate-route-groups.sh
├── 📄 next.config.ts
├── ⚙️ package.json
├── ⚙️ pnpm-lock.yaml
├── 📄 postcss.config.mjs
├── 📄 supabase_public_data.sql
├── 📄 tailwind.config.ts
├── 📄 test-email-simple.js
├── 📄 test-invitation.js
└── ⚙️ tsconfig.json
```
