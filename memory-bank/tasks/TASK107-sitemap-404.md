# TASK107 - Corriger la 404 de `/sitemap.xml`

**Status:** Pending  
**Added:** 2026-08-04  
**Updated:** 2026-08-04

## Original Request

Diagnostiquer puis corriger la réponse `404 Not Found` retournée par
`https://compagnie-rouge-cardinal.fr/sitemap.xml`, et documenter la situation
dans le Memory Bank.

## Symptôme observé

La production répond actuellement `404` sur :

```text
https://compagnie-rouge-cardinal.fr/sitemap.xml
```

La route suivante fonctionne :

```text
https://compagnie-rouge-cardinal.fr/robots.txt
```

Cependant, `robots.txt` déclare le sitemap suivant :

```text
https://compagnie-rouge-cardinal.fr/sitemap.xml
```

Les moteurs de recherche peuvent donc découvrir une référence valide mais
aboutir à une ressource inexistante, ce qui dégrade la découverte et
l'indexation des pages publiques.

## Diagnostic

### Cause racine confirmée

Le projet contient `app/robots.ts`, qui génère `robots.txt` et référence
`/sitemap.xml`, mais aucun des fichiers suivants n'existe dans le dépôt :

- `app/sitemap.ts` ;
- `app/sitemap.js` ;
- `app/sitemap.xml`.

La route HTTP `/sitemap.xml` n'est donc enregistrée ni par une Metadata Route
Next.js, ni par un fichier statique déployé.

### Causes écartées

- `app/robots.ts` ne crée pas automatiquement le sitemap ; il ne fait que le
  référencer.
- La table `public.sitemap_entries` contient des données SEO potentielles,
  mais une table PostgreSQL n'expose pas automatiquement une URL HTTP.
- `proxy.ts` et le middleware Supabase ne redirigent ni ne bloquent
  `/sitemap.xml`.
- `WEBSITE_URL` est correctement configurée en production vers
  `https://compagnie-rouge-cardinal.fr`.

## Fichiers examinés

- `app/robots.ts` — référence `${WEBSITE_URL}/sitemap.xml`.
- `lib/site-config.ts` — fournit `WEBSITE_URL`.
- `proxy.ts` — délègue la gestion de session sans règle sitemap.
- `supabase/middleware.ts` — protège uniquement les zones privées.
- `public.sitemap_entries` — source de données éventuelle, pas une route.
- `public.seo_redirects` — à prendre en compte pour éviter d'inscrire des
  destinations obsolètes ou redirigées.

## Correction recommandée

Créer une Metadata Route Next.js dans `app/sitemap.ts` :

1. importer `MetadataRoute` depuis `next` ;
2. utiliser `WEBSITE_URL` pour produire des URLs absolues et cohérentes ;
3. retourner un tableau de type `MetadataRoute.Sitemap` ;
4. inclure les routes publiques canoniques réellement disponibles ;
5. ajouter les pages publiques dynamiques publiées, notamment les spectacles,
   les événements ou les articles de presse, selon les DAL existants ;
6. intégrer `sitemap_entries` uniquement après avoir vérifié son schéma, son
   filtre `is_indexed`, ses URLs et ses règles d'accès public ;
7. exclure les routes privées ou techniques : `/admin`, `/api`, `/auth`, les
   pages de debug, les brouillons et les URLs invalides ;
8. ne pas inclure les URLs qui redirigent vers une destination externe ou qui
   correspondent à une page non canonique.

Le premier correctif peut rester volontairement statique et limité aux routes
publiques confirmées. L'intégration de `sitemap_entries` est une étape
complémentaire : elle ne doit pas retarder le rétablissement d'un XML valide.

## Plan d'implémentation

### Phase 1 — Route Next.js

- Créer `app/sitemap.ts`.
- Déclarer les URLs publiques canoniques avec leur `lastModified` uniquement
  lorsque la valeur est fiable.
- Réutiliser les fonctions DAL de lecture publique existantes plutôt que des
  requêtes SQL directes dans la route.
