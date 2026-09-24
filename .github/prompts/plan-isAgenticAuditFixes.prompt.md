# Plan: Corrections Is Agentic Audit (59/100 → cible ~90+)

Source: `.github/prompts/is-agentic-audit.md`. Site: https://compagnie-rouge-cardinal.fr

## État des lieux (recherche effectuée)

| # | Point | État code | Constat |
|---|-------|-----------|---------|
| 1 | Crawler reachability (Failed) | `app/robots.ts` utilise `userAgent: "*"` + `allow: "/"` — **aucun blocage dans le code** | Blocage probable côté Vercel Bot Protection/WAF (hors repo) |
| 2 | 404 agent-friendly (Partial) | Pas de `app/not-found.tsx` racine (seul `spectacles/[slug]/not-found.tsx` existe) | 404 réel OK via convention Next.js, mais pas de corps guidant les agents |
| 3 | Contenu sans JS (Partial) | Homepage server-rendered, mais : H2→H4 skip dans NewsView, H3 orphelin dans PartnersView, ratio contenu 4.3% < 5% | Corriger hiérarchie + augmenter contenu textuel SSR |
| 4 | Markdown negotiation (Failed) | **Aucune** gestion `Accept: text/markdown`, pas de `Vary: Accept` | À implémenter from scratch |
| 5 | JSON-LD (Failed) | Aucun JSON-LD dans le repo | À implémenter (type `PerformingGroup`) |

Bonus identifié : pas de `llms.txt` (recommandé par le fix 2, améliore le score).

## Décisions utilisateur

- Markdown : négociation Accept sur les pages publiques principales (/, /spectacles, /compagnie, /agenda, /presse, /contact) via middleware + route `/api/md` + `Vary: Accept`.
- Crawlers : accès dashboard Vercel confirmé → étape manuelle Bot Protection incluse.
- JSON-LD : identité de base uniquement (name, description, url, logo, address). Pas de sameAs ni TheaterEvent.

---

## Phase A — Foundations machine-readable (fixes 1 + 5 + llms.txt)

*Steps 1-3 parallèles.*

1. **robots.ts explicite pour crawlers IA** — Modifier `app/robots.ts` : ajouter un tableau `rules` avec des entrées explicites `userAgent` pour `ChatGPT-User`, `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `DeepSeekBot`, `OAI-SearchBot`, `anthropic-ai`, `ora-agent` (allow `/`, mêmes disallow que la règle `*`). Conserver la règle `userAgent: "*"` existante en fallback. Garder `sitemap` inchangé.
2. **llms.txt** — Créer `public/llms.txt` au format llmstxt.org : H1 nom du site, blockquote description, sections H2 avec liens vers pages principales + `/sitemap.xml`. Contenu statique FR.
3. **JSON-LD PerformingGroup** — Créer `lib/seo/json-ld.ts` : fonction `buildOrganizationJsonLd()` retournant un objet `@type: "PerformingGroup"` depuis `SITE_CONFIG` (name, description, WEBSITE_URL, logo `/android-chrome-512x512.png`, address depuis `SITE_CONFIG.MAKER.ADDRESS`). L'injecter dans `app/(marketing)/page.tsx` via `<script type="application/ld+json">` (Server Component, pas de behavior change visuel).
4. **Étape manuelle Vercel** (hors code) — Dashboard → Firewall/Bot Protection : vérifier que les UA IA ne sont pas challengés ; ajouter règles d'exception si Bot Protection en mode "block all bots".

## Phase B — 404 agent-friendly (fix 2)

5. **Créer `app/not-found.tsx` racine** — Page 404 réelle (convention Next.js garantit le statut 404) avec : message clair, liste de liens de récupération (accueil, spectacles, agenda, contact), et liens machine-readable vers `/sitemap.xml` et `/llms.txt`. Style cohérent avec `spectacles/[slug]/not-found.tsx` existant (réutiliser pattern Button + Link). *Dépend de step 2 (llms.txt référencé).*
6. **Vérifier le statut HTTP** — `curl -s -o /dev/null -w "%{http_code}" https://compagnie-rouge-cardinal.fr/chemin-inexistant` doit afficher `404`.

## Phase C — Contenu sans JS (fix 3)

*Préserver le design visuel — changements sémantiques uniquement.*

7. **Corriger la hiérarchie des titres** :
   - `components/features/public-site/home/news/NewsView.tsx` : titres d'articles `<h4>` → `<h3>` (adapter classes Tailwind pour conserver le rendu visuel).
   - `components/features/public-site/home/partners/PartnersView.tsx` : `<h3>` orphelin → ajouter un `<h2>` de section (visuellement existant ou `sr-only` si le design ne doit pas changer) et passer le titre de section en cohérence.
   - Vérifier la présence d'un unique `<h1>` sur la homepage (hero) — si absent, convertir le titre du hero actif en `<h1>` (audit indique H1 présent ; confirmer dans HeroClient).
8. **Augmenter le ratio contenu (4.3% → ≥5%)** : ajouter un paragraphe descriptif server-rendered concis (ex. mission de la compagnie) dans la section hero ou about — **point de vigilance design** : préférer texte existant en base (about content) plutôt que nouveau copywriting. Réduire le markup non-contenu si possible (wrappers div superflus dans les sections homepage). *Bloquant potentiel : valider le wording avec le produit si nouveau texte.*
9. **Vérifier** : `curl -s https://compagnie-rouge-cardinal.fr/ | html-to-text` → ≥500 chars significatifs, hiérarchie H1→H2→H3 séquentielle, ratio ≥5%.

