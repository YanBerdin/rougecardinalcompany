## Plan : Analytics Dashboard Admin (TASK031)

Tableau de bord analytique admin avec métriques de trafic, visualisations temps-série, intégration Sentry et export CSV/JSON, en réutilisant l'infrastructure `analytics_events` existante et le pattern Container/View du projet.

### Steps

1. **Installer le composant Chart shadcn/ui** — Exécuter `pnpm dlx shadcn@latest add chart` pour ajouter Recharts

2. **Créer la vue SQL 90 jours** — Ajouter migration `supabase/migrations/YYYYMMDDHHMMSS_analytics_summary_90days.sql` avec vue `analytics_summary_90d` pour étendre la rétention de 30 à 90 jours (RLS admin-only)

3. **Créer les schemas Zod** — Ajouter [lib/schemas/analytics.ts](lib/schemas/analytics.ts) avec :
   - `AnalyticsFilterSchema` (date range, granularity auto: "hour" si ≤7j, "day" sinon)
   - `PageviewsSeriesSchema`, `TopPageSchema`, `MetricsSummarySchema`
   - `SentryErrorMetricsSchema` pour les données Sentry

4. **Créer le DAL analytics** — Implémenter [lib/dal/analytics.ts](lib/dal/analytics.ts) avec 5 fonctions cachées :
   - `fetchPageviewsTimeSeries()` — exploite `analytics_summary_90d`, granularité auto
   - `fetchTopPages()` — top 10 pages par views
   - `fetchMetricsSummary()` — total views, unique visitors, sessions
   - `fetchAdminActivitySummary()` — requête `logs_audit`
   - `fetchSentryErrorMetrics()` — appel API Sentry (issues count par severity)

5. **Configurer l'intégration Sentry API** — Ajouter variables T3 Env (`SENTRY_ORG`, `SENTRY_AUTH_TOKEN`) dans [lib/env.ts](lib/env.ts) et créer [lib/services/sentry-api.ts](lib/services/sentry-api.ts) pour récupérer error counts P0/P1/P2

6. **Créer la page et les composants** — Structure :
   - [app/(admin)/admin/analytics/page.tsx](app/(admin)/admin/analytics/page.tsx) avec `revalidate = 300` (ISR 5min)
   - [components/features/admin/analytics/AnalyticsContainer.tsx](components/features/admin/analytics/AnalyticsContainer.tsx) (Server, fetch parallèle)
   - [components/features/admin/analytics/AnalyticsDashboard.tsx](components/features/admin/analytics/AnalyticsDashboard.tsx) (Client, état + UI)
   - Sous-composants : `MetricCard.tsx`, `PageviewsChart.tsx`, `TopPagesTable.tsx`, `AnalyticsFilters.tsx`, `SentryErrorsCard.tsx`

7. **Implémenter les Server Actions export** — Créer [app/(admin)/admin/analytics/actions.ts](app/(admin)/admin/analytics/actions.ts) avec `exportAnalyticsCSV()` et `exportAnalyticsJSON()` en réutilisant le pattern de [app/(admin)/admin/audit-logs/actions.ts](app/(admin)/admin/audit-logs/actions.ts)

8. **Ajouter la navigation sidebar** — Modifier [components/admin/sidebar/nav-content.tsx](components/admin/sidebar/nav-content.tsx) pour ajouter l'entrée "Analytics" avec icône `BarChart3`

### Decisions

| Question | Décision |
|----------|----------|
| Granularité temporelle | Automatique : "hour" pour ≤7 jours, "day" pour >7 jours |
| Métriques Sentry | ✅ Intégrer via API Sentry (issues count par severity P0/P1/P2) |
| Rétention données | Créer vue complémentaire `analytics_summary_90d` pour 90 jours |