- Gérer les erreurs de lecture sans publier de fausses URLs ; documenter le
  comportement attendu en cas d'indisponibilité de la base.

### Phase 2 — Données dynamiques SEO

- Examiner la structure réelle de `public.sitemap_entries` et ses policies RLS.
- Déterminer si les entrées sont déjà utilisées ailleurs et si leur URL est
  relative ou absolue.
- Filtrer les entrées publiables (`is_indexed = true`, URL valide, destination
  canonique).
- Dédupliquer les URLs et supprimer les URLs hors domaine ou redirigées.

### Phase 3 — Validation locale et build

- Lancer `pnpm type-check`.
- Lancer `pnpm build`.
- Démarrer l'application et vérifier que `GET /sitemap.xml` répond `200`.
- Vérifier le `Content-Type` XML et la présence d'un élément `<urlset>` ou d'un
  index de sitemaps conforme.
- Vérifier que chaque `<loc>` est une URL absolue du domaine officiel et que
  les routes listées répondent sans `404`.

### Phase 4 — Déploiement et validation production

- Déployer la correction sur Vercel.
- Vérifier `https://compagnie-rouge-cardinal.fr/sitemap.xml` avec `curl -I` et
  une récupération du corps XML.
- Vérifier que `/robots.txt` continue de pointer vers la même URL.
- Contrôler les URLs principales du sitemap en production.
- Soumettre ou actualiser le sitemap dans Google Search Console et surveiller
  le résultat de lecture après traitement par Google.

## Critères d'acceptation

- [ ] `/sitemap.xml` répond `200 OK` en production.
- [ ] La réponse est un XML valide avec un `Content-Type` approprié.
- [ ] Le document contient uniquement des URLs publiques, canoniques et
      accessibles.
- [ ] Aucune URL `/admin`, `/api`, `/auth`, debug ou brouillon n'est publiée.
- [ ] Les URLs dynamiques publiées sont générées depuis des données réellement
      visibles publiquement.
- [ ] `robots.txt` référence un sitemap qui répond effectivement `200`.
- [ ] `pnpm type-check` et `pnpm build` réussissent.
- [ ] La vérification HTTP locale et la vérification HTTP production sont
      documentées avec leur résultat.
- [ ] Google Search Console accepte la lecture du sitemap après déploiement.

## Risques et points de vigilance

- Une requête DB dans une Metadata Route peut rendre la route dynamique et
  dépendre de l'authentification ou des cookies si le mauvais client Supabase
  est utilisé. La lecture doit rester publique et server-first.
- Une entrée `sitemap_entries` mal filtrée peut exposer des URLs privées,
  obsolètes ou externes.
- Un `lastModified` inventé ou instable peut générer du bruit pour les moteurs
  de recherche ; mieux vaut l'omettre que publier une date non fiable.
- Toute modification de `robots.ts` doit rester alignée avec l'URL réellement
  servie par la Metadata Route.

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | -------------------------------------------------------- | ----------- | ---------- | -------------------------------------- |
| 1.1 | Créer la Metadata Route `app/sitemap.ts` | Not Started | 2026-08-04 | Cause racine confirmée |
| 1.2 | Définir le périmètre des routes publiques | Not Started | 2026-08-04 | Exclure admin, API, auth et debug |
| 1.3 | Évaluer l'intégration de `sitemap_entries` | Not Started | 2026-08-04 | Vérifier schéma, RLS et URLs |
| 1.4 | Valider type-check, build et réponse XML locale | Not Started | 2026-08-04 | |
| 1.5 | Déployer et vérifier `/sitemap.xml` en production | Not Started | 2026-08-04 | Puis soumettre à Search Console |

## Progress Log

### 2026-08-04

- Tâche créée après vérification de la 404 production sur `/sitemap.xml`.
- `robots.txt` fonctionne et référence le sitemap absent.
- Aucun fichier `app/sitemap.*` ou `app/sitemap.xml` n'est présent.
- Le proxy, le middleware et la configuration `WEBSITE_URL` ont été écartés
  comme causes de la 404.
- Prochaine action : implémenter la Metadata Route, puis valider localement et
  en production.
