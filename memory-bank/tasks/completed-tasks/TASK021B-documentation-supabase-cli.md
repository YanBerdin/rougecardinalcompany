# \[TASK022] - Documentation Supabase CLI (workflow déclaratif)

**Status:** Completed  
**Added:** 1er octobre 2025  
**Updated:** 1er octobre 2025  
**Completed:** 1er octobre 2025

## Original Request

Compléter la documentation Supabase CLI avec workflow déclaratif détaillé, commande db reset, et explications des conteneurs.

## Thought Process

### Contexte

- Utilisateur utilise `pnpm dlx supabase` (pas d'install globale)
- Workflow déclaratif avec schéma dans `supabase/schemas/`
- Besoin de clarifier `db reset` et ses effets

### Documentation à améliorer

1. Commande `start --debug` : que fait-elle exactement ?
2. Commande `db reset` : comportement destructif à clarifier
3. Workflow complet : stop → diff → push → start
4. Pattern de nommage des migrations

## Implementation Plan

1. Enrichir CLI-Supabase-Local.md avec notes détaillées
2. Clarifier comportement db reset (--db-url, --yes, seed)
3. Documenter pattern YYYYMMDDHHMMSS pour migrations
4. Ajouter exemples de workflow complet

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Notes détaillées sur supabase start --debug | Complete | 01-10-2025 | Blockquote avec détails |
| 1.2 | Documentation db reset complète | Complete | 01-10-2025 | Effet, flags, seed |
| 1.3 | Workflow déclaratif step-by-step | Complete | 01-10-2025 | stop → diff → push |
| 1.4 | Pattern migrations et seed.sql | Complete | 01-10-2025 | Conventions claires |

## Progress Log

### 1er octobre 2025

- Analyse des besoins de documentation CLI
- Ajout blockquote NOTE détaillée pour `supabase start --debug` :
  - Exécution via pnpm dlx (sans install globale)
  - Démarrage stack Docker (Postgres, Auth, Storage, PostgREST, etc.)
  - Initialisation volumes/réseaux
  - Logs verbeux pour diagnostic
  - Important : N'applique PAS automatiquement les migrations
- Documentation complète de `db reset` :
  - Effet destructif : drop + recreate database
  - Rejeu de toutes les migrations horodatées (YYYYMMDDHHMMSS_name.sql)
  - Fichiers non horodatés (README) sont skippés
  - Exécution seed.sql à la fin (sauf --no-seed)
  - Flag --db-url pour cibler la DB locale
  - Flag sslmode=disable pour éviter soucis TLS local
- Workflow complet documenté avec commandes concrètes
- Exemples de vérification (ls migrations, requêtes SQL)
- Notes sur URLs et ports d'accès aux services

## Résultats

- ✅ Documentation CLI enrichie avec détails techniques
- ✅ Comportement db reset clairement expliqué
- ✅ Workflow déclaratif step-by-step documenté
- ✅ Pattern migrations et conventions établis
- ✅ Exemples concrets et testables

## Contenu documenté

### Commandes principales

```bash
# Démarrer avec debug
pnpm dlx supabase start --debug

# Workflow déclaratif
pnpm dlx supabase stop
pnpm dlx supabase db diff -f apply_declarative_schema
pnpm dlx supabase db push

# Reset complet
pnpm dlx supabase db reset --yes --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
```

### Clarifications importantes

- `start` : Lance Docker mais N'applique PAS les migrations automatiquement
- `db reset` : Réinitialisation DESTRUCTIVE avec rejeu migrations
- Pattern migrations : YYYYMMDDHHMMSS_name.sql (autres fichiers skippés)
- seed.sql : Exécuté à la fin si présent
- --db-url : Cibler DB locale sans `supabase link`

## Lessons Learned

- Documentation étape par étape plus utile que commandes isolées
- Clarifier ce qu'une commande NE fait PAS est aussi important
- Flags et paramètres doivent être expliqués (sslmode, db-url)
- Workflow complet > liste de commandes
- Exemples de vérification augmentent la confiance utilisateur
