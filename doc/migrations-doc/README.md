# Documentation Projet - Rouge Cardinal Company

## 📚 Index des Documents

### Incidents de Production

- ✅ **[INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md](./legacy-migrations/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md)** - **DOCUMENT PRINCIPAL**
  - Post-mortem complet de l'incident production du 27 octobre 2025
  - Analyse de la campagne de sécurité erronée (Rounds 1-17)
  - Résolution complète (5 migrations GRANT restoration)
  - Leçons apprises et checklist de prévention
  - **À LIRE EN PRIORITÉ** pour comprendre le modèle de sécurité PostgreSQL

- ⚠️ **[RLS_POLICIES_HOTFIX_2025-10-26.md](./legacy-migrations/DEPRECATED/RLS_POLICIES_HOTFIX_2025-10-26.md)** - Analyse partielle (conservée pour historique)
  - Première analyse de l'incident (incomplète)
  - Identifie RLS policies manquantes et fonction is_admin
  - **NE reflète PAS la résolution finale**
  - Voir post-mortem ci-dessus pour la version complète

### Guides Techniques

- [progress.md](`./progress.md`) - Progression générale du projet
- [update-node-18to-22.md](`./update-node-18to-22.md`) - Guide de mise à jour Node.js

## ⚠️ Documents Dépréciés

Les documents suivants sont **DEPRECATED** et ne doivent **PAS** être utilisés comme référence :

- ❌ `supabase/migrations/SECURITY_AUDIT_SUMMARY.md` - Campagne de sécurité erronée (Rounds 1-17)
  - Basée sur une compréhension incorrecte du modèle de sécurité PostgreSQL
  - A causé l'incident de production du 27 octobre 2025
  - Conservé uniquement pour l'historique

## 🎯 Guides de Référence

### Modèle de Sécurité PostgreSQL (Correct)

PostgreSQL requiert **DEUX niveaux** de permissions :

```sql
-- Layer 1: GRANT (table-level) - Vérifié EN PREMIER
GRANT SELECT ON TABLE public.spectacles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.spectacles TO authenticated;

-- Layer 2: RLS (row-level) - Vérifié EN SECOND
ALTER TABLE public.spectacles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public spectacles viewable by everyone"
  ON public.spectacles FOR SELECT
  TO anon, authenticated
  USING (public = true);

CREATE POLICY "Admins see all spectacles"
  ON public.spectacles FOR SELECT
  TO authenticated
  USING (is_admin());
```

**Sans GRANT** : PostgreSQL retourne `permission denied for table` (42501) AVANT d'évaluer RLS.

### Architecture Base de Données

Voir les guides dans `.github/instructions/` :

- `nextjs-supabase-auth-2025.instructions.md` - Authentification optimisée (JWT Signing Keys)
- `nextjs15-backend-with-supabase.instructions.md` - Patterns Next.js 15 backend
- `1-clean-code.instructions.md` et `2-typescript.instructions.md` - Standards de code

### Structure Projet

Voir `.github/copilot-instructions.md` pour :

- Feature-based organization
- Smart/Dumb component pattern
- Data Access Layer (DAL)
- Server/Client component usage

## 📊 Statistiques Incident (27 oct 2025)

- **Durée** : 8 heures (02:00 → 02:30 résolution finale après plusieurs tentatives)
- **Impact** : Production DOWN - Homepage et toutes pages publiques inaccessibles
- **Objets affectés** : 59 objets database (33 tables + 11 vues + 15 fonctions)
- **Migrations d'urgence** : 7 migrations créées (2 RLS + 1 function + 1 séparation + 5 GRANTs)
- **Cause racine** : Campagne de sécurité basée sur fausse prémisse "RLS-only"
- **Résolution** : Restauration de tous les GRANTs + création RLS policies + fonction is_admin

## Références commit & migrations

Commits récents liés aux corrections et CI (branche `feature/backoffice`):

- c74115e — ci(monitor): add scheduled monitor for detect-revoke workflow (YanBerdin)
  - https://github.com/YanBerdin/rougecardinalcompany/commit/c74115e4ea9c847d8748411372b841c8f1e294b4
- e6b5249 — ci(security): fail CI when changed migrations contain REVOKE (YanBerdin)
  - https://github.com/YanBerdin/rougecardinalcompany/commit/e6b5249686a2482dd3bfd1e94f15270e6b865edf
- e0f0916 — chore(ci): add README for allowed_exposed_objects and warn-only workflow (YanBerdin)
  - https://github.com/YanBerdin/rougecardinalcompany/commit/e0f09163b1ca075d1b5c0e9e8391b0620b46a70e
- 3e160a8 — chore(ci): add detected exposed DB objects to allowlist (YanBerdin)
  - https://github.com/YanBerdin/rougecardinalcompany/commit/3e160a842fba05c637c64237421b71cd90cd3aa0
- d1cfaad — chore(ci): allowlist known restored DB objects in audit (YanBerdin)
  - https://github.com/YanBerdin/rougecardinalcompany/commit/d1cfaadc8a5b776eea3867faeb7a842296e68360
- 8b9df19 — chore(migrations): add warning headers to revoke_* migrations and move dangerous ones to legacy-migrations (YanBerdin)
  - https://github.com/YanBerdin/rougecardinalcompany/commit/8b9df198de4716ec7e9f45820c8141f3142e356a

Migrations d'urgence (résolution GRANTs & RLS) :

- `supabase/migrations/20251026180000_apply_spectacles_partners_rls_policies.sql`
- `supabase/migrations/20251026181000_apply_missing_rls_policies_home_content.sql`
- `supabase/migrations/20251027000000_create_is_admin_function.sql`
- `supabase/migrations/20251027020000_restore_basic_grants_for_rls.sql`
- `supabase/migrations/20251027021000_restore_remaining_grants.sql`
- `supabase/migrations/20251027021500_restore_views_grants.sql`
- `supabase/migrations/20251027022000_fix_logs_audit_grants.sql`
- `supabase/migrations/20251027022500_grant_execute_all_trigger_functions.sql`

## 🔗 Références Externes

- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL GRANT Documentation](https://www.postgresql.org/docs/current/sql-grant.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js 15 Documentation](https://nextjs.org/docs)

---

**Dernière mise à jour** : 27 octobre 2025  
**Maintenu par** : Équipe développement Rouge Cardinal Company
