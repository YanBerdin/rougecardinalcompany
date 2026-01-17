# TASK047 - Extraire NewsletterSubscriptionSchema

**Status:** Complete  
**Added:** 2025-12-13  
**Updated:** 2026-01-17  
**Completed:** 2026-01-17

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
| `lib/schemas/contact.ts` | Retirer `NewsletterSubscriptionSchema` (lignes 65-77) |
| `lib/schemas/newsletter.ts` | **Créer** avec le schéma |
| `lib/schemas/index.ts` | Modifier exports (rediriger vers newsletter.ts) |
| `lib/actions/newsletter-server.ts` | Mettre à jour import (ligne 4) |

**Note :** `app/api/newsletter/route.ts` et `app/actions/newsletter.actions.ts` n'importent pas directement le schéma (ils utilisent `handleNewsletterSubscription()`).

## Implementation Plan

1. Créer `lib/schemas/newsletter.ts` avec `NewsletterSubscriptionSchema` + types (avec `.default()` values)
2. Modifier `lib/schemas/index.ts` (rediriger export depuis newsletter.ts au lieu de contact.ts)
3. Retirer le schéma de `lib/schemas/contact.ts`
4. Mettre à jour l'import dans `lib/actions/newsletter-server.ts`
5. Vérifier build + lint

## Progress Tracking

**Overall Status:** Complete - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | ----------- | ------ | ------- | ----- |
| 1 | Créer `lib/schemas/newsletter.ts` | Complete | 2026-01-17 | ✅ Fichier créé avec schéma et types |
| 2 | Mettre à jour barrel exports | Complete | 2026-01-17 | ✅ `lib/schemas/index.ts` modifié |
| 3 | Mettre à jour imports consommateurs | Complete | 2026-01-17 | ✅ `newsletter-server.ts` mis à jour |
| 4 | Nettoyer `contact.ts` | Complete | 2026-01-17 | ✅ Schéma newsletter retiré |
| 5 | Tests validation | Complete | 2026-01-17 | ✅ TypeScript, build, tests schéma |

## Progress Log

### 2026-01-17 - Implémentation complète

**Actions effectuées :**

1. ✅ **Phase 1** - Création `lib/schemas/newsletter.ts`
   - Schéma extrait avec `.default()` values préservés
   - Commit: `165f5fa` - "feat(schemas): create newsletter.ts schema file"

2. ✅ **Phase 2-3** - Mise à jour imports
   - Barrel export modifié dans `lib/schemas/index.ts`
   - Import mis à jour dans `lib/actions/newsletter-server.ts`
   - Commit: `ac8867b` - "refactor(schemas): update newsletter schema imports"

3. ✅ **Phase 4** - Nettoyage
   - Schéma newsletter retiré de `lib/schemas/contact.ts` (lignes 65-77)
   - Commit: `dd75761` - "refactor(schemas): remove newsletter schema from contact.ts"

**Tests de validation :**

- ✅ TypeScript: `pnpm tsc --noEmit` → 0 erreurs
- ✅ Build Next.js: `pnpm build` → ✓ Compiled successfully
- ✅ Schema validation: Email valide/invalide testé
- ✅ Defaults appliqués: `consent: true`, `source: "website"`
- ✅ Barrel exports: Import via `@/lib/schemas` fonctionne
- ✅ Contact schemas toujours disponibles

**Résultat :**

```bash
lib/schemas/
├── contact.ts (ContactMessage uniquement ✅)
├── newsletter.ts (Newsletter dédié ✅)
├── index.ts (exports newsletter ✅)
```

**Impact :**

- 0 régression détectée
- Architecture cohérente avec pattern existant
- Préparé pour évolutions futures (unsubscribe, preferences)

**Commits :**

- `165f5fa` - Create newsletter.ts schema file
- `ac8867b` - Update newsletter schema imports
- `dd75761` - Remove newsletter schema from contact.ts

**Durée totale :** ~25 minutes (estimation initiale : 30 min)

### Subtasks

| ID | Description | Status | Updated | Notes |
| ---- | ------------- | -------- | --------- | ------- |
| 1.1 | Créer `lib/schemas/newsletter.ts` | Not Started | - | Avec `.default(true)` et `.default("website")` |
| 1.2 | Modifier exports dans `lib/schemas/index.ts` | Not Started | - | Rediriger vers newsletter.ts |
| 1.3 | Retirer de `lib/schemas/contact.ts` | Not Started | - | Lignes 65-77 |
| 1.4 | Mettre à jour import dans `newsletter-server.ts` | Not Started | - | Ligne 4 |
| 1.5 | Vérifier build + lint | Not Started | - | |

## Progress Log

### 2025-12-13

- Task créée suite à la factorisation Newsletter
- Schéma actuellement dans `lib/schemas/contact.ts`

### 2026-01-17

- Plan mis à jour avec schéma exact (avec `.default()` values)
- Confirmé : seul `lib/actions/newsletter-server.ts` importe directement le schéma
- Export barrel existe déjà dans index.ts, nécessite modification (pas ajout)

## References

- `lib/schemas/contact.ts` — Fichier source actuel (lignes 65-77)
- `lib/actions/newsletter-server.ts` — Consommateur principal (ligne 4)
- `lib/schemas/index.ts` — Barrel exports (lignes 133-144)
- `.github/prompts/plan-TASK047-Extraction-NewsletterSubscriptionSchema.prompt.md` — Plan détaillé
