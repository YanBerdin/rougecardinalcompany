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
    type SpectacleDb,
    type CreateSpectacleInput,
    type UpdateSpectacleInput,
    type SpectacleSummary,
} from "./spectacles";

// Team (Admin schemas)
export {
    TeamMemberDbSchema,
    CreateTeamMemberInputSchema,
    UpdateTeamMemberInputSchema,
    ReorderTeamMembersInputSchema,
    type TeamMemberDb,
    type CreateTeamMemberInput,
    type UpdateTeamMemberInput,
    type ReorderTeamMembersInput,
} from "./team";
