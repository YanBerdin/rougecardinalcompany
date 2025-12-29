# File Tree: rougecardinalcompany

**Generated:** 12/22/2025, 10:00:00 AM
**Root Path:** `memory-bank/architecture`
**Last Updated:** Added hydration fix wrappers (AboutContentFormWrapper.tsx, TeamMemberFormClient.tsx) and commit message

```bash
├── 📁 .github
│   ├── 📁 copilot
│   ├── 📁 instructions
│   ├── 📁 prompts
│   ├── 📁 workflows
│   │   ├── ⚙️ detect-revoke-warn.yml
│   │   ├── ⚙️ invitation-email-test.yml
│   │   ├── ⚙️ monitor-detect-revoke.yml
│   │   └── ⚙️ reorder-sql-tests.yml
│   ├── 📝 SECRETS_EXAMPLES.md
│   └── 📝 copilot-instructions.md
├── 📁 __tests__
│   └── 📁 emails
│       └── 📄 invitation-email.test.tsx
├── 📁 app
│   ├── 📁 (admin)
│   │   ├── 📁 admin
│   │   │   ├── 📁 debug-auth
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 home
│   │   │   │   ├── 📁 about
│   │   │   │   │   ├── 📄 home-about-actions.ts
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📁 hero
│   │   │   │       ├── 📄 home-hero-actions.ts
│   │   │   │       └── 📄 page.tsx
│   │   │   ├── 📁 media
│   │   │   │   ├── 📁 folders
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 library
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 tags
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 spectacles
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   ├── 📁 edit
│   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 new
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 team
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📁 edit
│   │   │   │   │       ├── 📄 loading.tsx
│   │   │   │   │       └── 📄 page.tsx
│   │   │   │   ├── 📁 new
│   │   │   │   │   ├── 📄 loading.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 users
│   │   │   │   ├── 📁 invite
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
│   │   ├── 📁 auth
│   │   │   └── 📁 setup-account
│   │   │       └── 📄 page.tsx
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
│   ├── 📁 actions
│   │   ├── 📄 contact.actions.ts
│   │   └── 📄 newsletter.actions.ts
│   ├── 📁 api
│   │   ├── 📁 admin
│   │   │   └── 📁 media
│   │   │       ├── 📁 search
│   │   │       │   └── 📄 route.ts
│   │   │       └── 📁 thumbnail
│   │   │           └── 📄 route.ts
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
│   ├── 📁 debug-auth-before-admin
│   │   └── 📄 page.tsx
│   ├── 📁 test-connection
│   │   └── 📄 page.tsx
│   ├── 📄 favicon.ico
│   ├── 📄 global.d.ts
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   ├── 🖼️ opengraph-image.png
│   └── 🖼️ twitter-image.png
├── 📁 components
│   ├── 📁 admin
│   │   ├── 📁 dashboard
│   │   │   ├── 📄 DashboardStatsContainer.tsx
│   │   │   └── 📄 StatsCard.tsx
│   │   ├── 📄 AdminAuthRow.tsx
│   │   ├── 📄 AdminSidebar.tsx
│   │   ├── 📄 BfcacheHandler.tsx
│   │   ├── 📄 CardsDashboard.tsx
│   │   ├── 📄 ErrorBoundary.tsx
│   │   └── 📄 TeamPageToasts.tsx
│   ├── 📁 auth
│   │   └── 📄 SetupAccountForm.tsx
│   ├── 📁 features
│   │   ├── 📁 admin
│   │   │   ├── 📁 home
│   │   │   │   ├── 📄 AboutContentContainer.tsx
│   │   │   │   ├── 📄 AboutContentForm.tsx
│   │   │   │   ├── 📄 AboutContentFormWrapper.tsx
│   │   │   │   ├── 📄 CtaFieldGroup.tsx
│   │   │   │   ├── 📄 HeroSlideForm.tsx
│   │   │   │   ├── 📄 HeroSlideFormFields.tsx
│   │   │   │   ├── 📄 HeroSlidePreview.tsx
│   │   │   │   ├── 📄 HeroSlidesContainer.tsx
│   │   │   │   ├── 📄 HeroSlidesErrorBoundary.tsx
│   │   │   │   └── 📄 HeroSlidesView.tsx
│   │   │   ├── 📁 media
│   │   │   │   ├── 📄 ImageFieldGroup.tsx
│   │   │   │   ├── 📄 MediaBulkActions.tsx
│   │   │   │   ├── 📄 MediaCard.tsx
│   │   │   │   ├── 📄 MediaDetailsPanel.tsx
│   │   │   │   ├── 📄 MediaExternalUrlInput.tsx
│   │   │   │   ├── 📄 MediaFoldersContainer.tsx
│   │   │   │   ├── 📄 MediaFoldersView.tsx
│   │   │   │   ├── 📄 MediaLibraryContainer.tsx
│   │   │   │   ├── 📄 MediaLibraryPicker.tsx
│   │   │   │   ├── 📄 MediaLibraryView.tsx
│   │   │   │   ├── 📄 MediaLibraryViewClient.tsx
│   │   │   │   ├── 📄 MediaTagsContainer.tsx
│   │   │   │   ├── 📄 MediaTagsView.tsx
│   │   │   │   ├── 📄 MediaUploadDialog.tsx
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 spectacles
│   │   │   │   ├── 📄 SortableHeader.tsx
│   │   │   │   ├── 📄 SpectacleForm.tsx
│   │   │   │   ├── 📄 SpectaclesManagementContainer.tsx
│   │   │   │   └── 📄 SpectaclesTable.tsx
│   │   │   ├── 📁 team
│   │   │   │   ├── 📄 TeamManagementContainer.tsx
│   │   │   │   ├── 📄 TeamMemberCard.tsx
│   │   │   │   ├── 📄 TeamMemberForm.tsx
│   │   │   │   ├── 📄 TeamMemberFormClient.tsx
│   │   │   │   ├── 📄 TeamMemberFormWrapper.tsx
│   │   │   │   └── 📄 TeamMemberList.tsx
│   │   │   └── 📁 users
│   │   │       ├── 📄 InviteUserForm.tsx
│   │   │       ├── 📄 UsersManagementContainer.tsx
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
│   │   ├── 📄 AboutContentSkeleton.tsx
│   │   ├── 📄 AdminDashboardSkeleton.tsx
│   │   ├── 📄 AdminSpectaclesSkeleton.tsx
│   │   ├── 📄 AdminTeamSkeleton.tsx
│   │   ├── 📄 HeroSlidesSkeleton.tsx
│   │   ├── 📄 StatsCardsSkeleton.tsx
│   │   ├── 📄 UsersManagementSkeleton.tsx
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
│   │   ├── 📄 progress.tsx
│   │   ├── 📄 scroll-area.tsx
│   │   ├── 📄 select.tsx
│   │   ├── 📄 separator.tsx
│   │   ├── 📄 sheet.tsx
│   │   ├── 📄 sidebar.tsx
│   │   ├── 📄 skeleton.tsx
│   │   ├── 📄 sonner.tsx
│   │   ├── 📄 sortable-header.tsx
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
├── 📁 lib
│   ├── 📁 actions
│   │   ├── 📝 actions_readme.md
│   │   ├── 📄 contact-server.ts
│   │   ├── 📄 index.ts
│   │   ├── 📄 media-actions.ts
│   │   ├── 📄 media-bulk-actions.ts
│   │   ├── 📄 media-folders-actions.ts
│   │   ├── 📄 media-tags-actions.ts
│   │   ├── 📄 newsletter-server.ts
│   │   └── 📄 types.ts
│   ├── 📁 api
│   │   └── 📄 helpers.ts
│   ├── 📁 auth
│   │   └── 📄 is-admin.ts
│   ├── 📁 constants
│   │   └── 📄 hero-slides.ts
│   ├── 📁 dal
│   │   ├── 📁 helpers
│   │   │   ├── 📄 error.ts
│   │   │   ├── 📄 format.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 serialize.ts
│   │   │   └── 📄 slug.ts
│   │   ├── 📄 admin-home-about.ts
│   │   ├── 📄 admin-home-hero.ts
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
│   │   ├── 📄 media-usage.ts
│   │   ├── 📄 media.ts
│   │   ├── 📄 newsletter-subscriber.ts
│   │   ├── 📄 presse.ts
│   │   ├── 📄 spectacles.ts
│   │   └── 📄 team.ts
│   ├── 📁 email
│   │   ├── 📄 actions.ts
│   │   └── 📄 types.ts
│   ├── 📁 forms
│   │   └── 📄 spectacle-form-helpers.ts
│   ├── 📁 hooks
│   │   ├── 📄 use-debounce.ts
│   │   ├── 📄 use-mobile.ts
│   │   ├── 📄 useContactForm.ts
│   │   ├── 📄 useHeroSlideForm.ts
│   │   ├── 📄 useHeroSlideFormSync.ts
│   │   ├── 📄 useHeroSlidesDelete.ts
│   │   ├── 📄 useHeroSlidesDnd.ts
│   │   ├── 📄 useImageValidation.ts
│   │   └── 📄 useNewsletterSubscribe.ts
│   ├── 📁 i18n
│   │   └── 📄 status.ts
│   ├── 📁 plugins
│   │   └── 📄 touch-hitbox-plugin.js
│   ├── 📁 schemas
│   │   ├── 📄 admin-users.ts
│   │   ├── 📄 agenda.ts
│   │   ├── 📄 compagnie.ts
│   │   ├── 📄 contact.ts
│   │   ├── 📄 dashboard.ts
│   │   ├── 📄 home-content.ts
│   │   ├── 📄 index.ts
│   │   ├── 📄 media.ts
│   │   ├── 📄 presse.ts
│   │   ├── 📄 spectacles.ts
│   │   └── 📄 team.ts
│   ├── 📁 tables
│   │   ├── 📄 spectacle-table-helpers.ts
│   │   └── 📄 user-table-helpers.ts
│   ├── 📁 utils
│   │   ├── 📄 file-hash.ts
│   │   ├── 📄 rate-limit.ts
│   │   └── 📄 validate-image-url.ts
│   ├── 📄 database.types.ts
│   ├── 📄 env.ts
│   ├── 📄 resend.ts
│   ├── 📄 site-config.ts
│   └── 📄 utils.ts
├── 📁 memory-bank
│   ├── 📁 architecture
│   │   ├── 📝 Email_Service_Architecture.md
│   │   ├── 📝 Project_Architecture_Blueprint.md
│   │   ├── 📝 Project_Folders_Structure_Blueprint_v5.md
│   │   ├── 📝 dev-email-redirect.md
│   │   └── 📝 file-tree.md
│   ├── 📁 changes
│   │   └── 📝 2025-11-11-layouts-admin-sidebar.md
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
│   ├── 📁 procedures
│   │   ├── 📝 admin-management.md
│   │   └── 📝 admin-user-registration.md
│   ├── 📁 tasks
│   │   ├── 📁 completed-tasks
│   │   │   ├── 📝 TASK007-update-memory-bank.md
│   │   │   ├── 📝 TASK011-integration-home-hero-slides.md
│   │   │   ├── 📝 TASK012-integration-ui-compagnie-stats.md
│   │   │   ├── 📝 TASK013-seeds-nouvelles-tables.md
│   │   │   ├── 📝 TASK019-fix-spectacles-archives.md
│   │   │   ├── 📝 TASK020-alignement-ui-presse.md
│   │   │   ├── 📝 TASK021-admin-backoffice-spectacles.md
│   │   │   ├── 📝 TASK021-admin-spectacles-crud.md
│   │   │   ├── 📝 TASK021-content-management-crud.md
│   │   │   ├── 📝 TASK021-documentation-docker.md
│   │   │   ├── 📝 TASK021B-documentation-supabase-cli.md
│   │   │   ├── 📝 TASK021C-auth-cleanup-and-optimization.md
│   │   │   ├── 📝 TASK022-REVIEW.md
│   │   │   ├── 📝 TASK022-implementation-summary.md
│   │   │   ├── 📝 TASK022-team-management.md
│   │   │   ├── 📝 TASK024-admin-email-scripts.md
│   │   │   ├── 📝 TASK025-rls-security-performance-fixes.md
│   │   │   ├── 📝 TASK025B-security-audit-campaign.md
│   │   │   ├── 📝 TASK026-COMPLIANCE-FIXES.md
│   │   │   ├── 📝 TASK026-FINAL-STATUS.md
│   │   │   ├── 📝 TASK026-homepage-content-management.md
│   │   │   ├── 📝 TASK026B-cloud-fix-procedure.md
│   │   │   ├── 📝 TASK026B-db-functions-compliance.md
│   │   │   ├── 📝 TASK027B-security-definer-rationale.md
│   │   │   ├── 📝 TASK028B-cleanup-obsolete-scripts.md
│   │   │   ├── 📝 TASK032-user-role-management-FINAL.md
│   │   │   └── 📝 TASK032-user-role-management.md
│   │   ├── 📝 RESOLVED_db_reconstruction_2025-11-18.md
│   │   ├── 📝 TASK014-backoffice-toggles-centralises.md
│   │   ├── 📝 TASK023-partners-management.md
│   │   ├── 📝 TASK024-press-management.md
│   │   ├── 📝 TASK027-company-content-management.md
│   │   ├── 📝 TASK028-content-versioning-ui.md
│   │   ├── 📝 TASK029-media-library.md
│   │   ├── 📝 TASK030-display-toggles.md
│   │   ├── 📝 TASK031-analytics-dashboard.md
│   │   ├── 📝 TASK033-audit-logs-viewer.md
│   │   ├── 📝 TASK034-performance-optimization.md
│   │   ├── 📝 TASK035-testing-suite.md
│   │   ├── 📝 TASK036-security-audit.md
│   │   ├── 📝 TASK037-accessibility-compliance.md
│   │   ├── 📝 TASK038-responsive-testing.md
│   │   ├── 📝 TASK039-production-deployment.md
│   │   ├── 📝 TASK040-documentation.md
│   │   ├── 📝 TASK046-rate-limiting-handlers.md
│   │   ├── 📝 TASK047-newsletter-schema-extraction.md
│   │   ├── 📝 TASK048-t3-env-implementation.md
│   │   ├── 📝 _archived_TASK025-communications-dashboard.md
│   │   ├── 📝 _index.md
│   │   ├── 📝 _issues_preview.md
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
│   ├── 📁 Archived-tests
│   │   ├── 📄 quick-test-active.sh
│   │   ├── 📄 test-active-endpoint-service.ts
│   │   ├── 📄 test-active-endpoint.sh
│   │   ├── 📄 test-active-endpoint.ts
│   │   └── 📄 test-spectacles-endpoints.ts
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
│   ├── 📁 test-invitation-email
│   │   ├── 📄 generate-invite-link.js
│   │   ├── 📄 test-complete-flow.js
│   │   ├── 📄 test-invitation-flow.js
│   │   ├── 📄 test-invitation-link-flow.js
│   │   ├── 📄 test-local-invitation.js
│   │   └── 📄 test-redirect-flow.js
│   ├── 📝 README.md
│   ├── 📄 check-email-logs.ts
│   ├── 📄 check-existing-profile.js
│   ├── 📄 check-extension.ts
│   ├── 📄 check-migration-applied.ts
│   ├── 📄 check-security-advisors.js
│   ├── 📄 check-security-audit.sh
│   ├── 📄 create-admin-user.ts
│   ├── 📄 create_issues.sh
│   ├── 📄 delete-test-user.js
│   ├── 📄 find-auth-user.js
│   ├── 📄 post-reset.sh
│   ├── 📄 rebuild-cloud-schema.sh
│   ├── 📄 seed-admin.ts
│   ├── 📄 set-admin-role.ts
│   ├── 📄 supabase-env.sh
│   ├── 📄 test-all-dal-functions.ts
│   ├── 📄 test-dashboard-stats.ts
│   ├── 📄 test-email-integration.ts
│   ├── 📄 test-env-validation.ts
│   ├── 📄 test-profile-insertion.js
│   ├── 📄 test-spectacles-crud.ts
│   ├── 📄 test-spectacles-dal.ts
│   ├── 📄 test-ssrf-validation.ts
│   ├── 📄 test-team-server-actions.ts
│   ├── 📄 test-views-security-invoker.ts
│   └── 📄 test-webhooks.ts
├── 📁 supabase
│   ├── 📁 .branches
│   │   └── 📄 _current_branch
│   ├── 📁 migrations
│   │   ├── 📁 archived
│   │   │   ├── 📄 20251118125945_normalize_spectacles_status.sql
│   │   │   ├── 📄 20251118130000_normalize_spectacles_status.sql
│   │   │   ├── 📄 20251123143116_fix_restore_content_version_published_at.sql
│   │   │   ├── 📄 20251209120000_normalize_spectacles_status_to_english.sql
│   │   │   ├── 📄 20251217100000_cleanup_spectacles_backup.sql
│   │   │   └── 📝 supabase-view-security-invoker-caveat.md
│   │   ├── 📄 20250918000000_fix_spectacles_versioning_trigger.sql
│   │   ├── 📄 20250918000002_apply_declarative_schema_complete.sql
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
│   │   ├── 📄 20251022160000_fix_all_views_security_invoker.sql
│   │   ├── 📄 20251024214802_reorder_team_members.sql
│   │   ├── 📄 20251024214930_grant_select_membres_equipe.sql
│   │   ├── 📄 20251027000000_create_is_admin_function.sql
│   │   ├── 📄 20251027020000_restore_basic_grants_for_rls.sql
│   │   ├── 📄 20251027021000_restore_remaining_grants.sql
│   │   ├── 📄 20251027021500_restore_views_grants.sql
│   │   ├── 📄 20251027022000_fix_logs_audit_grants.sql
│   │   ├── 📄 20251027022500_grant_execute_all_trigger_functions.sql
│   │   ├── 📄 20251115150000_fix_reorder_team_members_search_path.sql
│   │   ├── 📄 20251119000000_seed_admin_user.sql
│   │   ├── 📄 20251120120000_move_extensions_to_schema.sql
│   │   ├── 📄 20251120231121_create_user_invitations.sql
│   │   ├── 📄 20251120231146_create_pending_invitations.sql
│   │   ├── 📄 20251121184519_allow_admin_insert_profiles.sql
│   │   ├── 📄 20251121185458_allow_admin_update_profiles.sql
│   │   ├── 📄 20251123150000_remote_schema.sql
│   │   ├── 📄 20251123170231_create_messages_contact_admin_view.sql
│   │   ├── 📄 20251126001251_add_alt_text_to_home_hero_slides.sql
│   │   ├── 📄 20251126215129_fix_hero_slides_admin_select_policy.sql
│   │   ├── 📄 20251204133540_create_reorder_hero_slides_function.sql
│   │   ├── 📄 20251205220000_refactor_hero_slides_cta_dual_buttons.sql
│   │   ├── 📄 20251209120000_normalize_spectacles_status_to_english.sql
│   │   ├── 📄 20251222120000_add_media_file_hash.sql
│   │   ├── 📄 20251227203314_add_media_tags_folders.sql
│   │   ├── 📄 20251227223934_fix_storage_path_urls_in_views.sql
│   │   ├── 📄 20251227225607_restore_medias_folder_id.sql
│   │   ├── 📄 20251228145621_add_thumbnail_support_phase3.sql
│   │   ├── 📄 20251228220350_fix_media_tags_folders_rls_granular.sql
│   │   ├── 📝 ROUND_7B_ANALYSIS.md
│   │   ├── 📝 migrations.md
│   │   └── 📄 sync_existing_profiles.sql
│   ├── 📁 reconstruction_database_plan
│   │   ├── 📝 RECONSTRUCTION_PLAN.md
│   │   └── 📝 RECONSTRUCTION_SUCCESS.md
│   ├── 📁 schemas
│   │   ├── 📄 01_extensions.sql
│   │   ├── 📄 02_table_profiles.sql
│   │   ├── 📄 02b_functions_core.sql
│   │   ├── 📄 02c_storage_buckets.sql
│   │   ├── 📄 03_table_medias.sql
│   │   ├── 📄 04_table_media_tags_folders.sql
│   │   ├── 📄 04_table_membres_equipe.sql
│   │   ├── 📄 05_profiles_auto_sync.sql
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
│   │   ├── 📄 10b_tables_user_management.sql
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
│   │   ├── 📄 63b_reorder_hero_slides.sql
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
│   ├── 📁 snippets
│   ├── 📁 tests
│   │   ├── 📄 20251025_test_reorder_and_views.sql
│   │   ├── 📝 README.md
│   │   ├── 📄 ci-run.sh
│   │   ├── 📄 run_audit_grants.sh
│   │   └── 📄 run_reorder_tests.sh
│   ├── 📝 README.md
│   ├── 📄 admin.ts
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
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── ⚙️ .markdownlint.jsonc
├── 📝 COMMIT_MESSAGE_HYDRATION_FIX.txt
├── 📝 README.md
├── 📝 TESTING_RESEND.md
├── 📄 check_spectacles_rls.sql
├── ⚙️ components.json
├── 📄 eslint.config.mjs
├── 📄 inspect-tables.sql
├── 📄 next.config.ts
├── ⚙️ package.json
├── ⚙️ pnpm-lock.yaml
├── 📄 postcss.config.mjs
├── 📄 proxy.ts
├── 📄 supabase_public_data.sql
├── 📄 tailwind.config.ts
├── 📄 test-email-simple.js
└── ⚙️ tsconfig.json
```
