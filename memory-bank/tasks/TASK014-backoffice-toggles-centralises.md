# [TASK014] - Back‑office: toggles centralisés (Agenda/Accueil/Contact)

**Status:** Pending  
**Added:** 17 septembre 2025  
**Updated:** 17 septembre 2025

## Original Request

Centraliser dans le back‑office les toggles d’affichage de la section Newsletter pour les pages Agenda, Accueil et Contact, et valider la cohérence front.

## Thought Process

- Les user stories (Agenda‑08, Accueil‑10, Newsletter‑05) doivent rester synchronisées avec l’état en base.
- Prévoir une UX simple (switch + description) et un stockage dans une table de configuration.

## Implementation Plan

- Définir/Utiliser la table `configurations_site` (ou équivalent) pour persistance.
- Back‑office: page paramètres avec switches + audit.
- Front: lecture des toggles et affichage conditionnel.

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 4.1 | Modèle/config pour stocker les toggles | Not Started | 17-09-2025 | RLS admin |
| 4.2 | UI Back‑office (switches) | Not Started | 17-09-2025 | shadcn/ui |
| 4.3 | Lecture côté front + cohérence | Not Started | 17-09-2025 | ISR/revalidate |
| 4.4 | Audit/logs des changements | Not Started | 17-09-2025 | |

## Progress Log

### 17 septembre 2025

- Tâche créée. Plan et sous-tâches définis.
