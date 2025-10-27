# ⚠️ AVERTISSEMENT SÉCURITÉ - Incident de Production (27 octobre 2025)

## 🚨 Incident Critique Résolu

**Date** : 27 octobre 2025  
**Durée** : 8 heures  
**Impact** : Production DOWN - Application entièrement inaccessible  
**Statut** : ✅ RÉSOLU  

## 📋 Résumé Exécutif

Une **campagne de sécurité erronée** (25-26 octobre 2025, Rounds 1-17) a causé une panne de production complète en révoquant tous les GRANTs PostgreSQL sur 73 objets database, basée sur une compréhension incorrecte du modèle de sécurité PostgreSQL.

**Erreur fondamentale** : Croire que "Row Level Security (RLS) seul suffit pour le contrôle d'accès".

**Réalité** : PostgreSQL requiert **GRANT (table-level) + RLS (row-level)** - les deux sont complémentaires, pas alternatifs.

## ⚠️ FAUSSE HYPOTHÈSE (À NE JAMAIS REPRODUIRE)

```
❌ FAUX : "Les GRANTs au niveau table court-circuitent les politiques RLS"
❌ FAUX : "RLS seul suffit pour la sécurité"
❌ FAUX : "Révoquer tous les GRANTs = amélioration de la sécurité"
```

## ✅ MODÈLE DE SÉCURITÉ CORRECT

PostgreSQL vérifie les permissions dans cet ordre :

```sql
-- Étape 1 : GRANT (table-level) - Vérifié EN PREMIER
GRANT SELECT ON TABLE public.spectacles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.spectacles TO authenticated;
-- Sans GRANT → permission denied (42501) AVANT vérification RLS

-- Étape 2 : RLS (row-level) - Vérifié EN SECOND (seulement si GRANT OK)
ALTER TABLE public.spectacles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public spectacles viewable"
  ON public.spectacles FOR SELECT
  TO anon, authenticated
  USING (public = true);
-- Filtre quelles lignes sont visibles
```

**Les deux niveaux sont OBLIGATOIRES et COMPLÉMENTAIRES.**

## 📊 Impact de l'Incident

### Objets Affectés (Révoqués puis Restaurés)

- **33 tables** : home_hero_slides, spectacles, partners, articles_presse, etc.
- **11 vues** : articles_presse_public, communiques_presse_dashboard, etc.
- **15 fonctions** : audit_trigger, create_content_version, triggers de versioning, etc.

### Erreurs Observées

```
ERROR: permission denied for table home_hero_slides (42501)
ERROR: permission denied for view articles_presse_public (42501)
ERROR: permission denied for table logs_audit (42501)
ERROR: permission denied for function create_content_version (42501)
```

### Pages Affectées

- ❌ Homepage (7 fonctions DAL en échec)
- ❌ Toutes les pages publiques
- ❌ Toutes les pages admin
- ❌ Système d'authentification
- ❌ Gestion de contenu

## ✅ Résolution

### Migrations d'Urgence (27 octobre 02:00-02:30)

5 migrations créées pour restaurer les GRANTs :

1. `20251027020000_restore_basic_grants_for_rls.sql` - 9 tables critiques
2. `20251027021000_restore_remaining_grants.sql` - 26 tables restantes
3. `20251027021500_restore_views_grants.sql` - 11 vues
4. `20251027022000_fix_logs_audit_grants.sql` - Permissions audit trigger
5. `20251027022500_grant_execute_all_trigger_functions.sql` - 15 fonctions

**Résultat** : Production opérationnelle à nouveau à 02:30 UTC.

## 📚 Documentation Complète

**Post-mortem détaillé** : [`doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md`](./doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md)

Contient :

- Timeline complète de l'incident (7 phases)
- Analyse technique de la cause racine
- Les 5 migrations correctives documentées
- Leçons apprises et checklist de prévention
- Requêtes SQL de vérification

## ❌ Documents Dépréciés (NE PAS UTILISER)

Les documents suivants décrivent la **campagne erronée** et sont conservés uniquement pour l'historique :

- `supabase/migrations/SECURITY_AUDIT_SUMMARY.md` (marqué DEPRECATED)
- `supabase/migrations/migrations.md` (section Rounds 1-17 avec avertissements)
- `doc/RLS_POLICIES_HOTFIX_2025-10-26.md` (analyse partielle incomplète)

## 🎯 Leçons Apprises - À Retenir

### 1. Modèle de Sécurité PostgreSQL

```
┌─────────────────────────────────────────┐
│ PostgreSQL Security Layers (REQUIRED)   │
├─────────────────────────────────────────┤
│ Layer 1: GRANT (table-level)            │
│   - Controls: WHO can access table      │
│   - Checked: FIRST                      │
│   - Without: permission denied (42501)  │
│                                         │
│ Layer 2: RLS (row-level)                │
│   - Controls: WHICH rows visible        │
│   - Checked: SECOND (if GRANT passed)   │
│   - Without: deny all by default        │
└─────────────────────────────────────────┘
```

### 2. Defense in Depth

GRANT + RLS = **Security Multicouche** (pas alternatifs)

- GRANT : Permissions au niveau table/structure
- RLS : Filtrage au niveau ligne/data

### 3. Tests Avant Production

**Checklist obligatoire** :

- ✅ Tester avec `SET ROLE authenticated` en staging
- ✅ Vérifier l'accès avec clés anon/authenticated (pas service_role)
- ✅ Scripts diagnostiques pour comparer anon vs service_role
- ✅ Tests d'intégration sur fonctions DAL

### 4. Outils d'Audit

**À ÉVITER** :

- ❌ Scripts qui flagguent tous les GRANTs comme "exposés"
- ❌ Audits basés sur "absence de GRANTs = sécurisé"

**À UTILISER** :

- ✅ Audit de la **logique des RLS policies** (`USING (true)` sans justification)
- ✅ Vérification SECURITY DEFINER vs SECURITY INVOKER
- ✅ Tests d'accès réels avec différents rôles

## 🔗 Ressources

### Documentation PostgreSQL Officielle

- [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [GRANT Documentation](https://www.postgresql.org/docs/current/sql-grant.html)
- [Database Roles](https://www.postgresql.org/docs/current/user-manag.html)

### Documentation Projet

- [Instructions Next.js 15 Backend](./.github/instructions/nextjs15-backend-with-supabase.instructions.md)
- [Supabase Auth Optimisée](./.github/instructions/nextjs-supabase-auth-2025.instructions.md)
- [Copilot Instructions](./.github/copilot-instructions.md)

## ⚠️ Message pour les Développeurs Futurs

**SI VOUS VOYEZ UN AUDIT DE SÉCURITÉ SUGGÉRANT DE "RÉVOQUER TOUS LES GRANTS" :**

1. 🛑 **STOP** - Ne pas appliquer sans comprendre
2. 📚 Lire ce document et le post-mortem complet
3. 🧪 Tester en staging avec `SET ROLE authenticated`
4. ❓ Questionner la prémisse : "Pourquoi révoquer des permissions requises ?"
5. ✅ Comprendre que GRANT + RLS travaillent ensemble

**PostgreSQL n'est PAS "GRANT OU RLS", c'est "GRANT ET RLS".**

---

**Date de création** : 27 octobre 2025  
**Dernière mise à jour** : 27 octobre 2025  
**Statut** : ✅ Incident résolu - Documentation complète disponible  
**Responsable** : Équipe développement Rouge Cardinal Company
