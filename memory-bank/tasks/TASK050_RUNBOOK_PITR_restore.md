# Runbook: PITR (Point-In-Time Recovery) — vérification, activation et test de restauration

## Contexte

Ce runbook décrit les étapes pour vérifier l'état des sauvegardes d'un projet Supabase, activer PITR si nécessaire, effectuer une sauvegarde logique (dump) et réaliser un test de restauration (dry-run) sur un environnement de staging.

## Prérequis

- Accès au Supabase Dashboard (owner/admin) ou `SUPABASE_ACCESS_TOKEN` avec droits de gestion (voir `.env.local`).
- Accès SSH / CLI sur l'environnement de staging.
- `pg_dump` et `pg_restore` ou `psql` installés localement ou sur la machine qui exécute les opérations.
- Pour les opérations API : `curl` disponible.

## Risque & précautions

- Ne lancez jamais une restauration PITR sur la base de production sans avoir validé la procédure en staging.
- Sauvegardez les dumps/logs actuels avant toute opération destructive.
- Les commandes ci‑dessous incluent des appels qui peuvent déclencher des restaurations ; vérifiez toujours les paramètres et les timestamps.

### 1) Vérifier l'état des backups et PITR (lecture seule)

Les vérifications suivantes consultent l'API de gestion Supabase. Elles sont en lecture seule.

Remplacez les variables :

```bash
export SUPABASE_ACCESS_TOKEN="sbp_..."          # token de gestion (sécurisé)
export PROJECT_REF="yvtrlvmbofklefxcxrzv"      # ref du projet
```

Lister les informations backups :

```bash
curl -sS -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/backups" | jq .
```

Interprétation rapide du JSON retourné :

- `pitr_enabled`: false → PITR désactivé
- `walg_enabled`: true → WAL-G (sauvegarde physique) activé
- `backups`: liste des sauvegardes logiques disponibles

Remarque : l'endpoint `/backups/scheduled` n'est pas garanti disponible selon l'offre.

### 2) Créer une sauvegarde logique (dump) manuelle

Si PITR est désactivé, prenez immédiatement un dump logique pour pouvoir restaurer si besoin.

Utilisez `pg_dump` en vous basant sur l'URL de connexion (dans `.env.local` : `TEST_DB_URL` ou votre `SUPABASE_DB_URL`). Exemple :

```bash
export DATABASE_URL="postgresql://postgres:password@db.yvtrlvmbofklefxcxrzv.supabase.co:5432/postgres"
pg_dump --format=custom --file=backup_$(date -u +%Y%m%dT%H%M%SZ).dump "$DATABASE_URL"
```

Conseil : stockez le fichier `.dump` dans un emplacement chiffré / bucket privé.

### 3) Activer PITR (Dashboard recommandé)

L'activation PITR dépend souvent du plan et doit être réalisée depuis le Dashboard Supabase :

1. Ouvrez https://app.supabase.com/project/$PROJECT_REF/database/backups
2. Recherchez la section "Point in time" ou "Continuous backups" et activez PITR
3. Choisissez la fenêtre de rétention (ex : 7j, 30j, 90j) selon la politique de l'organisation

Si vous préférez l'API, contactez le support Supabase ou consultez la doc interne à votre compte : certaines opérations d'activation PITR peuvent nécessiter des rôles/aperçus non exposés publiquement.

### 4) Validation post-activation

Après activation, vérifiez à nouveau :

```bash
curl -sS -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/backups" | jq .
```

Vous devez voir `pitr_enabled: true` et des métadonnées sur la fenêtre de rétention.

### 5) Test de restauration (dry-run) — procédure sûre

Ne restaurez jamais en production. Créez un projet staging (ou utilisez une base vide) et effectuez la restauration dessus.

a) Option A : restauration via dump (pg_restore)

1. Créez une base staging (nouveau projet Supabase ou instance Postgres).
2. Transférez le fichier `.dump` vers la machine pouvant accéder à la staging DB.
3. Restaurer :

```bash
export STAGING_DATABASE_URL="postgresql://postgres:staging_pwd@staging-host:5432/postgres"
pg_restore --verbose --clean --no-owner --dbname="$STAGING_DATABASE_URL" backup_YYYYMMDDTHHMMSSZ.dump
```

Vérifiez les tables et quelques requêtes clés :

```bash
psql "$STAGING_DATABASE_URL" -c "select count(*) from spectacles;"
psql "$STAGING_DATABASE_URL" -c "select now();"
```

### 6) Résultats du test dry-run (À compléter après exécution)

**Date du test**: _À renseigner_  
**Environnement**: `supabase start` (local development)  
**Dump testé**: _Nom du fichier backup_YYYYMMDD-HHMMSS.dump.gz_

**Procédure exécutée**:

