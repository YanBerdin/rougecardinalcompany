# TASK100 - ContactInfoSidebar dynamique (coordonnées DB)

**Status:** Completed  
**Added:** 2026-06-30  
**Updated:** 2026-06-30

## Original Request

Récupérer les coordonnées via `fetchFooterConfig()` dans `ContactServerGate`, assembler `<ContactInfoSidebar />` entièrement côté serveur, et le passer comme slot `sidebar: React.ReactNode` à `ContactPageView`. Élimine le prop drilling de types métier dans le Client Component et corrige la violation `showNewsletter: boolean`.

Plan source : `.github/prompts/plan-TASK100-contactInfoSidebarDynamique.prompt.md`

## Thought Process

La page Contact affichait des coordonnées hardcodées (`contact@rouge-cardinal.fr`, `+33 1 23 45 67 89`, `12 Rue de la République`). Depuis TASK095, ces données vivent en DB sous `public:footer:content`. L'objectif est de les brancher dynamiquement.

Le pattern composition (slot `sidebar: React.ReactNode`) est préféré au prop drilling `FooterConfigDTO` dans un Client Component, conformément à la règle `architecture-avoid-boolean-props` et au principe de ségrégation des responsabilités :

- `ContactServerGate` (Server Component) : fetch des données + assemblage du JSX sidebar
- `ContactPageView` (Client Component) : orchestre le layout, ne connaît pas `FooterConfigDTO`
- `ContactInfoSidebar` (Server Component) : affiche les données, reçoit `children` pour l'extensibilité

La conversion `showNewsletter: boolean` → `children?: React.ReactNode` élimine un boolean prop anti-pattern HIGH.

## Implementation Plan

- Phase 0 : Renommage labels dashboard admin
- Phase 1a : Refactorer `ContactInfoSidebar` (contactInfo + children)
- Phase 1b : Refactorer `ContactServerGate` (Promise.all + assemblage sidebar)
- Phase 1c : Refactorer `ContactPageView` (sidebar: ReactNode)

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | ------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------- |
| 0 | Renommer `"Footer - Pied de page"` → `"Pied de page & Coordonnées"` (AdminSidebar + CardsDashboard) | Complete | 2026-06-30 | Titre + description CardsDashboard mis à jour |
| 1a | `ContactInfoSidebar` : `contactInfo` + `children`, phone conditionnel, adresse sans `<br />` | Complete | 2026-06-30 | Suppression import `NewsletterCard` + `showNewsletter` |
| 1b | `ContactServerGate` : `Promise.all`, assemblage sidebar, passage à `ContactPageView` | Complete | 2026-06-30 | Import `fetchFooterConfig` + `FOOTER_DEFAULTS` + `ContactInfoSidebar` + `NewsletterCard` |
| 1c | `ContactPageView` : `sidebar: React.ReactNode`, suppression import `ContactInfoSidebar` | Complete | 2026-06-30 | Client Component découplé de `FooterConfigDTO` |
| 2 | `pnpm lint` + `pnpm tsc --noEmit` sur les 5 fichiers | Complete | 2026-06-30 | 0 erreur lint, 0 erreur TypeScript |

## Progress Log

### 2026-06-30

- Toutes les phases implémentées en un seul passage via `multi_replace_string_in_file`
- 5 fichiers modifiés : `ContactInfoSidebar.tsx`, `ContactPageView.tsx`, `ContactServerGate.tsx`, `AdminSidebar.tsx`, `CardsDashboard.tsx`
- `pnpm lint` ciblé : 0 erreur sur les 5 fichiers
- `pnpm tsc --noEmit` : 0 erreur sur les fichiers contact/admin modifiés
- Fallback silencieux garanti : `fetchFooterConfig()` retourne toujours `dalSuccess(FOOTER_DEFAULTS)` en cas d'erreur DB
- `ContactPageView` (Client Component) ne connaît plus `FooterConfigDTO` → séparation server/client respectée
