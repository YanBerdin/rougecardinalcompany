# TASK050 - Database Backup & Recovery Strategy

**Status:** not started
**Priority:** P0 (Critical)
**Added:** 2026-01-05

## Objectif

Mettre en place une stratégie de sauvegarde et de restauration (PITR) pour la base de données Supabase, documenter et tester les procédures de restauration (dry-run), et définir les politiques de rétention.

## Contexte

- L'historique des migrations contient des opérations potentiellement destructives (`drop cascade`).
- Aucune procédure de backup/restore formalisée n'est documentée.
- Nécessaire avant tout déploiement en production.

## Livrables

- Configuration PITR (supabase cloud) et politique de rétention (30j / 1 an).
- Runbook de restauration (étapes pas-à-pas) et checklist de test.
- Test de restauration (dry-run) documenté et validé.
- Script / instructions pour export de DB (pg_dump / supabase CLI).

## Checklist initiale

- [ ] Vérifier état actuel PITR sur projet Supabase
- [ ] Documenter procédure de backup et restore
- [ ] Exécuter un test de restauration en environnement staging
- [ ] Automatiser exports périodiques si nécessaire
- [ ] Ajouter runbook dans `memory-bank/` et référencer dans README

## Estimation

2-3 jours (analyse + tests dry-run)
