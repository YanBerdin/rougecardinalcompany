# 🚨 INCIDENT POST-MORTEM: Production Down - Permission Denied (26-27 Oct 2025)

## 📋 Résumé Exécutif

**Incident**: Site en production inaccessible - Erreurs "permission denied" (PostgreSQL 42501)  
**Durée**: ~8 heures (26 oct 18:00 → 27 oct 02:30 UTC)  
**Cause racine**: GRANTs révoqués pendant campagne RLS sans restauration  
**Impact**: Homepage et toutes pages publiques down  
**Résolution**: 4 migrations d'urgence restaurant les GRANTs

---

## 🔴 Chronologie de l'Incident

### Phase 1: Détection (26 oct 18:00)

- **Symptôme**: Homepage affiche "Erreur lors du chargement des données"
- **Logs**: 7 fonctions DAL retournent PostgreSQL 42501 "permission denied"
- **Tables affectées**:
  - `home_hero_slides`
  - `spectacles`
  - `partners`
  - `communiques_presse`
  - `compagnie_stats`
  - `home_about_content`
  - `configurations_site`

### Phase 2: Diagnostic Initial (26 oct 18:00-19:00)

- ❌ **Hypothèse 1**: RLS policies manquantes
  - **Action**: Création migration `20251026180000_apply_spectacles_partners_rls_policies.sql`
  - **Résultat**: Échec - erreurs persistent

- ❌ **Hypothèse 2**: Policies manquantes sur autres tables
  - **Action**: Création migration `20251026181000_apply_missing_rls_policies_home_content.sql`
  - **Résultat**: Échec - erreurs persist

### Phase 3: Découverte Fonction Manquante (27 oct 00:00)

- **Découverte**: Fonction `is_admin()` référencée par policies mais n'existe pas
- **Action**: Création migration `20251027000000_create_is_admin_function.sql`
- **Résultat**: Partiel - fonction créée mais policies invalides (créées AVANT fonction)

### Phase 4: Recréation Policies (27 oct 01:00)

- **Action**: Recréation toutes policies APRÈS fonction
  - Migration: `20251027010000_recreate_all_rls_policies.sql`
  - 30 policies recréées (7 tables × ~4 policies)
- **Résultat**: Échec - erreurs persistent malgré policies valides

### Phase 5: Investigation Profonde (27 oct 01:00-02:00)

- **MCP Supabase**: Connexion directe à la base pour diagnostics
- **Tests**:
  - ✅ Policies existent et sont valides
  - ✅ Fonction `is_admin()` existe (SECURITY DEFINER)
  - ✅ Profil utilisateur admin existe
  - ❌ Requêtes avec clé anon échouent: "permission denied"
  - ✅ Requêtes avec clé service_role réussissent

### Phase 6: Cause Racine Identifiée (27 oct 02:00)

- **Script diagnostic**: `scripts/diagnose-server-auth.ts` créé
- **Révélation**: Clé ANON échoue mais SERVICE_ROLE réussit
- **Vérification GRANTs**:

  ```sql
  SELECT grantee FROM information_schema.table_privileges 
  WHERE table_name = 'home_hero_slides'
  -- Résultat: SEULEMENT service_role, PAS anon/authenticated
  ```

### Phase 7: Résolution (27 oct 02:00-02:30)

**Découverte critique**: PostgreSQL nécessite **DEUX niveaux** de permission:

1. **GRANT** (table-level): Permission d'accéder à la structure de la table
2. **RLS Policy** (row-level): Filtrage des lignes accessibles

**Sans GRANT, RLS n'est JAMAIS évalué** → Permission denied avant même de vérifier les policies !

**Migrations appliquées**:

1. **`20251027020000_restore_basic_grants_for_rls.sql`**
   - GRANTs pour 7 tables principales + profiles + membres_equipe
   - `GRANT SELECT` pour anon/authenticated
   - `GRANT INSERT, UPDATE, DELETE` pour authenticated (filtré par RLS)

2. **`20251027021000_restore_remaining_grants.sql`**
   - GRANTs pour 26 tables restantes
   - Tables système (newsletter, contact, analytics)
   - Tables de liaison (many-to-many)
   - Séquences (`GRANT USAGE`)

3. **`20251027021500_restore_views_grants.sql`**
   - GRANTs pour 11 vues (publiques et admin)
   - `articles_presse_public`, `communiques_presse_public`, etc.

4. **`20251027022000_fix_logs_audit_grants.sql`**
   - `GRANT INSERT` sur `logs_audit` pour authenticated
   - Fix triggers audit qui échouaient

