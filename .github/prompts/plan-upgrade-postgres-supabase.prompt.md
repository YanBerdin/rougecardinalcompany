# Plan : Mise à jour Postgres Supabase

**Date de création** : 2026-01-08  
**Statut** : ✅ COMPLÉTÉ (Étapes 1-5/5)  
**Priorité** : Moyenne (WARN level → Résolu)  
**Type** : Maintenance infrastructure

---

## Contexte

### Alerte détectée

- **Version actuelle** : `supabase-postgres-17.4.1.069`
- **Niveau** : WARN
- **Source** : Rapport Supabase Advisors (2026-01-07)
- **Impact** : Exposition possible à vulnérabilités corrigées dans des versions plus récentes

### Environnement

- **Type de projet** : Développement (données factices uniquement)
- **Stratégie** : Ce projet cloud servira de staging, un nouveau projet sera créé pour la production
- **Risque** : Faible — aucune donnée de production

---

## Pré-requis

### État actuel du projet

| Élément | Valeur |
| --------- | -------- |
| Migrations | 66 fichiers |
| Schéma déclaratif | 42 fichiers SQL |
| Tables avec RLS | 36/36 (100%) |
| Functions | 28 (SECURITY INVOKER) |
| Extensions | pgcrypto, pg_trgm, unaccent, citext |

### Dernière migration

- **Fichier** : `20260107140000_fix_categories_duplicate_select_policies.sql`
- **Date** : 2026-01-07

---

## Étapes d'exécution

### Étape 1 : Synchronisation locale ✅ COMPLÉTÉE

**Objectif** : Capturer l'état actuel du schéma avant l'upgrade

```bash
pnpm db:pull
```

**Validation** : Vérifier que `supabase/` contient les dernières migrations

**Résultat (2026-01-08)** :

| Élément | Statut |
|---------|--------|
| Connexion DB distante | ✅ |
| Migrations appliquées | ✅ 66/66 |
| Schéma synchronisé | ✅ No changes |
| Extensions vérifiées | ✅ pgcrypto installé |

**Notes** :
- Code de sortie 1 = "No schema changes found" (comportement normal quand synchronisé)
- 3 fichiers ignorés (ne respectent pas le pattern `<timestamp>_name.sql`) : `ROUND_7B_ANALYSIS.md`, `migrations.md`, `sync_existing_profiles.sql`

---

### Étape 2 : Déclenchement de l'upgrade ✅ COMPLÉTÉE

**Procédure** :

