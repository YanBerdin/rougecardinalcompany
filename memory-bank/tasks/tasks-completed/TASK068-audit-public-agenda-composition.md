# TASK068 — Audit conformité public/agenda + Refactoring Composition Patterns

**Status:** Completed  
**Added:** 2026-03-02  
**Updated:** 2026-03-02

## Original Request

> "vérifie que components/features/public-site/agenda respecte toutes les instructions"

Audit complet de la feature publique Agenda contre **TOUTES** les instructions projet :

- Clean Code (max 30 lignes/fn, max 300 lignes/fichier, max 5 params, DRY)
- TypeScript strict (return types, interface vs type, readonly props)
- React Composition Patterns (compound components, no boolean prop proliferation)
- Accessibility WCAG 2.2 AA (semantic HTML, aria, next/image)
- DAL SOLID (import depuis lib/schemas, DALResult<T>)
- CRUD Server Actions pattern
- Next.js 16 best practices (dynamic, revalidate)

## Thought Process

### Problème identifié

Le composant `AgendaView.tsx` (285 lignes) était un monolithe recevant **14 props** drillées depuis `AgendaClientContainer.tsx` (81 lignes). 6 de ces props étaient dédiées à la newsletter, drillées sur 3 niveaux sans nécessité.

Le fichier `hooks.ts` (179 lignes) contenait du code 100% commenté — code mort en production.

L'import du DAL (`lib/dal/agenda.ts`) référençait les types depuis `components/` au lieu de `lib/schemas/` (violation DAL SOLID).

### Décision d'architecture

Migration vers une architecture **Compound Components** conforme aux React Composition Patterns :

- **AgendaProvider** centralise l'état (filtrage événements + ICS calendar)
- Chaque sous-composant accède à l'état via `use(AgendaContext)` (React 19)
- La newsletter devient **autonome** (utilise directement `useNewsletterSubscribe`)
- Le container devient un **composition root** minimal (~38 lignes, 3 props)

### Contraintes respectées

- React 19 : `use()` au lieu de `useContext()`, `<Context value={}>` au lieu de `<Context.Provider>`
- Clean Code : toutes les fonctions < 30 lignes, tous les fichiers < 300 lignes
- TypeScript : `React.JSX.Element` (convention projet), `interface` pour props, `readonly`
- A11y : `<Image>` next/image, `aria-hidden` sur icônes décoratives, `aria-label` sur contrôles, sémantique `<ul>`/`<li>`, `role="status"` pour état vide

## Implementation Plan

1. Auditer tous les fichiers contre toutes les instructions
2. Cataloguer les violations par sévérité
3. Créer AgendaContext.tsx (Provider + context + ICS utilities)
4. Créer AgendaHero.tsx (section hero pure)
5. Créer AgendaFilters.tsx (filtrage via context)
6. Créer AgendaEventList.tsx (liste + sub-components internes)
7. Créer AgendaNewsletter.tsx (autonome avec useNewsletterSubscribe)
8. Réécrire AgendaClientContainer.tsx (composition root)
9. Mettre à jour types.ts (supprimer AgendaViewProps, ajouter AgendaClientContainerProps)
10. Mettre à jour index.ts (barrel exports)
11. Mettre à jour AgendaContainer.tsx (return type explicite)
12. Mettre à jour page.tsx (ajouter revalidate=0)
13. Fix lib/dal/agenda.ts (import depuis @/lib/schemas/agenda)
14. Fix lib/schemas/agenda.ts (formatting)
15. Supprimer hooks.ts et AgendaView.tsx
16. Valider compilation (0 erreurs)

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| ---- | ---------------------------------------- | -------- | ---------- | ------------------------------------------------------------------ |
| 68.1 | Audit complet (17 violations identifiées) | Complete | 2026-03-02 | Audit multi-instructions |
| 68.2 | Cataloguer violations par sévérité | Complete | 2026-03-02 | 5 critiques, 5 hautes, 5 moyennes, 2 basses |
| 68.3 | Créer AgendaContext.tsx | Complete | 2026-03-02 | 147 lignes, Provider + context + ICS util |
| 68.4 | Créer AgendaHero.tsx | Complete | 2026-03-02 | 26 lignes, pure presentation |
| 68.5 | Créer AgendaFilters.tsx | Complete | 2026-03-02 | 47 lignes, shadcn Select + context |
| 68.6 | Créer AgendaEventList.tsx | Complete | 2026-03-02 | 204 lignes, 5 sub-components internes + next/image |
| 68.7 | Créer AgendaNewsletter.tsx | Complete | 2026-03-02 | 125 lignes, autonome via useNewsletterSubscribe |
| 68.8 | Réécrire AgendaClientContainer.tsx | Complete | 2026-03-02 | 81→37 lignes, 14→3 props |
| 68.9 | Mettre à jour types.ts | Complete | 2026-03-02 | -AgendaViewProps (11 props), +AgendaClientContainerProps (3 props) |
| 68.10 | Mettre à jour index.ts | Complete | 2026-03-02 | Barrel exports mis à jour |
| 68.11 | Mettre à jour AgendaContainer.tsx | Complete | 2026-03-02 | Return type Promise<React.JSX.Element> |
| 68.12 | Mettre à jour page.tsx | Complete | 2026-03-02 | +revalidate=0 |
| 68.13 | Fix lib/dal/agenda.ts | Complete | 2026-03-02 | Import @/lib/schemas/agenda au lieu de components/types |
| 68.14 | Fix lib/schemas/agenda.ts | Complete | 2026-03-02 | Formatting corrigé |
| 68.15 | Supprimer hooks.ts + AgendaView.tsx | Complete | 2026-03-02 | Code mort + monolithe supprimés |
| 68.16 | Validation compilation | Complete | 2026-03-02 | 0 erreurs tous fichiers |

