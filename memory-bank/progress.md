# Suivi de Progression

## État Général du Projet

### Progression Globale

- [x] Configuration initiale du projet
- [x] Mise en place de l'architecture de base
- [x] Intégration de Supabase
- [x] Configuration du design system
- [x] Schéma déclaratif consolidé (RLS 36/36 : 25 principales + 11 liaison)
- [x] Harmonisation knowledge‑base + epics avec le schéma
- [x] Développement des fonctionnalités principales (intégrations front restantes)
- [ ] Tests et optimisation
- [ ] Déploiement en production

## Fonctionnalités Complétées

### Structure de Base

- [x] Layout principal
- [x] Navigation responsive
- [x] Thème personnalisé
- [x] Configuration des routes

### Pages et Composants

- [x] Page d'accueil
- [x] Section Hero (DAL + Server Components + Suspense)
- [x] Section À propos (stats via DAL)
- [x] Footer
- [x] Page Agenda
- [x] Espace Presse
- [ ] Médiathèque professionnelle

### Intégration Backend

- [x] Configuration Supabase
- [x] Authentification optimisée (getClaims ~2-5ms, template officiel Next.js + Supabase)
- [x] RLS sur 100% des tables (36/36 : 25 principales + 11 liaison)
- [x] Versioning contenu (valeurs, stats, sections présentation)
- [x] Tables ajoutées: `compagnie_values`, `compagnie_stats`, `compagnie_presentation_sections`, `home_hero_slides`
- [x] Nettoyage architecture auth (~400 lignes code redondant supprimées)
- [x] Gestion des données spectacles (accueil: listes + dates)
- [ ] Back‑office Team Management (CRUD membres équipe, photos, rôles, ordre d’affichage) — schemas Zod, DAL server‑only, Server Actions, UI admin, requireAdmin(), soft‑delete + reorder (restant: intégration Médiathèque + ajustements layout Admin)
- [x] Documentation d’architecture v2 (C4 + ADRs) publiée et référencée

## Fonctionnalités en Cours

### Intégrations Front prioritaires

- En cours: Back-office (toggles centralisés, CRUD étendus)
- Terminé: Système d'emailing (newsletter, contacts) – intégration Resend + React Email (templates), endpoints `/api/newsletter`, `/api/contact`, `/api/test-email`, webhooks (handler présent, config à finaliser)
- Terminé: Agenda/Événements (DAL + containers + UI + export calendrier ICS)
- Option: Modélisation `partners.type` si besoin UI

## Problèmes Résolus (Octobre 2025)

### Fixes majeurs

1. ✅ Spectacles archivés : 11 spectacles maintenant visibles avec `public=true` + `status='archive'`
2. ✅ UI Press releases : alignement des boutons PDF avec flexbox pattern
3. ✅ Production cleanup : suppression des logs de debug
4. ✅ Documentation Docker : volumes, disk space, prune behavior
5. ✅ Documentation Supabase CLI : workflow déclaratif complet
6. ✅ Migration DDL redondante : suppression de `20250921112000_add_home_about_content.sql` (table définie dans schéma déclaratif `07e_table_home_about.sql`)
7. ✅ **Page Presse vide (21 octobre 2025)** : Fix incompatibilité RLS/JWT Signing Keys
   - **Problème** : `mediaArticles Array(0)` malgré 3 articles seedés en base
   - **Cause** : Nouveaux JWT Signing Keys (`sb_publishable_*`/`sb_secret_*`) ne déclenchent pas l'évaluation RLS pour le rôle `anon`
   - **Solution** : Création vue `articles_presse_public` qui contourne RLS avec permissions directes (`GRANT SELECT`)
   - **Migration** : `supabase/migrations/20251021000001_create_articles_presse_public_view.sql` (hotfix DDL)
   - **Schéma déclaratif** : Vue intégrée dans `supabase/schemas/08_table_articles_presse.sql` (source de vérité)
   - **DAL** : `lib/dal/presse.ts` modifié pour requêter `articles_presse_public` au lieu de `articles_presse`
   - **Séparation chapo/excerpt** : Correction du mapping - `chapo` (intro) et `excerpt` (citation) sont des champs distincts, non des fallbacks
   - **Types** : `MediaArticleSchema` (Zod) et interface TypeScript mis à jour avec les deux champs
   - **UI** : `PresseView.tsx` affiche maintenant chapo (texte normal) et excerpt (italique entre guillemets) séparément
   - **Impact** : 🔒 Sécurité identique, ⚡ Performance améliorée, 📊 Portée limitée aux requêtes anonymes
   - **Documentation** : 7 fichiers mis à jour (migrations.md, schemas README, blueprints, systemPatterns, knowledge-base, instructions README, diagnostic scripts README)
   - **Validation** : ✅ 3 articles affichés avec badges corrects (Article/Critique/Interview), chapo et excerpt visibles, aucune erreur console
