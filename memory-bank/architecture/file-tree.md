# File Tree: rougecardinalcompany

**Generated:** 16/01/2026, 10:00:00 AM
**Root Path:** `memory-bank/architecture`
**Last Updated:** Added TASK030 Phase 11 scripts (check-presse-toggles.ts, toggle-presse.ts) - 2026-01-02

```bash
├── 📁 .github
│   ├── 📁 copilot
│   ├── 📁 instructions
│   ├── 📁 prompts
│   ├── 📁 workflows
│   └── 📝 copilot-instructions.md
├── 📁 __tests__
├── 📁 app
│   ├── 📁 (admin)
│   │   ├── 📁 admin
│   │   │   ├── 📁 audit-logs
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📄 page.tsx
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
│   │   │   ├── 📁 site-config
│   │   │   │   ├── 📄 loading.tsx
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
│   │   ├── 📁 sentry-example-api
│   │   │   └── 📄 route.ts
│   │   ├── 📁 test-email
│   │   │   └── 📄 route.ts
│   │   ├── 📁 test-error
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
│   ├── 📁 sentry-example-page
│   │   └── 📄 page.tsx
│   ├── 📁 test-connection
│   │   └── 📄 page.tsx
│   ├── 📄 error.tsx
│   ├── 📄 favicon.ico
│   ├── 📄 global-error.tsx
│   ├── 📄 global.d.ts
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   ├── 🖼️ opengraph-image.png
│   └── 🖼️ twitter-image.png
├── 📁 components
│   ├── 📁 LogoCloud
│   │   ├── 📄 LogoCloud.tsx
│   │   ├── 📝 README.md
│   │   ├── 📄 index.ts
│   │   └── 📄 types.ts
│   ├── 📁 LogoCloudModel
│   │   ├── 📄 BrandLogos.tsx
│   │   └── 📄 LogoCloudModel.tsx
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
│   ├── 📁 error-boundaries
│   │   ├── 📄 ComponentErrorBoundary.tsx
│   │   ├── 📄 PageErrorBoundary.tsx
│   │   ├── 📄 RootErrorBoundary.tsx
│   │   └── 📄 index.ts
│   ├── 📁 features
│   │   ├── 📁 admin
│   │   │   ├── 📁 audit-logs
│   │   │   │   ├── 📄 AuditLogDetailModal.tsx
│   │   │   │   ├── 📄 AuditLogFilters.tsx
│   │   │   │   ├── 📄 AuditLogsContainer.tsx
│   │   │   │   ├── 📄 AuditLogsSkeleton.tsx
│   │   │   │   ├── 📄 AuditLogsTable.tsx
│   │   │   │   ├── 📄 AuditLogsView.tsx
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 types.ts
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
│   │   │   ├── 📁 site-config
│   │   │   │   ├── 📄 DisplayTogglesContainer.tsx
│   │   │   │   ├── 📄 DisplayTogglesView.tsx
│   │   │   │   ├── 📄 ToggleCard.tsx
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
│   │   ├── 📄 DisplayTogglesSkeleton.tsx
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
│   ├── 📁 ui
│   │   ├── 📄 alert-dialog.tsx
│   │   ├── 📄 alert.tsx
│   │   ├── 📄 avatar.tsx
│   │   ├── 📄 badge.tsx
│   │   ├── 📄 breadcrumb.tsx
│   │   ├── 📄 button.tsx
│   │   ├── 📄 calendar.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 checkbox.tsx
│   │   ├── 📄 date-range-picker.tsx
│   │   ├── 📄 dialog.tsx
│   │   ├── 📄 dropdown-menu.tsx
│   │   ├── 📄 form.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 label.tsx
│   │   ├── 📄 pagination.tsx
│   │   ├── 📄 popover.tsx
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
│   ├── 📄 test-toast-button.tsx
│   ├── 📄 theme-switcher.tsx
│   └── 📄 update-password-form.tsx
├── 📁 doc
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
│   │   ├── 📄 site-config-actions.ts
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
│   │   ├── 📄 audit-logs.ts
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
│   │   ├── 📄 site-config.ts
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
│   │   ├── 📄 audit-logs.ts
│   │   ├── 📄 compagnie.ts
│   │   ├── 📄 contact.ts
│   │   ├── 📄 dashboard.ts
│   │   ├── 📄 home-content.ts
│   │   ├── 📄 index.ts
│   │   ├── 📄 media.ts
│   │   ├── 📄 presse.ts
│   │   ├── 📄 site-config.ts
│   │   ├── 📄 spectacles.ts
│   │   └── 📄 team.ts
│   ├── 📁 sentry
│   │   ├── 📄 capture-error.ts
│   │   └── 📄 index.ts
│   ├── 📁 tables
│   │   ├── 📄 spectacle-table-helpers.ts
│   │   └── 📄 user-table-helpers.ts
│   ├── 📁 utils
│   │   ├── 📄 file-hash.ts
│   │   ├── 📄 get-client-ip.ts
│   │   ├── 📄 rate-limit.ts
│   │   └── 📄 validate-image-url.ts
│   ├── 📄 database.types.ts
│   ├── 📄 env.ts
│   ├── 📄 resend.ts
│   ├── 📄 site-config.ts
│   └── 📄 utils.ts
├── 📁 memory-bank
├── 📁 public
├── 📁 scripts
├── 📁 supabase
│   ├── 📁 .branches
│   ├── 📁 migrations
│   └── 📁 seschemaseds
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
