# File Tree: rougecardinalcompany

**Generated:** 3/5/2026, 4:56:31 PM
**Root Path:** `/home/yandev/projets-2026/rougecardinalcompany`

```bash

├── 📁 .github
│   ├── 📁 workflows
│   │   ├── ⚙️ backup-database.yml
│   │   ├── ⚙️ deploy.yml
│   │   ├── ⚙️ detect-revoke-warn.yml
│   │   ├── ⚙️ invitation-email-test.yml
│   │   ├── ⚙️ monitor-detect-revoke.yml
│   │   └── ⚙️ reorder-sql-tests.yml
├── 📁 __tests__
│   └── 📁 emails
│       └── 📄 invitation-email.test.tsx
├── 📁 app
│   ├── 📁 (admin)
│   │   ├── 📁 admin
│   │   │   ├── 📁 agenda
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   ├── 📁 edit
│   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 new
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📄 actions-client.ts
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 analytics
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 audit-logs
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 compagnie
│   │   │   │   ├── 📁 presentation
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 valeurs
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📄 compagnie-presentation-actions.ts
│   │   │   │   ├── 📄 compagnie-values-actions.ts
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
│   │   │   ├── 📁 lieux
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📁 edit
│   │   │   │   │       └── 📄 page.tsx
│   │   │   │   ├── 📁 new
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 media
│   │   │   │   ├── 📁 folders
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 library
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 tags
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 partners
│   │   │   │   ├── 📁 [id]
│   │   │   │   │   └── 📁 edit
│   │   │   │   │       └── 📄 page.tsx
│   │   │   │   ├── 📁 new
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📄 actions.ts
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 presse
│   │   │   │   ├── 📁 articles
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   └── 📁 edit
│   │   │   │   │   │       └── 📄 page.tsx
│   │   │   │   │   └── 📁 new
│   │   │   │   │       └── 📄 page.tsx
│   │   │   │   ├── 📁 communiques
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   ├── 📁 edit
│   │   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   │   └── 📁 preview
│   │   │   │   │   │       └── 📄 page.tsx
│   │   │   │   │   └── 📁 new
│   │   │   │   │       └── 📄 page.tsx
│   │   │   │   ├── 📁 contacts
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   └── 📁 edit
│   │   │   │   │   │       └── 📄 page.tsx
│   │   │   │   │   └── 📁 new
│   │   │   │   │       └── 📄 page.tsx
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   ├── 📄 press-articles-actions.ts
│   │   │   │   ├── 📄 press-contacts-actions.ts
│   │   │   │   └── 📄 press-releases-actions.ts
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
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 spectacle-photo-actions.ts
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
│   │   │   ├── 📁 [slug]
│   │   │   │   ├── 📄 not-found.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 actions
│   │   ├── 📄 analytics.actions.ts
│   │   ├── 📄 contact.actions.ts
│   │   └── 📄 newsletter.actions.ts
│   ├── 📁 api
│   │   ├── 📁 admin
│   │   │   ├── 📁 media
│   │   │   │   ├── 📁 search
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📁 thumbnail
│   │   │   │       └── 📄 route.ts
│   │   │   └── 📁 spectacles
│   │   │       └── 📁 [id]
│   │   │           └── 📁 gallery-photos
│   │   │               └── 📄 route.ts
│   │   ├── 📁 contact
│   │   │   └── 📄 route.ts
│   │   ├── 📁 debug-auth
│   │   │   └── 📄 route.ts
│   │   ├── 📁 newsletter
│   │   │   └── 📄 route.ts
│   │   ├── 📁 sentry-example-api
│   │   │   └── 📄 route.ts
│   │   ├── 📁 spectacles
│   │   │   └── 📁 [id]
│   │   │       └── 📁 photos
│   │   │           └── 📄 route.ts
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
│   │   │   ├── 📁 agenda
│   │   │   │   ├── 📄 EventDetail.tsx
│   │   │   │   ├── 📄 EventForm.tsx
│   │   │   │   ├── 📄 EventFormFields.tsx
│   │   │   │   ├── 📄 EventsContainer.tsx
│   │   │   │   ├── 📄 EventsTable.tsx
│   │   │   │   ├── 📄 EventsView.tsx
│   │   │   │   ├── 📄 LieuSelect.tsx
│   │   │   │   ├── 📄 SpectacleSelect.tsx
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 analytics
│   │   │   │   ├── 📄 AdminActivityCard.tsx
│   │   │   │   ├── 📄 AnalyticsContainer.tsx
│   │   │   │   ├── 📄 AnalyticsDashboard.tsx
│   │   │   │   ├── 📄 AnalyticsDashboardNoSSR.tsx
│   │   │   │   ├── 📄 AnalyticsFilters.tsx
│   │   │   │   ├── 📄 MetricCard.tsx
│   │   │   │   ├── 📄 PageviewsChart.tsx
│   │   │   │   ├── 📄 SentryErrorsCard.tsx
│   │   │   │   ├── 📄 TopPagesTable.tsx
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 audit-logs
│   │   │   │   ├── 📄 AuditLogDetailModal.tsx
│   │   │   │   ├── 📄 AuditLogFilters.tsx
│   │   │   │   ├── 📄 AuditLogsContainer.tsx
│   │   │   │   ├── 📄 AuditLogsSkeleton.tsx
│   │   │   │   ├── 📄 AuditLogsTable.tsx
│   │   │   │   ├── 📄 AuditLogsView.tsx
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 compagnie
│   │   │   │   ├── 📄 ContentArrayField.tsx
│   │   │   │   ├── 📄 PresentationContainer.tsx
│   │   │   │   ├── 📄 PresentationForm.tsx
│   │   │   │   ├── 📄 PresentationFormFields.tsx
│   │   │   │   ├── 📄 PresentationView.tsx
│   │   │   │   ├── 📄 ValueForm.tsx
│   │   │   │   ├── 📄 ValuesContainer.tsx
│   │   │   │   ├── 📄 ValuesView.tsx
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
│   │   │   │   ├── 📄 HeroSlidesView.tsx
│   │   │   │   ├── 📄 StatForm.tsx
│   │   │   │   ├── 📄 StatsContainer.tsx
│   │   │   │   ├── 📄 StatsView.tsx
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 lieux
│   │   │   │   ├── 📄 LieuForm.tsx
│   │   │   │   ├── 📄 LieuFormFields.tsx
│   │   │   │   ├── 📄 LieuxContainer.tsx
│   │   │   │   ├── 📄 LieuxTable.tsx
│   │   │   │   ├── 📄 LieuxView.tsx
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 media
│   │   │   │   ├── 📁 details
│   │   │   │   │   ├── 📄 MediaDetailActions.tsx
│   │   │   │   │   ├── 📄 MediaEditForm.tsx
│   │   │   │   │   ├── 📄 MediaFileInfo.tsx
│   │   │   │   │   └── 📄 MediaPreview.tsx
│   │   │   │   ├── 📁 hooks
│   │   │   │   │   └── 📄 useMediaLibraryState.ts
│   │   │   │   ├── 📁 image-field
│   │   │   │   │   ├── 📄 ImageFieldAltText.tsx
│   │   │   │   │   ├── 📄 ImageFieldContext.tsx
│   │   │   │   │   ├── 📄 ImageFieldPreview.tsx
│   │   │   │   │   ├── 📄 ImageFieldProvider.tsx
│   │   │   │   │   ├── 📄 ImageFieldSourceActions.tsx
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📄 BulkDeleteDialog.tsx
│   │   │   │   ├── 📄 BulkTagSelector.tsx
│   │   │   │   ├── 📄 ImageField.tsx
│   │   │   │   ├── 📄 MediaBulkActions.tsx
│   │   │   │   ├── 📄 MediaCard.tsx
│   │   │   │   ├── 📄 MediaCardFooter.tsx
│   │   │   │   ├── 📄 MediaCardThumbnail.tsx
│   │   │   │   ├── 📄 MediaDetailsContext.tsx
│   │   │   │   ├── 📄 MediaDetailsPanel.tsx
│   │   │   │   ├── 📄 MediaDetailsProvider.tsx
│   │   │   │   ├── 📄 MediaExternalUrlInput.tsx
│   │   │   │   ├── 📄 MediaFolderFormDialog.tsx
│   │   │   │   ├── 📄 MediaFoldersContainer.tsx
│   │   │   │   ├── 📄 MediaFoldersView.tsx
│   │   │   │   ├── 📄 MediaLibraryContainer.tsx
│   │   │   │   ├── 📄 MediaLibraryContext.tsx
│   │   │   │   ├── 📄 MediaLibraryPicker.tsx
│   │   │   │   ├── 📄 MediaLibraryProvider.tsx
│   │   │   │   ├── 📄 MediaLibraryView.tsx
│   │   │   │   ├── 📄 MediaLibraryViewClient.tsx
│   │   │   │   ├── 📄 MediaTagFormDialog.tsx
│   │   │   │   ├── 📄 MediaTagsContainer.tsx
│   │   │   │   ├── 📄 MediaTagsView.tsx
│   │   │   │   ├── 📄 MediaUploadDialog.tsx
│   │   │   │   ├── 📄 TagActionBadge.tsx
│   │   │   │   ├── 📄 constants.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 partners
│   │   │   │   ├── 📄 PartnerForm.tsx
│   │   │   │   ├── 📄 PartnersContainer.tsx
│   │   │   │   ├── 📄 PartnersView.tsx
│   │   │   │   ├── 📄 SortablePartnerCard.tsx
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 presse
│   │   │   │   ├── 📄 ArticleEditForm.tsx
│   │   │   │   ├── 📄 ArticleNewForm.tsx
│   │   │   │   ├── 📄 ArticlesContainer.tsx
│   │   │   │   ├── 📄 ArticlesView.tsx
│   │   │   │   ├── 📄 PressContactEditForm.tsx
│   │   │   │   ├── 📄 PressContactNewForm.tsx
│   │   │   │   ├── 📄 PressContactsContainer.tsx
│   │   │   │   ├── 📄 PressContactsView.tsx
│   │   │   │   ├── 📄 PressReleaseEditForm.tsx
│   │   │   │   ├── 📄 PressReleaseNewForm.tsx
│   │   │   │   ├── 📄 PressReleasesContainer.tsx
│   │   │   │   ├── 📄 PressReleasesView.tsx
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 site-config
│   │   │   │   ├── 📄 DisplayTogglesContainer.tsx
│   │   │   │   ├── 📄 DisplayTogglesView.tsx
│   │   │   │   ├── 📄 ToggleCard.tsx
│   │   │   │   ├── 📄 ToggleSection.tsx
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 spectacles
│   │   │   │   ├── 📄 SortableGalleryCard.tsx
│   │   │   │   ├── 📄 SortableHeader.tsx
│   │   │   │   ├── 📄 SpectacleForm.tsx
│   │   │   │   ├── 📄 SpectacleFormFields.tsx
│   │   │   │   ├── 📄 SpectacleFormImageSection.tsx
│   │   │   │   ├── 📄 SpectacleFormMetadata.tsx
│   │   │   │   ├── 📄 SpectacleGalleryManager.tsx
│   │   │   │   ├── 📄 SpectaclePhotoManager.tsx
│   │   │   │   ├── 📄 SpectaclesManagementContainer.tsx
│   │   │   │   ├── 📄 SpectaclesTable.tsx
│   │   │   │   └── 📄 types.ts
│   │   │   ├── 📁 team
│   │   │   │   ├── 📄 TeamManagementContainer.tsx
│   │   │   │   ├── 📄 TeamMemberCard.tsx
│   │   │   │   ├── 📄 TeamMemberForm.tsx
│   │   │   │   ├── 📄 TeamMemberFormClient.tsx
│   │   │   │   ├── 📄 TeamMemberFormWrapper.tsx
│   │   │   │   ├── 📄 TeamMemberList.tsx
│   │   │   │   └── 📄 types.ts
│   │   │   └── 📁 users
│   │   │       ├── 📄 InviteUserForm.tsx
│   │   │       ├── 📄 UserDeleteDialog.tsx
│   │   │       ├── 📄 UserDesktopTable.tsx
│   │   │       ├── 📄 UserMobileCard.tsx
│   │   │       ├── 📄 UserRoleChangeDialog.tsx
│   │   │       ├── 📄 UserStatusBadge.tsx
│   │   │       ├── 📄 UsersManagementContainer.tsx
│   │   │       ├── 📄 UsersManagementView.tsx
│   │   │       ├── 📄 index.ts
│   │   │       └── 📄 types.ts
│   │   ├── 📁 analytics
│   │   │   └── 📄 PageViewTracker.tsx
│   │   └── 📁 public-site
│   │       ├── 📁 agenda
│   │       │   ├── 📄 AgendaClientContainer.tsx
│   │       │   ├── 📄 AgendaContainer.tsx
│   │       │   ├── 📄 AgendaContext.tsx
│   │       │   ├── 📄 AgendaEventList.tsx
│   │       │   ├── 📄 AgendaFilters.tsx
│   │       │   ├── 📄 AgendaHero.tsx
│   │       │   ├── 📄 AgendaNewsletter.tsx
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 types.ts
│   │       ├── 📁 compagnie
│   │       │   ├── 📁 sections
│   │       │   │   ├── 📄 SectionHero.tsx
│   │       │   │   ├── 📄 SectionHistory.tsx
│   │       │   │   ├── 📄 SectionMission.tsx
│   │       │   │   ├── 📄 SectionQuote.tsx
│   │       │   │   ├── 📄 SectionTeam.tsx
│   │       │   │   ├── 📄 SectionValues.tsx
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📄 CompagnieContainer.tsx
│   │       │   ├── 📄 CompagnieView.tsx
│   │       │   ├── 📝 MAPPING.md
│   │       │   ├── 📄 constants.ts
│   │       │   ├── 📄 index.ts
│   │       │   └── 📄 types.ts
│   │       ├── 📁 contact
│   │       │   ├── 📄 ContactForm.tsx
│   │       │   ├── 📄 ContactInfoSidebar.tsx
│   │       │   ├── 📄 ContactPageContainer.tsx
│   │       │   ├── 📄 ContactPageView.tsx
│   │       │   ├── 📄 ContactServerGate.tsx
│   │       │   ├── 📄 ContactSuccessView.tsx
│   │       │   ├── 📄 NewsletterCard.tsx
│   │       │   ├── 📄 actions.ts
│   │       │   └── 📄 contact-types.ts
│   │       ├── 📁 home
│   │       │   ├── 📁 about
│   │       │   │   ├── 📄 AboutContainer.tsx
│   │       │   │   ├── 📄 AboutContent.tsx
│   │       │   │   ├── 📄 AboutView.tsx
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 hero
│   │       │   │   ├── 📄 HeroCTA.tsx
│   │       │   │   ├── 📄 HeroClient.tsx
│   │       │   │   ├── 📄 HeroContainer.tsx
│   │       │   │   ├── 📄 HeroIndicators.tsx
│   │       │   │   ├── 📄 HeroNavigation.tsx
│   │       │   │   ├── 📄 HeroProgressBar.tsx
│   │       │   │   ├── 📄 HeroSlideBackground.tsx
│   │       │   │   ├── 📄 HeroView.tsx
│   │       │   │   ├── 📄 constants.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 news
│   │       │   │   ├── 📄 NewsCard.tsx
│   │       │   │   ├── 📄 NewsContainer.tsx
│   │       │   │   ├── 📄 NewsView.tsx
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 newsletter
│   │       │   │   ├── 📄 NewsletterClientContainer.tsx
│   │       │   │   ├── 📄 NewsletterContainer.tsx
│   │       │   │   ├── 📄 NewsletterContext.tsx
│   │       │   │   ├── 📄 NewsletterForm.tsx
│   │       │   │   ├── 📄 NewsletterView.tsx
│   │       │   │   ├── 📄 hooks.ts
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 partners
│   │       │   │   ├── 📄 PartnersContainer.tsx
│   │       │   │   ├── 📄 PartnersView.tsx
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   ├── 📁 shows
│   │       │   │   ├── 📄 ShowCard.tsx
│   │       │   │   ├── 📄 ShowsContainer.tsx
│   │       │   │   ├── 📄 ShowsView.tsx
│   │       │   │   ├── 📄 index.ts
│   │       │   │   └── 📄 types.ts
│   │       │   └── 📄 index.ts
│   │       ├── 📁 presse
│   │       │   ├── 📄 AccreditationSection.tsx
│   │       │   ├── 📄 CommuniquesSection.tsx
│   │       │   ├── 📄 ContactPresseSection.tsx
│   │       │   ├── 📄 HeroSection.tsx
│   │       │   ├── 📄 MediaKitSection.tsx
│   │       │   ├── 📄 PresseContainer.tsx
│   │       │   ├── 📄 PresseServerGate.tsx
│   │       │   ├── 📄 PresseView.tsx
│   │       │   ├── 📄 RevueDePresse.tsx
│   │       │   └── 📄 types.ts
│   │       └── 📁 spectacles
│   │           ├── 📄 LandscapePhotoCard.tsx
│   │           ├── 📄 SpectacleCTABar.tsx
│   │           ├── 📄 SpectacleCarousel.tsx
│   │           ├── 📄 SpectacleDetailView.tsx
│   │           ├── 📄 SpectaclesContainer.tsx
│   │           ├── 📄 SpectaclesView.tsx
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
│   │   ├── 📄 presse-sections-skeleton.tsx
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
│   │   ├── 📄 calendar.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 chart.tsx
│   │   ├── 📄 checkbox.tsx
│   │   ├── 📄 command.tsx
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
├── 📁 e2e-tests
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
│   │   ├── 📄 home-stats-actions.ts
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
│   │   ├── 📁 fallback
│   │   │   └── 📄 compagnie-presentation-fallback.ts
│   │   ├── 📁 helpers
│   │   │   ├── 📄 error.ts
│   │   │   ├── 📄 format.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 media-url.ts
│   │   │   ├── 📄 serialize.ts
│   │   │   └── 📄 slug.ts
│   │   ├── 📄 admin-agenda.ts
│   │   ├── 📄 admin-compagnie-presentation.ts
│   │   ├── 📄 admin-compagnie-values.ts
│   │   ├── 📄 admin-home-about.ts
│   │   ├── 📄 admin-home-hero.ts
│   │   ├── 📄 admin-home-stats.ts
│   │   ├── 📄 admin-lieux.ts
│   │   ├── 📄 admin-partners.ts
│   │   ├── 📄 admin-press-articles.ts
│   │   ├── 📄 admin-press-contacts.ts
│   │   ├── 📄 admin-press-releases.ts
│   │   ├── 📄 admin-press-select-options.ts
│   │   ├── 📄 admin-users.ts
│   │   ├── 📄 agenda.ts
│   │   ├── 📄 analytics.ts
│   │   ├── 📄 audit-logs.ts
│   │   ├── 📄 compagnie-presentation.ts
│   │   ├── 📄 compagnie.ts
│   │   ├── 📄 contact.ts
│   │   ├── 📄 dashboard.ts
│   │   ├── 📄 data-retention.ts
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
│   │   ├── 📄 spectacle-photos.ts
│   │   ├── 📄 spectacles.ts
│   │   ├── 📄 team-hard-delete.ts
│   │   ├── 📄 team-reorder.ts
│   │   └── 📄 team.ts
│   ├── 📁 email
│   │   ├── 📄 actions.ts
│   │   └── 📄 types.ts
│   ├── 📁 forms
│   │   └── 📄 spectacle-form-helpers.ts
│   ├── 📁 hooks
│   │   ├── 📄 use-debounce.ts
│   │   ├── 📄 use-mobile.ts
│   │   ├── 📄 use-prefers-reduced-motion.ts
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
│   │   ├── 📄 admin-agenda-ui.ts
│   │   ├── 📄 admin-agenda.ts
│   │   ├── 📄 admin-lieux.ts
│   │   ├── 📄 admin-users.ts
│   │   ├── 📄 agenda.ts
│   │   ├── 📄 analytics.ts
│   │   ├── 📄 audit-logs.ts
│   │   ├── 📄 compagnie-admin.ts
│   │   ├── 📄 compagnie.ts
│   │   ├── 📄 contact.ts
│   │   ├── 📄 dashboard.ts
│   │   ├── 📄 data-retention.ts
│   │   ├── 📄 home-content.ts
│   │   ├── 📄 index.ts
│   │   ├── 📄 media.ts
│   │   ├── 📄 newsletter.ts
│   │   ├── 📄 partners.ts
│   │   ├── 📄 press-article.ts
│   │   ├── 📄 press-contact.ts
│   │   ├── 📄 press-release.ts
│   │   ├── 📄 presse.ts
│   │   ├── 📄 site-config.ts
│   │   ├── 📄 spectacles.ts
│   │   └── 📄 team.ts
│   ├── 📁 sentry
│   │   ├── 📄 capture-error.ts
│   │   └── 📄 index.ts
│   ├── 📁 services
│   │   └── 📄 sentry-api.ts
│   ├── 📁 tables
│   │   ├── 📄 audit-log-table-helpers.ts
│   │   ├── 📄 event-table-helpers.ts
│   │   ├── 📄 lieu-table-helpers.ts
│   │   ├── 📄 spectacle-table-helpers.tsx
│   │   └── 📄 user-table-helpers.ts
│   ├── 📁 types
│   │   └── 📄 admin-agenda-client.ts
│   ├── 📁 utils
│   │   ├── 📄 audit-log-filters.ts
│   │   ├── 📄 file-hash.ts
│   │   ├── 📄 format.ts
│   │   ├── 📄 get-client-ip.ts
│   │   ├── 📄 image-validation-refinements.ts
│   │   ├── 📄 image-validation-server.ts
│   │   ├── 📄 mime-verify.ts
│   │   ├── 📄 press-utils.ts
│   │   ├── 📄 rate-limit.ts
│   │   ├── 📄 validate-image-url.ts
│   │   └── 📄 with-display-toggle.tsx
│   ├── 📄 database.types.ts
│   ├── 📄 env.ts
│   ├── 📄 resend.ts
│   ├── 📄 site-config.ts
│   └── 📄 utils.ts
├── 📁 memory-bank
│   ├── 📁 architecture
│   │   ├── 📝 Email_Service_Architecture.md
│   │   ├── 📝 Project_Architecture_Blueprint.md
│   │   ├── 📝 Project_Folders_Structure_Blueprint.md
│   │   ├── 📝 dev-email-redirect.md
│   │   └── 📝 file-tree.md
│   ├── 📁 epics
│   │   ├── 📁 details
│   │   └── ⚙️ epics-map.yaml
│   ├── 📁 procedures
│   │   ├── 📝 admin-management.md
│   │   └── 📝 admin-user-registration.md
│   ├── 📁 tasks
│   │   ├── 📝 _index.md
│   │   └── 📝 _preview_backoffice_tasks.md
│   ├── 📝 RGPD_DATA_RETENTION_POLICY.md
│   ├── 📝 activeContext.md
│   ├── 📝 guide-url-images-externes.md
│   ├── 📝 productContext.md
│   ├── 📝 progress.md
│   ├── 📝 projectbrief.md
│   ├── 📝 rate-limiting-media-upload.md
│   ├── 📝 systemPatterns.md
│   ├── 📝 t3_env_guide.md
│   ├── 📝 techContext.md
│   └── 📝 thumbnail-flow.md
├── 📁 public
├── 📁 scripts
│   ├── 📁 Test_fetchMediaArticles
│   ├── 📁 Thumbnails
│   ├── 📁 lib
│   │   └── 📄 env.ts
│   ├── 📁 test-invitation-email
│   ├── 📁 utils
│   │   └── 📄 supabase-local-credentials.ts
│   ├── 📝 README.md
│   ├── 📄 audit-cookie-flags.ts
│   ├── 📄 audit-secrets-management.ts
│   ├── 📄 backup-database.ts
│   ├── 📄 check-admin-status.ts
│   ├── 📄 check-buckets.ts
│   ├── 📄 check-cloud-data.ts
│   ├── 📄 check-cloud-policies.sql
│   ├── 📄 check-display-toggles.ts
│   ├── 📄 check-email-logs.ts
│   ├── 📄 check-existing-profile.js
│   ├── 📄 check-extension.ts
│   ├── 📄 check-migration-applied.ts
│   ├── 📄 check-policies.sql
│   ├── 📄 check-presse-toggles.ts
│   ├── 📄 check-rls-policies.ts
│   ├── 📄 check-security-advisors.js
│   ├── 📄 check-security-advisors.ts
│   ├── 📄 check-security-audit.sh
│   ├── 📄 check-storage-buckets.ts
│   ├── 📄 check-storage-files.ts
│   ├── 📄 check-storage-paths.ts
│   ├── 📄 check-thumbnails-db.ts
│   ├── 📄 check-view-permissions.js
│   ├── 📄 check-views-security.ts
│   ├── 📄 check_unused_indexes.sql
│   ├── 📄 create-admin-user-local.ts
│   ├── 📄 create-admin-user.ts
│   ├── 📄 create_issues.sh
│   ├── 📄 debug-rls-errors.ts
│   ├── 📄 debug-spectacle-media-complete.sql
│   ├── 📄 debug-spectacle-media-usage.sql
│   ├── 📄 delete-test-user.js
│   ├── 📄 deploy-edge-function.sh
│   ├── 📄 diagnose-admin-views.js
│   ├── 📄 find-auth-user.js
│   ├── 📄 generate-missing-thumbnails.ts
│   ├── 📄 inspect-user.ts
│   ├── 📄 post-reset.sh
│   ├── 📄 rebuild-cloud-schema.sh
│   ├── 📄 regenerate-all-thumbnails-remote.ts
│   ├── 📄 regenerate-all-thumbnails.ts
│   ├── 📄 seed-admin.ts
│   ├── 📄 set-admin-role.ts
│   ├── 📄 supabase-env.sh
│   ├── 📄 test-admin-agenda-crud.ts
│   ├── 📄 test-admin-compagnie.ts
│   ├── 📄 test-admin-partners.ts
│   ├── 📄 test-agenda-query.ts
│   ├── 📄 test-all-dal-functions-doc.ts
│   ├── 📄 test-all-dal-functions.ts
│   ├── 📄 test-audit-logs-cloud.ts
│   ├── 📄 test-audit-logs-schema.ts
│   ├── 📄 test-audit-logs.ts
│   ├── 📄 test-cookie-security.ts
│   ├── 📄 test-dal-query-spectacles.sql
│   ├── 📄 test-dashboard-stats.ts
│   ├── 📄 test-data-retention.ts
│   ├── 📄 test-email-integration.ts
│   ├── 📄 test-env-validation.ts
│   ├── 📄 test-home-stats.ts
│   ├── 📄 test-newsletter-recursion-fix-direct.ts
│   ├── 📄 test-newsletter-recursion-fix.ts
│   ├── 📄 test-profile-insertion.js
│   ├── 📄 test-rate-limit-contact.ts
│   ├── 📄 test-rate-limit-newsletter.ts
│   ├── 📄 test-rate-limit.ts
│   ├── 📄 test-rls-cloud.ts
│   ├── 📄 test-rls-policy-with-check-validation.ts
│   ├── 📄 test-sentry-api.ts
│   ├── 📄 test-spectacles-crud.ts
│   ├── 📄 test-spectacles-dal.ts
│   ├── 📄 test-ssrf-validation.ts
│   ├── 📄 test-team-server-actions.ts
│   ├── 📄 test-thumbnail-direct-remote.ts
│   ├── 📄 test-thumbnail-direct.ts
│   ├── 📄 test-thumbnail-generation-remote.ts
│   ├── 📄 test-thumbnail-generation.ts
│   ├── 📄 test-views-security-authenticated-cloud.ts
│   ├── 📄 test-views-security-authenticated.ts
│   ├── 📄 test-views-security-invoker.ts
│   ├── 📄 test-webhooks.ts
│   ├── 📄 toggle-presse.ts
│   └── 📄 validate-media-folders.ts
├── 📁 supabase
│   ├── 📁 .branches
│   ├── 📁 functions
│   │   └── 📁 scheduled-cleanup
│   │       ├── ⚙️ deno.json
│   │       └── 📄 index.ts
│   ├── 📁 migrations
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
│   │   ├── 📄 20251022140000_grant_select_articles_presse_anon.sql
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
│   │   ├── 📄 20251228140000_add_thumbnail_support.sql
│   │   ├── 📄 20251228220350_fix_media_tags_folders_rls_granular.sql
│   │   ├── 📄 20251230120000_sync_media_folders_with_storage.sql
│   │   ├── 📄 20251231010000_fix_base_tables_rls_revoke_admin_views_anon.sql
│   │   ├── 📄 20251231020000_enforce_security_invoker_all_views_final.sql
│   │   ├── 📄 20260101160000_add_display_toggles_metadata_columns.sql
│   │   ├── 📄 20260101160100_seed_display_toggles.sql
│   │   ├── 📄 20260101170000_cleanup_and_add_epic_toggles.sql
│   │   ├── 📄 20260101180000_fix_cleanup_display_toggles_no_compagnie.sql
│   │   ├── 📄 20260101220000_fix_presse_toggles.sql
│   │   ├── 📄 20260103004430_remote_schema.sql
│   │   ├── 📄 20260103120000_fix_communiques_presse_dashboard_admin_access.sql
│   │   ├── 📄 20260103123000_revoke_authenticated_on_communiques_dashboard.sql
│   │   ├── 📄 20260103183217_audit_logs_retention_and_rpc.sql
│   │   ├── 📄 20260105120000_admin_views_security_hardening.sql
│   │   ├── 📄 20260105130000_fix_security_definer_views.sql
│   │   ├── 📄 20260106190617_fix_rls_policy_with_check_true_vulnerabilities.sql
│   │   ├── 📄 20260106200000_fix_drop_old_insert_policies.sql
│   │   ├── 📄 20260106232619_fix_newsletter_infinite_recursion.sql
│   │   ├── 📄 20260106235000_fix_newsletter_select_for_duplicate_check.sql
│   │   ├── 📄 20260107120000_fix_newsletter_remove_duplicate_select_policy.sql
│   │   ├── 📄 20260107123000_performance_indexes_rls_policies.sql
│   │   ├── 📄 20260107130000_fix_newsletter_remove_not_exists_from_policy.sql
│   │   ├── 📄 20260107140000_fix_categories_duplicate_select_policies.sql
│   │   ├── 📄 20260110011128_fix_audit_trigger_no_id_column.sql
│   │   ├── 📄 20260111120000_restore_medias_folder_id_final.sql
│   │   ├── 📄 20260114152153_add_backups_storage_bucket.sql
│   │   ├── 📄 20260116145628_optimize_spectacles_slug_index.sql
│   │   ├── 📄 20260116232648_analytics_summary_90days.sql
│   │   ├── 📄 20260117234007_task053_data_retention.sql
│   │   ├── 📄 20260118004644_seed_data_retention_config.sql
│   │   ├── 📄 20260118010000_restore_insert_policies_dropped_by_task053.sql
│   │   ├── 📄 20260118012000_fix_security_definer_views_and_merge_policies.sql
│   │   ├── 📄 20260118234945_add_partners_media_folder.sql
│   │   ├── 📄 20260120183000_fix_spectacles_rls_include_archived.sql
│   │   ├── 📄 20260121164730_add_pdf_support_medias_bucket.sql
│   │   ├── 📄 20260121205257_fix_communiques_slug_trigger.sql
│   │   ├── 📄 20260121231253_add_press_media_library_integration.sql
│   │   ├── 📄 20260122000000_fix_communiques_presse_dashboard_security.sql
│   │   ├── 📄 20260122142356_enable_rls_home_hero_slides.sql
│   │   ├── 📄 20260122143405_fix_press_views_security_invoker.sql
│   │   ├── 📄 20260122150000_final_restore_insert_policies.sql
│   │   ├── 📄 20260122151500_fix_entity_type_whitelist.sql
│   │   ├── 📄 20260201135511_add_landscape_photos_to_spectacles.sql
│   │   ├── 📄 20260202004924_drop_swap_spectacle_photo_order.sql
│   │   ├── 📄 20260202010000_fix_views_security_invoker.sql
│   │   ├── 📄 20260202200333_add_spectacle_paragraphs.sql
│   │   ├── 📄 20260204205029_add_alt_text_to_home_about.sql
│   │   ├── 📄 20260211005525_fix_audit_trigger_tg_op_case.sql
│   │   ├── 📄 20260220120000_add_gallery_photos_views.sql
│   │   ├── 📄 20260220130000_fix_spectacle_admin_views_security.sql
│   │   ├── 📄 20260221100000_fix_membres_equipe_image_url_constraint.sql
│   │   ├── 📄 20260227210418_fix_analytics_events_insert_policy.sql
│   │   ├── 📄 20260228231707_restore_contact_insert_policy.sql
│   │   ├── 📄 20260302184850_add_alt_text_to_compagnie_presentation.sql
│   │   ├── 📄 20260302200002_fix_hero_section_position.sql
│   │   ├── 📄 20260302210000_fix_mission_section_position.sql
│   │   ├── 📄 20260303120000_fix_history_section_position.sql
│   │   ├── 📄 20260303130000_fix_quote_history_position.sql
│   │   ├── 📝 ROUND_7B_ANALYSIS.md
│   │   ├── 📝 migrations.md
│   │   └── 📄 sync_existing_profiles.sql
│   ├── 📁 reconstruction_database_plan
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
│   │   ├── 📄 20_audit_logs_retention.sql
│   │   ├── 📄 20_functions_core.sql
│   │   ├── 📄 21_data_retention_tables.sql
│   │   ├── 📄 21_functions_auth_sync.sql
│   │   ├── 📄 22_data_retention_functions.sql
│   │   ├── 📄 30_triggers.sql
│   │   ├── 📄 40_indexes.sql
│   │   ├── 📄 41_views_admin_content_versions.sql
│   │   ├── 📄 41_views_communiques.sql
│   │   ├── 📄 41_views_retention.sql
│   │   ├── 📄 41_views_spectacle_photos.sql
│   │   ├── 📄 42_rpc_audit_logs.sql
│   │   ├── 📄 42_views_spectacle_gallery.sql
│   │   ├── 📄 50_constraints.sql
│   │   ├── 📄 60_rls_profiles.sql
│   │   ├── 📄 61_rls_main_tables.sql
│   │   ├── 📄 62_functions_spectacles.sql
│   │   ├── 📄 62_rls_advanced_tables.sql
│   │   ├── 📄 63_reorder_team_members.sql
│   │   ├── 📄 63b_reorder_hero_slides.sql
│   │   └── 📝 README.md
│   ├── 📁 scripts
│   ├── 📁 tests
│   ├── 📝 README.md
│   ├── 📄 admin.ts
│   ├── 📄 client.ts
│   ├── 📄 middleware.ts
│   └── 📄 server.ts
├── ⚙️ .env.example
├── ⚙️ .env.test.local
├── ⚙️ .gitignore
├── ⚙️ .markdownlint.jsonc
├── 📝 README.md
├── 📄 check_spectacles_rls.sql
├── ⚙️ components.json
├── 📄 eslint.config.mjs
├── 📄 inspect-tables.sql
├── 📄 instrumentation.ts
├── 📄 next.config.ts
├── ⚙️ package.json
├── ⚙️ pnpm-lock.yaml
├── 📄 postcss.config.mjs
├── 📄 proxy.ts
├── 📄 sentry.client.config.ts
├── 📄 sentry.edge.config.ts
├── 📄 sentry.server.config.ts
├── 📄 supabase_public_data.sql
├── 📄 tailwind.config.ts
├── 📄 test-email-simple.js
└── ⚙️ tsconfig.json
```

---
