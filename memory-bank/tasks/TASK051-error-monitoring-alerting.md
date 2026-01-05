# TASK051 - Error Monitoring & Alerting

**Status:** not started
**Priority:** P0 (Critical)
**Added:** 2026-01-05

## Objectif

Intégrer un système de monitoring des erreurs (Sentry ou équivalent), configurer les alertes (Slack/email), et instrumenter les applications pour remonter le contexte (user, route, action).

## Contexte

- Absence actuelle d'un système centralisé d'alerting. Logs dispersés et usage ponctuel de console.log.
- Objectif : détecter rapidement les incidents en production, réduire le MTTR.

## Livrables

- Intégration Sentry (DSN + release tagging) pour backend et front.
- Configuration des alertes (Slack/email) et playbook d'escalade.
- Ajout de contextes utiles (user id, route, action id) aux événements d'erreur.
- Tests d'alerte (simulate error path).

## Checklist initiale

- [ ] Créer projet Sentry / obtenir DSN
- [ ] Instrumenter Server Actions et API routes
- [ ] Ajouter sourcemaps pour front-end (build config)
- [ ] Configurer notifications Slack/email
- [ ] Documenter runbook d'incident

## Estimation

2-3 jours