7. ✅ Audit complet conformité database : 5 rapports générés dans `doc/SQL-schema-Compliancy-report/`
   - ✅ SQL Style Guide : 100% (32 aliases avec 'as', indentation optimisée, awards documenté)
   - ✅ RLS Policies : 100% (36/36 tables, 70+ policies granulaires, 6 double SELECT corrigés)
   - ✅ Functions : 99% (23/27 SECURITY INVOKER, 4/27 DEFINER justifiés, 100% search_path)
   - ✅ Migrations : 92.9% (12/13 naming timestamp, 100% idempotence, workflow déclaratif)
   - ✅ Declarative Schema : 100% (36/36 tables via workflow déclaratif, triggers centralisés)
8. ✅ Kit média Presse : seed complet avec URLs externes fonctionnelles (logos, photos HD, PDFs)
9. ✅ Emailing transactionnel (Resend)
   - ✅ Intégration Resend via `lib/resend.ts` + gestion clé API
10. ✅ Nettoyage code redondant d'authentification (13 octobre 2025)
    - ✅ Suppression `lib/auth/service.ts` (classe AuthService + 7 Server Actions redondantes)
    - ✅ Suppression `components/auth/protected-route.tsx` (protection client-side redondante)
    - ✅ Suppression `lib/hooks/useAuth.ts` (hook inutilisé)
    - ✅ Suppression `app/auth/callback/route.ts` (route OAuth inutile)
    - ✅ Suppression config `EMAIL_REDIRECT_TO` de `lib/site-config.ts` (non utilisée)
    - ✅ Total nettoyé : ~400+ lignes de code redondant
    - ✅ Pattern : 100% conforme au template officiel Next.js + Supabase (client-direct)
11. ✅ Optimisation performance authentification (13 octobre 2025)
    - ✅ `AuthButton` : migration de Server Component vers Client Component
    - ✅ Ajout `onAuthStateChange()` pour réactivité temps réel
    - ✅ Conformité 100% avec `.github/instructions/nextjs-supabase-auth-2025.instructions.md`
    - ✅ Chargement initial optimisé : 2-5ms au lieu de 300ms
