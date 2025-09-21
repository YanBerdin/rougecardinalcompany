# Migrations Manuelles - Rouge Cardinal Company

Ce dossier contient les migrations spécifiques (DML/DDL ponctuelles) exécutées en complément du schéma déclaratif.

## Conventions de nommage

- Fichiers horodatés: `YYYYMMDDHHMMSS_description.sql`
- Pas de `seed.sql` générique à la racine: chaque seed est un fichier migration horodaté explicite
- Idempotence recommandée (MERGE/UPSERT ou clauses `where not exists (...)`)

## Migrations de données (DML) notables

- `20250921113000_seed_home_about_content.sql` — Seed Home > About (ligne par défaut `slug='default'`)
- `20250921110000_seed_compagnie_presentation_sections.sql` — Seed sections présentation Compagnie depuis la source typée côté code
- `20250918102240_seed_team_and_presentation.sql` — Seed membres d’équipe et sections présentation (initial)
- `20250918095610_seed_compagnie_values.sql` — Seed valeurs institutionnelles
- `20250918101020_seed_events_press_articles.sql` — Seed événements et articles de presse (exemples)
- `20250918031500_seed_home_hero_slides.sql` — Seed slides Hero de la Home

## Autres migrations manuelles

- `sync_existing_profiles.sql` — Synchronisation ponctuelle des profils existants avec `auth.users` (idempotent)

**Contexte :** Migration extraite du schéma déclaratif pour respecter les principes de Declarative Database Schema Management  
**Exécution :** Après application du schéma déclaratif principal  
**Idempotente :** ✅ Oui (peut être exécutée plusieurs fois sans effet de bord)

## Ordre d'exécution recommandé

### 1) Appliquer le schéma déclaratif

Assure-toi que Supabase Local est démarré:

```bash
pnpm dlx supabase stop
pnpm dlx supabase db diff -f apply_declarative_schema
# pnpm dlx supabase db diff -f apply_declarative_schema --debug
pnpm dlx supabase db push
```

### 2) Exécuter les migrations DML horodatées (si besoin de rejouer ponctuellement)

Exécuter une migration DML précise:

```bash
Supabase local
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable" \
   -f supabase/migrations/20250921113000_seed_home_about_content.sql
```

Pour rejouer l'ensemble (reset local):

```bash
# Réinitialiser la base locale (optionnel, utile pour tests) et rejoue les migrations
pnpm dlx supabase db reset --yes --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
```

## Notes importantes

- Les migrations de schéma (DDL) sont gérées via le schéma déclaratif (`supabase/schemas/*`) + `db diff`
- Les migrations de données (DML) sont versionnées ici et appliquées au besoin (idempotentes de préférence)
- Toujours tester en local avant d'appliquer en production
- **Les migrations de données (DML)** ne sont pas capturées par `supabase db diff` et doivent être gérées séparément

## Voir aussi

- `.github/copilot/Declarative_Database_Schema.Instructions.md` — Instructions pour le schéma déclaratif
- `supabase/schemas/` — Schéma déclaratif structuré en fichiers séparés
- `supabase/migrations/` — Migrations DML/DDL ponctuelles horodatées