## Phase D — Négociation Markdown (fix 4)

10. **Route handler `app/api/md/route.ts`** — GET avec query `?path=`. Mappe les pages publiques (`/`, `/spectacles`, `/compagnie`, `/agenda`, `/presse`, `/contact`) vers du markdown généré : contenu statique de base + données DAL pour les listes (spectacles via `fetchFeaturedShows`/`fetchAllSpectacles`, articles presse, événements agenda). Retourne `text/markdown; charset=utf-8` avec headers `Vary: Accept`. Path non mappé → 404 markdown court pointant vers sitemap/llms.txt. Réutiliser le DAL existant (server-only OK dans route handler). Pas d'auth requise (contenu public uniquement).
11. **Négociation dans `proxy.ts`** — Pour les requêtes GET dont `Accept` contient `text/markdown` et dont le path est une page publique mappée : `NextResponse.rewrite` vers `/api/md?path=<pathname>`. Ne pas toucher aux routes /admin, /api, /auth, /_next. Préserver la logique `updateSession` existante (l'appliquer d'abord, puis la réécriture).
12. **`Vary: Accept` sur les réponses HTML** — Dans `proxy.ts`, merger `Accept` dans le header `Vary` existant des réponses publiques (Next.js pose déjà `Vary: rsc, next-router-state-tree, ...` — append, jamais écraser). Vérifier que la réponse markdown et la réponse HTML portent toutes deux `Vary: Accept`.

## Phase E — Tests & vérification

13. **Tests unitaires Vitest** (`__tests__/`) :
    - `robots.test.ts` : règles IA explicites présentes, disallow admin/api conservés.
    - `json-ld.test.ts` : structure PerformingGroup valide (champs requis, URL absolue).
    - `api-md.test.ts` : la route retourne `text/markdown` + `Vary: Accept` pour `/`, 404 pour path inconnu.
14. **Script de vérification E2E post-déploiement** — `scripts/verify-agentic.ts` (tsx) : curl-like checks sur la prod : (a) homepage 200 pour UA `ChatGPT-User`, `ClaudeBot`, `Google-Extended`, `DeepSeekBot`, `ora-agent` ; (b) 404 réel ; (c) `Accept: text/markdown` → content-type markdown + Vary contient Accept ; (d) homepage contient `application/ld+json` ; (e) `/llms.txt` 200. Sortie tabulaire PASS/FAIL.
15. **Validation finale** : `pnpm lint`, `pnpm build`, tests Vitest ciblés, puis re-soumettre le site à l'audit Is Agentic.

## Fichiers concernés

- `app/robots.ts` — règles UA explicites (step 1)
- `public/llms.txt` — nouveau (step 2)
- `lib/seo/json-ld.ts` — nouveau helper (step 3)
- `app/(marketing)/page.tsx` — injection JSON-LD (step 3)
- `app/not-found.tsx` — nouveau (step 5)
- `components/features/public-site/home/news/NewsView.tsx` — h4→h3 (step 7)
- `components/features/public-site/home/partners/PartnersView.tsx` — hiérarchie (step 7)
- `components/features/public-site/home/hero/HeroClient.tsx` — H1 si confirmé absent (step 7)
- `app/api/md/route.ts` — nouveau route handler (step 10)
- `proxy.ts` — négociation Accept + Vary (steps 11-12)
- `__tests__/seo/*` — nouveaux tests (step 13)
- `scripts/verify-agentic.ts` — nouveau (step 14)

## Vérification (récap)

1. `curl -A "ClaudeBot" -s -o /dev/null -w "%{http_code}" https://compagnie-rouge-cardinal.fr/` → 200 (×5 UA)
2. `curl -s -o /dev/null -w "%{http_code}" .../chemin-inexistant` → 404
3. `curl -sI -H "Accept: text/markdown" https://compagnie-rouge-cardinal.fr/` → `content-type: text/markdown` + `vary` contient `Accept`
4. `curl -s https://compagnie-rouge-cardinal.fr/ | grep -c 'application/ld+json'` → ≥1
5. `curl -s https://compagnie-rouge-cardinal.fr/llms.txt` → 200
6. Hiérarchie headings : pas de skip H2→H4 dans le HTML brut
7. `pnpm build` + `pnpm lint` + Vitest verts

## Risques / points d'attention

- **Fix 1** : si le blocage vient de Vercel Bot Protection, le code seul ne suffira pas — l'étape manuelle dashboard est obligatoire. Les statuts "unknown" de l'audit peuvent aussi provenir du challenge Vercel par défaut.
- **Fix 3 ratio** : augmenter le texte sans changer le design peut nécessiter un arbitrage produit (wording).
- **Fix 4** : la homepage est `force-dynamic` (cookies Supabase) — les réponses ne sont pas cachées par défaut, mais `Vary: Accept` reste requis pour les CDN en amont. Ne pas casser le prefetch RSC (matcher proxy existant exclut déjà les assets statiques ; vérifier que les requêtes `RSC: 1` ne sont pas réécrites en markdown).
- **Contenu markdown** : le markdown généré doit refléter le contenu réel des pages (pas de placeholder) pour ne pas dégrader la confiance des agents.