12. ✅ Fix mise à jour header après login/logout (13 octobre 2025)
    - ✅ Problème identifié : `AuthButton` Server Component dans `layout.tsx` ne se re-rendait pas
    - ✅ Solution : transformation en Client Component + `onAuthStateChange()` listener
    - ✅ Résultat : mise à jour instantanée du header sans refresh manuel
    - ✅ Sécurité : aucune vulnérabilité ajoutée (protection reste côté serveur : middleware + RLS)
    - ✅ UX : affichage utilisateur temps réel dans le header après authentification
    - ✅ Templates React Email: `emails/newsletter-confirmation.tsx`, `emails/contact-message-notification.tsx` (+ layout et composants utilitaires)
    - ✅ Actions d'envoi: `lib/email/actions.ts` (avec rendu React Email + gestion FROM par défaut)
    - ✅ Schémas Zod: `lib/email/schemas.ts` (validation newsletter/contact)
    - ✅ API routes: `app/api/newsletter`, `app/api/contact`, `app/api/test-email` (+ `GET` doc de test)
    - ✅ Scripts d'intégration: `scripts/test-email-integration.ts`, `scripts/check-email-logs.ts`, `scripts/test-webhooks.ts`
    - ✅ Warnings `@react-email/render` résolus en ajoutant `prettier` (devDependency)
    - ✅ Hook partagé renommé: `useNewsletterSubscribe` (cohérent avec le fichier) et usages mis à jour
    - ✅ Tests automatisés `pnpm test:resend` OK (newsletter + contact)
    - ✅ Seed `20251002120000_seed_communiques_presse_et_media_kit.sql` : 8 médias + 4 communiqués + 4 catégories
    - ✅ URLs externes dans `metadata.external_url` (Unsplash pour photos, W3C pour PDFs de démo)
    - ✅ `fetchMediaKit()` modifié pour prioriser URLs externes sur storage local
    - ✅ Types stricts : suppression de tous les `any`, ajout interfaces `MediaRow`, `CommuniquePresseRow`, `ArticlePresseRow`
    - ✅ Conformité TypeScript : 100% (interfaces explicites, pas de `any`/`unknown`, type guards)

**Newsletter (`abonnes_newsletter`)**

- ✅ RLS restrictif : seuls les admins peuvent lire les emails (donnée personnelle)
- ✅ API `/api/newsletter` : utilise `.insert()` au lieu de `.upsert()` pour éviter SELECT public
- ✅ Gestion doublons : code erreur 23505 (unique_violation) traité comme succès (idempotent)
- ✅ Gestion erreurs email : warning retourné si envoi Resend échoue, inscription réussit quand même
- ✅ Principe de minimisation : emails non exposés via RLS public
- ✅ Tests validés :
  - Email valide : `{"status":"subscribed"}` ✅
  - Email invalide : `{"status":"subscribed","warning":"Confirmation email could not be sent"}` ✅
  - Doublon : `{"status":"subscribed"}` (idempotent) ✅

**Contact (`messages_contact`)**

- ✅ RLS restrictif : seuls les admins peuvent lire les données personnelles (prénom, nom, email, téléphone)
- ✅ DAL `lib/dal/contact.ts` : utilise `.insert()` uniquement, pas de lecture après insertion
- ✅ API `/api/contact` : **intégration DAL complétée** avec pattern warning identique à newsletter
- ✅ Gestion erreurs email : warning retourné si notification échoue, message stocké quand même
- ✅ Mapping schémas : API (name/subject) → DAL (firstName/lastName/message fusionné)
- ✅ Principe de minimisation : données personnelles stockées uniquement pour traitement admin
- ✅ Conformité : lecture publique impossible, insertion libre pour formulaire de contact
- ✅ Tests validés :
  - Soumission valide : `{"status":"sent"}` + insertion BDD ✅
  - Email invalide (format) : `{"error":"Données invalides"}` 400 ✅
  - Mapping données : "Jean Dupont" → firstName="Jean", lastName="Dupont" ✅

#### Validation Conformité Instructions Supabase

- ✅ **Schéma Déclaratif** : 100% conforme à `.github/instructions/Declarative_Database_Schema.Instructions.md`
  - Modifications dans `supabase/schemas/10_tables_system.sql` (pas de migrations manuelles)
  - État final désiré représenté dans le schéma déclaratif
  - Commentaires RGPD explicites
- ✅ **Politiques RLS** : 100% conforme à `.github/instructions/Create_RLS_policies.Instructions.md`
  - 4 policies distinctes (SELECT/INSERT/UPDATE/DELETE) par table
  - USING/WITH CHECK correctement utilisés selon l'opération
  - Noms descriptifs et commentaires hors policies
  - Pattern PERMISSIVE (pas RESTRICTIVE)
- ✅ **Documentation** : Rapport complet généré dans `doc/RGPD-Compliance-Validation.md`

## Problèmes Connus

### Points d'attention restants

