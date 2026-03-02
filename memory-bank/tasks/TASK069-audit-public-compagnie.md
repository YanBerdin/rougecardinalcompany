# TASK069 — Audit conformité public/compagnie

**Status:** Pending
**Added:** 2026-03-02
**Updated:** 2026-03-02

## Original Request

Corriger les 14 violations relevées dans l'audit de conformité de la feature `public-site/compagnie` :

- 3 FAIL Clean Code (monolithe 241L, magic numbers, dead code)
- 2 FAIL Composition Patterns (6 blocs if conditionnels, pas de compound components)
- 3 FAIL Accessibilité WCAG 2.2 AA (hiérarchie titres sautée, background-image sans alt, sections sans landmarks)
- 2 FAIL Dead Code (hooks.ts 100% commenté, commentaires morts)
- 2 WARN TypeScript strict (return types manquants)
- 1 WARN DAL SOLID (import fallback depuis composants — inversion de dépendance)
- 1 WARN Architecture (ISR vs force-dynamic)

## Thought Process

La feature compagnie est une page publique affichant 6 sections dynamiques (hero, histoire, citation, valeurs, équipe, mission) pilotées par la BDD. Le monolithe `CompagnieView.tsx` (241 lignes) contient 6 blocs `if (section.kind === "xxx")` dans un `.map()`, ce qui viole à la fois Clean Code (max 30L/fn), Composition Patterns (Open/Closed) et complique les corrections a11y.

**Stratégie** : extraire chaque section en composant dédié, créer un `SECTION_RENDERERS` map, corriger les violations WCAG dans chaque composant extrait, nettoyer le dead code, et aligner l'architecture.

**Pattern choisi** : `SECTION_RENDERERS` map plutôt que compound components car les sections sont pilotées par la DB (pas de composabilité utilisateur). Cohérent avec le pattern Open/Closed.

## Implementation Plan

Voir `.github/prompts/plan-auditPublicCompagnieViolations.prompt.md`

8 phases, 16 étapes :

1. Nettoyage dead code (hooks.ts, commentaires morts, fonctions legacy)
2. Déplacement fallback (inversion de dépendance DAL→UI)
3. Extraction des 6 composants de section
4. Corrections accessibilité WCAG 2.2 AA
5. TypeScript strict + constantes
6. Architecture page.tsx (force-dynamic)
7. DAL cleanup
8. Vérifications finales

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Supprimer hooks.ts + export dans index.ts | Not Started | — | 102L dead code |
| 1.2 | Supprimer commentaires morts CompagnieView.tsx L5-16 | Not Started | — | Bloc LucideIconMap |
| 1.3 | Supprimer fonctions *Legacy dans compagnie.ts | Not Started | — | 0 consommateurs |
| 2.1 | Déplacer fallback → lib/dal/fallback/ | Not Started | — | Inversion dépendance |
| 3.1 | Créer 6 composants sections/ | Not Started | — | < 30L chacun |
| 3.2 | Créer SECTION_RENDERERS map dans CompagnieView | Not Started | — | Open/Closed |
| 4.1 | Corriger hiérarchie titres h1→h2→h3 | Not Started | — | WCAG 1.3.1 |
| 4.2 | Remplacer background-image par next/image | Not Started | — | WCAG 1.1.1 |
| 4.3 | Ajouter aria-labelledby sur sections | Not Started | — | WCAG 1.3.1/4.1.2 |
| 5.1 | Ajouter return types explicites | Not Started | — | TypeScript strict |
| 5.2 | Extraire magic numbers en constantes | Not Started | — | 12, 0.2s, image |
| 6.1 | Remplacer ISR par force-dynamic | Not Started | — | Cohérence projet |
| 7.1 | Réduire fetchCompagniePresentationSections < 30L | Not Started | — | DAL cleanup |
| 7.2 | Supprimer casts `as unknown as` dans DAL | Not Started | — | Typage correct |
| 8.1 | Mettre à jour index.ts exports | Not Started | — | Cleanup |
| 8.2 | Vérifier pnpm lint + pnpm build | Not Started | — | Gate qualité |

## Progress Log

### 2026-03-02

- Audit initial réalisé : 14 violations identifiées dans `doc-perso/TASK069-audit-public-compagnie-violations.md`
- Plan d'implémentation rédigé : 8 phases, 16 étapes
- Task créée avec statut Pending
