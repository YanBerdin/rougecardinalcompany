# Rapport Supabase Advisors — 2026-01-07

Projet Supabase: `yvtrlvmbofklefxcxrzv`

Résumé bref

- Performance: nombreuses recommandations (FK sans index couvrant, RLS inefficace, indices inutilisés, policies permissives multiples).

> **Conseils de performance (détaillé)**

A. Clés étrangères sans index couvrant — action prioritaire

- Problème : plusieurs contraintes FK n'ont pas d'index couvrant sur la colonne référencée → jointures/filtrages lents.
- Tables / contraintes identifiées (créer index sur la colonne FK listée) :
  - public.articles_categories — `articles_categories_category_id_fkey`
  - public.articles_medias — `articles_medias_media_id_fkey`
  - public.articles_presse — `articles_presse_og_image_media_id_fkey`
  - public.articles_tags — `articles_tags_tag_id_fkey`
  - public.categories — `categories_created_by_fkey`
  - public.communiques_categories — `communiques_categories_category_id_fkey`
  - public.communiques_medias — `communiques_medias_media_id_fkey`
  - public.communiques_presse — `communiques_presse_evenement_id_fkey`
  - public.communiques_tags — `communiques_tags_tag_id_fkey`
  - public.compagnie_presentation_sections — `compagnie_presentation_sections_image_media_id_fkey`
  - public.configurations_site — `configurations_site_updated_by_fkey`
  - public.contacts_presse — `contacts_presse_created_by_fkey`
  - public.evenements — `evenements_lieu_id_fkey`
  - public.home_about_content — `home_about_content_image_media_id_fkey`
  - public.home_hero_slides — `home_hero_slides_image_media_id_fkey`
  - public.membres_equipe — `membres_equipe_photo_media_id_fkey`
  - public.partners — `partners_logo_media_id_fkey`
  - public.seo_redirects — `seo_redirects_created_by_fkey`
  - public.spectacles — `spectacles_og_image_media_id_fkey`
  - public.spectacles_categories — `spectacles_categories_category_id_fkey`
  - public.spectacles_medias — `spectacles_medias_media_id_fkey`
  - public.spectacles_membres_equipe — `spectacles_membres_equipe_membre_id_fkey`
  - public.spectacles_tags — `spectacles_tags_tag_id_fkey`
  - public.tags — `tags_created_by_fkey`

- Exemple SQL (générique) :

```sql
create index if not exists idx_table_fkcol on public.table_name (fk_column);
```

- Remarques : privilégier `create index concurrently` pour les bases en production si disponible, ou planifier la fenêtre de maintenance.

B. RLS — appels `auth.<function>()` réévalués par ligne (initPlan)

- Problème : certaines policies (ex. `public.spectacles`) appellent `auth.<function>()` directement dans la clause, ce qui peut forcer l'évaluation par ligne.
- Impact : dégradation des performances sur scans/reads à grande échelle.
- Remédiation : remplacer `auth.uid()` par `(select auth.uid())` dans les clauses `using`/`with check` des policies pour permettre la mise en cache par initPlan.
- Exemple :

```sql
-- mauvais
create policy "Admins can view all spectacles" on public.spectacles for select to authenticated using ( auth.uid() = owner_id );

-- bon (initPlan)
create policy "Admins can view all spectacles" on public.spectacles for select to authenticated using ( (select auth.uid()) = owner_id );
```

- Lien : https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

C. Politiques permissives multiples pour le même rôle+action

- Problème : tables avec plusieurs policies permissives pour `authenticated` + `select` (ex. `categories`, `communiques_presse`, `compagnie_presentation_sections`, `home_hero_slides`, `membres_equipe`, `partners`, `spectacles`).
- Impact : chaque policy permissive est évaluée → coût supplémentaire et complexité.
- Remédiation : fusionner les policies compatibles en une seule policy permissive par rôle+action, ou rendre certaines policies restrictives si elles doivent filtrer des sous-ensembles.

D. Index inutilisés (candidates à suppression ou revision)