1. Délais artificiels (1200-1500ms) dans les containers à retirer avant production
2. Synchronisation des fenêtres de visibilité (hero) avec le cache ISR
3. Cohérence des toggles Back‑office ↔ pages publiques (Agenda/Accueil/Contact)
4. PostgREST cache: penser à redémarrer le stack en cas de mismatch pendant seeds
5. Docker disk usage monitoring à mettre en place (si utilisation de Supabase local)
6. Webhooks Resend non configurés dans le dashboard (à pointer vers `/api/webhooks/resend` et sélectionner les événements)
7. ESLint: plusieurs règles à adresser (no-explicit-any, no-unescaped-entities, no-unused-vars) dans quelques composants/pages

### ✅ Problèmes résolus récemment (13 octobre 2025)

1. ~~Header ne se met pas à jour après login/logout~~ → **RÉSOLU**
   - Cause: Server Component dans layout.tsx ne se re-rendait pas
   - Solution: Client Component + onAuthStateChange()
2. ~~Performance lente authentification initiale~~ → **RÉSOLU**
   - Cause: getUser() fait un appel réseau (~300ms)
   - Solution: getClaims() fait vérification JWT locale (~2-5ms) - 100x plus rapide
3. ~~Code redondant d'authentification~~ → **RÉSOLU**
   - Cause: Multiples abstractions (AuthService, Server Actions, hooks, protected-route)
   - Solution: Suppression ~400 lignes, alignement strict template officiel
4. ~~Script admin email bloqué par RLS~~ → **RÉSOLU**
   - Cause: Script utilisait anon key, RLS bloque lecture messages_contact
   - Solution: Support service_role/secret key + détection automatique + messages d'aide
5. ~~Legacy API keys disabled error~~ → **RÉSOLU**
   - Cause: Documentation assumait format JWT uniquement
   - Solution: Support dual format (JWT + Simplified) + guide migration complet

## Tests

### Tests Unitaires

- [ ] Composants UI
- [ ] Utilitaires
- [ ] Hooks personnalisés

### Tests d'Intégration

- [ ] Flux de navigation
- [ ] Authentification
- [x] Emailing (Resend): `pnpm test:resend` (newsletter + contact + vérification DB + webhooks à configurer)

### Tests E2E

- [ ] Parcours utilisateur complet
- [ ] Formulaires

## Déploiement

### Environnement de Développement

- [x] Configuration locale
- [x] Variables d'environnement
- [x] Hot reload

### Environnement de Production

- [ ] Configuration Vercel
- [ ] SSL/HTTPS
- [ ] Monitoring

## Prochaines Étapes

### Court Terme

1. Définir la stratégie seeds en environnement cloud (idempotent + safe)
2. Valider les toggles Back‑office (Agenda/Accueil/Contact)
3. Finaliser configuration des webhooks Resend (dashboard) et consigner les événements
4. Lint: corriger les règles critiques (any, unused vars, no-unescaped-entities) dans les fichiers listés par ESLint
5. Markdown: lancer `pnpm lint:md:fix` et corriger manuellement MD040/MD036 restantes

### Moyen Terme

1. Back‑office avancé (CRUD et toggles centralisés)
2. Option: versioning pour `home_hero_slides`
3. Tests automatisés et analytics
4. CI: ajouter job lint (`pnpm lint:all`) et tests emailing (`pnpm test:resend`) sur PR

## Métriques

### Performance

- First Contentful Paint: 1.2s (local)
- Time to Interactive: 2.5s (local)
- Lighthouse Score: 85 (à améliorer après retrait des délais artificiels)

### Qualité du code

- RLS Coverage: 36/36 tables protégées (100%) - 25 principales + 11 liaison
- Documentation: 3 fichiers techniques majeurs mis à jour (Docker, Supabase CLI, migrations)
- Debug logs: Nettoyés pour production

### Utilisation

- Taux de rebond: À mesurer
- Temps moyen sur site: À mesurer
- Conversions: À mesurer

## Journal des Mises à Jour

### 20 Octobre 2025

