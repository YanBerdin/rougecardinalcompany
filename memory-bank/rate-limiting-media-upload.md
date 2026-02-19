# Rate Limiting - Media Upload

## Vue d'ensemble

Système de rate limiting pour limiter les uploads média à **10 fichiers par minute par utilisateur**.

**Objectif** : Prévenir l'abus et protéger les ressources serveur (Supabase Storage).

---

## Architecture

### Approche actuelle (développement)

**In-Memory Map** : Simple et rapide pour le développement local.

```typescript
// lib/utils/rate-limit.ts
const rateLimitStore = new Map<string, RateLimitEntry>();
```

**Limites** :

- ❌ Ne persiste pas entre redémarrages serveur
- ❌ Ne fonctionne pas en multi-instance (load balancing)
- ✅ Parfait pour dev/test

### Migration production (recommandée)

**Redis** : Distributed rate limiting pour production multi-instance.

```typescript
// Exemple avec ioredis
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(key: string, max: number, windowMs: number) {
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, Math.ceil(windowMs / 1000));
  }
  
  return {
    allowed: count <= max,
    remaining: Math.max(0, max - count),
  };
}
```

**Alternatives** :

- **Upstash Redis** : Serverless Redis (Vercel compatible)
- **Vercel KV** : Edge-compatible key-value store
- **Rate Limiter Middleware** : `@upstash/ratelimit`, `rate-limiter-flexible`

---

## Configuration actuelle

| Paramètre | Valeur | Configurable dans |
| ----------- | -------- | ------------------- |
| **Max uploads** | 10 | `lib/actions/media-actions.ts` |
| **Fenêtre temporelle** | 1 minute (60s) | `lib/actions/media-actions.ts` |
| **Clé utilisateur** | `upload:${userId}` | `lib/actions/media-actions.ts` |
| **Cleanup interval** | 5 minutes | `lib/utils/rate-limit.ts` |

---

## Implémentation

### 1. Utilitaire Rate Limit

**Fichier** : `lib/utils/rate-limit.ts`

**Fonctions exportées** :

```typescript
// Vérifier si limite atteinte (sans enregistrer)
checkRateLimit(key: string, maxRequests: number, windowMs: number)
  → { allowed: boolean; remaining: number; resetAt: Date }

// Enregistrer une requête (incrémenter compteur)
recordRequest(key: string, maxRequests: number, windowMs: number)
  → { success: boolean; remaining: number; resetAt: Date }

// Reset pour un utilisateur (testing)
resetRateLimit(key: string): void

// Cleanup entrées expirées (auto)
cleanupExpiredEntries(windowMs: number): void
```

### 2. Intégration Server Action

**Fichier** : `lib/actions/media-actions.ts`

```typescript
import { recordRequest } from "@/lib/utils/rate-limit";

export async function uploadMediaImage(formData: FormData, folder: string) {
  // ... validation ...
  
  const uploadedBy = await getCurrentUserId();
  
  // ✅ Rate limiting
  const rateLimitResult = recordRequest(
    `upload:${uploadedBy}`,
    10,           // max 10 uploads
    60 * 1000     // per 1 minute
  );
  
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Limite d'uploads atteinte (10/min). Réessayez après ${resetTime}.`,
    };
  }
  
  // ... upload logic ...
}
```

### 3. Gestion erreur UI

**Fichier** : `components/features/admin/media/MediaUploadDialog.tsx`

```typescript
const result = await uploadMediaImage(formData, "medias");

