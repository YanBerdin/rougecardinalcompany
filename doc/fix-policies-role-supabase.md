# Bugs identifiés et corrigés (2026-03-10)

L'analyse croisée du code source avec cet audit a révélé 4 bugs concrets, corrigés dans les fichiers correspondants.

## Bug P0 — Policy RESTRICTIVE bloquant les articles publiés pour authenticated

> **Fichier** : `supabase/schemas/08_table_articles_presse.sql`
>
> **Problème** : La policy `"Admins can view all press articles"` était déclarée `as restrictive`. Or en PostgreSQL, les policies RESTRICTIVE s'appliquent en AND avec les policies PERMISSIVE. Résultat : pour le rôle `authenticated`, la condition finale devenait `published_at is not null AND is_admin()`. Les utilisateurs authentifiés non-admin ne voyaient **aucun** article — seuls `anon` (qui n'est pas ciblé par la RESTRICTIVE) et les admins pouvaient voir les articles publiés.
>
> **Correction** : Retrait de `as restrictive`, la policy est maintenant PERMISSIVE (défaut). Les deux policies SELECT s'évaluent en OR : les non-admins voient les articles publiés, les admins voient tout.

### Bug P1 — Policies `super_admin` mortes sur `logs_audit`

> **Fichier** : `supabase/schemas/10_tables_system.sql`
>
> **Problème** : Les policies UPDATE/DELETE sur `logs_audit` exigeaient `role = 'super_admin'` dans le profil. Or la contrainte `profiles_role_check` dans `50_constraints.sql` n'autorise que `user`, `editor`, `admin`. Le rôle `super_admin` ne peut jamais exister, rendant ces policies toujours fausses (aucun UPDATE/DELETE possible, même pour un admin).
>
> **Correction** : Remplacement par des policies admin-only simples avec `is_admin()`. Ajout d'un commentaire signalant que UPDATE/DELETE sur les logs d'audit doit rester exceptionnel.

## Bug P1 — Inconsistance `is_admin()` dans les policies spectacles

> **Fichier** : `supabase/schemas/61_rls_main_tables.sql`
>
> **Problème** : Les policies INSERT, UPDATE et DELETE sur `spectacles` utilisaient un subquery inline `exists(select 1 from profiles where user_id = auth.uid() and role = 'admin')` au lieu de la fonction centralisée `is_admin()`, contrairement à toutes les autres tables (evenements, partners, medias, etc.). Cela créait une incohérence de maintenance et ne bénéficiait pas du cache `initPlan` de la fonction.
>
> **Correction** : Remplacement des subqueries inline par `(select public.is_admin())` pour INSERT, et `created_by = (select auth.uid()) or (select public.is_admin())` pour UPDATE/DELETE (pattern owner-or-admin conservé).

## Bug P2 — Description trompeuse du rôle editor dans InviteUserForm

> **Fichier** : `components/features/admin/users/InviteUserForm.tsx`
>
> **Problème** : La description affichée pour le rôle `editor` était « Peut créer et modifier du contenu », alors qu'aucune permission éditoriale n'est implémentée en RLS ni côté DAL. Le rôle `editor` est effectivement traité comme un `authenticated` standard sans privilège particulier.
>
> **Correction** : Description modifiée en « Accès en lecture seule (permissions éditoriales à venir) » pour refléter l'état réel du système.

## Note importante sur la policy `articles_presse` (correction de l'audit)

La section « Analytics, audit, rétention » de l'audit mentionnait correctement que `super_admin` n'existe pas dans le modèle. En revanche, l'audit **ne signalait pas** le bug RESTRICTIVE sur `articles_presse` qui est le plus critique (P0) car il rendait les articles invisibles pour les utilisateurs connectés non-admin.