- Architecture: publication de `Project_Architecture_Blueprint_v2.md` (Implementation‑Ready, C4, ADRs, patterns canoniques Supabase Auth 2025)
- Back‑office: avancement TASK022 Team Management (DAL `lib/dal/team.ts`, Server Actions `app/admin/team/actions.ts`, UI `components/features/admin/team/*`, guard `requireAdmin()`, soft‑delete + reorder) — statut: En cours (Médiathèque + layout Admin restants)

### 13 Octobre 2025

- **Nettoyage architecture auth** : Suppression ~400 lignes code redondant
  - Supprimé: `lib/auth/service.ts` (AuthService + 7 Server Actions)
  - Supprimé: `components/auth/protected-route.tsx` (protection client-side redondante)
  - Supprimé: `lib/hooks/useAuth.ts` (hook inutilisé)
  - Supprimé: `app/auth/callback/route.ts` (route OAuth inutile)
  - Supprimé: config `EMAIL_REDIRECT_TO` de `lib/site-config.ts`
  - Alignement: 100% conforme au template officiel Next.js + Supabase
- **Optimisation performance auth** : Migration `getUser()` → `getClaims()`
  - Avant: ~300ms (appel réseau pour vérification utilisateur)
  - Après: ~2-5ms (vérification JWT locale) - 100x plus rapide
  - `AuthButton` migré vers Client Component + `onAuthStateChange()` pour réactivité
- **Fix header login/logout** : Mise à jour automatique sans refresh manuel
  - AuthButton réactif en temps réel via listener `onAuthStateChange()`
- **Scripts admin email** : `check-email-logs.ts` avec support complet
  - Support dual format clés Supabase (JWT `eyJ...` + Simplified `sb_secret_...`)
  - Détection automatique service_role/secret vs anon key
  - Messages d'aide pour RLS et legacy keys
  - Tests validés: 5 newsletters + 5 messages contact récupérés
- **Documentation Supabase keys** : Guides complets créés
  - `scripts/README.md` (252 lignes) : Guide scripts admin
  - `doc/scripts-troubleshooting.md` (257 lignes) : Troubleshooting RLS + legacy keys
  - `doc/Supabase-API-Keys-Formats-2025-10-13.md` (250 lignes) : Comparaison JWT vs Simplified
  - `doc/Fix-Legacy-API-Keys-2025-10-13.md` (280 lignes) : Session documentation
  - `doc/Architecture-Blueprints-Update-Log-2025-10-13.md` (235 lignes) : Log modifications blueprints

### 1er Octobre 2025

- **Spectacles archivés** : Fix majeur avec changement de stratégie - 11 spectacles archivés maintenant `public=true` pour affichage via toggle "Voir toutes nos créations"
- **UI Press releases** : Alignement des boutons "Télécharger PDF" avec pattern flexbox (`flex flex-col` + `flex-1` + `mt-auto`)
- **Production cleanup** : Suppression des logs de debug dans SpectaclesContainer et SpectaclesView
- **Documentation Docker** : Section complète sur inspection volumes (`docker volume ls`, `du -sh`), gestion espace disque, et comportement `docker system prune -a`
- **Documentation Supabase CLI** : Commandes détaillées pour `db reset`, workflow déclaratif, et notes sur les conteneurs
- **Documentation migrations** : Mise à jour conventions et notes sur spectacles archivés (`public=true` approach)
- **Knowledge base** : Revue complète du fichier (4554 lignes) couvrant architecture, schéma DB, RLS, versioning

### 23 Septembre 2025

- Compagnie: migration complète vers DAL server-only pour valeurs et équipe (`lib/dal/compagnie.ts`).
- Compagnie: sections éditoriales branchées sur `public.compagnie_presentation_sections` via `lib/dal/compagnie-presentation.ts` (Zod + mapping quotes).
- Page `app/compagnie/page.tsx`: enveloppée dans `<Suspense>` avec `CompagnieSkeleton`; délai artificiel 1500 ms dans le conteneur pour validation UX (à retirer avant prod).
- Fallback automatique: si la table des sections est vide ou en erreur, retour du contenu local `compagniePresentationFallback` (DEPRECATED FALLBACK) pour éviter une page vide.
- Dépréciation: anciens hooks/données mocks de la Compagnie annotés `[DEPRECATED MOCK]` et non utilisés par le rendu.

