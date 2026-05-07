# TASK091 - Agenda Calendar Refactor + Lint Violations Fixes

**Status:** Completed  
**Added:** 2026-05-07  
**Updated:** 2026-05-07

## Original Request

Exécuter deux plans en une session :

1. `.github/prompts/plan-agenda-calendar.prompt.md` — refactoring des composants calendrier agenda (CalendarNav, CalendarMonth, CalendarWeek, AgendaEventList, AgendaEventCard)
2. `.github/prompts/plan-agendaViolationsFixes.prompt.md` — correction des violations ESLint/Clean Code sur les composants agenda (phases A→C4)

Objectif final : `pnpm lint` = 0 erreurs + commit des deux implémentations.

## Implementation Plan

- Phase A : inline styles → Tailwind, `type="button"`, single-quote fixes
- Phase B : CalendarNav — `useCallback` pour prev/next, `setSelectedDate` à la navigation
- Phase C1 : AgendaEventCard — extraire `resolveDisplayDate`, layout mobile/desktop séparé
- Phase C2 : AgendaEventList — extraire `SelectedDateBanner`, `EventListEmptyState`
- Phase C3 : CalendarMonth — extraire `CalendarMonthHeader`, `filterDayEvents`, typage `Event[]`
- Phase C4 : CalendarWeek — extraire `CalendarWeekHeader`
- Fixes ESLint transverses : `animations.jsx` + 4 fichiers fixtures e2e

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | ----------- | ------ | ------- | ----- |
| A | Phase A — inline styles, type="button", quotes | Complete | 2026-05-07 | ✅ |
| B | Phase B — CalendarNav useCallback + setSelectedDate | Complete | 2026-05-07 | ✅ |
| C1 | Phase C1 — AgendaEventCard : resolveDisplayDate + layout | Complete | 2026-05-07 | ✅ |
| C2 | Phase C2 — AgendaEventList : SelectedDateBanner + EmptyState | Complete | 2026-05-07 | ✅ |
| C3 | Phase C3 — CalendarMonth : CalendarMonthHeader + filterDayEvents | Complete | 2026-05-07 | ✅ |
| C4 | Phase C4 — CalendarWeek : CalendarWeekHeader | Complete | 2026-05-07 | ✅ |
| FIX1 | Fix animations.jsx useRef(0) | Complete | 2026-05-07 | ✅ |
| FIX2 | Fix 4 fixtures e2e register au lieu de use | Complete | 2026-05-07 | ✅ |
| GIT | Commit git | Complete | 2026-05-07 | ✅ |

## Progress Log

### 2026-05-07

**plan-agendaViolationsFixes phases A→C4 :**

- Phase A : suppression des inline styles (`style={{ color: '...' }}` → classes Tailwind), ajout `type="button"` sur tous les boutons non-submit, correction des guillemets simples en doubles dans JSX
- Phase B : `CalendarNav.tsx` — enveloppé `handlePrevMonth` et `handleNextMonth` dans `useCallback`, ajouté `setSelectedDate(null)` lors de la navigation de mois pour réinitialiser la sélection
- Phase C1 : `AgendaEventCard.tsx` — extraction de `resolveDisplayDate(event)` (calcul de la date d'affichage selon `date_fin`), séparation du layout mobile (stack vertical) et desktop (row horizontal) en sections distinctes
- Phase C2 : `AgendaEventList.tsx` — extraction de `SelectedDateBanner` (bannière de la date sélectionnée avec reset button) et `EventListEmptyState` (état vide avec message conditionnel)
- Phase C3 : `CalendarMonth.tsx` — extraction de `CalendarMonthHeader` (header avec nom du mois + boutons prev/next), extraction de `filterDayEvents(events, day)` retournant `Event[]`, typage explicite `Event[]` sur les variables d'événements du jour
- Phase C4 : `CalendarWeek.tsx` — extraction de `CalendarWeekHeader` (header des noms de jours de la semaine)

**plan-agenda-calendar :**

- Création de `CalendarDay.tsx`, `CalendarDayCell.tsx`, `CalendarEventChip.tsx` (nouveaux composants atomiques)
- Mise à jour `AgendaContext.tsx`, `AgendaClientContainer.tsx`, `AgendaContainer.tsx`, `AgendaEventList.tsx`, `AgendaFilters.tsx`, `AgendaHero.tsx`

**Fixes ESLint transverses :**

- `animations.jsx` : `useRef(performance.now())` → `useRef(0)` — évite l'appel de fonction impure dans l'initialisation du render (ESLint `react-hooks`)
- 4 fichiers fixtures Playwright (`agenda.fixtures.ts`, `compagnie.fixtures.ts`, `contact.fixtures.ts`, `presse.fixtures.ts`) : paramètre `use` renommé en `register` — le nom `use` déclenche la règle `react-hooks/rules-of-hooks` d'ESLint car toute variable commençant par `use` est traitée comme un Hook React

**Résultat :** `pnpm lint` = 0 erreurs ✅
