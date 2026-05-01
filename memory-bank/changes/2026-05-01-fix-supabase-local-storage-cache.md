# Changelog — 1er mai 2026

## fix(supabase): résolution du démarrage local Supabase bloqué par cache `.temp/` obsolète

### Contexte

`pnpm dlx supabase start` échouait : le conteneur `supabase_storage_rougecardinalcompany` redémarrait en boucle avec l'erreur :

```
{"error":"Migration fix-optimized-search-function not found","level":"fatal"}
WARN Local config differs from linked project. Try updating supabase/config.toml
storage_image_version = "v1.31.1" => "v1.54.0"
```

### Symptômes

- Storage container : `Restarting (1)` permanent
- Erreur fatale au démarrage : migration `fix-optimized-search-function` introuvable
- Warning sur version storage `v1.31.1` au lieu de `v1.54.0`
- Aucun fichier `supabase/config.toml` n'existe dans le projet

### Diagnostic

Le CLI Supabase 2.98.0 lisait des **valeurs de version obsolètes** dans le cache local `supabase/.temp/`, hérité d'un précédent `supabase db pull` sur le projet cloud lié.

Sans `supabase/config.toml` pour épingler les versions des images Docker, le CLI s'appuie sur :

1. Les métadonnées du projet cloud lié (via `linked-project.json`)
2. Le cache `.temp/storage-version` et `.temp/storage-migration`

Ces fichiers cache forçaient l'image `storage-api:v1.31.1`, qui ne contient pas la migration `fix-optimized-search-function` exigée par les migrations plus récentes.

### Cause racine

Fichiers cache obsolètes dans `supabase/.temp/` :

- `storage-migration` (= "fix-optimized-search-function")
- `storage-version` (= "v1.31.1")
- `cli-latest`, `gotrue-version`, `postgres-version`, `rest-version`

### Solution appliquée

```bash
# 1. Arrêt complet (sans backup pour repartir propre)
pnpm dlx supabase stop --no-backup

# 2. Purge des fichiers cache de versions obsolètes
rm -f supabase/.temp/storage-migration \
      supabase/.temp/storage-version \
      supabase/.temp/cli-latest \
      supabase/.temp/gotrue-version \
      supabase/.temp/postgres-version \
      supabase/.temp/rest-version

# 3. Redémarrage : le CLI re-télécharge les versions correctes
pnpm dlx supabase start
```

**Fichiers conservés** dans `supabase/.temp/` : `linked-project.json`, `pooler-url`, `project-ref`.

### État final validé

- ✅ 12 conteneurs Docker `healthy` / `Up`
- ✅ `supabase/storage-api:v1.54.1` (migration appliquée)
- ✅ `supabase/postgres:17.6.1.106`
- ✅ `supabase/gotrue:v2.188.1`
- ✅ `postgrest/postgrest:v14.10`
- ✅ 200+ migrations appliquées sans erreur (de `2025-09-18` à `2026-05-02`)

**URLs services** :

| Service | URL |
| ------- | --- |
| Studio | <http://127.0.0.1:54323> |
| API | <http://127.0.0.1:54321> |
| DB | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Mailpit | <http://127.0.0.1:54324> |
| MCP | <http://127.0.0.1:54321/mcp> |
| S3 Storage | <http://127.0.0.1:54321/storage/v1/s3> |

### Recommandations préventives

1. **Créer `supabase/config.toml`** pour épingler explicitement les versions Docker et éviter toute dérive silencieuse via le cache `.temp/`. Utiliser `pnpm dlx supabase init` ou copier depuis un projet de référence.
2. **Ne jamais piper `supabase start`** dans `tail`, `head`, ou autre — l'output est bufferisé et masque les erreurs en temps réel.
3. **Après `supabase stop --no-backup`**, relancer `pnpm db:reset` ou `./scripts/post-reset.sh` si les données seed sont nécessaires (le flag `--no-backup` purge volumes Docker).
4. **Lors d'un mismatch version** entre cloud lié et local, préférer : (a) créer/mettre à jour `config.toml`, ou (b) purger sélectivement les fichiers cache `.temp/<service>-version` et `.temp/<service>-migration` plutôt que `rm -rf .temp/` (préserve `linked-project.json`).

### Leçons retenues

- Le dossier `supabase/.temp/` agit comme **source de vérité silencieuse** des versions d'images Docker quand `config.toml` est absent.
- Un `db pull` antérieur peut figer dans le cache des versions devenues incompatibles avec les migrations actuelles.
- Le warning `Local config differs from linked project` est un signal critique, pas un avertissement bénin.