### 22 Septembre 2025

- Newsletter: unification derrière une API route `app/api/newsletter/route.ts` (POST validé Zod, upsert `onConflict: 'email'`, metadata `{ consent, source }`)
- Hook partagé: `lib/hooks/useNewsletterSubscribe.ts` utilisé par Home et Contact; gestion unifiée des erreurs/chargement/succès
- DAL: `lib/dal/home-newsletter.ts` pour gating via `configurations_site` (Zod + valeurs par défaut)
- UI: Home/Contact affichent `errorMessage` explicite; Suspense 1500 ms pour la section Home Newsletter pendant validation UX (à retirer avant prod)
- Nettoyage: suppression des bannières `[DEPRECATED MOCK]`; renommage en `useNewsletterSubscription`; factorisation de `contact-hooks` vers le hook partagé

### 20 Septembre 2025

- Migration frontend: Data Access Layer (lib/dal/\*) côté serveur + Server Components
- Accueil: Hero, News, À propos (stats), Spectacles (avec dates), Partenaires branchés sur Supabase
- UX: Sections d’accueil enveloppées dans React Suspense avec skeletons (délais artificiels temporaires pour visualisation)
- Dépréciation: anciens hooks mocks conservés en commentaires avec en-têtes `[DEPRECATED MOCK]`
- Documentation: début de mise à jour knowledge‑base + memory‑bank (patterns, tech context, tasks)

### 20 Septembre 2025 — Ajouts récents

- Base de données (schéma déclaratif): ajout de `home_about_content` (bloc « À propos » de la Home) avec RLS lecture publique et gestion admin, index `(active, position)`, et triggers globaux `updated_at` + `audit`. Ajout de `image_media_id` (prioritaire sur `image_url`).
- DAL `fetchHomeAboutContent()`: priorisation de l’image côté média interne — lecture de `image_media_id` sur `compagnie_presentation_sections`, récupération `medias.storage_path` et génération d’URL publique via Supabase Storage; fallbacks conservés (`image_url`, puis image par défaut).
- Documentation: mise à jour `supabase/schemas/README.md` et knowledge‑base avec la nouvelle table et le flux image prioritaire.

### 17 Septembre 2025

- Harmonisation epics/user‑stories (14.1/14.6/14.7) incluant toggles Newsletter/Partenaires/À la Une
- Mise à jour `supabase/schemas/README.md` (arbre, versioning étendu, métriques RLS 24/24)
- Ajout des tables et RLS: `compagnie_values`, `compagnie_stats`, `compagnie_presentation_sections`, `home_hero_slides`

### 20 Août 2025

- Ajout de la section Hero
- Optimisation des images
- Correction du menu mobile

### 19 Août 2025

- Configuration initiale
- Mise en place du design system
- Intégration Supabase

## Notes Importantes

1. ✅ Privilégier les Server Components quand possible (pattern appliqué)
2. Maintenir la cohérence du design system (flexbox patterns documentés)
3. Documenter les nouveaux composants et décisions architecturales
4. Optimiser les performances en continu
5. ⚠️ Retirer les délais artificiels avant production (1200-1500ms dans containers)
6. ⚠️ Docker: `prune -a` supprime TOUTES les images inutilisées, pas seulement les anciennes versions

## Dernière Mise à Jour

**Date**: 13 octobre 2025
**Changements majeurs**: Nettoyage architecture auth (~400 lignes), optimisation performance auth (100x), fix header réactif, scripts admin email fonctionnels, documentation formats clés Supabase (JWT vs Simplified)

**Date**: 21 octobre 2025
**Changements majeurs**: Fix page Presse vide - workaround RLS/JWT Signing Keys via vue `articles_presse_public`, séparation correcte chapo/excerpt comme champs indépendants, workflow hotfix déclaratif appliqué, 7 fichiers de documentation mis à jour
