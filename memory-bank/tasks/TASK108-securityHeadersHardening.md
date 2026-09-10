# TASK108 - Durcissement des en-têtes HTTP et migration CSP stricte

**Statut:** Planifiée

**Ajoutée:** 2026-09-09

**Mise à jour:** 2026-09-09

## Demande originale

Prévoir les corrections issues de l’audit des en-têtes HTTP, notamment le
durcissement immédiat de la Content Security Policy, la validation des réponses
sensibles et la suppression obligatoire, mais différée, de `'unsafe-inline'`
au moyen d’une CSP stricte par nonce ou d’une alternative validée.

## Contexte et constats

La configuration globale dans `next.config.ts` fournit déjà une base solide :
HSTS pendant deux ans avec `includeSubDomains` et `preload`, protection contre
le clickjacking, blocage du MIME sniffing, politique de référent et restriction
de la caméra, du microphone et de la géolocalisation.

L’audit a toutefois relevé les écarts suivants :

1. `script-src` autorise `'unsafe-inline'` et `'unsafe-eval'` dans tous les
   environnements ; Next.js n’a besoin de `'unsafe-eval'` qu’en développement ;
2. les directives `object-src`, `base-uri` et `form-action` sont absentes ;
3. `img-src 'self' data: https:` autorise toutes les origines HTTPS ;
4. Next.js peut encore exposer `X-Powered-By` ;
5. `Permissions-Policy` ne couvre qu’un ensemble minimal de capacités ;
6. les en-têtes de cache des réponses authentifiées n’ont pas encore été
   contrôlés sur une build de production ;
7. aucun test automatisé ne protège actuellement la configuration des en-têtes.

La suppression de `'unsafe-inline'` est obligatoire, mais elle ne doit pas être
confondue avec le correctif rapide. Une CSP par nonce impose un rendu dynamique
aux pages concernées sous Next.js 16 et peut supprimer les bénéfices du rendu
statique, de l’ISR, de PPR et du cache CDN classique. Cette évolution nécessite
donc une mesure préalable et une validation dédiée.

## Plan d’implémentation

### Phase 1 - Baseline et durcissement sans rupture

- Ajouter un test d’intégration des en-têtes sur une build de production.
- Contrôler au minimum une page publique, une page d’authentification, une route
  admin et une route API.
- Conserver `'unsafe-eval'` uniquement en développement et le retirer de la CSP
  de production.
- Conserver temporairement `'unsafe-inline'` pour éviter de casser le bootstrap
  Next.js avant la migration stricte.
- Ajouter `object-src 'none'`, `base-uri 'self'` et `form-action 'self'`.
- Ajouter `upgrade-insecure-requests` uniquement hors développement afin de ne
  pas convertir les ressources HTTP de Supabase local vers HTTPS.
- Conserver `frame-ancestors 'none'`, cohérent avec `X-Frame-Options: DENY`.
- Remplacer `img-src 'self' data: https:` par une allowlist cohérente avec les
  sources réellement utilisées et `images.remotePatterns`.
- Inclure `https://www.transparenttextures.com` tant que la texture distante
  utilisée par la section partenaires n’est pas remplacée par un asset local.
- Autoriser `blob:` uniquement si les aperçus locaux en dépendent réellement.
- Ajouter `poweredByHeader: false`.
- Étendre prudemment `Permissions-Policy` aux capacités manifestement inutiles,
  notamment paiement, USB, capteurs et XR.
- Ne pas ajouter COEP ou CORP globalement sans besoin métier et sans validation
  des médias publics cross-origin.

### Phase 2 - Validation fonctionnelle et cache sensible

- Exécuter le type-check, le lint, la build et le test d’intégration des
  en-têtes.
- Vérifier dans Chromium l’absence de violations CSP inattendues sur les pages
  publiques, d’authentification et d’administration.
- Vérifier les graphiques Recharts, les images Supabase et CDN, la texture des
  partenaires, l’authentification et l’envoi Sentry via `/monitoring`.
- Tester Vercel Live sur un déploiement Preview.
- Mesurer les en-têtes de cache des réponses admin et auth.
- Ajouter `Cache-Control: private, no-store` uniquement aux réponses sensibles
  qui ne disposent pas déjà d’une politique privée adaptée.

### Phase 3 - CSP stricte, tâche obligatoire différée

- Mesurer la part des routes statiques, ISR et dynamiques ainsi que l’impact
  attendu sur le temps de réponse, le cache CDN et le coût Vercel.
- Si le coût est accepté, générer un nonce cryptographiquement aléatoire par
  requête dans `proxy.ts`.
- Transmettre le nonce avec `x-nonce`, appliquer la CSP à la réponse produite
  par `updateSession` et conserver les cookies Supabase sur toutes les branches.
- Utiliser `'strict-dynamic'` et ne conserver `'unsafe-eval'` qu’en
  développement.
- Adapter le `<style>` dynamique de `ChartStyle` afin qu’il reçoive le nonce.
- Vérifier les intégrations Sentry, Vercel Live, Supabase et les ressources
  tierces avec la CSP stricte.
