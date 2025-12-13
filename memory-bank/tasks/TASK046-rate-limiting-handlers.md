# TASK046 - Rate-limiting handlers contact/newsletter

**Status:** En Cours  
**Added:** 2025-12-13  
**Updated:** 2025-12-13

## Original Request

Ajouter du rate-limiting sur les handlers `handleContactSubmission()` et `handleNewsletterSubscription()` pour prévenir les abus (spam, DoS).

## Context

Suite à la factorisation des handlers Contact et Newsletter (2025-12-13), la logique est maintenant centralisée dans :

- `lib/actions/contact-server.ts` → `handleContactSubmission()`
- `lib/actions/newsletter-server.ts` → `handleNewsletterSubscription()`

Ces endpoints publics sont exposés via API Routes et Server Actions, rendant le rate-limiting critique.

## Thought Process

### Options envisagées

| Option | Pros | Cons |
|--------|------|------|
| **A. Middleware Next.js** | Centralisé, appliqué avant le handler | Complexité config, matcher patterns |
| **B. Inside handler** | Simple, proche du code | Duplication potentielle |
| **C. Library (upstash/ratelimit)** | Production-ready, Redis-backed | Dépendance externe, coût |
| **D. Simple in-memory** | Zero dépendance | Pas persisté, multi-instance fail |

### Recommandation

**Option C (upstash/ratelimit)** pour production, ou **Option D (in-memory)** comme MVP rapide.

## Implementation Plan

### Phase 1 : MVP In-Memory (rapide)

1. Créer `lib/utils/rate-limiter.ts` avec Map<IP, timestamps>
2. Ajouter check dans `handleContactSubmission()` et `handleNewsletterSubscription()`
3. Retourner erreur 429 si limite dépassée

### Phase 2 : Production (upstash)

1. Installer `@upstash/ratelimit` + `@upstash/redis`
2. Configurer Redis via env vars (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
3. Remplacer rate-limiter in-memory par Upstash
4. Ajouter sliding window algorithm

### Limites suggérées

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| Contact | 5 requêtes | 15 minutes |
| Newsletter | 3 requêtes | 1 heure |

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Créer `lib/utils/rate-limiter.ts` | Not Started | - | MVP in-memory |
| 1.2 | Intégrer dans `handleContactSubmission()` | Not Started | - | |
| 1.3 | Intégrer dans `handleNewsletterSubscription()` | Not Started | - | |
| 1.4 | Tester avec curl/Postman | Not Started | - | Vérifier 429 |
| 2.1 | Installer upstash packages | Not Started | - | Phase 2 |
| 2.2 | Configurer Redis credentials | Not Started | - | Phase 2 |
| 2.3 | Migrer vers Upstash ratelimit | Not Started | - | Phase 2 |

## Progress Log

### 2025-12-13

- Task créée suite à la factorisation Contact/Newsletter
- Recommandation : commencer par MVP in-memory, migrer vers Upstash en production

## References

- `lib/actions/contact-server.ts` — Handler contact
- `lib/actions/newsletter-server.ts` — Handler newsletter
- [Upstash Ratelimit](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
- [Next.js Rate Limiting](https://nextjs.org/docs/app/building-your-application/routing/rate-limiting)