- Liste d'indices détectés comme non utilisés (analyse recommandée via `pg_stat_user_indexes` / `pg_stat_all_indexes`) :
  - `idx_pending_invitations_status` (pending_invitations)
  - `idx_compagnie_presentation_sections_kind` (compagnie_presentation_sections)
  - `idx_evenements_parent_event_id`, `idx_evenements_recurrence_end_date`, `idx_evenements_start_time`, `idx_evenements_type_array`, `idx_evenements_date_time` (evenements)
  - `idx_analytics_events_type`, `idx_analytics_events_entity`, `idx_analytics_events_created_at`, `idx_analytics_search_query_trgm` (analytics_events)
  - `idx_categories_display_order`, `idx_categories_is_active` (categories)
  - `idx_content_versions_type` (content_versions)
  - `idx_seo_redirects_old_path`, `idx_seo_redirects_active` (seo_redirects)
  - `idx_sitemap_entries_indexed`, `idx_sitemap_entries_last_modified` (sitemap_entries)
  - `idx_spectacles_title`, `idx_spectacles_title_trgm`, `idx_spectacles_search_vector`, `idx_spectacles_slug`, `idx_spectacles_status`, `idx_spectacles_public`, `idx_spectacles_title_trgm` (spectacles)
  - `idx_articles_published_at`, `idx_articles_title_trgm` (articles_presse)
  - `idx_medias_uploaded_by`, `idx_medias_thumbnail_path` (medias)
  - `idx_communiques_presse_public`, `idx_communiques_presse_ordre`, `idx_communiques_presse_search` (communiques_presse)
  - `idx_partners_is_active` (partners)
  - `idx_profiles_role` (profiles)
  - `idx_configurations_site_key_pattern`, `idx_configurations_site_category` (configurations_site)
  - `idx_messages_contact_*` (messages_contact: reason, status, contact_presse, status_actifs, consent_true)
  - `media_item_tags_tag_id_idx` (media_item_tags)

- Remédiation : pour chaque index non utilisé
  1. vérifier statistiques d'utilisation (`pg_stat_user_indexes`, `pg_stat_all_indexes`).
  2. si inutilisé depuis longtemps, envisager `drop index` après revue et tests.
  3. si index partiellement utile, remplacer par index partiel (`where ...`) pour réduire coût et espace.

## Summary of the issue

Supabase AI response :
The RLS policy "Admins can create spectacles" on table public.spectacles calls either current_setting() or an auth.<function>() (e.g., auth.uid() / auth.jwt()) directly within the policy expression. When used directly, Postgres may re-evaluate these function calls for every row processed by the query, which can cause poor performance at scale.

The recommended fix is to wrap those calls in a scalar subquery so they are computed once per statement, e.g.:

Bad (re-evaluated per row): auth.uid()
Good (evaluated once): (SELECT auth.uid())
This follows Supabase guidance: call functions with SELECT inside RLS policy expressions to avoid per-row re-evaluation.

Why it matters
Per-row evaluation can significantly increase CPU and latency for large scans, updates, or inserts.
Wrapping calls in a single-value subquery lets Postgres treat the result as a constant for the query execution, improving performance and ensuring policies scale.
Suggested fixes
Identify the exact policy definition. Example problematic policy fragments:

USING (auth.uid() = owner_id)
WITH CHECK (current_setting('jwt.claims.role') = 'admin')
USING ((auth.jwt() ->> 'tenant_id')::uuid = tenant_id)
Update the policy to call those functions via SELECT. Examples:

Replace auth.uid() with (SELECT auth.uid())
Replace current_setting('...') with (SELECT current_setting('...'))
Replace auth.jwt() ->> 'claim' with ((SELECT auth.jwt()) ->> 'claim')
Example corrected policy SQL (adjust names to your actual policy):

For a policy that allowed admins to create: CREATE POLICY "Admins can create spectacles" ON public.spectacles FOR INSERT TO authenticated WITH CHECK ( (SELECT (auth.jwt() ->> 'role')) = 'admin' );
Or using uid: WITH CHECK ( (SELECT auth.uid()) = owner_id );
Deploy changes:

> If you created the policy via SQL, run an ALTER or DROP/CREATE with the corrected expression.
> If using the Dashboard, edit the policy expression and replace direct calls as described.
Validate:

Run explain/analyze on representative queries (INSERT/SELECT/UPDATE) before and after the change to confirm fewer function evaluations and improved plans.
Test behavior with non-admin and admin accounts to confirm policy semantics remain correct.
> Example minimal SQL fix :
(Use this as a template; do not run destructive changes without confirming.)

```sql
-- Example: replace an existing policy by dropping and recreating it
DROP POLICY IF EXISTS "Admins can create spectacles" ON public.spectacles;

CREATE POLICY "Admins can create spectacles" ON public.spectacles
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT (auth.jwt() ->> 'role')) = 'admin'
);
```

Notes & best practices

> Always wrap calls to auth.* functions and current_setting() in a scalar SELECT inside RLS expressions.
> Ensure any casting (e.g., ::uuid) is preserved inside the SELECT where needed: (SELECT (auth.jwt() ->> 'tenant_id'))::uuid = tenant_id.
> Add indexes on columns referenced by the policy (e.g., owner_id, tenant_id) to further improve performance.
> Test policies using representative loads to confirm correctness and performance.*