if (!result.success) {
  if (result.error.includes("Limite d'uploads")) {
    toast.error("Trop d'uploads", {
      description: result.error,
      duration: 5000,
    });
  } else {
    toast.error("Erreur upload", { description: result.error });
  }
}
```

---

## Tests

### Script de test

**Exécution** :

```bash
pnpm exec tsx scripts/test-rate-limit.ts
```

**Couverture** :

- ✅ 10 uploads successifs passent
- ✅ 11ème upload bloqué
- ✅ Vérification sans enregistrement
- ✅ Reset manuel fonctionnel
- ✅ Isolation par utilisateur

### Test manuel (UI)

1. Se connecter en admin
2. Aller sur `/admin/media/library`
3. Uploader 10 fichiers rapidement
4. Essayer d'uploader un 11ème → Message d'erreur attendu
5. Attendre 1 minute
6. Réessayer → Upload devrait passer

---

## Monitoring

### Logs serveur

Les tentatives bloquées sont loggées automatiquement :

```typescript
// Ajout dans lib/utils/rate-limit.ts
if (!allowed) {
  console.warn(`[Rate Limit] Blocked: ${key} (${currentCount}/${maxRequests})`);
}
```

### Métriques recommandées (production)

- **Nombre de blocages** : Combien d'uploads bloqués par jour
- **Utilisateurs affectés** : Qui atteint souvent la limite
- **Patterns abus** : Détection upload automatisé

---

## Migration vers Redis (production)

### Étape 1 : Installer dépendances

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

### Étape 2 : Configuration Upstash

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxYyyy
```

### Étape 3 : Remplacer implémentation

```typescript
// lib/utils/rate-limit-redis.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 req/min
  analytics: true,
});

export async function checkRateLimit(key: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(key);
  
  return {
    allowed: success,
    remaining,
    resetAt: new Date(reset),
  };
}
```

### Étape 4 : Mettre à jour Server Action

```typescript
// Remplacer import
// import { recordRequest } from "@/lib/utils/rate-limit";
import { checkRateLimit } from "@/lib/utils/rate-limit-redis";

// Utiliser nouvelle fonction
const { allowed, remaining, resetAt } = await checkRateLimit(`upload:${userId}`);
```

---

## Configuration personnalisée

### Ajuster les limites

```typescript
// Par environnement
const MAX_UPLOADS = process.env.NODE_ENV === 'production' ? 10 : 100;
const WINDOW_MS = process.env.NODE_ENV === 'production' ? 60_000 : 10_000;

// Par rôle utilisateur
const isAdmin = await checkIfAdmin(userId);
const maxUploads = isAdmin ? 50 : 10; // Admins ont 5x plus
```

### Limites différentes par type

```typescript
// Images : 10/min
if (file.type.startsWith("image/")) {
  maxUploads = 10;
}

// Vidéos : 2/min (plus lourd)
if (file.type.startsWith("video/")) {
  maxUploads = 2;
}
```

---

## Troubleshooting

### Problème 1 : Rate limit trop strict

**Symptôme** : Utilisateurs légitimes bloqués

**Solution** :

- Augmenter limite : `10` → `20`
- Augmenter fenêtre : `60s` → `120s`
- Ajouter exemption admins

### Problème 2 : Rate limit contourné

**Symptôme** : Abus malgré rate limit

**Causes possibles** :

- Multi-comptes (même IP, différents users)
- Redémarrage serveur reset le Map

**Solutions** :

- Ajouter rate limit par IP (en plus de userId)
- Migrer vers Redis (persistence)
- Ajouter CAPTCHA après 3 blocages

### Problème 3 : Performance dégradée

**Symptôme** : Lenteur lors d'uploads

**Diagnostic** :

- Trop d'entrées dans Map → Cleanup insuffisant
- Vérifier `cleanupExpiredEntries()` fonctionne

**Solution** :

- Réduire interval cleanup : `5min` → `1min`
- Migrer vers Redis (optimisé pour ce cas)

---

## Checklist pré-production

Avant de déployer en production :

- [ ] Migrer vers Redis/Upstash (persistence)
- [ ] Configurer monitoring (logs + métriques)
- [ ] Tester charge avec 100+ utilisateurs
- [ ] Documenter procédure reset manuel
- [ ] Ajouter alertes si > 100 blocages/jour
- [ ] Implémenter exemption pour admins
- [ ] Ajouter rate limit par IP (DoS protection)
- [ ] Tester fallback si Redis down

---

## Références

- **Upstash Rate Limit** : https://upstash.com/docs/oss/sdks/ts/ratelimit/overview
- **Vercel KV** : https://vercel.com/docs/storage/vercel-kv
- **rate-limiter-flexible** : https://github.com/animir/node-rate-limiter-flexible
- **Next.js Middleware** : https://nextjs.org/docs/app/building-your-application/routing/middleware

---

## Historique

| Version | Date | Changements |
| ----------- | -------- | ------------------- |
| 1.0 | 2025-12-28 | Implémentation initiale (in-memory Map) |
