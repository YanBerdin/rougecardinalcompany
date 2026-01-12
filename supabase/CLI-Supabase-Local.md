# Supabase Local avec CLI Supabase

Voici les étapes typiques pour utiliser Supabase Local avec la CLI Supabase:

## 1. **Démarrer Supabase Local**

```bash
# Initialise et démarre les services Supabase dans des conteneurs Docker.
pnpm dlx supabase start --debug

Started supabase local development setup.
```

Voici l’essentiel de ce que fait `pnpm dlx supabase start --debug`:

> [!NOTE]
> Commande: exécute la CLI Supabase via `pnpm dlx` (sans install globale) et démarre l’environnement local.
>
> Démarre: lance la stack Supabase locale avec Docker (Postgres, Auth, Storage, PostgREST, Realtime, API Gateway/Kong, Studio, Mail catcher, etc.).
>
> Initialisation: prépare les volumes/réseaux Docker et les services de base; imprime les URLs/ports d’accès.
>
> Logs `--debug`: sortie verbeuse pour le diagnostic (étapes Docker, variables/ports résolus, commandes sous-jacentes, IDs de conteneurs).
>
> **Important: n’applique PAS automatiquement les migrations projet.**
> Utilise ensuite:
>
> `pnpm dlx supabase db push` (appliquer migrations) ou `pnpm dlx supabase db reset --force` (réinitialiser + rejouer)
>
> Arrêt propre: `pnpm dlx supabase stop`
>
> Voir aussi: [Documentation officielle Supabase CLI](https://supabase.com/docs/guides/cli)

### 2. Appliquer le Schéma Déclaratif

```bash
# Arrêter l'environnement local
pnpm dlx supabase stop

# Générer les migrations depuis le schéma déclaratif (fichier précis avec `psql -f`)
pnpm dlx supabase db diff -f apply_declarative_schema

# Vérifier la migration générée dans supabase/migrations/
ls -la supabase/migrations/

# Appliquer les migrations
pnpm dlx supabase db push

# Réinitialiser la base locale (optionnel, utile pour tests) et rejouer les migrations
pnpm dlx supabase db reset --yes --db-url "postgresql://postgres:postgres@127.0.0.1:5XXXX/postgres?sslmode=disable"
```

> [!NOTE]
> **Commande `db reset`**: effectue une réinitialisation destructive de la base pointée par --db-url (postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable).
>
> **Effet principal**: supprime et recrée la DB, réinitialise le schéma, puis applique toutes les migrations de migrations dans l’ordre horodaté.
>
> **Fichiers appliqués**: seuls les fichiers respectant le pattern YYYYMMDDHHMMSS_name.sql sont exécutés; les autres (ex. README) sont “skippés”.
>
> **Seed**: si seed.sql existe, il est exécuté à la fin (sauf --no-seed). Lors de votre premier reset, il n’existait pas encore, donc rien n’a été seedé.
>
> **Conteneurs**: redémarre les services locaux (DB/API/Studio) pour repartir proprement.
>
> **Pourquoi --db-url**: permet de cibler explicitement la DB locale sans supabase link. Le paramètre sslmode=disable évite les soucis TLS en local

## 3. **Appliquer les Migrations**

Après avoir démarré Supabase, appliquer les migrations de schéma déclaratif:

```bash
   pnpm dlx supabase db diff -f apply_declarative_schema --debug
   pnpm dlx supabase db push
```

=> synchronise la base de données locale avec le schéma défini dans `supabase/schemas/`.

## 4. **Vérifier les Services**

Vérifier que tous les services sont opérationnels en consultant les URLs fournies dans la sortie de la commande `start`, par exemple:

- API URL: `http://127.0.0.1:XXXXX`
- GraphQL URL: `http://127.0.0.1:XXXXX/graphql/v1`
- S3 Storage URL: `http://127.0.0.1:XXXXX/storage/v1/s3`
- DB URL: `postgresql://postgres:postgres@127.0.0.1:XXXXX/postgres`
- Studio URL: `http://127.0.0.1:XXXXX`
- Inbucket URL: `http://127.0.0.1:XXXXX`
- JWT secret, anon key, service_role key, S3 Access Key, S3 Secret Key (pour tests)

## 5. **Arrêter Supabase Local**

```bash
   pnpm dlx supabase stop 
```

=> arrête proprement tous les conteneurs et services Supabase.

## Notes Additionnelles

- Les données sont persistées dans le dossier `./supabase/.local/share/supabase/` (volumes Docker).
- Les commandes `pnpm dlx supabase ...` permettent d’utiliser la CLI Supabase sans l’installer globalement.
- La CLI Supabase utilise Docker pour exécuter les services localement.
- Les données locales sont persistées dans le dossier `./supabase/.local/share/supabase/` (volumes Docker).
- Vérifier que Docker est en cours d’exécution avant de démarrer Supabase Local.
- La CLI Supabase utilise Docker pour exécuter les services localement.
- Les commandes `pnpm dlx supabase ...` permettent d’utiliser la CLI Supabase sans l’installer globalement.
- Si modification le schéma, réexécuter les commandes de migration (`db diff` + `db push`).
- Pour réinitialiser complètement la base de données locale, utiliser `pnpm dlx supabase db reset --force`.

Consulter la documentation officielle pour des options avancées et le dépannage:

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Supabase GitHub Repository](https://github.com/supabase/cli)

Si modification du schéma, réexécuter les commandes de migration (`db diff` + `db push`).

Pour réinitialiser complètement la base de données locale, utiliser `pnpm dlx supabase db reset --force`.
Consulter la documentation officielle pour des options avancées et le dépannage:

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Supabase GitHub Repository](https://github.com/supabase/cli)
- [Supabase Community](https://supabase.com/community)

## Migrations Manuelles

Certaines migrations de données (DML) doivent être exécutées manuellement après avoir appliqué le schéma déclaratif. Voir `supabase/migrations/README-migrations.md` pour les détails.

## Contexte Actif

```bash
   pnpm dlx supabase status
```

Cela affiche l’état actuel de ta base de données locale, y compris les migrations appliquées et en attente.

## Vérifications Post-Migration

```bash
# Vérifier les politiques RLS
pnpm dlx supabase db diff -f check_rls

# Vérifier les performances
pnpm dlx supabase db diff -f check_performance

# Test complet du schéma
pnpm dlx supabase db diff -f check_schema
```

## Utilisation avec Next.js

Si développement en local, vérifier que `.env` pointe vers l’instance locale de Supabase.

Si .env pointe vers l’URL cloud Supabase (`NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co`), toutes les requêtes frontend/serveur iront vers la base distante, pas la base locale Docker.

Pour utiliser la base locale, il faut :

1. Modifier .env pour pointer vers l’URL locale :

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:XXXXX
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<clé locale>
```

(Remplace `<clé locale>` par la valeur `anon key` affichée lors du démarrage de Supabase Local.)

(La clé locale est affichée au démarrage de Supabase dans le terminal.)

1. Redémarrer le serveur Next.js pour prendre en compte la nouvelle config.

2. Vérifier que Supabase local est bien démarré (`pnpm dlx supabase start`).

## Dépannage

- Vérifier que Docker est en cours d’exécution.
- Vérifier que les ports nécessaires (54321, 54322, 54323, 54324) ne sont pas bloqués ou utilisés par d’autres applications.
- Si modification du schéma, réexécuter les commandes de migration (`db diff` + `db push`).
- Pour réinitialiser complètement la base de données locale, utiliser `pnpm dlx supabase db reset --force`.
- Si problèmes, vérifier les logs Docker avec `docker ps` et `docker logs <container_id>`.

---
