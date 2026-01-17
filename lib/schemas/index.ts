/**
 * @file Schemas Barrel Export
 * @description Central export for all Zod schemas used in DAL and UI
 * @module lib/schemas
 *
 * Import pattern:
 * - For specific schemas: import { EventSchema } from "@/lib/schemas/agenda"
 * - For barrel import: import { EventSchema, TeamMemberDbSchema } from "@/lib/schemas"
 */

// Agenda
export {
    EventSchema,
    EventTypeSchema,
    EventFilterSchema,
    type Event,
    type EventType,
    type EventFilter,
} from "./agenda";

// Compagnie
export {
    ValueSchema,
    TeamMemberSchema,
    type Value,
    type TeamMember,
} from "./compagnie";

// Home Content
export {
    HeroSlideInputSchema,
    HeroSlideFormSchema,
    AboutContentInputSchema,
    AboutContentFormSchema,
    type HeroSlideInput,
    type HeroSlideFormValues,
    type HeroSlideDTO,
    type AboutContentInput,
    type AboutContentFormValues,
    type AboutContentDTO,
} from "./home-content";

// Site Config
export {
    DisplayToggleInputSchema,
    DisplayToggleFormSchema,
    type DisplayToggleDTO,
    type DisplayToggleInput,
    type DisplayToggleFormValues,
} from "./site-config";

// Presse
export {
    PressReleaseSchema,
    MediaArticleSchema,
    MediaKitItemSchema,
    MediaArticleTypeEnum,
    PresseFilterSchema,
    type PressRelease,
    type MediaArticle,
    type MediaKitItem,
    type MediaArticleType,
    type IconComponent,
    type PresseFilter,
} from "./presse";

// Spectacles
export {
    SpectacleDbSchema,
    CreateSpectacleSchema,
    UpdateSpectacleSchema,
    SpectacleSummarySchema,
    CurrentShowSchema,
    ArchivedShowSchema,
    type SpectacleDb,
    type CreateSpectacleInput,
    type UpdateSpectacleInput,
    type SpectacleSummary,
    type CurrentShow,
    type ArchivedShow,
} from "./spectacles";

// Team (Admin schemas)
export {
    TeamMemberDbSchema,
    CreateTeamMemberInputSchema,
    UpdateTeamMemberInputSchema,
    ReorderTeamMembersInputSchema,
    SetActiveBodySchema,
    type TeamMemberDb,
    type CreateTeamMemberInput,
    type UpdateTeamMemberInput,
    type ReorderTeamMembersInput,
    type SetActiveBody,
} from "./team";

// Dashboard
export {
    DashboardStatsSchema,
    type DashboardStats,
    type StatItem,
    type QuickAction,
} from "./dashboard";

// Media
export {
    MediaItemSchema,
    MediaSelectResultSchema,
    MediaSearchItemSchema,
    MediaPickerModeSchema,
    MediaUploadInputSchema,
    ExternalUrlInputSchema,
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    isAllowedImageMimeType,
    type MediaItem,
    type MediaSelectResult,
    type MediaSearchItem,
    type MediaPickerMode,
    type MediaUploadInput,
    type ExternalUrlInput,
    type AllowedImageMimeType,
} from "./media";

// Admin Users
export {
    UpdateUserRoleSchema,
    InviteUserSchema,
    UserRoleEnum,
    type UpdateUserRoleInput,
    type InviteUserInput,
    type UserRole,
} from "./admin-users";

// Contact
export {
    ContactMessageSchema,
    ContactEmailSchema,
    NewsletterSubscriptionSchema,
    ContactReasonEnum,
    type ContactMessageInput,
    type ContactEmailInput,
    type NewsletterSubscription,
    type ContactReason,
} from "./contact";

// Analytics
export {
    GranularitySchema,
    AnalyticsFilterSchema,
    AnalyticsFilterFormSchema,
    PageviewsDataPointSchema,
    PageviewsSeriesSchema,
    TopPageSchema,
    TopPagesSchema,
    MetricsSummarySchema,
    AdminActivitySummarySchema,
    SentryErrorMetricsSchema,
    AnalyticsEventSchema,
    AnalyticsSummaryRowSchema,
    autoSelectGranularity,
    normalizeAnalyticsFilter,
    type Granularity,
    type AnalyticsFilter,
    type AnalyticsFilterFormValues,
    type PageviewsDataPoint,
    type PageviewsSeries,
    type TopPage,
    type TopPages,
    type MetricsSummary,
    type AdminActivitySummary,
    type SentryErrorMetrics,
    type AnalyticsEvent,
    type AnalyticsSummaryRow,
} from "./analytics";
