# Secrets GitHub recommandés pour le workflow `reorder-sql-tests`

Placez ces secrets dans Settings → Secrets and variables → Actions du dépôt.

IMPORTANT : ne commitez jamais de vraies clés/valeurs dans le dépôt. N'utilisez que des secrets GitHub.

Liste des secrets et format attendu

- TEST_DB_URL
  - Description : URL de connexion PostgreSQL utilisée pour exécuter les tests SQL.
  - Format exemple : postgresql://<user>:<password>@<host>:<port>/<database>
  - Usage : si fourni, le workflow exécutera `psql "$TEST_DB_URL" -f supabase/tests/20251025_test_reorder_and_views.sql`.

- SUPABASE_TOKEN
  - Description : token personnel ou token CI pour la CLI Supabase (utilisé pour `supabase db push --linked`).
  - Format exemple : supabase token (string opaque)
  - Où l'obtenir : Supabase Dashboard → Settings → Service API / Personal access tokens.

- SUPABASE_PROJECT_REF
  - Description : identifiant du projet Supabase (project ref) — requis pour `supabase link`.
  - Format exemple : yvtrlvmbofklefxcxrzv
  - Où l'obtenir : URL du projet Supabase ou Settings → Project ref.

- GITHUB_TOKEN
  - Description : token GitHub fait automatiquement disponible dans les workflows par défaut (ne pas remplacer sauf si besoin d'un token personnalisé).

Remarques opérationnelles

- Ordre recommandé pour la configuration des secrets :
  1. `SUPABASE_TOKEN` et `SUPABASE_PROJECT_REF` (si vous voulez que le workflow pousse le schéma/migrations vers un projet de test).
  2. `TEST_DB_URL` (si vous préférez exécuter les tests directement contre l'URL de la base de test/preview).

- Sécurité :
  - Utiliser un projet Supabase de test/preview pour CI — ne poussez jamais de migrations vers la base de production depuis un workflow CI sans revue humaine.
  - Restreindre l'accès aux secrets aux mainteneurs autorisés.

- Exemple (à copier dans la page Secrets) :

  - Name: TEST_DB_URL
    Value: postgresql://postgres:supersecret@db-preview.example.com:5432/postgres

  - Name: SUPABASE_TOKEN
    Value: sxp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

  - Name: SUPABASE_PROJECT_REF
    Value: yvtrlvmbofklefxcxrzv

FAQ rapide

- Q: Puis-je mettre le `service_role` key dans `TEST_DB_URL` ?
  - R: Oui si vous avez besoin d'accéder à des opérations admin dans les tests (ex : `supabase db push`), mais manipulez cette valeur avec précaution.
option 3
- Q: Où générer `SUPABASE_TOKEN` ?
  - R: Dashboard Supabase → Settings → Service API / Personal access tokens → Create token.
