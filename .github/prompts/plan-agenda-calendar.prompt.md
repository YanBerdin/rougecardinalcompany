# Plan: Calendrier Interactif /agenda (Mois/Semaine/Jour)

## TL;DR

Ajouter une vue calendrier interactive (mois/semaine/jour) à la page `/agenda` existante, en conservant la vue liste actuelle comme 4ème mode. Implémentation custom avec `date-fns` (déjà installé v4.1.0) + Tailwind CSS Grid — aucune lib calendrier externe. L'état de navigation est greffé sur `AgendaContext`. Nouveau fetch DAL `fetchEventsForCalendar` (fenêtre -6m/+12m, sans filtre "upcoming only") passé en prop `calendarEvents` via `AgendaContainer` → `AgendaClientContainer`.

---

## Phase 1 — DAL & Schémas (base pour tout le reste)

1. **Modifier `lib/schemas/agenda.ts`** — ajouter `export type AgendaView = 'list' | 'month' | 'week' | 'day'`

2. **Modifier `lib/dal/agenda.ts`** — extraire le mapper interne `mapEventRow(row)` (DRY avec `fetchUpcomingEvents`), puis ajouter :
   - `fetchEventsForCalendar()` : même SELECT + JOINs que `fetchUpcomingEvents`, mais filtre `date_debut` entre `-6 mois` et `+12 mois` (pas de filtre `>= now()`), sans `LIMIT`, wrappée avec `cache()`. Retourne `DALResult<Event[]>`. Code erreur `[ERR_AGENDA_002]`.

---

## Phase 2 — Context (dépend de Phase 1)

