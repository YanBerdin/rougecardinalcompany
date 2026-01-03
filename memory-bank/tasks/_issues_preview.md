# Preview des issues générées pour TASK021..TASK040

Ce fichier liste les titres et descriptions extraites des fichiers de tâches `TASK021` à `TASK040`.

> Généré automatiquement. Exécutez `scripts/create_issues.sh` localement pour créer les issues via la CLI `gh` (nécessite `gh` installé et authentifié).

## Liste des issues

1. TASK021 — Content management CRUD
   - Résumé: Implémenter les interfaces CRUD pour la gestion du contenu (articles, pages, shows).

2. TASK022 — Team management
   - Résumé: Interface admin pour gérer les membres de la compagnie et leurs rôles.

3. TASK023 — Partners management
   - Résumé: Gérer partenaires, logos, liens et pages de partenaires.

4. TASK024 — Press management
   - Résumé: Espace presse pour ajouter communiqués, dossiers de presse et contacts.

5. **TASK025 — RLS Security & Performance Fixes** ✅
   - **Résumé**: Résolution complète de 3 problèmes critiques RLS (Row Level Security) - articles vides, SECURITY DEFINER views, performance optimization. 4 migrations créées, ~40% gain performance, documentation exhaustive.
   - **Etat**: Completed (23 oct 2025)
   - **Issue**: [#5](https://github.com/YanBerdin/rougecardinalcompany/issues/5) (CLOSED)

5b. **TASK025B — Database Security Audit Campaign** ✅

- **Résumé**: Audit exhaustif de 73 objets database sur 17 rounds. Round 12 CRITIQUE: storage.objects ALL PRIVILEGES → explicit. CI gate créé avec allowlist REVOKE. Documentation complète SECURITY_AUDIT_SUMMARY.md.
- **Etat**: Completed (26 oct 2025)
- **Issue**: [#24](https://github.com/YanBerdin/rougecardinalcompany/issues/24) (CLOSED)

6. **TASK026B — Database Functions Compliance: SET search_path** ✅
   - **Résumé**: Application `SET search_path = ''` à toutes les fonctions database pour prévenir injection schéma. 28/28 fonctions conformes (100%). Hotfix appliqué via SQL Editor (Section 5.5).
   - **Etat**: Completed (15 nov 2025)
   - **Issue**: [#26](https://github.com/YanBerdin/rougecardinalcompany/issues/26) (CLOSED)

6b. **TASK027B — Security Definer Rationale Headers** ✅

- **Résumé**: Template et headers SECURITY DEFINER ajoutés aux fonctions. 6 fonctions documentées avec justifications explicites, risques évalués, validations. Security checklist créé.
- **Etat**: Completed (15 nov 2025)
- **Issue**: [#27](https://github.com/YanBerdin/rougecardinalcompany/issues/27) (CLOSED)

6c. **TASK028B — Cleanup Obsolete Scripts** ✅

- **Résumé**: Suppression de 3 scripts obsolètes Round 7 (déjà supprimés le 26 oct 2025). Documentation updated. Repository cleanup.
- **Etat**: Completed (15 nov 2025)
- **Issue**: [#28](https://github.com/YanBerdin/rougecardinalcompany/issues/28) (CLOSED)

7. TASK026 — Homepage content management
   - Résumé: Panneau pour éditer contenus d'accueil (hero, news, shows).

7. TASK027 — Company content management
   - Résumé: Page de la compagnie: équipe, histoire, textes légaux.

8. TASK028 — Content versioning UI
   - Résumé: Interface pour versionner et restaurer anciennes versions de contenu.

9. TASK029 — Media library ✅
    - Résumé: Gestion des médias (upload, tags, transformations, storage).
    - État: Completed (2025-12-29)
    - Issue: [#9](https://github.com/YanBerdin/rougecardinalcompany/issues/9) (OPEN) — fermer ou lier la PR.

10. **TASK030 — Display toggles** ✅
    - **Résumé**: Système complet de toggles d'affichage pour sections publiques. 10 toggles sur 5 catégories (home, agenda, contact, presse). Phase 11 : Split presse en 2 toggles indépendants (Media Kit + Communiqués). Migration idempotente, scripts utilitaires, documentation complète.
    - **État**: Completed (1er jan 2026)
    - **Issue**: [#10](https://github.com/YanBerdin/rougecardinalcompany/issues/10) (OPEN) — fermer ou lier la PR.

11. TASK031 — Access controls for content
    - Résumé: Rôles et permissions pour accès éditeur/admin.

12. **TASK032 — Admin User Invitation System** ✅
    - **Résumé**: Système complet d'invitation admin end-to-end avec emails, DAL, RLS policies, UI admin, client-side token processing (404 fix), CI tests. Production-ready avec rollback complet et conformité RGPD.
    - **Etat**: Completed (23 nov 2025)
    - **Issue**: [#12](https://github.com/YanBerdin/rougecardinalcompany/issues/12) (CLOSED)

13. TASK033 — Bulk import/export
    - Résumé: Import CSV / export JSON pour contenu et partenaires.

14. TASK034 — Editorial workflow
    - Résumé: Drafts, review, publish workflow pour articles.

15. TASK035 — UI localization
    - Résumé: Support langue FR/EN et gestion des traductions.

16. **TASK036 — Security Audit** ✅

- **Résumé**: Audit de sécurité OWASP Top 10 complet (35%→100%). 4 scripts d'audit créés (cookie flags, secrets, T3 Env validation), 3 documents générés (OWASP results, production checklist, executive summary), 6 security headers configurés, 85% production ready.
- **État**: Completed (3 jan 2026)
- **Issue**: #16 (PENDING)

17. TASK037 — Data retention & purge
    - Résumé: Politique de conservation des données et procédures de purge.

18. TASK038 — Performance optimisation
    - Résumé: Pagination, lazy-loading, caching pour gros volumes.

19. TASK039 — Tests & QA
    - Résumé: Tests unitaires, intégration, E2E pour back-office.

20. TASK040 — Documentation
    - Résumé: Documentation utilisateur et guide d'administration.
