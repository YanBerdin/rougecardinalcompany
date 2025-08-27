# Schéma Déclaratif Rouge Cardinal Company

Ce dossier contient le schéma déclaratif de la base de données selon les instructions **Declarative Database Schema Management** de Supabase.

## ✅ Structure Correcte

### Principe

- **UN fichier .sql par entité** (table, fonction, policy, etc.)
- **Ordre lexicographique** pour gérer les dépendances
- **État final désiré** (pas de migrations)
- **Génération automatique** des migrations via `supabase db diff`

### Organisation des fichiers

```bash
supabase/schemas/
├── 01_extensions.sql              # Extensions PostgreSQL
├── 02_table_profiles.sql          # Table des profils utilisateurs
├── 03_table_medias.sql            # Table des médias
├── 04_table_membres_equipe.sql    # Table membres équipe  
├── 05_table_lieux.sql             # Table des lieux
├── 06_table_spectacles.sql        # Table des spectacles
├── 07_table_evenements.sql        # Table des événements
├── 08_table_articles_presse.sql   # Table articles presse
├── 09_tables_system.sql           # Tables système (config, logs, etc.)
├── 10_tables_relations.sql        # Tables de liaison many-to-many
├── 20_functions_core.sql          # Fonctions utilitaires de base
├── 21_functions_auth_sync.sql     # Fonctions sync auth.users
├── 30_triggers.sql                # Déclencheurs
├── 40_indexes.sql                 # Index et optimisations
├── 50_constraints.sql             # Contraintes et validations
├── 60_rls_profiles.sql            # Politiques RLS pour profils
├── 61_rls_main_tables.sql         # Politiques RLS tables principales
└── README.md                      # Cette documentation
```

## 🚀 Utilisation

### 1. Appliquer le schéma déclaratif

```bash
# Arrêter l'environnement local
supabase stop

# Générer les migrations depuis le schéma déclaratif
supabase db diff -f apply_declarative_schema

# Vérifier la migration générée dans supabase/migrations/

# Appliquer les migrations
supabase db push
```

### 2. Migrations de données séparées

Les opérations DML (INSERT/UPDATE/DELETE) ne sont **pas** dans le schéma déclaratif.
Voir `supabase/migrations/` pour les migrations de données.

## 📋 Bonnes Pratiques

### ✅ À FAIRE

- Modifier les fichiers dans `supabase/schemas/`
- Respecter l'ordre lexicographique (01_, 02_, etc.)
- Représenter l'état final désiré
- Utiliser `supabase db diff` pour générer les migrations

### ❌ À ÉVITER

- Créer/modifier directement dans `supabase/migrations/`
- Inclure des opérations DML dans le schéma déclaratif
- Créer un seul gros fichier monolithique

## 🔄 Modifications

Pour ajouter/modifier une entité :

1. **Éditer** le fichier `.sql` correspondant dans `schemas/`
2. **Générer** la migration : `supabase db diff -f nom_migration`
3. **Vérifier** la migration générée
4. **Appliquer** : `supabase db push`

## 📚 Références

- `.github/copilot/Declarative_Database_Schema.Instructions.md` - Instructions officielles
- [Documentation Supabase](https://supabase.com/docs/guides/cli/local-development) - CLI et développement local