1. **Modifier `components/features/public-site/agenda/AgendaContext.tsx`** — ajouter :
   - `AgendaState` : `view: AgendaView`, `calendarDate: Date`, `calendarEvents: Event[]`
   - `AgendaActions` : `setView(view)`, `navigatePrev()`, `navigateNext()`, `navigateToday()`
   - `AgendaProviderProps` : ajouter `calendarEvents: Event[]`
   - `navigatePrev/Next` : utilisent `subMonths/addMonths`, `subWeeks/addWeeks`, `subDays/addDays` selon `view` (import `date-fns`)
   - `calendarDate` initialisé à `new Date()` (aujourd'hui)
   - Les vues calendrier utilisent `calendarEvents` bruts (pas de filtre `filterType` — le filtre type reste réservé à la vue liste)

---

## Phase 3 — Composants calendrier (dépend de Phase 2, parallélisable entre eux)

Tous dans `components/features/public-site/agenda/calendar/`, tous des Client Components.

1. **`CalendarEventChip.tsx`** (< 60 lignes) — puce compacte affichant heure + titre tronqué. Props: `event: Event`, `compact?: boolean`. `compact=true` → point coloré uniquement (pour mobile month view). Couleur par statut: `scheduled/confirme` → `bg-primary`, `cancelled/annule` → `bg-muted line-through`, `completed` → `bg-muted`.

2. **`CalendarDayCell.tsx`** (< 80 lignes) — cellule jour réutilisée dans month ET week. Props: `date: Date`, `events: Event[]`, `isCurrentMonth?: boolean`, `onClick?: (date: Date) => void`. Affiche numéro + chips (max 2 + "+N" badge). `aria-label="[jour long]"`, `aria-current="date"` si today, `role="gridcell"`, `tabIndex` géré par roving tabindex.

3. **`CalendarNav.tsx`** (< 80 lignes) — barre de navigation. Props: via `useAgendaContext()`. Boutons `< Prev` / `Aujourd'hui` / `Next >` + titre date formaté (ex: "mai 2026") + Tabs shadcn/ui pour switcher `Mois | Semaine | Jour | Liste`. Responsive: tabs en `<select>` ou `ScrollArea` sur mobile.

4. **`CalendarMonth.tsx`** (< 150 lignes) — grille mois. Utilise `eachDayOfInterval(startOfWeek(startOfMonth(date), {weekStartsOn:1}), endOfWeek(endOfMonth(date), {weekStartsOn:1}))` pour obtenir 35-42 jours. Header `role="row"` avec 7 `role="columnheader"` (Lun…Dim). CSS `grid-cols-7`. Chaque cellule = `CalendarDayCell`. Sur mobile (< sm): cellules réduites, chips en mode `compact`.  Clic sur cellule → `setView('day')` + `setCalendarDate(date)`. Keyboard: roving tabindex sur les gridcells.

5. **`CalendarWeek.tsx`** (< 120 lignes) — vue semaine. `eachDayOfInterval(startOfWeek(date, {weekStartsOn:1}), endOfWeek(date, {weekStartsOn:1}))`. Desktop: `grid-cols-7`, chaque colonne = `CalendarDayCell` taille pleine. Mobile: `overflow-x-auto` sur le grid avec `min-w-[90px]` par colonne.

6. **`CalendarDay.tsx`** (< 100 lignes) — vue jour. Filtre `calendarEvents` avec `isSameDay(parseISO(event.date), calendarDate)`. Affiche titre date (`"lundi 5 mai 2026"`), liste des événements avec heure/lieu/lien billetterie. Si aucun événement: message vide illustré.

7. **`CalendarView.tsx`** (< 60 lignes) — dispatcher. Lit `view` + `calendarEvents` depuis contexte. Rend `<CalendarNav />` + `{view === 'month' ? <CalendarMonth /> : view === 'week' ? <CalendarWeek /> : <CalendarDay />}`.

8. **`calendar/index.ts`** — barrel export de `CalendarView`.

---

## Phase 4 — Intégration (dépend de Phase 2 et Phase 3)

1. **Modifier `components/features/public-site/agenda/types.ts`** — ajouter `calendarEvents: Event[]` à `AgendaClientContainerProps`.

2. **Modifier `components/features/public-site/agenda/AgendaContainer.tsx`** — ajouter `fetchEventsForCalendar()` au `Promise.all`, passer `calendarEvents` en prop.

3. **Modifier `components/features/public-site/agenda/AgendaClientContainer.tsx`** — accepter `calendarEvents`, le passer au `AgendaProvider`. Remplacer le bloc `<AgendaFilters /><AgendaEventList />` par rendu conditionnel :

    ```tsx
    view === 'list' → <AgendaFilters /> + <AgendaEventList />
    else → <CalendarView />
    ```

    Utiliser `useAgendaContext()` pour lire `view`.

---

## Fichiers concernés

**Créer:**

- `components/features/public-site/agenda/calendar/CalendarEventChip.tsx`
- `components/features/public-site/agenda/calendar/CalendarDayCell.tsx`
- `components/features/public-site/agenda/calendar/CalendarNav.tsx`
- `components/features/public-site/agenda/calendar/CalendarMonth.tsx`
- `components/features/public-site/agenda/calendar/CalendarWeek.tsx`
- `components/features/public-site/agenda/calendar/CalendarDay.tsx`
- `components/features/public-site/agenda/calendar/CalendarView.tsx`
- `components/features/public-site/agenda/calendar/index.ts`

**Modifier:**

- `lib/schemas/agenda.ts` — ajouter `AgendaView`
- `lib/dal/agenda.ts` — ajouter `fetchEventsForCalendar` + mapper extrait
- `components/features/public-site/agenda/AgendaContext.tsx` — state/actions calendrier
- `components/features/public-site/agenda/types.ts` — `calendarEvents` dans props
- `components/features/public-site/agenda/AgendaContainer.tsx` — fetch + prop
- `components/features/public-site/agenda/AgendaClientContainer.tsx` — rendu conditionnel

---

## Accessibilité (WCAG 2.2 — obligatoire per instructions)

- `role="grid"` sur le conteneur calendrier, `role="row"` sur chaque ligne, `role="columnheader"` sur les en-têtes jour, `role="gridcell"` sur chaque cellule
- `aria-label="lundi 4 mai 2026"` sur chaque gridcell (date longue)
- `aria-current="date"` sur la cellule d'aujourd'hui
- Roving tabindex sur les cellules du calendrier (arrow keys pour naviguer)
- `CalendarNav` boutons avec `aria-label` explicites ("Mois précédent", "Mois suivant")
- View switcher: `role="tablist"` + `role="tab"` + `aria-selected`
- Contraste: événements utilisent les CSS vars `--primary`, `--muted` déjà conformes AA

---

## Vérification

1. `pnpm build` — zéro erreur TypeScript
2. `pnpm lint` — zéro warning ESLint
3. Navigation manuelle `/agenda` :
   - Vue Mois: grille 7×5 avec events de mai 2026 visibles
   - Clic "< Prev" → avril 2026, clic "Aujourd'hui" → retour mai 2026
   - Clic cellule jour → bascule sur vue Jour, événements filtrés
   - Vue Semaine: 7 colonnes, scroll horizontal mobile
   - Onglet "Liste" → retour à la vue liste existante (comportement inchangé)
4. Resize browser < 640px: calendrier mois en mode compact (dots)
5. Keyboard: `Tab` → `CalendarNav`, arrow keys → navigate cells dans le grid

---

## Décisions

- **Pas de lib calendrier externe** — date-fns v4 déjà installé + Tailwind Grid suffisent
- **Vue liste conservée** comme 4ème onglet — aucune régression UX
- **Filtre type** (dropdown genres) uniquement sur vue liste — pas de filtre sur calendrier
- **Fetch séparé** pour le calendrier (`fetchEventsForCalendar`) — préserve le comportement "upcoming only" de la liste
- **Hors scope** : export ICS global du calendrier mois (le bouton ICS par event reste), time-slot grid (Google Calendar style), drag & drop, infinite scroll, récurrence (données présentes mais non développées)
