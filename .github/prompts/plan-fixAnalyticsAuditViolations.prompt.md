# Plan: Fix Violations Audit Analytics + Bugfixes Analytics (2026-02-27)

Corrections appliquées dans les fichiers `components/features/admin/analytics/` et `lib/dal/analytics.ts`.

> **⚠️ Note** : Ce plan a été enrichi par rapport à la version initiale — deux bugfixes additionnels ont été découverts et corrigés en cours de session (sections marquées 🆕).

---

## Étape 1 — `types.ts` : import `ReactNode` (🔴 critique TS)

Dans `types.ts`, ajouté en tête de fichier :

```ts
import type { ReactNode } from "react";
```

Ligne L32, remplacé `React.ReactNode` → `ReactNode`.

**Statut** : ✅ Implémenté

---

## Étape 2 — `SentryErrorsCard.tsx` : supprimer `cn` local, importer depuis `@/lib/utils` (🔴 critique DRY)

1. Suppression de la fonction locale `cn` (ex-lignes L101–L103).
2. Ajout de `import { cn } from "@/lib/utils";` dans les imports.
3. Usage existant : la signature `ClassValue[]` de `@/lib/utils` est compatible.

**Statut** : ✅ Implémenté

---

## Étape 3 — `AdminActivityCard.tsx` : clé stable (🔴 React anti-pattern)

Remplacé `key={index}` par :

```tsx
key={`${action.tableName}-${action.operation}-${action.timestamp.getTime()}`}
```

Combinaison stable et suffisamment unique pour une liste d'actions récentes.

**Statut** : ✅ Implémenté

---

## Étape 4 — `AnalyticsDashboard.tsx` : fusionner les 2 handlers export + supprimer `setTimeout` + export JSON client-side (🟠 DRY + hack + 🆕 bugfix)

### 4a — Fusionner `handleExportCSV` et `handleExportJSON`

Fonction privée `handleExport(format: 'csv' | 'json')` extraite :

- Appelle `exportAnalyticsCSV` (CSV, via Server Action — nécessite `csv-stringify` Node.js)
- Génère le JSON **entièrement côté client** depuis l'état React existant (voir 4c)
- Factorisation du code de download DOM, des `toast` et du `catch`

Les deux boutons appellent respectivement `handleExport("csv")` et `handleExport("json")`.

**Statut** : ✅ Implémenté

### 4b — Remplacer le `setTimeout` hack par `useTransition`

`useState(false)` + `setTimeout` → `useTransition` (React 19) :

```ts
const [isRefreshing, startRefreshTransition] = useTransition();
```

`handleDateRangeChange` utilise `startRefreshTransition(() => { router.refresh(); })`. `isRefreshing` est `true` pendant le refresh automatiquement — plus de hack temporel.

**Statut** : ✅ Implémenté

### 4c — 🆕 Export JSON entièrement côté client (bugfix : fichier vide)

**Problème découvert** : `exportAnalyticsJSON` était une Server Action qui re-fetchait toutes les données et retournait un grand string JSON. La couche de sérialisation RSC perdait silencieusement la valeur quand le spread du payload incluait des instances `Date` (`startDate`/`endDate`).

**Solution** : Server Action `exportAnalyticsJSON` supprimée entièrement. Le JSON est construit côté client depuis l'état React déjà disponible.

```typescript
// Helper : déclenche un téléchargement fichier + libère la mémoire
const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url); // nettoyage mémoire
};

// JSON généré côté client depuis l'état existant — aucun re-fetch
const handleExportJSON = () => {
    const toISO = (d: Date | string): string =>
        d instanceof Date ? d.toISOString() : String(d);
    const exportData = {
        exportDate: new Date().toISOString(),
        filter: { startDate: toISO(pageviewsSeries.startDate), endDate: toISO(pageviewsSeries.endDate), granularity },
        metrics, topPages,
        timeSeries: { ...pageviewsSeries, data: pageviewsSeries.data.map(p => ({ ...p, timestamp: toISO(p.timestamp) })) },
        adminActivity: adminActivity ? { ...adminActivity, recentActions: adminActivity.recentActions.map(a => ({ ...a, timestamp: toISO(a.timestamp) })) } : null,
    };
    triggerDownload(JSON.stringify(exportData, null, 2), `analytics-export-${Date.now()}.json`, "application/json;charset=utf-8;");
};
```

**Note architecturale** : L'export CSV conserve la Server Action (`exportAnalyticsCSV`) car `csv-stringify` est une bibliothèque Node.js uniquement. Le JSON n'a pas cette contrainte.

**Commit dédié** : `d71163b — fix(analytics): move JSON export client-side to fix empty file bug`

**Statut** : ✅ Implémenté + ✅ Commité séparément

---

## Étape 5 — Icônes décoratives sans `aria-hidden` (🟡 accessibilité)

Ajout de `aria-hidden="true"` sur chaque icône Lucide décorative :

| Fichier | Icônes traitées |
|---|---|
| `SentryErrorsCard.tsx` | `AlertTriangle` (×3), `AlertCircle`, `Info` |
| `AdminActivityCard.tsx` | `Activity` (×2) |
| `MetricCard.tsx` | `TrendingUp`, `TrendingDown` |
| `AnalyticsDashboard.tsx` | `Eye`, `Users`, `Activity`, `BarChart3` (passés en prop `icon` à `MetricCard`) |

**Statut** : ✅ Implémenté

---

## Étape 6 — `PageviewsChart.tsx` : accessibilité graphique + import inutilisé + nettoyage état vide (🟡)

