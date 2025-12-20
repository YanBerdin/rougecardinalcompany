import { env } from "./env";

export const SITE_CONFIG = {
  SEO: {
    TITLE: "Rouge Cardinal Company",
    DESCRIPTION: "Compagnie de théâtre professionnelle",
    ICON: "/favicon.ico",
  },
  EMAIL: {
    FROM: env.EMAIL_FROM,
    CONTACT: env.EMAIL_CONTACT,
  },
  SERVER: {
    PROD_URL: "https://rougecardinalcompany.fr",
    DEV_URL: env.NEXT_PUBLIC_SITE_URL,
  },
  MAKER: {
    NAME: "Rouge Cardinal Company",
    ADDRESS: "Adresse de votre compagnie",
  },
  AUTH: {
    REDIRECT_TO_DASHBOARD: "/dashboard",
    REDIRECT_TO_LOGIN: "/auth/login",
  },
} as const;

export const WEBSITE_URL =
  env.NODE_ENV === "production"
    ? SITE_CONFIG.SERVER.PROD_URL
    : SITE_CONFIG.SERVER.DEV_URL;
