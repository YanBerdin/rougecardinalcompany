# Plan : TASK050 - Stratégie Backup & Recovery (Final)

**TL;DR** : Exports hebdomadaires `pg_dump` via GitHub Actions, stockés dans bucket privé Supabase Storage avec rétention 4 semaines, notifications d'échec par email GitHub. Tests dry-run sur instance locale.

## Steps

1. **Créer le script d'export** [scripts/backup-database.ts](scripts/) : Exécute `pg_dump --format=custom`, compresse en gzip, upload vers bucket `backups` via Supabase Storage, supprime les dumps > 4 semaines (rotation automatique).

2. **Configurer le bucket Storage** : Ajouter bucket `backups` dans [supabase/schemas/02c_storage_buckets.sql](supabase/schemas/02c_storage_buckets.sql) avec policies restrictives (service_role uniquement, pas de public access).

3. **Créer le workflow GitHub Actions** [.github/workflows/backup-database.yml](@/.github/workflows/) : Schedule `cron: '0 3 * * 0'` (dimanche 3h UTC), secrets `SUPABASE_DB_URL` + `SUPABASE_SERVICE_ROLE_KEY`, job ~5-10 min, échec = email automatique GitHub.

4. **Exécuter test dry-run local** : `supabase start` → `pg_restore` du dump → validation counts (`spectacles`, `membres_equipe`, etc.) → documenter résultats dans [TASK050_RUNBOOK_PITR_restore.md](memory-bank/tasks/TASK050_RUNBOOK_PITR_restore.md).

5. **Finaliser documentation** : Compléter runbook avec procédure GitHub Actions, ajouter section backup dans [supabase/README.md](supabase/README.md), marquer TASK050 `completed` dans [TASK050-database-backup-recovery.md](memory-bank/tasks/TASK050-database-backup-recovery.md).

## Estimation

- **Step 1-2** : 1h (script + bucket)
- **Step 3** : 30min (workflow YAML)
- **Step 4** : 1h (test dry-run + validation)
- **Step 5** : 30min (documentation)
- **Total** : ~3h

## Stratégie de Récupération Multi-Niveaux

| Niveau | Mécanisme | Granularité | Protection contre |
|--------|-----------|-------------|-------------------|
| **1. Content Versioning** | Triggers sur tables (existant) | Entité par entité | Erreurs utilisateur, rollback granulaire |
| **2. Weekly Backup** | `pg_dump` + Supabase Storage (TASK050) | Base complète | Disaster recovery, corruption totale |

**Complémentarité** :
- Le [Content Versioning](supabase/schemas/15_content_versioning.sql) permet de restaurer une version antérieure d'un spectacle/article spécifique sans toucher au reste.
- Le Weekly Backup protège contre les scénarios catastrophiques où le versioning lui-même serait perdu (DROP TABLE, corruption base, etc.).

## Décisions Prises

| Question | Décision |
|----------|----------|
| Plan Supabase | Free (pas de PITR natif) |
| Automatisation | GitHub Actions hebdomadaire (< 1500 min/mois) |
| Stockage dumps | Supabase Storage bucket privé |
| Rétention | 4 derniers dumps (1 mois) |
| Notifications échec | Email GitHub (défaut) |

## Secrets GitHub Requis

| Secret | Description |
|--------|-------------|
| `SUPABASE_DB_URL` | `postgresql://postgres:[password]@db.yvtrlvmbofklefxcxrzv.supabase.co:5432/postgres` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service-role pour upload Storage |

## Fichiers à Créer/Modifier

| Fichier | Action |
|---------|--------|
| `scripts/backup-database.ts` | Créer |
| `supabase/schemas/02c_storage_buckets.sql` | Modifier (ajouter bucket backups) |
| `.github/workflows/backup-database.yml` | Créer |
| `memory-bank/tasks/TASK050_RUNBOOK_PITR_restore.md` | Modifier (ajouter résultats dry-run) |
| `memory-bank/tasks/TASK050-database-backup-recovery.md` | Modifier (status: completed) |
| `supabase/README.md` | Modifier (ajouter section backup) |
