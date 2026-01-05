# TASK053 - Data Retention Automation

**Status:** not started
**Priority:** P1 (Important)
**Added:** 2026-01-05

## Objectif

Automatiser les règles de rétention pour les données sensibles/volumineuses (newsletter unsubscribes, audit logs, contact messages) afin de rester conforme RGPD et alléger la base de données.

## Contexte

- Règles manuelles ou non appliquées actuellement (ex: newsletter retention mentionnée, mais non automatisée).
- Besoin d'une solution fiable (pg_cron, edge function ou scheduled job) et d'auditer les suppressions.

## Livrables

- Jobs automatisés pour purger/archiver selon la politique (90j pour unsubscribers, 1 an pour audit logs par défaut).
- Documentation et justification RGPD.
- Tests et rapport d'exécution.

## Checklist initiale

- [ ] Lister les tables concernées et champs de date
- [ ] Définir politiques par table (90j / 365j / configurable)
- [ ] Implémenter job (pg_cron / edge function) en staging
- [ ] Ajouter tests/alertes en cas d'échec

## Estimation

1-2 jours