- Si le coût du nonce est refusé, évaluer SRI dans une branche dédiée et mettre
  en œuvre une alternative stricte validée.
- Ne pas clôturer TASK108 tant que `'unsafe-inline'` reste durablement dans la
  CSP de production sans mécanisme strict de remplacement accepté.

## Fichiers concernés

- `next.config.ts` - politique globale, sources CSP, `poweredByHeader`, Sentry
  et Vercel Live.
- `proxy.ts` - génération future du nonce et composition avec le middleware
  Supabase.
- `supabase/middleware.ts` - création et remplacement de `NextResponse`,
  cookies, redirections et réponses 403.
- `components/ui/chart.tsx` - `<style>` inline dynamique de `ChartStyle`.
- `components/features/public-site/home/partners/PartnersView.tsx` - texture
  distante à autoriser explicitement ou à remplacer localement.
- `package.json` - commande de vérification des en-têtes si un script dédié est
  ajouté.
- `__tests__/` ou `e2e/` - tests automatisés selon le niveau retenu.

## Critères d’acceptation

- [ ] `'unsafe-eval'` est absent de la CSP de production et reste disponible en
      développement si Next.js en dépend.
- [ ] `object-src 'none'`, `base-uri 'self'` et `form-action 'self'` sont
      présents.
- [ ] `upgrade-insecure-requests` est présent hors développement et absent en
      développement local.
- [ ] `img-src` ne contient plus le schéma générique `https:` et autorise toutes
      les sources réellement nécessaires.
- [ ] `X-Powered-By` n’est plus exposé.
- [ ] `Permissions-Policy` refuse les capacités navigateur inutilisées sans
      casser une fonctionnalité existante.
- [ ] Les réponses sensibles admin et auth utilisent une politique de cache
      privée appropriée lorsqu’elle est nécessaire.
- [ ] Les tests automatisés couvrent les en-têtes d’une page publique, d’une
      page auth, d’une route admin et d’une route API.
- [ ] Les pages testées ne déclenchent aucune violation CSP inattendue.
- [ ] Les graphiques, images, authentification, Sentry et Vercel Live restent
      fonctionnels.
- [ ] La CSP finale est contrôlée avec CSP Evaluator.
- [ ] La suppression de `'unsafe-inline'` est réalisée avec un nonce ou une
      alternative stricte validée ; elle ne reste pas une dette sans échéance.

## Risques et décisions

- Une CSP par nonce rend dynamiques les pages concernées sous Next.js 16 et est
  incompatible avec PPR et le cache CDN statique classique.
- Le `<style>` dynamique de `ChartStyle` doit être adapté avant de retirer
  `'unsafe-inline'` de `style-src`.
- `upgrade-insecure-requests` ne doit pas être actif en développement, car
  Supabase local expose son stockage en HTTP sur le port 54321.
- COEP n’est pas requis sans `SharedArrayBuffer` et pourrait bloquer des
  ressources cross-origin.
- CORP ne doit pas être appliqué globalement aux médias publics Supabase.
- COOP reste un durcissement optionnel ; `same-origin-allow-popups` est la
  valeur candidate compatible avec les flux externes et Vercel Live.
- Les sujets webhook Resend, routes de debug, autorisation métier et rate
  limiting restent hors périmètre de cette tâche.

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Ajouter la baseline automatisée des en-têtes | Not Started | 2026-09-09 | Build de production et quatre surfaces HTTP |
| 1.2 | Durcir la CSP statique sans rupture | Not Started | 2026-09-09 | Environnement, directives et allowlist images |
| 1.3 | Désactiver `X-Powered-By` et renforcer `Permissions-Policy` | Not Started | 2026-09-09 | Vérifier les besoins navigateur réels |
| 2.1 | Valider les intégrations et violations CSP | Not Started | 2026-09-09 | Chromium, Sentry, Supabase et Vercel Live |
| 2.2 | Auditer puis corriger le cache sensible | Not Started | 2026-09-09 | Ne pas dégrader le cache public |
| 3.1 | Mesurer l’impact architectural du nonce | Not Started | 2026-09-09 | Statique, ISR, PPR, CDN et coût Vercel |
| 3.2 | Supprimer obligatoirement `'unsafe-inline'` | Not Started | 2026-09-09 | Nonce privilégié, SRI comme alternative évaluée |
| 3.3 | Valider la CSP stricte en Preview et production | Not Started | 2026-09-09 | CSP Evaluator et absence de régression |

## Progress Log

### 2026-09-09

- TASK108 créée à partir de l’audit statique des en-têtes HTTP.
- La phase de durcissement compatible avec le rendu statique est distinguée de
  la migration CSP stricte.
- La suppression de `'unsafe-inline'` est enregistrée comme tâche obligatoire
  différée et comme condition de clôture.
- Le nonce reste la solution privilégiée, sous réserve d’une mesure de son
  impact ; SRI doit être évalué comme alternative si ce coût est refusé.
- `upgrade-insecure-requests` est limité aux environnements hors développement
  pour préserver Supabase local.