1. Ouvrir le [Dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionner le projet de développement
3. Naviguer vers **Settings** → **Infrastructure**
4. Localiser la section **Database version**
5. Cliquer sur **Upgrade** ou suivre les instructions de maintenance

**Résultat (2026-01-08)** :

- [x] Version source : `17.4.1.069`
- [x] Version cible : `17.6.1.063` (à remplir depuis dashboard)
- [ ] Durée totale : `15min`

---

### Étape 3 : Validation post-upgrade ✅ COMPLÉTÉE

#### 3.1 Lint des migrations ✅

```bash
pnpm db:lint
```

**Résultat (2026-01-08)** :

```bash
Linting schema: public
No schema errors found
🎉 All tests passed!
✅ All view security tests passed!
✅ All views are properly secured with SECURITY INVOKER!
```

---

#### 3.2 Tests RLS Cloud ✅

```bash
pnpm exec tsx scripts/test-rls-cloud.ts
```

**Résultat (2026-01-08)** : ✅ Tous les tests passent (36 tables protégées)

---

#### 3.3 Test des views sécurisées ✅

```bash
pnpm exec tsx scripts/check-views-security.ts
```

**Résultat (2026-01-08)** : ✅ Toutes les vues admin isolées correctement

---

### Étape 4 : Vérification des extensions ✅ COMPLÉTÉE

**Commande SQL** (via SQL Editor du dashboard) :

```sql
SELECT extname, extversion FROM pg_extension ORDER BY extname;
```

**Extensions requises** :

| Extension | Version | Statut |
| --------- | ------- | ------ |
| pgcrypto | 1.3 | ✅ OK |
| pg_trgm | 1.6 | ✅ OK |
| unaccent | 1.1 | ✅ OK |
| citext | 1.6 | ✅ OK |

**Extensions supplémentaires détectées** :

| Extension | Version | Description |
| --------- | ------- | ----------- |
| pg_graphql | 1.5.11 | GraphQL support |
| pg_net | 0.19.5 | HTTP client |
| pg_stat_statements | 1.11 | Query statistics |
| plpgsql | 1.0 | PL/pgSQL language |
| supabase_vault | 0.3.1 | Secrets management |
| uuid-ossp | 1.1 | UUID generation |

**Résultat (2026-01-08)** : ✅ Toutes les extensions préservées après l'upgrade (10 extensions actives)

---

### Étape 5 : Documentation de la mise à jour

Mettre à jour les fichiers suivants avec les informations de l'upgrade :

#### 5.1 memory-bank/activeContext.md

Ajouter dans la section des actions récentes :

```markdown
### 2026-01-08 - Mise à jour Postgres Supabase

- **Action** : Upgrade de la version Postgres sur Supabase Cloud
- **Version source** : 17.4.1.069
- **Version cible** : [À REMPLIR]
- **Motif** : Correctifs de sécurité disponibles (alerte Advisors WARN)
- **Validation** : 
  - db:lint ✅
  - test-rls-cloud.ts ✅
  - Extensions vérifiées ✅
```

#### 5.2 memory-bank/progress.md

Ajouter une entrée de maintenance :

```markdown
### Infrastructure - Maintenance Postgres

| Date | Action | Détails | Statut |
|------|--------|---------|--------|
| 2026-01-08 | Upgrade Postgres | 17.4.1.069 → [VERSION] | ✅ Complété |

**Notes** :
- Upgrade déclenché via dashboard Supabase
- Aucune interruption de service notable
- Toutes les validations passées (RLS, extensions, lint)
```

#### 5.3 memory-bank/systemPatterns.md

Mettre à jour la section infrastructure/database :

```markdown
### Database Infrastructure

- **SGBD** : PostgreSQL [17.6.1.063]
- **Hébergement** : Supabase Cloud
- **Dernière mise à jour** : 2026-01-08 (depuis 17.4.1.069)
- **Extensions actives** : pgcrypto, pg_trgm, unaccent, citext
```

#### 5.4 memory-bank/techContext.md

Mettre à jour la section stack technique :

```markdown
### Backend / Database

| Technologie | Version | Dernière MAJ |
|-------------|---------|--------------|
| PostgreSQL (Supabase) | [17.6.1.063] | 2026-01-08 |
| Supabase JS Client | @supabase/supabase-js | - |
| Supabase SSR | @supabase/ssr | - |

**Historique versions Postgres** :
- 2026-01-08 : Upgrade vers 17.6.1.063 (correctifs sécurité)
- Précédent : 17.4.1.069
```

---

## Checklist finale

- [X] `pnpm db:pull` exécuté
- [X] Upgrade déclenché via dashboard
- [X] Version cible notée (17.6.1.063)
- [X] `pnpm db:lint` passé
- [X] `scripts/test-rls-cloud.ts` passé
- [X] Extensions vérifiées (4/4)
- [X] activeContext.md mis à jour
- [X] progress.md mis à jour
- [X] systemPatterns.md mis à jour
- [X] techContext.md mis à jour
- [ ] Commit de documentation effectué (en attente)

---

## Notes post-exécution ✅

**Rempli après l'upgrade (2026-01-08)** :

```bash
Date d'exécution : 2026-01-08
Version finale : 17.6.1.063
Durée downtime : ~15 minutes
Problèmes rencontrés : Aucun
Actions correctives : Aucune nécessaire
Validations : Toutes passées (lint, RLS, views, extensions)
```

---

## 🎉 Résumé de l'upgrade

| Catégorie | Résultat |
|----------|----------|
| **Upgrade** | 17.4.1.069 → 17.6.1.063 ✅ |
| **Durée** | ~15 minutes |
| **Migrations** | 66/66 préservées ✅ |
| **Tables RLS** | 36/36 protégées ✅ |
| **Extensions** | 4/4 actives ✅ |
| **Tests** | Lint + RLS + Views ✅ |
| **Documentation** | 4 fichiers mis à jour ✅ |

**Prochaine action** : Commit de la documentation mise à jour

```bash
git add memory-bank/ .github/prompts/
git commit -m "docs: Postgres upgrade 17.4.1.069 → 17.6.1.063 (security patches)"
```

## Notes post-exécution ✅

**Rempli après l'upgrade (2026-01-08)** :

```bash
Date d'exécution : 2026-01-08
Version finale : 17.6.1.063
Durée downtime : ~15 minutes
Problèmes rencontrés : Aucun
Actions correctives : Aucune nécessaire
Validations : Toutes passées (lint, RLS, views, extensions)
```

---

## 🎉 Résumé de l'upgrade

| Catégorie | Résultat |
|----------|----------|
| **Upgrade** | 17.4.1.069 → 17.6.1.063 ✅ |
| **Durée** | ~15 minutes |
| **Migrations** | 66/66 préservées ✅ |
| **Tables RLS** | 36/36 protégées ✅ |
| **Extensions** | 4/4 actives ✅ |
| **Tests** | Lint + RLS + Views ✅ |
| **Documentation** | 4 fichiers mis à jour ✅ |

**Prochaine action** : Commit de la documentation mise à jour

```bash
git add memory-bank/ .github/prompts/
git commit -m "docs: Postgres upgrade 17.4.1.069 → 17.6.1.063 (security patches)"
```
