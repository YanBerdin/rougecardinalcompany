// lib/site-config.ts
export const SITE_CONFIG = {
  SEO: {
    TITLE: "Rouge Cardinal Company",
    DESCRIPTION: "Compagnie de théâtre professionnelle",
    ICON: "/favicon.ico",
  },
  EMAIL: {
    FROM: process.env.EMAIL_FROM || "noreply@rougecardinalcompany.fr",
    CONTACT: process.env.EMAIL_CONTACT || "contact@rougecardinalcompany.fr",
  },
  SERVER: {
    PROD_URL: "https://rougecardinalcompany.fr",
    DEV_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
  MAKER: {
    NAME: "Rouge Cardinal Company",
    ADDRESS: "Adresse de votre compagnie",
  },
  AUTH: {
    REDIRECT_TO_DASHBOARD: "/protected",
    REDIRECT_TO_LOGIN: "/auth/login",
    EMAIL_REDIRECT_TO: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  },
} as const;

export const WEBSITE_URL =
  process.env.NODE_ENV === "production"
    ? SITE_CONFIG.SERVER.PROD_URL
    : SITE_CONFIG.SERVER.DEV_URL;