## Violations détectées et corrigées (17)

### Critique (5)

| # | Instruction | Violation | Correction |
| - | ----------- | --------- | ---------- |
| C1 | Composition Patterns | AgendaView monolithique 285L, 14 props drillées | Compound components avec Provider context |
| C2 | Clean Code | AgendaView > 300 lignes (285), fonctions > 30 lignes | Split en 5 composants < 203 lignes |
| C3 | Composition Patterns | Newsletter state (6 props) drillé sur 3 niveaux | AgendaNewsletter autonome via useNewsletterSubscribe |
| C4 | DAL SOLID | `lib/dal/agenda.ts` importe types depuis `components/` | Import depuis `@/lib/schemas/agenda` |
| C5 | Clean Code | `hooks.ts` 179 lignes, 100% commenté (code mort) | Fichier supprimé |

### Haute (5)

| # | Instruction | Violation | Correction |
| - | ----------- | --------- | ---------- |
| H1 | TypeScript | Pas de return type sur fonctions/composants | `React.JSX.Element` explicite partout |
| H2 | TypeScript | `type` utilisé pour props au lieu d'`interface` | `interface` pour toutes les props |
| H3 | A11y | `<img>` au lieu de `<Image>` next/image | `<Image>` avec fill, sizes, alt |
| H4 | A11y | Pas d'`aria-hidden` sur icônes décoratives | `aria-hidden="true"` sur Filter, CheckCircle, etc. |
| H5 | Next.js | `revalidate = 0` manquant sur page.tsx | Export ajouté |

### Moyenne (5)

| # | Instruction | Violation | Correction |
| - | ----------- | --------- | ---------- |
| M1 | Composition | AgendaClientContainer 81 lignes, 14 props vers 1 enfant | Composition root 37 lignes, 3 props |
| M2 | Clean Code | > 5 params (14 props AgendaViewProps) | 3 props via AgendaClientContainerProps |
| M3 | A11y | Pas de sémantique `<ul>`/`<li>` pour la liste | `<ul role="list" className="list-none">` + `<li>` (fix post-audit : `role="list"` ajouté après vérification) |
| M4 | A11y | Pas de `role="status"` pour état vide | Ajouté avec message accessible |
| M5 | A11y | `<label>` manquant pour Select | `<label className="sr-only">` + `aria-label` |

### Basse (2)

| # | Instruction | Violation | Correction |
| - | ----------- | --------- | ---------- |
| B1 | TypeScript | Props pas `readonly` | `readonly` sur toutes les interfaces |
| B2 | Clean Code | Magic string `"S&apos;inscrire"` (HTML entity en JSX) | Plain string `"S'inscrire"` |

## Architecture avant/après

### AVANT (monolithique)

```
page.tsx
└─ AgendaContainer (pas de return type)
   └─ AgendaClientContainer (81L, 14 props drillées)
      └─ AgendaView (285L monolithique)
         ├─ hero section
         ├─ filter section
         ├─ event cards (EventCard interne)
         └─ newsletter (6 props drillées depuis parent)
+ hooks.ts (179L, 100% commenté = code mort)
```

### APRÈS (compound components)

