# Plan : Correction des violations de code — Composants Agenda

## TL;DR

7 catégories de violations identifiées dans 4 fichiers après review des changements non commités. 
Fixes simples (quotes, types, style) + restructuration de composants trop longs (>30 lignes).

---

## Fichiers concernés

- `components/features/public-site/agenda/AgendaEventList.tsx` (379 lignes)
- `components/features/public-site/agenda/calendar/CalendarNav.tsx` (52 lignes)
- `components/features/public-site/agenda/calendar/CalendarMonth.tsx` (116 lignes)
- `components/features/public-site/agenda/calendar/CalendarWeek.tsx` (74 lignes)

---

## Phase A — Fixes simples (indépendants, parallélisables)

### A1. Inline style → Tailwind (`AgendaEventList.tsx` ligne 223)

**Violation** : `style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}`

**Fix** : Remplacer par `className="flex flex-col items-start gap-1.5"` (supprime le `style={…}` entièrement)

---

### A2. type="button" manquant (`AgendaEventList.tsx` lignes 259, 285)

**Violation** : 2 `<button>` sans `type="button"` (boutons "clear date filter")

**Fix** : Ajouter `type="button"` sur les deux occurrences

---

### A3. type="button" manquant (`CalendarNav.tsx` lignes 32, 38, 43)

**Violation** : 3 `<button>` sans `type="button"` (prev, today, next)

**Fix** : Ajouter `type="button"` sur les trois boutons

---

### A4. Single quotes → double quotes (`CalendarMonth.tsx` ligne 62)

**Violation** : `filterType === 'all'`

**Fix** : `filterType === "all"`

---

### A5. Type annotation erronée (`CalendarMonth.tsx` ligne 21)

**Violation** : `events: ReturnType<typeof useAgendaContext>["state"]["calendarEvents"]`

**Fix** : 
1. Ajouter `import type { Event } from "@/lib/schemas/agenda"` (si absent)
2. Changer le type du paramètre en `Event[]`

---

## Phase B — CalendarNav : handlers redondants + useCallback

### B1. Remplacer les handlers locaux par les actions contexte

**Violation** : `handlePrev` et `handleNext` ré-implémentent la logique de `navigatePrev`/`navigateNext` (qui gèrent déjà month/week/day). `navigateToday` n'est utilisé que dans `handleToday`.

**Context confirmé** : `navigatePrev`, `navigateNext`, `navigateToday` existent dans le contexte mais NE font PAS `setSelectedDate(null)` — donc il faut les appeler ET `setSelectedDate(null)`.

**Fix** :
```ts
// Avant
const { setCalendarDate, setSelectedDate, navigateToday } = actions;
const handlePrev = () => { setCalendarDate(subMonths(calendarDate, 1)); setSelectedDate(null); };
const handleNext = () => { setCalendarDate(addMonths(calendarDate, 1)); setSelectedDate(null); };
const handleToday = () => { navigateToday(); setSelectedDate(null); };

// Après (supprimer les imports addMonths, subMonths, calendarDate)
const { navigatePrev, navigateNext, navigateToday, setSelectedDate } = actions;
const handlePrev = useCallback(() => { navigatePrev(); setSelectedDate(null); }, [navigatePrev, setSelectedDate]);
const handleNext = useCallback(() => { navigateNext(); setSelectedDate(null); }, [navigateNext, setSelectedDate]);
const handleToday = useCallback(() => { navigateToday(); setSelectedDate(null); }, [navigateToday, setSelectedDate]);
```

**Imports** : Ajouter `useCallback` from "react", supprimer `addMonths, subMonths` from "date-fns", supprimer `calendarDate` du destructuring state.

---

## Phase C — Fonctions trop longues (>30 lignes)

### C1. `AgendaEventCard` (~63 lignes) — `AgendaEventList.tsx`

**Extraction** :
- `EventCardMobileLayout({ event, day, month, animationDelay }: {...})` → ~22 lignes (le bloc `md:hidden`)
- `EventCardDesktopLayout({ event, displayDate, animationDelay }: {...})` → ~18 lignes (le bloc `hidden md:block`)
- `resolveDisplayDate(event: Event, selectedDate: Date | null): string` → ~9 lignes (helper pur, extrait le calcul)
- `AgendaEventCard` restant → ~10 lignes (appelle les deux layouts)

**DRY** (simultané) : Dans `EventCardMobileLayout`, remplacer le `<div>+<Image>` dupliqué par `<EventCardImage image={event.image} title={event.title} isFirst={animationDelay === 0} />`. Supprimer les imports `Image` from next/image uniquement si plus utilisé ailleurs.

---

### C2. `AgendaEventList` (~56 lignes) — `AgendaEventList.tsx`

**Extraction** :
- `SelectedDateBanner({ label, onClear }: { label: string; onClear: () => void })` → ~14 lignes (le pill date avec bouton X)
- `EventListEmptyState({ selectedDate, onClear }: { selectedDate: Date | null; onClear: () => void })` → ~20 lignes (état vide)
- `AgendaEventList` restant → ~20 lignes

---

### C3. `CalendarMonth` (~47 lignes) — `CalendarMonth.tsx`

**Extraction** :
- `CalendarMonthHeader()` → ~10 lignes (la ligne `WEEKDAY_NAMES` avec `role="row"`)
- `filterDayEvents(events: Event[], day: Date, filterType: string): Event[]` → ~8 lignes (helper pur : `getEventsForDay` + filtre par genre)
- `CalendarMonth` restant → ~30 lignes

---

### C4. `CalendarWeek` (~39 lignes) — `CalendarWeek.tsx`

**Extraction** :
- `CalendarWeekHeader()` → ~10 lignes (la ligne `WEEKDAY_NAMES` pour vue semaine, avec `role="row"` et `min-w-[560px]`)
- `CalendarWeek` restant → ~30 lignes

---

## Ordre d'exécution recommandé

1. Phase A (A1→A5) — fixes atomiques, aucune dépendance
2. Phase B — CalendarNav refactor
3. Phase C1 — AgendaEventCard (inclut le fix DRY image mobile)
4. Phase C2 — AgendaEventList (dépend des sous-composants de C1)
5. Phase C3 — CalendarMonth (inclut fix A4/A5 si pas encore appliqués)
6. Phase C4 — CalendarWeek

---

## Vérification

1. `pnpm lint` → 0 erreur
2. Visuel : page `/agenda` affiche les cartes, les badges gold, le calendrier mensuel/hebdo
3. Interaction : boutons prev/next/today du calendrier changent bien de mois, sélection de date filtre la liste
4. A11y : tous les `<button>` ont `type="button"`, focus visible sur le calendrier

---

## Décisions

- Les sous-composants extraits restent dans le même fichier (non exportés) — pas de nouveaux fichiers pour éviter la prolifération
- `EventCardImage` accepte déjà les props nécessaires (`image`, `title`, `isFirst?`) — pas de modification
- `navigatePrev`/`navigateNext` ne resetent pas `selectedDate` → les handlers CalendarNav gardent l'appel `setSelectedDate(null)`
