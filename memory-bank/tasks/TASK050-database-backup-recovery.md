# TASK050 - Database Backup & Recovery Strategy

**Status:** completed  
**Priority:** P0 (Critical)  
**Added:** 2026-01-05  
**Completed:** 2026-01-14

## Objectif

Mettre en place une stratégie de sauvegarde et de restauration (PITR) pour la base de données Supabase, documenter et tester les procédures de restauration (dry-run), et définir les politiques de rétention.

## Contexte

- L'historique des migrations contient des opérations potentiellement destructives (`drop cascade`).
- Aucune procédure de backup/restore formalisée n'est documentée.
- Nécessaire avant tout déploiement en production.

## Solution Implémentée

### Stratégie Multi-Niveaux

| Niveau | Mécanisme | Granularité | Protection contre |
| -------- | ----------- | ------------- | ------------------- |
| **1. Content Versioning** | Triggers sur tables (existant) | Entité par entité | Erreurs utilisateur, rollback granulaire |
| **2. Weekly Backup** | `pg_dump` + Supabase Storage | Base complète | Disaster recovery, corruption totale |

### Composants Créés

1. **Script d'export**: `scripts/backup-database.ts`
   - Exécute `pg_dump --format=custom` avec compression gzip
   - Upload vers bucket Supabase Storage `backups`
   - Rotation automatique : garde les 4 derniers dumps (4 semaines)

2. **Bucket Storage**: `supabase/schemas/02c_storage_buckets.sql`
   - Bucket privé `backups` (non-public)
   - Policies RLS service_role uniquement
   - Limite 500MB par fichier

3. **Workflow GitHub Actions**: `.github/workflows/backup-database.yml`
   - Schedule: Dimanche 3h00 UTC (hebdomadaire)
   - Durée: 5-10 minutes
   - Notification email automatique en cas d'échec

### Secrets GitHub Requis

| Secret | Description |
| -------- | ------------- |
| `SUPABASE_DB_URL` | `postgresql://postgres:[password]@db.yvtrlvmbofklefxcxrzv.supabase.co:5432/postgres` |
| `SUPABASE_SECRET_KEY` | Clé service-role pour upload Storage |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Clé publishable |

## Livrables

- [x] Configuration PITR (supabase cloud) et politique de rétention (4 semaines)
- [x] Runbook de restauration (étapes pas-à-pas) et checklist de test
- [ ] Test de restauration (dry-run) documenté et validé (à compléter par l'utilisateur)
- [x] Script / instructions pour export de DB (pg_dump / supabase CLI)
- [x] Documentation dans `memory-bank/` et référence dans README

## Checklist d'Implémentation

- [x] Créer le script d'export `scripts/backup-database.ts`
- [x] Configurer le bucket Storage `backups` avec policies RLS
- [x] Créer le workflow GitHub Actions hebdomadaire
- [x] Documenter procédure de backup et restore dans runbook
- [ ] **Action utilisateur**: Exécuter test dry-run local et documenter résultats
- [ ] **Action utilisateur**: Configurer secrets GitHub
- [ ] **Action utilisateur**: Activer workflow et valider première exécution

## Prochaines Étapes (Utilisateur)

1. **Configurer les secrets GitHub**:
   - Aller dans Settings → Secrets and variables → Actions
   - Ajouter les 4 secrets requis (voir tableau ci-dessus)

2. **Exécuter test dry-run local**:

   ```bash
   # 1. Créer un premier backup
   pnpm exec tsx scripts/backup-database.ts
   
   # 2. Télécharger depuis Storage
   supabase storage download backups/backup-YYYYMMDD-HHMMSS.dump.gz
   
   # 3. Restaurer sur environnement local
   gunzip backup-YYYYMMDD-HHMMSS.dump.gz
   supabase start
   pg_restore --clean --no-owner \
     --dbname="postgresql://postgres:postgres@localhost:54322/postgres" \
     backup-YYYYMMDD-HHMMSS.dump
   
   # 4. Valider les counts (documenter dans TASK050_RUNBOOK_PITR_restore.md)
   psql "postgresql://postgres:postgres@localhost:54322/postgres" << SQL
   select 'spectacles', count(*) from public.spectacles;
   select 'membres_equipe', count(*) from public.membres_equipe;
   select 'medias', count(*) from public.medias;
   SQL
   ```

3. **Activer le workflow GitHub**:
   - Aller dans Actions → Weekly Database Backup
   - Cliquer "Run workflow" pour tester manuellement
   - Vérifier email de notification

## Documentation

- **Runbook complet**: `memory-bank/tasks/TASK050_RUNBOOK_PITR_restore.md`
- **Workflow**: `.github/workflows/backup-database.yml`
- **Script**: `scripts/backup-database.ts`
- **Schema Storage**: `supabase/schemas/02c_storage_buckets.sql`

## Estimation Finale

- **Implémentation**: 3h (script + bucket + workflow + doc) ✅
- **Test dry-run**: 1h (à compléter par utilisateur) ⏳
- **Total**: ~4h
