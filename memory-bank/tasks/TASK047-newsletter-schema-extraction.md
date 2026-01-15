# TASK047 - Extraire NewsletterSubscriptionSchema

**Status:** En Cours  
**Added:** 2025-12-13  
**Updated:** 2025-12-13

## Original Request

Extraire `NewsletterSubscriptionSchema` de `lib/schemas/contact.ts` vers un fichier dédié `lib/schemas/newsletter.ts` pour cohérence avec l'architecture.

## Context

Actuellement, le schéma de validation newsletter est défini dans `lib/schemas/contact.ts` alors qu'il devrait avoir son propre fichier, conformément au pattern établi :

- `lib/schemas/team.ts`
- `lib/schemas/spectacles.ts`
- `lib/schemas/media.ts`
- etc.

## Thought Process

### Bénéfices attendus

- ✅ Cohérence avec l'architecture existante (1 fichier = 1 domaine)
- ✅ Facilite les imports (`import { ... } from '@/lib/schemas/newsletter'`)
- ✅ Prépare l'évolution (ajout schémas unsubscribe, preferences, etc.)
- ✅ Barrel exports dans `lib/schemas/index.ts`

### Fichiers impactés

| Fichier | Action |
| --------- | -------- |
| `lib/schemas/contact.ts` | Retirer `NewsletterSubscriptionSchema` |
| `lib/schemas/newsletter.ts` | **Créer** avec le schéma |
| `lib/schemas/index.ts` | Ajouter export |
| `lib/actions/newsletter-server.ts` | Mettre à jour import |
| `app/api/newsletter/route.ts` | Mettre à jour import (si applicable) |

## Implementation Plan

1. Créer `lib/schemas/newsletter.ts` avec `NewsletterSubscriptionSchema` + types
2. Mettre à jour `lib/schemas/index.ts` (barrel export)
3. Retirer le schéma de `lib/schemas/contact.ts`
4. Mettre à jour les imports dans les fichiers consommateurs
5. Vérifier build + lint

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
| ---- | ------------- | -------- | --------- | ------- |
| 1.1 | Créer `lib/schemas/newsletter.ts` | Not Started | - | |
| 1.2 | Exporter dans `lib/schemas/index.ts` | Not Started | - | |
| 1.3 | Retirer de `lib/schemas/contact.ts` | Not Started | - | |
| 1.4 | Mettre à jour imports | Not Started | - | |
| 1.5 | Vérifier build + lint | Not Started | - | |

## Progress Log

### 2025-12-13

- Task créée suite à la factorisation Newsletter
- Schéma actuellement dans `lib/schemas/contact.ts`

## References

- `lib/schemas/contact.ts` — Fichier source actuel
- `lib/actions/newsletter-server.ts` — Consommateur principal
- `lib/schemas/index.ts` — Barrel exports
