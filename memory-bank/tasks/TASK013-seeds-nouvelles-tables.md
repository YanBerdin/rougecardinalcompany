# [TASK013] - Seeds init**Overall Status:** Completed - 100%

## Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 3.1 | Seed `compagnie_values` | Complete | 18-09-2025 | Migration 20250918095610 |
| 3.2 | Seed `compagnie_stats` | Complete | 18-09-2025 | Intégré dans core_content |
| 3.3 | Seed `compagnie_presentation_sections` | Complete | 21-09-2025 | Migration 20250921110000 |
| 3.4 | Seed `home_hero_slides` | Complete | 18-09-2025 | Migration 20250918031500 |
| 3.5 | Seed `home_about_content` | Complete | 21-09-2025 | Migration 20250921113000 |
| 3.6 | README/commandes d'exécution | Complete | 01-10-2025 | README-migrations.md |

## Progress Log

### 1er octobre 2025

- Documentation complète des migrations dans README-migrations.md
- Toutes les seeds exécutées et validées en local
- Conventions établies : fichiers horodatés, idempotence recommandée

### 21-23 septembre 2025

- Seeds créées pour toutes les nouvelles tables
- Migrations horodatées selon pattern YYYYMMDDHHMMSS_name.sql
- Données réalistes pour démo et développement
- Testées en local avec db reset

### 17 septembre 2025

- Tâche créée. Plan et sous-tâches définis.rs, stats, sections présentation, hero)

**Status:** Completed  
**Added:** 17 septembre 2025  
**Updated:** 1er octobre 2025  
**Completed:** 23 septembre 2025

## Original Request

Créer des scripts de seed (SQL/TS) pour remplir les tables: `compagnie_values`, `compagnie_stats`, `compagnie_presentation_sections`, `home_hero_slides`.

## Thought Process

- Prévoir des jeux de données réalistes pour la démo.
- Respecter RLS via rôles appropriés ou désactivation contrôlée dans seed.
- Documenter la commande d’exécution.

## Implementation Plan

- Fichier SQL ou script TS par table avec insertion d’entrées.
- Idem: images placeholders et dates de visibilité cohérentes.
- Ajout d’un README seed avec commandes `pnpm`.

## Progress Tracking

**Overall Status:** Not Started - 0%

## Subtasks (bis)

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 3.1 | Seed `compagnie_values` | Not Started | 17-09-2025 | |
| 3.2 | Seed `compagnie_stats` | Not Started | 17-09-2025 | |
| 3.3 | Seed `compagnie_presentation_sections` | Not Started | 17-09-2025 | |
| 3.4 | Seed `home_hero_slides` | Not Started | 17-09-2025 | |
| 3.5 | README/commandes d’exécution | Not Started | 17-09-2025 | |

## Progress Log (bis)

### 17 septembre 2025 (bis)

- Tâche créée. Plan et sous-tâches définis.
