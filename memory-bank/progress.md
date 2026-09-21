# Progression du projet

**Dernière mise à jour :** 2026-09-21

Ce fichier synthétise l’état des tâches récentes. Les comptes rendus détaillés conservés avant compaction sont disponibles dans [l’archive complète](archive/progress/2026-08-20-before-compaction.md).

## En cours

### TASK200 — Migration Sharp / nft

- **Statut :** en cours.
- **Déjà validé :** Next.js et eslint-config-next 16.3.3, Sharp 0.35.4, baseline-browser-mapping 2.11.20, installation verrouillée, audit sans vulnérabilité connue, type-check, 159 tests unitaires et compilation Next.js. Les validations antérieures des manifests `.nft.json` et de la preview Vercel restent valides avec le workaround.
- **Reste à faire :** diagnostiquer le blocage local du hook Sentry `runAfterProductionCompile`, exécuter les E2E avec Supabase local, tester Sharp après cold start, valider upload/thumbnail/régénération, puis retirer isolément le workaround de tracing.
- **Détails :** [TASK200](tasks/TASK200-migration-correctif-upstream-sharp-nft.md)

### TASK107 — Sitemap production

- **Statut :** en cours.
- **Déjà validé :** `/sitemap.xml` répond `200 OK`, fournit un XML valide avec 9 URLs publiques, et `robots.txt` pointe vers l’URL canonique.
- **Reste à faire :** soumettre à nouveau le sitemap dans la propriété Search Console `https://compagnie-rouge-cardinal.fr/`, puis attendre le nouveau crawl.
- **Détails :** [TASK107](tasks/TASK107-sitemap-404.md)

## Planifiées

- **TASK108 :** durcir les en-têtes HTTP, ajouter leur validation automatisée et supprimer obligatoirement `'unsafe-inline'` dans une phase CSP stricte différée.
- **TASK105 :** créer le profil admin manquant en production.
- **TASK103 :** retirer le grant `authenticated` résiduel de `cleanup_expired_audit_logs()`.
- Les détails et critères sont centralisés dans [l’index des tâches](tasks/_index.md).

## Réalisations récentes

- **SEC-2026-09-21 / TASK200 :** quatre vulnérabilités corrigées, dont deux RCE critiques Next.js ; `pnpm audit` est propre après passage à Next.js 16.3.3 et Sharp 0.35.4.
- **TASK106 :** correction locale CodeQL XSS sur l’acceptation d’invitation ; validation URL, type-check et tests du validateur réussis.
- **TASK104 :** résolution du 500 Sharp/Vercel et correction des vulnérabilités Dependabot ; déploiement production validé.
- **TASK101 :** réorganisation drag-and-drop des articles de presse, migrations et tests validés.
- **TASK100 :** coordonnées dynamiques sur la page Contact, alimentées par la configuration publique.

## Blocages et actions manuelles

- Le hook Sentry `runAfterProductionCompile` est resté bloqué après une compilation Next.js réussie ; le build local a été interrompu avant sa terminaison complète.
- Les E2E de la remédiation du 2026-09-21 nécessitent le démarrage de Supabase local.
- Search Console doit rafraîchir son état après la nouvelle soumission du sitemap.
- Le test de protection contre les mots de passe compromis reste dépendant de l’activation de l’option Supabase Pro.
- Le secret CI `INVARIANT_DB_URL` doit être configuré pour le workflow de vérification des rôles.
- Les avertissements Browserslist sont connus et non bloquants ; le lint peut rester affecté par la fixture E2E indépendante documentée dans l’archive.

## Références

- [Contexte actif](activeContext.md)
- [Index des tâches](tasks/_index.md)
- [Archive complète de l’ancien progress.md](archive/progress/2026-08-20-before-compaction.md)
- [Index des archives](archive/progress/README.md)

## Règle de maintenance

Garder ici les tâches en cours, les derniers résultats utiles et les blocages actionnables. Déplacer les détails d’implémentation dans les fichiers de tâches ou les rapports `doc/`. Archiver les anciennes synthèses lors d’une prochaine compaction.
