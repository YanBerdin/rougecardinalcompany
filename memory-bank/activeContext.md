# Contexte actif

**Dernière mise à jour :** 2026-10-28

Ce fichier est un tableau de bord opérationnel. L’historique détaillé est conservé dans [l’archive complète](archive/active-context/2026-08-20-before-compaction.md).

## Priorités actuelles

### TASK110 — Jetons de session dans les logs

- **Statut :** correctif de code fait, actions manuelles en attente.
- **Objectif :** stopper la fuite de l'en-tête `cookie` (access + refresh tokens) dans les logs du middleware et empêcher sa réapparition.
- **Prochaine action :** changer le mot de passe admin, supprimer ses sessions (`auth.sessions`), vérifier log drains Vercel, 2FA et breadcrumbs Sentry.
- **Référence :** [TASK110](./tasks/TASK110-sessionTokensLeakInLogs.md)

### TASK200 — Sharp / nft

- **Statut :** en cours.
- **Objectif :** valider en production Next.js 16.4.3, Sharp 0.35.5 et `@sentry/nextjs` 10.76.2 après la remédiation du 2026-10-25 (44 avis, dont 4 critiques).
- **Déjà validé :** audit sans vulnérabilité connue, type-check, 159 tests unitaires et build Next.js 16.4.3 (traces `.nft.json` avec `libvips-cpp.so.8.18.7` et `sharp-linux-x64-0.35.5.node`).
- **Prochaine action :** diagnostiquer le hook Sentry post-compilation, puis tester Sharp après cold start Vercel et valider les parcours upload, thumbnail et régénération.
- **Référence :** [TASK200](./tasks/TASK200-migration-correctif-upstream-sharp-nft.md)

### TASK107 — Sitemap

- **Statut :** en cours.
- **Objectif :** finaliser le sitemap du site public.
- **Prochaine action :** vérifier la configuration Search Console et confirmer l’indexation après déploiement.
- **Référence :** [TASK107](./tasks/TASK107-sitemap-404.md)

## Actions planifiées

- **TASK109 :** garde-fou du dernier admin (Phase 1) ; fenêtre de révocation JWT acceptée pour un admin unique. Voir [TASK109](./tasks/TASK109-roleRevocationLatency.md).
- **TASK108 :** établir la baseline HTTP puis durcir la CSP statique ; la suppression de `'unsafe-inline'` par nonce ou alternative stricte reste une tâche obligatoire différée. Voir [TASK108](./tasks/TASK108-securityHeadersHardening.md).
- **TASK105 :** reprendre selon les critères indiqués dans [l’index des tâches](tasks/_index.md).
- **TASK103 :** reprendre selon les critères indiqués dans [l’index des tâches](tasks/_index.md).

## Décisions récentes à retenir

- Les lectures de données passent par les Server Components et le DAL.
- Les mutations internes passent par des Server Actions validées et autorisées, avec revalidation côté action.
- Les accès Supabase utilisent le pattern SSR `getAll()` / `setAll()` et `getClaims()` pour les contrôles rapides.
- Le schéma déclaratif dans `supabase/schemas/` reste la source de vérité pour les changements de base de données.
- Les archives de contexte sont conservées séparément afin de garder ce fichier court et utile au démarrage d’une session.
- Un événement « à venir ou en cours » se filtre par `date_fin >= now` (ou `date_debut >= now` si `date_fin` est null), pas par `date_debut` seul ; helper `upcomingOrOngoingFilter()` dans `lib/dal/spectacles.ts`.
- Aucun `as any` : corriger le type source (ex. type de retour du DAL aligné sur le schéma Zod) ; si un générique est effacé par un contexte React, utiliser `as unknown as X` avec un commentaire d'une ligne.
- Zod ≥ 4.6 : ne jamais appeler `.partial()` / `.pick()` / `.omit()` sur un schéma contenant `.refine()` (exception runtime) ; garder un `z.object` de base et réappliquer les refines (modèle : `HeroSlideUpdateSchema`). Toute clé `z.unknown()` / `z.any()` pouvant manquer doit être `.optional()`. Après une montée de Zod, relancer les E2E admin de mise à jour avant de merger.
- Ne jamais journaliser l'en-tête `cookie` / `authorization`, un JWT, un refresh token ou des claims complets, quel que soit le niveau `console.*`. `no-console` est bloquant sur `proxy.ts`, `supabase/*.ts` et `lib/auth/**` ; Sentry nettoie en-têtes et breadcrumbs via `lib/sentry/scrub-sensitive.ts`.
- Le rôle `user` n'a aucun accès au backoffice (pas de rôle « lecture seule »). JWT signés en ES256 : `getClaims()` vérifie localement.

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