5. **`20251027022500_grant_execute_all_trigger_functions.sql`**
   - `GRANT EXECUTE` sur 15 fonctions trigger
   - Versioning, audit, automatisations

**Résultat**: ✅ **Production restaurée à 02:30 UTC**

---

## 🔍 Analyse Technique

### Cause Racine Profonde

**Contexte**: Campagne de sécurité RLS (Rounds 1-17, sept-oct 2025)

- Objectif: Durcir sécurité en passant à RLS-only
- Actions:
  1. ✅ Activation RLS sur toutes tables
  2. ✅ Création policies permissives
  3. ❌ **RÉVOCATION de tous les GRANTs** pour forcer RLS
  4. ❌ **AUCUNE restauration des GRANTs de base**

**Malentendu architectural**:

```
Pensée initiale (INCORRECTE):
  RLS policies = Contrôle d'accès complet
  → Pas besoin de GRANTs

Réalité PostgreSQL:
  Access = GRANT (table-level) AND RLS (row-level)
  → Les deux sont nécessaires !
```

### Pourquoi Cela a Fonctionné Localement ?

**Environnement local** (Docker):

- Role `postgres` utilisé par défaut
- `postgres` est superuser → bypass tous les checks
- RLS non testé réellement

**Environnement production** (Supabase Cloud):

- Roles `anon` / `authenticated` utilisés
- Pas de privilèges superuser
- RLS + GRANTs strictement appliqués

### Architecture PostgreSQL: Modèle de Sécurité

```
┌─────────────────────────────────────┐
│  1. CONNECTION (Role: anon/auth)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. TABLE-LEVEL PERMISSIONS (GRANT) │ ◄─── MANQUAIT !
│     □ SELECT                        │
│     □ INSERT                        │
│     □ UPDATE                        │
│     □ DELETE                        │
└──────────────┬──────────────────────┘
               │ IF GRANTED
               ▼
┌─────────────────────────────────────┐
│  3. ROW-LEVEL SECURITY (RLS)        │ ◄─── Existait
│     • Policies USING (...)          │
│     • Policies WITH CHECK (...)     │
└──────────────┬──────────────────────┘
               │ IF POLICY MATCH
               ▼
┌─────────────────────────────────────┐
│  4. DATA ACCESS GRANTED             │
└─────────────────────────────────────┘
```

**Sans GRANT à l'étape 2**: Permission denied **AVANT** d'évaluer RLS !

---

## 📊 Impact

### Tables Affectées

- **33 tables** sans GRANTs pour anon/authenticated
- **11 vues** sans GRANTs
- **15 fonctions** sans EXECUTE
- **Total**: 59 objets database bloqués

### Fonctionnalités Impactées

- ❌ Homepage complète
- ❌ Liste des spectacles
- ❌ Page de presse
- ❌ À propos / Équipe
- ❌ Partenaires
- ❌ Newsletter (inscription)
- ❌ Contact (formulaire)
- ❌ Toutes opérations CRUD admin

### Utilisateurs Impactés

- **Public**: 100% des visiteurs (site inaccessible)
- **Admin**: 100% des opérations backend

---

## ✅ Actions Correctives

### Immédiat (Fait)

- ✅ 5 migrations d'urgence appliquées
- ✅ Scripts de diagnostic créés
- ✅ Production restaurée et testée

### Court Terme (À faire)

- [ ] Créer tests automatisés GRANTs + RLS
- [ ] Ajouter CI check pré-déploiement
- [ ] Documentation pattern GRANT + RLS
- [ ] Playbook incident "Permission Denied"

### Moyen Terme

- [ ] Revue processus de déploiement
- [ ] Tests environnement staging avec roles réels
- [ ] Monitoring permissions database
- [ ] Alertes sur erreurs 42501

---

## 📚 Leçons Apprises

### ✅ Ce qui a bien fonctionné

1. **MCP Supabase**: Diagnostic direct sans passer par Next.js
2. **Scripts de test**: Isolation du problème (anon vs service_role)
3. **Migrations granulaires**: Facilite rollback si besoin
4. **Documentation**: Toutes actions tracées dans migrations

### ❌ Ce qui a mal fonctionné

1. **Malentendu RLS**: Confusion entre RLS et GRANTs
2. **Tests locaux insuffisants**: Docker avec postgres superuser
3. **Pas de staging réaliste**: Différence local vs production
4. **Campagne de sécurité trop agressive**: Révocation sans plan de restauration

### 🎓 Connaissances Acquises

**Pattern correct pour sécurité PostgreSQL**:

