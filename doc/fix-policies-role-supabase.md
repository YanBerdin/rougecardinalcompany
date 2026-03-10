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

---

## Rapport d'audit — fix-policies-role-supabase.md

**Fichiers analysés** : 6 fichiers | **Score conformité** : 91/100

---

### Les 4 bugs sont correctement corrigés dans le code

| Bug | Fichier | Statut | Conformité instructions |
| ----- | --------- | -------- | ------------------------ |
| **P0** — RESTRICTIVE articles_presse | 08_table_articles_presse.sql | Corrigé | 9/10 |
| **P1-a** — `super_admin` logs_audit | 10_tables_system.sql | Corrigé | 10/10 |
| **P1-b** — Inline subquery spectacles | 61_rls_main_tables.sql | Corrigé | 9/10 |
| **P2** — Description editor InviteUserForm | InviteUserForm.tsx | Corrigé | 10/10 |

---

### Points conformes (checklist instructions)

```bash
RLS-001  (select auth.uid()) wrappé               ✅ Partout
RLS-002  SELECT → USING only                       ✅ Partout
RLS-003  INSERT → WITH CHECK only                  ✅ Partout
RLS-004  UPDATE → USING + WITH CHECK               ✅ Partout
RLS-005  DELETE → USING only                        ✅ Partout
RLS-006  Policies séparées (pas FOR ALL)            ✅ Partout
RLS-008  Noms descriptifs entre guillemets doubles  ✅ Partout
RLS-009  Indexes sur colonnes RLS                   ✅ Tous présents dans 40_indexes.sql + tables
RLS-010  PERMISSIVE préféré                         ✅ Aucun RESTRICTIVE restant
FN-001   SECURITY DEFINER documenté (audit_trigger) ✅ Comment explicite
SQL-CASE SQL en minuscules                          ✅ Partout
MIG-003  RLS activé sur toutes les tables           ✅ Partout
MIG-007  comment on table présent                   ✅ articles_presse + logs_audit
```

- **`super_admin` totalement éliminé** : 0 occurrence dans `supabase/schemas/**`
- **La contrainte `profiles_role_check`** dans 50_constraints.sql confirme que seuls `user`, `editor`, `admin` sont autorisés
- **Le document** décrit fidèlement les 4 corrections appliquées au code

---

### Violation MIG-005 : `to anon, authenticated` combiné (Majeure)

**Instruction** Create_migration.instructions.md :
> **"RLS Policies should be granular: one policy for select, one for insert etc) and for **each supabase role** (anon and authenticated). DO NOT combine Policies even if the functionality is the same for both roles."**

**5 tables combinent les rôles** dans une même SELECT policy :

| Table | Ligne | Policy |
| ------- | ------- | -------- |
| `medias` | 61_rls_main_tables.sql | `to anon, authenticated` |
| `spectacles` | 61_rls_main_tables.sql | `to anon, authenticated` |
| `evenements` | 61_rls_main_tables.sql | `to anon, authenticated` |
| `partners` | 61_rls_main_tables.sql | `to anon, authenticated` |
| `articles_presse` | 08_table_articles_presse.sql | `to anon, authenticated` |

**2 tables le font correctement** (policies séparées) :

- `media_tags` : 61_rls_main_tables.sql — policies `anon` et `authenticated` séparées
- `media_folders` : 61_rls_main_tables.sql — idem

**Impact performance** : Dans les policies `spectacles` et `partners`, `(select public.is_admin())` est évalué inutilement pour `anon` (toujours `false`). Séparer les policies permettrait à PostgreSQL de sauter cette évaluation, conformément à la recommandation Supabase :
> **"This prevents the policy from running for any anon users, since the execution stops at the to authenticated step."**

**Exemple de correction** pour `spectacles` :

```sql
-- anon: seulement publié/archivé (pas d'évaluation is_admin)
create policy "Anon can view public spectacles"
on public.spectacles
for select
to anon
using (
  public = true
  and status in ('published', 'archived')
);

-- authenticated: publié/archivé OU admin
create policy "Authenticated can view spectacles"
on public.spectacles
for select
to authenticated
using (
  (
    public = true
    and status in ('published', 'archived')
  )
  or (select public.is_admin())
);
```

> **Note** : Cette violation est **pré-existante** — elle n'a pas été introduite par le fix. Cependant, la réécriture des policies spectacles (Bug P1-b) était une opportunité de la corriger.

---

### Observation mineure : GRANT SELECT retiré sur `articles_presse_public`

Le fichier 08_table_articles_presse.sql contient deux NOTE indiquant que `GRANT SELECT` a été retiré pour le CI audit. La vue `articles_presse_public` est `SECURITY INVOKER` — elle nécessite que le rôle appelant ait accès à la table de base. Vérifier que les grants par défaut Supabase (public schema) couvrent cet accès, sinon `anon` ne verra pas les articles publiés via la vue.

---

### Actions recommandées

| Priorité | Action | Fichier | Effort |
| ---------- | -------- | --------- | -------- |
| P1 | Séparer `to anon, authenticated` en policies distinctes (5 tables) | 61_rls_main_tables.sql + 08_table_articles_presse.sql | 20 min |
| P2 | Vérifier que les grants par défaut couvrent la vue `articles_presse_public` | Schema ou migration | 5 min |

---

### Verdict

Le document fix-policies-role-supabase.md est **fidèle et complet**. Les 4 corrections sont correctement appliquées dans le code et respectent les instructions critiques (RLS clauses, `(select ...)` wrapping, PERMISSIVE, `is_admin()` centralisé, SQL lowercase). La seule déviation notable est la combinaison `to anon, authenticated` dans 5 SELECT policies, qui viole Create_migration.instructions.md — mais c'est un pattern pré-existant, non introduit par le fix.
