# Contexte actif

**Dernière mise à jour :** 2026-09-21

Ce fichier est un tableau de bord opérationnel. L’historique détaillé est conservé dans [l’archive complète](archive/active-context/2026-08-20-before-compaction.md).

## Priorités actuelles

### TASK200 — Sharp / nft

- **Statut :** en cours.
- **Objectif :** valider en production Next.js 16.3.3 et Sharp 0.35.4 après la remédiation de quatre vulnérabilités de dépendances.
- **Déjà validé :** audit sans vulnérabilité connue, type-check, 159 tests unitaires et compilation Next.js.
- **Prochaine action :** diagnostiquer le hook Sentry post-compilation, puis tester Sharp après cold start Vercel et valider les parcours upload, thumbnail et régénération.
- **Référence :** [TASK200](./tasks/TASK200-migration-correctif-upstream-sharp-nft.md)

### TASK107 — Sitemap

- **Statut :** en cours.
- **Objectif :** finaliser le sitemap du site public.
- **Prochaine action :** vérifier la configuration Search Console et confirmer l’indexation après déploiement.
- **Référence :** [TASK107](./tasks/TASK107-sitemap-404.md)

## Actions planifiées

- **TASK108 :** établir la baseline HTTP puis durcir la CSP statique ; la suppression de `'unsafe-inline'` par nonce ou alternative stricte reste une tâche obligatoire différée. Voir [TASK108](./tasks/TASK108-securityHeadersHardening.md).
- **TASK105 :** reprendre selon les critères indiqués dans [l’index des tâches](tasks/_index.md).
- **TASK103 :** reprendre selon les critères indiqués dans [l’index des tâches](tasks/_index.md).

## Décisions récentes à retenir

- Les lectures de données passent par les Server Components et le DAL.
- Les mutations internes passent par des Server Actions validées et autorisées, avec revalidation côté action.
- Les accès Supabase utilisent le pattern SSR `getAll()` / `setAll()` et `getClaims()` pour les contrôles rapides.
- Le schéma déclaratif dans `supabase/schemas/` reste la source de vérité pour les changements de base de données.
- Les archives de contexte sont conservées séparément afin de garder ce fichier court et utile au démarrage d’une session.

## Références rapides

- [Progression du projet](progress.md)
- [Index des tâches](tasks/_index.md)
- [Patterns système](systemPatterns.md)
- [Contexte technique](techContext.md)
- [Brief projet](projectbrief.md)
- [Archive complète de l’ancien contexte](archive/active-context/2026-08-20-before-compaction.md)
- [Index des archives](archive/active-context/README.md)

## Règle de maintenance

Ajouter ici uniquement les tâches actives, les décisions encore applicables et les prochaines actions immédiates. Déplacer les comptes rendus détaillés dans les fichiers de tâches, `progress.md` ou l’archive mensuelle.
