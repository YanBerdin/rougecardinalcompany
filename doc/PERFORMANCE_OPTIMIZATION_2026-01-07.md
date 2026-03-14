# Performance optimization — 2026-01-07

Résumé des actions réalisées et instructions pour la validation en production.

## 🔄 Corrections Supplémentaires (2026-01-07 14:00 UTC)

### Categories Table - Duplicate SELECT Policies Fixed

**Migration**: `20260107140000_fix_categories_duplicate_select_policies.sql`

**Problème**: Détecté lors de l'audit post-déploiement - la table `categories` avait échappé à la Phase 3 de l'optimisation et conservait 2 politiques SELECT permissives :

- `"Active categories are viewable by everyone"` - `using (is_active = true)`  
- `"Admins can view all categories"` - `using ((select public.is_admin()))`

**Impact**: CPU overhead à chaque requête SELECT (évaluation de 2 politiques au lieu d'1)

**Solution**: Fusion en 1 seule politique avec logique OR

```sql
create policy "View categories (active OR admin)"
using ( is_active = true or (select public.is_admin()) );
```

**Validation**: ✅ 26/26 tests sécurité (13 vues + 13 RLS)  
**Déployé**: 2026-01-07 14:00 UTC (local + cloud)

---

## Actions réalisées (automatiques dans repo)

- Ajout de 24 index couvrants FK dans `supabase/schemas/40_indexes.sql`.
- Remplacement des usages directs `auth.uid()` par `(select auth.uid())` dans `supabase/schemas/61_rls_main_tables.sql` pour permettre l'`initPlan`.
- Fusion de policies SELECT redondantes pour :
  - `public.spectacles` (fusionnée en `View spectacles (public published OR admin all)`).
  - `public.home_hero_slides` (fusionnée en `View home hero slides (public active OR admin all)`).
  - `public.compagnie_presentation_sections` (fusionnée en `View presentation sections (public active OR admin all)`).
  - `public.membres_equipe` (fusionnée en `View team members (public active OR admin all)`).
  - `public.communiques_presse` (fusionnée en `View press releases (public OR admin all)`).
  - `public.partners` (fusionnée en `View partners (active public OR admin all)`).

## Prochaines étapes (à exécuter en production)

1. ✅ **FAIT (2026-03-14)** — `scripts/check_unused_indexes.sql` exécuté via MCP Supabase sur le cloud.
   **Résultat** : 88 index avec `idx_scan = 0` détectés (statistiques représentatives : >60 jours depuis déploiement).
   Index les plus volumineux : `idx_spectacles_title_trgm` (48 kB), `idx_analytics_events_type` (48 kB), `idx_evenements_type_array` (24 kB).
2. ⏳ Valider chaque index candidat (usage business, historique, requêtes occasionnelles) avant suppression.
3. ⏳ Mettre à jour `supabase/schemas/40_indexes.sql` en retirant les index validés pour suppression.
4. ⏳ Générer migration déclarative :

```bash
pnpm dlx supabase stop
# éditer les fichiers sous supabase/schemas/
pnpm dlx supabase db diff -f performance_indexes_rls_policies
cat supabase/migrations/$(ls -t supabase/migrations/ | head -1)
pnpm dlx supabase start
```

## Validation

- Exécuter les requêtes `EXPLAIN ANALYZE` listées dans le plan.
- Lancer `pnpm exec tsx scripts/check-views-security.ts` et `pnpm exec tsx scripts/test-admin-access.ts`.

## Notes

- Toute suppression d'index doit être précédée d'une validation `pg_stat_user_indexes` et d'une revue fonctionnelle.
- Les modifications aux politiques RLS sont atomiques dans les fichiers déclaratifs ; la migration générée contient les DROP/CREATE nécessaires.
