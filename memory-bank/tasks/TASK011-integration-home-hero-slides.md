# [TASK011] - Intégration home_hero_slides (fetch + rendu)

**Status:** Pending  
**Added:** 17 septembre 2025  
**Updated:** 17 septembre 2025

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

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Service Supabase: fetch des slides visibles | Not Started | 17-09-2025 | Server Component préféré |
| 1.2 | Composant View Hero (carousel/slide) | Not Started | 17-09-2025 | Accessibilité clavier |
| 1.3 | Gestion des cas sans données | Not Started | 17-09-2025 | Fallback illustration |
| 1.4 | Revalidation/ISR et perf | Not Started | 17-09-2025 | Revalidation ciblée |

## Progress Log

### 17 septembre 2025

- Tâche créée. Plan et sous-tâches définis.
