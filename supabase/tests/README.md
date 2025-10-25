# Tests: reorder_team_members et vues admin

Fichier de test principal : `20251025_test_reorder_and_views.sql`

Date d'exécution (observée) : 2025-10-25

But : valider les points suivants depuis une connexion administrateur (service_role/postgres) :

- Vérifier l'accès lecture via la vue `public.membres_equipe_admin` (SECURITY INVOKER) pour les rôles `anon` et `authenticated`.
- Vérifier que l'appel RPC `public.reorder_team_members(jsonb)` accepte/rejette les rôles attendus (EXECUTE grants correctement restreints).

Résultat observé (dans Supabase SQL Editor) :

- Message global retourné : "Success. No rows returned." (le script est prévu pour émettre des `RAISE NOTICE` détaillant chaque étape et résultat).

Notes importantes :

- Le script `20251025_test_reorder_and_views.sql` utilise des blocs PL/pgSQL `DO $$ ... $$` et `RAISE NOTICE` pour être compatible avec :
  - l'éditeur SQL du dashboard Supabase
  - l'exécution en tant que migration (via `supabase db push`)

- Initialement le script utilisait des méta-commandes `\echo` (psql-only). Elles ont été remplacées par `RAISE NOTICE` pour éviter des erreurs de syntaxe lorsque le script est exécuté hors de psql.

- Une tentative d'exécution locale via `psql` depuis cet environnement de développement a échoué avec `Network is unreachable` à cause d'une résolution DNS vers une adresse IPv6 sans connectivité IPv6 locale. Si vous rencontrez ce problème localement, deux options :
  1. Exécuter le script directement depuis le Supabase SQL Editor (recommandé pour tests ad-hoc).
  2. Exécuter localement en forçant une connexion IPv4 vers l'instance (nécessite l'adresse IPv4 du serveur). Exemple (remplacer `<ipv4>` et `<conn>` par vos valeurs) :

```bash
# Exemple avec PGHOST/PGPORT/PGUSER/PASSWORD ou une connexion PostgreSQL complète
export PGHOST=<ipv4>
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD="<your-password>"
psql "postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/postgres" -f supabase/tests/20251025_test_reorder_and_views.sql
```

- Si vous ne disposez pas d'une adresse IPv4 publique pour la base Supabase Cloud, utilisez l'éditeur SQL du dashboard ou déployez une instance de test Postgres (local Docker / Supabase Local) et adaptez les IDs test dans le script.

Rappel : le script est idempotent et non destructive par défaut (il effectue des appels RPC de test avec des IDs d'exemple). Pour des tests de bout en bout, remplacez les IDs d'exemple dans le script par des IDs réels présents dans `public.membres_equipe`.

---

Fichier source du test : `supabase/tests/20251025_test_reorder_and_views.sql`

Pour toute question ou pour que je crée un job CI qui exécute ce script automatiquement, dites-le et je préparerai un GitHub Action minimal.
