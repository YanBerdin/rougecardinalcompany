# Documentation Projet - Rouge Cardinal Company

## 📚 Index des Documents

### Incidents de Production

- ✅ **[INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md](./INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md)** - **DOCUMENT PRINCIPAL**
  - Post-mortem complet de l'incident production du 27 octobre 2025
  - Analyse de la campagne de sécurité erronée (Rounds 1-17)
  - Résolution complète (5 migrations GRANT restoration)
  - Leçons apprises et checklist de prévention
  - **À LIRE EN PRIORITÉ** pour comprendre le modèle de sécurité PostgreSQL

- ⚠️ **[RLS_POLICIES_HOTFIX_2025-10-26.md](./RLS_POLICIES_HOTFIX_2025-10-26.md)** - Analyse partielle (conservée pour historique)
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

## 🔗 Références Externes

- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL GRANT Documentation](https://www.postgresql.org/docs/current/sql-grant.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js 15 Documentation](https://nextjs.org/docs)

---

**Dernière mise à jour** : 27 octobre 2025  
**Maintenu par** : Équipe développement Rouge Cardinal Company