1. **`Tooltip` supprimé** de l'import recharts (non utilisé — `ChartTooltip` de shadcn le remplace).
2. **`<ChartContainer>` encapsulé** dans `<div role="img" aria-label="Graphique des pages vues par période">` — WCAG 2.2 AA pour les graphiques non-textuels.
3. **🆕 Branche "état vide" supprimée** : le bloc

   ```tsx
   if (data.data.length === 0) { return <p>Aucune donnée disponible</p>; }
   ```

   a été retiré — le graphique vide est géré par Recharts nativement (axes sans données) ; la duplication avec `isLoading` introduisait un état intermédiaire non prévu par le type `PageviewsChartProps`.

**Statut** : ✅ Implémenté

---

## 🆕 Bugfix DAL — `lib/dal/analytics.ts` : `uniqueVisitors` affichait toujours 0 (🔴 logique)

**Problème découvert** : Les 3 fonctions DAL comptaient les visiteurs uniques via `user_id`, qui est systématiquement `NULL` pour les visiteurs anonymes (la Server Action `trackPageView` ne stocke jamais `user_id`). Résultat : `Set` toujours vide → `size === 0`.

**Correction appliquée dans 3 fonctions** :

| Fonction | Champ SELECT modifié | Logique modifiée |
|---|---|---|
| `fetchPageviewsTimeSeries` | `created_at, user_id, session_id` → `created_at, session_id` | `users: Set<string>` supprimé ; `uniqueVisitors: sessions.size` |
| `fetchTopPages` | `pathname, user_id, session_id` → `pathname, session_id` | `if (row.user_id) stats.visitors.add(...)` → `if (row.session_id) stats.visitors.add(...)` |
| `fetchMetricsSummary` | `event_type, user_id, session_id` → `event_type, session_id` | `uniqueUsers: Set<string>` supprimé ; `uniqueVisitors: uniqueSessions.size` |

**Justification** : `session_id` (UUID généré par `sessionStorage` dans `PageViewTracker`) est le meilleur proxy pour les visiteurs uniques anonymes — présent dans chaque ligne `analytics_events`.

**Note** : `uniqueVisitors` et `totalSessions` dans `MetricsSummary` ont désormais la même valeur (`uniqueSessions.size`) — sémantiquement correct dans le modèle actuel de tracking à événement unique par session.

**Statut** : ✅ Implémenté — commit distinct à faire

---

## 🆕 Infrastructure Analytics — PageViewTracker + trackPageView + RLS (hors audit initial)

Changements additionnels liés au déploiement de l'infrastructure de tracking analytique :

### `app/(marketing)/layout.tsx`

Ajout du composant `<PageViewTracker />` — déclenche le tracking sur chaque navigation publique.

### `components/features/analytics/PageViewTracker.tsx` (nouveau fichier)

Client Component : lit `sessionStorage` pour le `session_id` (UUID persistant par onglet), appelle la Server Action `trackPageView` à chaque changement de `pathname`.

### `app/actions/analytics.actions.ts` (nouveau fichier)

Server Action `trackPageView` : insère un événement `page_view` dans `analytics_events` avec `pathname`, `session_id`, `user_agent`.

### Migration RLS : `20260227210418_fix_analytics_events_insert_policy.sql`

Hotfix migration corrigeant la politique RLS INSERT d'`analytics_events` :

- **Problème** : L'ancienne policy `"Validated analytics collection"` refusait les inserts avec `entity_type = NULL` (opérateur SQL `IN` avec NULL évalue à NULL/false) et n'incluait pas `'page_view'` comme type d'événement autorisé.
- **Correction** : Remplacement par deux policies granulaires (`anon` + `authenticated`) avec :
  - `event_type IN ('page_view', 'view', 'click', 'share', 'download')`
  - `entity_type IS NULL OR entity_type IN (...)` (null explicitement permis)
  - Validation optionnelle de `session_id` (regex UUID 36 chars), `entity_id` (entier positif), `user_agent` (max 500 chars)
- **Référence schéma déclaratif** : `supabase/schemas/62_rls_advanced_tables.sql` — note explicative ajoutée (INSERT policies gérées par migrations hotfix, pas par le schéma déclaratif)

**Statut** : ✅ Implémenté + ✅ Appliqué sur Supabase Cloud

---

## Vérification finale

```bash
pnpm lint    # Aucune erreur ESLint/TS nouvelle
pnpm build   # Build propre sans warning sur les imports
```

Vérification manuelle : naviguer sur `/admin/analytics` — les icônes ne doivent pas être annoncées par un lecteur d'écran. Le graphique doit être annoncé comme « Graphique des pages vues par période ». Les métriques « Visiteurs Uniques » et « Sessions » doivent afficher des valeurs > 0 après navigation sur le site public.

---

## Récapitulatif des commits

| Commit | Contenu |
|---|---|
| Batch commit audit (à faire) | Étapes 1–3, 5–6, bugfix DAL session_id |
| `d71163b` | Fix JSON export client-side (Étape 4c) |
| Infrastructure analytics (à faire) | PageViewTracker + migration RLS |

---

## Décisions

- `ReactNode` direct (pas `import React`) — conforme aux instructions TypeScript du projet qui évitent les imports `React` inutiles
- Clé stable via triple concaténation string — pas de `crypto.randomUUID()` (évite les rerenders inutiles)
- `handleExport(format)` garde les `toast` en français existants — pas de changement de comportement observable
- `useTransition` pour `router.refresh()` — React track nativement si `isPending`. Plus fiable qu'un `setTimeout`
- Export JSON côté client — aucun re-fetch superflu ; le CSV conserve sa Server Action (contrainte Node.js lib)
- `session_id` comme proxy visiteur unique — `user_id` intentionnellement absent du tracking anonyme