```sql
-- 1. Activer RLS
ALTER TABLE ma_table ENABLE ROW LEVEL SECURITY;

-- 2. Créer policies (filtrage lignes)
CREATE POLICY "Public read" ON ma_table
  FOR SELECT TO anon, authenticated
  USING (public = true);

-- 3. GARDER les GRANTs de base (accès table)
GRANT SELECT ON ma_table TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ma_table TO authenticated;

-- Résultat: GRANT + RLS = Sécurité multicouche
```

**Ordre des opérations critique**:

1. Tables et colonnes
2. Fonctions helper (is_admin, etc.)
3. RLS policies (référencent fonctions)
4. GRANTs (permettent l'exécution)
5. Tests avec roles réels

---

## 🔧 Outils Créés

### Scripts de Diagnostic

1. **`scripts/diagnose-server-auth.ts`**
   - Test accès avec clé anon vs service_role
   - Vérification GRANTs sur tables
   - Exécutable: `pnpm tsx scripts/diagnose-server-auth.ts`

2. **`scripts/test-evenements-access.ts`**
   - Test spécifique table evenements
   - Vérification JOINs avec spectacles

3. **`scripts/test-all-dal-functions.ts`**
   - Test complet toutes fonctions DAL
   - Simule flux homepage

### Routes de Debug Next.js

1. **`app/api/debug-auth/route.ts`**
   - API JSON avec état auth complet
   - Cookies, user, queries test

2. **`app/debug-auth/page.tsx`**
   - Interface visuelle état auth
   - Tests multi-tables avec résultats

### Migrations d'Urgence

5 migrations horodatées 20251027020000-022500

---

## 📝 Checklist Pré-Déploiement (Nouveau)

Avant tout déploiement touchant à la sécurité database:

### Tests Locaux

- [ ] RLS activé sur TOUTES les tables modifiées
- [ ] Policies créées POUR CHAQUE opération (SELECT, INSERT, UPDATE, DELETE)
- [ ] Fonctions helpers existent AVANT policies
- [ ] GRANTs présents pour anon/authenticated
- [ ] Test avec `SET ROLE authenticated` (pas postgres)

### Tests Staging

- [ ] Environment variables = production (publishable key, pas service_role)
- [ ] Test authentification avec utilisateur réel
- [ ] Test accès anonyme (sans auth)
- [ ] Test toutes fonctions DAL
- [ ] Vérifier logs pour erreurs 42501

### Vérifications Database

```sql
-- Check 1: RLS activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
-- Résultat attendu: 0 rows

-- Check 2: Toutes tables ont GRANTs
SELECT DISTINCT t.tablename
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public' AND c.relrowsecurity = true
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_privileges p
    WHERE p.table_name = t.tablename 
      AND p.grantee IN ('anon', 'authenticated')
  );
-- Résultat attendu: 0 rows

-- Check 3: Toutes vues ont GRANTs
SELECT table_name FROM information_schema.views v
WHERE v.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_privileges p
    WHERE p.table_name = v.table_name 
      AND p.grantee IN ('anon', 'authenticated')
  );
-- Résultat attendu: 0 rows (ou vues privées uniquement)
```

---

## 🔗 Références

### Documentation

- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Supabase Auth: https://supabase.com/docs/guides/auth/row-level-security
- Incident files:
  - `supabase/migrations/202510270*.sql`
  - `scripts/diagnose-*.ts`
  - `doc/RLS_POLICIES_HOTFIX_2025-10-26.md`

### Migrations Critiques

```
20251027020000_restore_basic_grants_for_rls.sql
20251027021000_restore_remaining_grants.sql
20251027021500_restore_views_grants.sql
20251027022000_fix_logs_audit_grants.sql
20251027022500_grant_execute_all_trigger_functions.sql
```

---

## ✨ Conclusion

Cet incident a révélé une incompréhension fondamentale du modèle de sécurité PostgreSQL. **RLS ne remplace pas les GRANTs**, les deux travaillent ensemble:

- **GRANTs**: "Qui peut accéder à la TABLE ?"
- **RLS**: "Quelles LIGNES peuvent-ils voir ?"

La campagne de sécurité RLS était bien intentionnée mais incomplète. La résolution a permis d'établir les **bonnes pratiques** pour toute modification future de sécurité database.

**Status final**: ✅ **Production stable, toutes fonctionnalités restaurées**

---

**Document créé: 27 octobre 2025, 02:30 UTC**  
**Incident résolu: 27 octobre 2025, 02:30 UTC**  
**Durée totale: ~8 heures**
