# [TASK011] - Intégration home_hero_slides (fetch + rendu)

**Status:** Completed  
**Added:** 17 septembre 2025  
**Updated:** 1er octobre 2025  
**Completed:** 23 septembre 2025

## Original Request

Intégrer la table `home_hero_slides` côté frontend avec filtrage de la fenêtre de visibilité, en utilisant `@supabase/ssr` et des Server Components quand pertinent.

## Thought Process

- Les slides ont une fenêtre temporelle (start/end) et une RLS publique pour la lecture dans cette fenêtre.
- Le rendu doit être résilient (fallback si aucune diapo visible).
- La revalidation ISR doit tenir compte des fenêtres de visibilité et des changements admin.

## Implementation Plan

- Créer un service/Hook de data `getVisibleHeroSlides()` (server-side).
- Appliquer le filtre SQL (now() BETWEEN start_at AND end_at) + ordre.
- Rendre une vue Hero avec transitions et focus management.
- Paramétrer la revalidation (ISR/Route segment options) selon besoins.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Service Supabase: fetch des slides visibles | Complete | 23-09-2025 | DAL lib/dal/home-hero.ts |
| 1.2 | Composant View Hero (carousel/slide) | Complete | 23-09-2025 | Server + Client components |
| 1.3 | Gestion des cas sans données | Complete | 23-09-2025 | Fallback implémenté |
| 1.4 | Revalidation/ISR et perf | Complete | 23-09-2025 | Suspense + skeleton |

## Progress Log

### 23 septembre 2025

- DAL créée : lib/dal/home-hero.ts avec fetch des slides visibles (fenêtre temporelle)
- Container serveur implémenté avec Suspense
- View client avec carousel fonctionnel
- Délai artificiel 1500ms pour validation UX (à retirer avant prod)
- Gestion fallback si aucune slide visible

### 17 septembre 2025

- Tâche créée. Plan et sous-tâches définis.
