# [TASK021] - Documentation Docker (volumes, disk space, prune)

**Status:** Completed  
**Added:** 1er octobre 2025  
**Updated:** 1er octobre 2025  
**Completed:** 1er octobre 2025

## Original Request

Documenter comment voir la place occupée sur le disque par la base de données locale Supabase et gérer l'espace disque Docker.

## Thought Process

### Questions utilisateur

1. Comment voir la taille de la DB locale ?
2. Que fait `docker system prune -a` ?
3. Supprime-t-il les anciennes versions seulement ou aussi la dernière ?
4. Comment gérer l'espace disque Docker ?

### Documentation nécessaire

- Inspection des volumes Docker
- Commandes de mesure de taille
- Comportement du prune (avec warnings)
- Workflow complet de gestion

## Implementation Plan

1. Ajouter section inspection volumes dans CLI-Supabase-Local.md
2. Ajouter section gestion espace disque dans docker-install.md
3. Inclure warnings sur comportement de `prune -a`
4. Documenter les commandes avec exemples concrets

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Section inspection volumes (CLI-Supabase-Local.md) | Complete | 01-10-2025 | docker volume ls + du -sh |
| 1.2 | Section disk space (docker-install.md) | Complete | 01-10-2025 | df, prune, warnings |
| 1.3 | Ajouter warnings sur prune -a | Complete | 01-10-2025 | Clarification critique |
| 1.4 | Exemples concrets et commandes | Complete | 01-10-2025 | Testés et validés |

## Progress Log

### 1er octobre 2025

- Questions utilisateur sur Docker disk usage et prune behavior
- Recherche et validation des commandes Docker pour inspection volumes
- Ajout section complète dans `doc-perso/lancement-supabase-local/CLI-Supabase-Local.md` :
  - Inspection des volumes Docker (`docker volume ls --filter name=supabase`)
  - Mesure de taille avec `docker run --rm -v <volume>:/volume alpine du -sh /volume`
  - Requête SQL pour taille DB : `SELECT pg_size_pretty(pg_database_size('postgres'))`
  - Note sur protection des images par conteneurs en cours
- Ajout section "Nettoyage et gestion de l'espace disque Docker" dans `docker-install.md` :
  - Commande `docker system df` pour voir l'usage
  - Warning critique sur `docker system prune -a` : supprime TOUTES les images inutilisées
  - Nuance importante : "unused" = aucun conteneur ne l'utilise (pas seulement anciennes versions)
  - Alternatives : `docker image prune -a`, `docker volume prune`, `docker container prune`
  - Recommandation : `docker image ls` pour voir ce qui sera supprimé avant prune
- Documentation claire et complète avec exemples de sortie
- Validation des commandes testées

## Résultats

- ✅ Documentation complète de l'inspection des volumes Docker
- ✅ Commandes de mesure de taille (système et SQL)
- ✅ Warning critique sur `prune -a` bien mis en évidence
- ✅ Alternatives documentées pour gestion fine
- ✅ Exemples concrets avec sorties attendues

## Contenu documenté

### CLI-Supabase-Local.md

- Lister volumes Supabase : `docker volume ls --filter name=supabase`
- Mesurer taille volume : `docker run --rm -v supabase_db_rougecardinalcompany:/volume alpine du -sh /volume`
- Requête SQL taille DB : `SELECT pg_size_pretty(pg_database_size('postgres'))`
- Note : Supabase en cours protège les images du prune

### docker-install.md

- Voir usage disque : `docker system df`
- Prune complet : `docker system prune -a` avec ⚠️ WARNING
- Prune sélectif : `docker image prune -a`, `docker volume prune`
- Vérifier avant suppression : `docker image ls`
- Clarification : "unused" = pas utilisé par un conteneur actif

## Lessons Learned

- `docker system prune -a` est plus agressif que ce qu'on pense
- Important de clarifier "unused" vs "anciennes versions"
- Les utilisateurs ont besoin de commandes avec exemples concrets
- Les warnings doivent être visuellement distincts (⚠️)
- Documentation opérationnelle aussi importante que documentation technique
