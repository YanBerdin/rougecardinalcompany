export const HERO_SLIDE_LIMITS = {
    TITLE_MAX_LENGTH: 80,
    SUBTITLE_MAX_LENGTH: 150,
    DESCRIPTION_MAX_LENGTH: 500,
    ALT_TEXT_MAX_LENGTH: 125,
    CTA_LABEL_MAX_LENGTH: 50,
    SLUG_MAX_LENGTH: 100,
    MAX_ACTIVE_SLIDES: 10, //TODO: adjust as needed
} as const;

export const HERO_SLIDE_DEFAULTS = {
    ACTIVE: true,
    POSITION: 0,
    CTA_PRIMARY_ENABLED: false,
    CTA_SECONDARY_ENABLED: false,
} as const;

export const ANIMATION_CONFIG = {
    DELAY_INCREMENT_MS: 100,
    SKELETON_DELAY_MS: 1500,
} as const;

export const DRAG_CONFIG = {
    ACTIVATION_DISTANCE_PX: 8,
} as const;

export type HeroSlideLimits = typeof HERO_SLIDE_LIMITS;
export type HeroSlideDefaults = typeof HERO_SLIDE_DEFAULTS;
