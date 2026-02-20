/**
 * DAL Helper Functions - Barrel Export
 * @module lib/dal/helpers
 */

// Error handling
export {
    type DALSuccess,
    type DALError,
    type DALResult,
    getErrorMessage,
    dalSuccess,
    dalError,
} from "./error";

// Formatting utilities
export { formatTime, toISODateString, bytesToHuman } from "./format";

// Slug generation
export { generateSlug, generateUniqueSlug } from "./slug";

// Serialization (Server types → UI DTOs)
export {
    toMediaTagDTO,
    toMediaFolderDTO,
    toMediaItemExtendedDTO,
} from "./serialize";

// Media URL builder (T3 Env — never process.env)
export { buildMediaPublicUrl } from "./media-url";
