# TASK076 : Fix Violation MIG-005 : `to anon, authenticated` combiné (Majeure)

**Instruction** Create_migration.instructions.md :
> **"RLS Policies should be granular: one policy for select, one for insert etc and for **each supabase role** (anon and authenticated). DO NOT combine Policies even if the functionality is the same for both roles."**

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

---

## Observation mineure : GRANT SELECT retiré sur `articles_presse_public`

Le fichier 08_table_articles_presse.sql contient deux NOTE indiquant que `GRANT SELECT` a été retiré pour le CI audit. La vue `articles_presse_public` est `SECURITY INVOKER` — elle nécessite que le rôle appelant ait accès à la table de base. Vérifier que les grants par défaut Supabase (public schema) couvrent cet accès, sinon `anon` ne verra pas les articles publiés via la vue.

---

### Actions recommandées

| Priorité | Action | Fichier | Effort |
| ---------- | -------- | --------- | -------- |
| P1 | Séparer `to anon, authenticated` en policies distinctes (5 tables) | 61_rls_main_tables.sql + 08_table_articles_presse.sql | 20 min |
| P2 | Vérifier que les grants par défaut couvrent la vue `articles_presse_public` | Schema ou migration | 5 min |
