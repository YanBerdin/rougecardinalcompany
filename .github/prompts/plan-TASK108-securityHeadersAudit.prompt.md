# Plan: Durcir les en-têtes HTTP

L’audit statique montre une bonne base globale, mais une CSP de production trop permissive, quelques directives CSP absentes, un `img-src` trop large et l’en-tête d’identification Next.js laissé par défaut. L’approche recommandée commence par des corrections compatibles avec le rendu statique, ajoute des tests de réponse réels, puis traite séparément une CSP stricte par nonce afin de mesurer son coût sur le cache, l’ISR et Vercel.

**Étapes**

## Phase 1 — Baseline et corrections sans rupture
1. Ajouter un test d’intégration des en-têtes qui démarre ou cible une build de production et contrôle au minimum une page publique, une page d’authentification, une route admin et une route API. Vérifier CSP, HSTS, framing, MIME sniffing, referrer, permissions, absence de `X-Powered-By` et cache des réponses authentifiées.
2. Dans `next.config.ts`, rendre `script-src` dépendant de l’environnement : conserver `'unsafe-eval'` uniquement en développement et le retirer en production. Conserver temporairement `'unsafe-inline'` tant que la stratégie nonce/SRI n’est pas validée, afin de ne pas casser le bootstrap Next.js.
3. Compléter la CSP statique avec `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` et, uniquement hors développement, `upgrade-insecure-requests` afin de préserver les ressources HTTP de Supabase local. Conserver `frame-ancestors 'none'`, déjà cohérent avec `X-Frame-Options: DENY`.
4. Remplacer `img-src 'self' data: https:` par une liste explicite cohérente avec `images.remotePatterns`, en ajoutant la source CSS réellement utilisée `https://www.transparenttextures.com` et `blob:` seulement si les aperçus locaux en ont besoin. Centraliser la liste des hôtes pour éviter une dérive entre Next Image et la CSP.
5. Ajouter `poweredByHeader: false`. Étendre prudemment `Permissions-Policy` aux capacités manifestement inutilisées (`payment`, `usb`, capteurs et XR), sans introduire COEP/CORP globalement.

## Phase 2 — Validation fonctionnelle
6. Exécuter le type-check, le lint ciblé/global et le nouveau test d’en-têtes sur une build de production. Contrôler le navigateur sur les pages publiques et admin : aucune violation CSP inattendue, graphiques Recharts visibles, images Supabase/CDN/texture chargées, authentification fonctionnelle, Sentry envoyé via `/monitoring`, Vercel Live testé sur un déploiement Vercel.
7. Vérifier explicitement les réponses sensibles à l’exécution. Si Next/Vercel ne renvoie pas déjà une politique privée adaptée, ajouter `Cache-Control: private, no-store` aux routes admin/auth concernées sans l’appliquer aux ressources publiques cachables.

## Phase 3 — CSP stricte, tâche obligatoire différée
8. Planifier cette phase comme une tâche obligatoire après le durcissement rapide. Mesurer la part des routes actuellement statiques/ISR et confirmer le budget de performance avant une migration par nonce. La documentation Next.js 16 impose le rendu dynamique aux pages recevant un nonce et exclut PPR/cache CDN classique.
9. Si ce coût est accepté, déplacer la génération de CSP dans `proxy.ts`, générer un nonce cryptographiquement aléatoire par requête, le transmettre dans l’en-tête de requête `x-nonce`, l’appliquer à la réponse retournée par `updateSession`, utiliser `'strict-dynamic'`, et ne garder `'unsafe-eval'` qu’en développement. Adapter le `<style>` dynamique de `ChartStyle` pour recevoir le nonce et tester les intégrations tierces.
10. Si le coût n’est pas accepté, conserver la CSP statique durcie de la phase 1 et évaluer l’option SRI expérimentale de Next.js 16 dans une branche dédiée; ne pas l’activer directement en production sans validation de build, hydratation, Sentry et CDN.

**Fichiers pertinents**
- `/home/yandev/projets-2026/rougecardinalcompany/next.config.ts` — politique globale, sources CSP, `poweredByHeader`, configuration Sentry/Vercel.
- `/home/yandev/projets-2026/rougecardinalcompany/proxy.ts` — point d’insertion d’une éventuelle CSP par nonce, à composer avec `updateSession`.
- `/home/yandev/projets-2026/rougecardinalcompany/supabase/middleware.ts` — fabrique et remplace parfois la `NextResponse`; toute CSP dynamique doit survivre aux branches redirect/403 et au rafraîchissement des cookies.
- `/home/yandev/projets-2026/rougecardinalcompany/components/ui/chart.tsx` — `ChartStyle` crée un `<style>` inline dynamique qui doit rester autorisé ou recevoir un nonce.
- `/home/yandev/projets-2026/rougecardinalcompany/components/features/public-site/home/partners/PartnersView.tsx` — charge `transparenttextures.com`, à intégrer à l’allowlist d’images ou à remplacer par un asset local.
- `/home/yandev/projets-2026/rougecardinalcompany/package.json` — ajouter une commande de vérification des en-têtes si un script dédié est créé.
- `/home/yandev/projets-2026/rougecardinalcompany/__tests__/` ou `/home/yandev/projets-2026/rougecardinalcompany/e2e/` — emplacement du test automatisé selon le pattern de test existant retenu à l’implémentation.

**Vérification**
1. `pnpm type-check` puis `pnpm lint`.
2. `pnpm build` et démarrage de la build avec `pnpm start` sur un port libre.
3. Assertions HTTP sur `/`, `/auth/login`, `/admin` et une route `/api/*` : valeurs exactes des six en-têtes existants, directives CSP ajoutées, absence de `X-Powered-By`, comportement de cache attendu.
4. Test Playwright Chromium : capturer les événements `securitypolicyviolation` et les erreurs console sur une page publique, une page auth et une page admin avec graphiques/images.
5. Sur Vercel Preview : vérifier Vercel Live, une transaction Sentry via `/monitoring`, les images Supabase et l’absence de violation CSP dans DevTools.
6. Soumettre la CSP finale à CSP Evaluator et confirmer séparément l’éligibilité HSTS preload du domaine de production.

**Décisions**
- Inclus : CSP, HSTS, framing, MIME sniffing, referrer, Permissions-Policy, identification serveur, cache sensible et tests de réponse.
- Exclu : webhook Resend, routes de debug, autorisation métier et rate limiting; ce sont des sujets de sécurité valides mais hors audit des en-têtes.
- Ne pas ajouter COEP globalement : il casserait potentiellement des ressources cross-origin et n’est requis ni par `SharedArrayBuffer` ni par un besoin métier identifié.
- Ne pas ajouter CORP globalement aux réponses publiques sans modèle par type de ressource; les médias publics Supabase sont volontairement cross-origin.
- COOP est un durcissement optionnel, pas une vulnérabilité avérée; `same-origin-allow-popups` est le candidat compatible avec Vercel Live et d’éventuels flux externes.
- La suppression définitive de `'unsafe-inline'` constitue une tâche obligatoire différée. La migration par nonce est la solution privilégiée après mesure des routes statiques/ISR; si son coût architectural est refusé, une alternative stricte validée, telle que SRI, doit être mise en œuvre plutôt que de conserver indéfiniment la CSP transitoire.
