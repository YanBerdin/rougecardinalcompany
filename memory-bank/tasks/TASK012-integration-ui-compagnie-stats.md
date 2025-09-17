# [TASK012] - Intégration UI des `compagnie_stats`

**Status:** Pending  
**Added:** 17 septembre 2025  
**Updated:** 17 septembre 2025

## Original Request
Afficher les statistiques de la compagnie depuis la table `compagnie_stats` dans l’UI (Accueil/Compagnie) avec un rendu élégant et accessible.

## Thought Process
- Les stats sont administrables et versionnées. RLS protège l’écriture, lecture publique.
- Besoin d’un composant dédié (cards/chiffres clés) et d’un layout responsive.

## Implementation Plan
- Service: `getCompagnieStats()` (server-side via `@supabase/ssr`).
- Composants: `StatsContainer` (smart) + `StatsView` (dumb).
- Styles: cartes avec icônes, animations légères, A11y.
- Tests: cas sans données, formats numériques, i18n.

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks
| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 2.1 | Service Supabase pour récupérer les stats | Not Started | 17-09-2025 | Server Component |
| 2.2 | Composants UI (Container/View) | Not Started | 17-09-2025 | shadcn/ui |
| 2.3 | Gestion des états vide/erreur | Not Started | 17-09-2025 | Skeletons |
| 2.4 | Tests de rendu et formats | Not Started | 17-09-2025 | Vitest/RTL |

## Progress Log
### 17 septembre 2025
- Tâche créée. Plan et sous-tâches définis.