```bash
# 1. Télécharger le dump depuis Storage
supabase storage download --bucket backups backup-YYYYMMDD-HHMMSS.dump.gz

# 2. Décompresser
gunzip backup-YYYYMMDD-HHMMSS.dump.gz

# 3. Démarrer environnement local
supabase start

# 4. Restaurer le dump
pg_restore --verbose --clean --no-owner \
  --dbname="postgresql://postgres:postgres@localhost:54322/postgres" \
  backup-YYYYMMDD-HHMMSS.dump

# 5. Valider les données critiques
psql "postgresql://postgres:postgres@localhost:54322/postgres" << SQL
select 'spectacles', count(*) from public.spectacles;
select 'membres_equipe', count(*) from public.membres_equipe;
select 'medias', count(*) from public.medias;
select 'communiques_presse', count(*) from public.communiques_presse;
select 'home_hero_slides', count(*) from public.home_hero_slides;
SQL
```

**Résultats attendus**:

| Table | Count local | Count restauré | ✅/❌ |
| ------- | ------------- | ---------------- | ------- |
| spectacles | _X_ | _Y_ | À tester |
| membres_equipe | _X_ | _Y_ | À tester |
| medias | _X_ | _Y_ | À tester |
| communiques_presse | _X_ | _Y_ | À tester |
| home_hero_slides | _X_ | _Y_ | À tester |

**Problèmes rencontrés**: _À documenter_

**Notes**:

- Les counts doivent correspondre au snapshot du dump
- Vérifier que les RLS policies sont correctement restaurées
- Valider que les triggers/functions sont fonctionnels

b) Option B : restauration PITR via API (si supporté par le projet)

L'API peut accepter une requête restore-pitr. Exemple (ne pas lancer en production sans vérification) :

```bash
curl -X POST -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/backups/restore-pitr" \
  -d '{"recovery_time_target_unix": 1700000000, "target_project_ref":"<staging_ref>"}'
```

Remplacez `recovery_time_target_unix` par le timestamp Unix ciblé et `target_project_ref` par la ref du projet staging à restaurer.

### 6) Vérifications post-restore

- Vérifier intégrité : counts, checksums métier, index existants.
- Vérifier que les RLS / policies sont présentes et cohérentes.
- Lancer un smoke test applicatif (UI / quelques endpoints API).

### 7) Plan de rollback & nettoyage

- Si la restauration corrompt la staging, supprimez et recréez la staging avant de retenter.
- Conserver les dumps originaux et les logs d'opération.

### 8) Checklist finale pour mise en production

- [ ] PITR activé et fenêtre de rétention validée
- [ ] Dump manuel initial pris et stocké hors-site
- [ ] Test de restauration validé en staging
- [ ] Runbook et contacts (Supabase support) documentés
- [ ] Automatiser export périodique supplémentaire si besoin

### 9) GitHub Actions - Backup automatisé (TASK050)

**Workflow**: `.github/workflows/backup-database.yml`

**Schedule**: Dimanche 3h00 UTC (hebdomadaire)

**Fonctionnement**:

1. Exécute `pg_dump --format=custom` avec compression gzip
2. Upload vers bucket Supabase Storage `backups`
3. Rotation automatique : garde les 4 derniers dumps (4 semaines)
4. Notification email automatique en cas d'échec

**Secrets GitHub requis**:

| Secret | Description | Exemple |
| -------- | ------------- | --------- |
| `SUPABASE_DB_URL` | PostgreSQL connection string | `postgresql://postgres:[pwd]@db.xxx.supabase.co:5432/postgres` |
| `SUPABASE_SECRET_KEY` | Service role key | `eyJhbGc...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Publishable key | `eyJhbGc...` |

**Exécution manuelle**:

```bash
# Local (requires pg_dump v16+)
pnpm exec tsx scripts/backup-database.ts

# Via GitHub UI
# Actions → Weekly Database Backup → Run workflow
```

**Monitoring**:

- Vérifier exécution : [Actions tab](https://github.com/yandevpro/rougecardinalcompany/actions)
- Email automatique si échec (admins GitHub)
- Durée typique : 5-10 minutes

**Récupération d'un backup**:

```bash
# 1. Lister les backups disponibles
supabase storage list backups

# 2. Télécharger un dump spécifique
supabase storage download backups/backup-YYYYMMDD-HHMMSS.dump.gz

# 3. Décompresser et restaurer (voir section 5a ci-dessus)
gunzip backup-YYYYMMDD-HHMMSS.dump.gz
pg_restore --clean --no-owner --dbname="$STAGING_URL" backup-YYYYMMDD-HHMMSS.dump
```

### Notes complémentaires

- `supabase db dump` (CLI) peut être utile pour exports ponctuels mais ne remplace pas PITR.
- Les APIs de gestion Supabase évoluent : préférez le Dashboard pour l'activation initiale, et utilisez l'API pour automatiser l'inventaire et les vérifications.

Fichier créé par l'équipe infra — conservez ce runbook dans `memory-bank/tasks/` et liez-le au ticket TASK050.
