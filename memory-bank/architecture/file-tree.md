# File Tree: rougecardinalcompany

**Generated:** 12/6/2025, 1:55:40 AM
**Root Path:** `memory-bank/architecture`

```bash
├── 📁 .github
│   ├── 📁 copilot
│   ├── 📁 instructions
│   │   ├── ⚙️ .markdownlint.jsonc
│   ├── 📁 prompts
│   ├── 📁 workflows
│   ├── 📝 SECRETS_EXAMPLES.md
│   └── 📝 copilot-instructions.md
├── 📁 __tests__
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
│   ├── 📁 api
│   │   ├── 📁 admin
│   │   │   └── 📁 media
│   │   │       └── 📁 search
│   │   │           └── 📄 route.ts
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
│   ├── 🖼️ opengraph-image.png
│   └── 🖼️ twitter-image.png
├── 📁 components
│   ├── 📁 admin
│   │   ├── 📁 dashboard
│   │   │   ├── 📄 DashboardStatsContainer.tsx
│   │   │   └── 📄 StatsCard.tsx
│   │   ├── 📄 AdminAuthRow.tsx
│   │   ├── 📄 AdminSidebar.tsx
│   │   ├── 📄 CardsDashboard.tsx
│   │   └── 📄 ErrorBoundary.tsx
│   ├── 📁 auth
│   │   └── 📄 SetupAccountForm.tsx
│   ├── 📁 features
│   │   ├── 📁 admin
│   │   │   ├── 📁 home
│   │   │   │   ├── 📄 AboutContentContainer.tsx
│   │   │   │   ├── 📄 AboutContentForm.tsx
│   │   │   │   ├── 📄 CtaFieldGroup.tsx
│   │   │   │   ├── 📄 HeroSlideForm.tsx
│   │   │   │   ├── 📄 HeroSlideFormFields.tsx
│   │   │   │   ├── 📄 HeroSlideImageSection.tsx
│   │   │   │   ├── 📄 HeroSlidePreview.tsx
│   │   │   │   ├── 📄 HeroSlidesContainer.tsx
│   │   │   │   ├── 📄 HeroSlidesErrorBoundary.tsx
│   │   │   │   └── 📄 HeroSlidesView.tsx
│   │   │   ├── 📁 media
│   │   │   │   ├── 📄 MediaExternalUrlInput.tsx
│   │   │   │   ├── 📄 MediaLibraryPicker.tsx
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
├── 📁 emails
│   ├── 📁 utils
│   │   ├── 📄 components.utils.tsx
│   │   └── 📄 email-layout.tsx
│   ├── 📄 contact-message-notification.tsx
│   ├── 📄 invitation-email.tsx
│   └── 📄 newsletter-confirmation.tsx
├── 📁 lib
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
│   │   └── 📄 useNewsletterSubscribe.ts
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
│   │   └── 📄 validate-image-url.ts
│   ├── 📄 database.types.ts
│   ├── 📄 resend.ts
│   ├── 📄 site-config.ts
│   └── 📄 utils.ts
├── 📁 memory-bank
│   ├── 📁 architecture
│   │   ├── 📝 Email_Service_Architecture.md
│   │   ├── 📝 Project_Architecture_Blueprint.md
│   │   ├── 📝 Project_Folders_Structure_Blueprint_v5.md
│   │   └── 📝 dev-email-redirect.md
│   ├── 📁 changes
│   │   └── 📝 2025-11-11-layouts-admin-sidebar.md
│   ├── 📁 epics
│   ├── 📁 procedures
│   ├── 📁 tasks
│   ├── 📝 activeContext.md
│   ├── 📝 productContext.md
│   ├── 📝 progress.md
│   ├── 📝 projectbrief.md
│   ├── 📝 systemPatterns.md
│   └── 📝 techContext.md
├── 📁 public
├── 📁 scripts
├── 📁 supabase
│   ├── 📁 .branches
│   │   └── 📄 _current_branch
│   ├── 📁 migrations
│   │   ├── 📁 archived
│   │   │   ├── 📄 20251123143116_fix_restore_content_version_published_at.sql
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
│   │   ├── 📄 20251118125945_normalize_spectacles_status.sql
│   │   ├── 📄 20251118130000_normalize_spectacles_status.sql
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
│   ├── 📁 tests
│   ├── 📝 README.md
│   ├── 📄 admin.ts
│   ├── 📄 client.ts
│   ├── 📄 middleware.ts
│   └── 📄 server.ts
├── 📁 swark-output
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── ⚙️ .markdownlint.jsonc
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