```
page.tsx (+revalidate=0)
└─ AgendaContainer (return type explicite)
   └─ AgendaClientContainer (37L, 3 props)
      └─ AgendaProvider (state via Context)
         ├─ AgendaHero (26L, pure presentational)
         ├─ AgendaFilters (47L, context-connected)
         ├─ AgendaEventList (203L, 5 sub-components)
         └─ AgendaNewsletter (124L, autonome)
```

## Fichiers créés/modifiés/supprimés

### Créés (5)

| Fichier | Lignes | Rôle |
| ------- | ------ | ---- |
| `AgendaContext.tsx` | 147 | Provider + context + ICS calendar utilities |
| `AgendaHero.tsx` | 26 | Hero section (pure JSX, pas de "use client") |
| `AgendaFilters.tsx` | 47 | Select filter via context |
| `AgendaEventList.tsx` | 204 | Event list avec 5 sub-components internes |
| `AgendaNewsletter.tsx` | 125 | Newsletter CTA autonome |

### Modifiés (6)

| Fichier | Changement |
| ------- | ---------- |
| `AgendaClientContainer.tsx` | Réécrit : 81→37 lignes, 14→3 props, composition root |
| `AgendaContainer.tsx` | +return type `Promise<React.JSX.Element>`, aliases simplifiés |
| `types.ts` | -AgendaViewProps (11 fields), +AgendaClientContainerProps (3 readonly) |
| `index.ts` | Barrel exports mis à jour (5 compound components) |
| `lib/dal/agenda.ts` | Import corrigé: `@/lib/schemas/agenda` |
| `lib/schemas/agenda.ts` | Formatting JSDoc |

### Supprimés (2)

| Fichier | Raison |
| ------- | ------ |
| `hooks.ts` (179L) | 100% code commenté, code mort |
| `AgendaView.tsx` (285L) | Remplacé par 5 compound components |

## Patterns clés implémentés

### 1. Compound Component Pattern (React Composition)

```tsx
// AgendaContext.tsx — Generic interface for dependency injection
interface AgendaContextValue {
  readonly state: AgendaState;
  readonly actions: AgendaActions;
}

// Sub-components access via use() (React 19)
function AgendaFilters(): React.JSX.Element {
  const { state, actions } = useAgendaContext();
  // ...
}
```

### 2. Self-contained Newsletter (no prop drilling)

```tsx
// AVANT: 6 props drillées sur 3 niveaux
<AgendaClientContainer
  isSubscribed={isSubscribed}
  newsletterEmail={newsletterEmail}
  isSubmitting={isSubmitting}
  onEmailChange={setEmail}
  onNewsletterSubmit={handleSubmit}
  showNewsletterSection={show}
/>

// APRÈS: autonome, 0 prop newsletter
function AgendaNewsletter(): React.JSX.Element {
  const { isSubscribed, submit, ... } = useNewsletterSubscribe({ source: "agenda" });
  // ...
}
```

### 3. ICS Calendar split (Clean Code < 30 lines)

```tsx
// 3 fonctions < 30 lignes chacune au lieu d'1 de 45 lignes
function formatICSDate(date: Date): string { /* 5 lignes */ }
function buildICSContent(event: Event): string { /* 22 lignes */ }
function triggerFileDownload(content: string, fileName: string): void { /* 8 lignes */ }
```

## Validation finale

| Check | Résultat |
| ----- | -------- |
| `get_errors` agenda folder | ✅ 0 erreurs |
| `get_errors` lib/dal/agenda.ts | ✅ 0 erreurs |
| `get_errors` lib/schemas/agenda.ts | ✅ 0 erreurs |
| `get_errors` page.tsx | ✅ 0 erreurs |
| Imports AgendaView/hooks dans codebase | ✅ Aucun (uniquement memory-bank/doc) |
| Max lignes/fichier (300) | ✅ Max 203 (AgendaEventList) |
| Max params/composant (5) | ✅ Max 3 (AgendaClientContainerProps) |
| `readonly` sur props | ✅ Toutes les interfaces |
| `aria` attributes | ✅ aria-hidden, aria-label, aria-labelledby, role |

## Progress Log

### 2026-03-02

- Audit complet multi-instructions identifiant 17 violations (5C, 5H, 5M, 2B)
- Création de 5 compound components avec architecture Provider/Context
- Réécriture AgendaClientContainer (composition root)
- Correction import DAL (components → lib/schemas)
- Fix JSX.Element namespace → React.JSX.Element (convention projet)
- Fix `<img>` → `<Image>` next/image avec fill + sizes
- Suppression code mort (hooks.ts, AgendaView.tsx)
- Validation finale : 0 erreurs de compilation sur tous les fichiers
