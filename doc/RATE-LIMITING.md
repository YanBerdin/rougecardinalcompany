# Rate Limiting Implementation

## Overview

Protection des endpoints publics contre le spam et les abus via rate-limiting in-memory.

## Configuration

| Endpoint | Limite | Fenêtre | Clé d'identification |
| ---------- | -------- | --------- | --------------------- |
| `/api/contact` | 5 req | 15 min | IP address |
| `/api/newsletter` | 3 req | 1 heure | Email (lowercase) |

## Architecture

### Stack

- **Storage**: In-memory Map (dev/staging)
- **Future**: Redis (production scaling)
- **Algorithm**: Sliding window

### Key Design

- Contact: `contact:${ip_address}`
- Newsletter: `newsletter:${email}`

## Error Handling

**HTTP 429 Response** (Too Many Requests):

```json
{
  "success": false,
  "error": "Trop de tentatives. Veuillez réessayer dans X minutes."
}
```

## Monitoring

### Logs

```typescript
console.warn(`[Contact] Rate limit exceeded for IP: ${ip}`);
console.warn(`[Newsletter] Rate limit exceeded for email: ${email}`);
```

### Metrics (Future - Phase 2 Production)

- Nombre de 429 par endpoint (Grafana/Prometheus)
- Distribution temps de réponse
- Top IPs bloquées

## Testing

- Unit: `scripts/test-rate-limit.ts`
- Integration: `scripts/test-rate-limit-{contact,newsletter}.ts`
- Manual: `doc/RATE-LIMITING-TESTING.md`

## Production Considerations

### Redis Migration (Phase 2)

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
});
```

### Environment Variables

```bash
# Development (in-memory)
RATE_LIMIT_STORAGE=memory

# Production (Redis)
RATE_LIMIT_STORAGE=redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## Implementation Details

### Contact Form

Le rate-limiting est appliqué **avant** la validation des données pour économiser les ressources CPU sur les requêtes spam.

```typescript
// 1. Rate-limiting (clé: IP address)
// 2. Validation Zod
// 3. Insertion en base avec metadata
```

**Metadata stockée**:

- `ip`: Adresse IP du client (X-Forwarded-For prioritaire)
- `user_agent`: User-Agent du navigateur
- `rate_limit_remaining`: Nombre de requêtes restantes

### Newsletter

Le rate-limiting est appliqué par **email** pour empêcher le spam ciblé.

```typescript
// 1. Normalisation email (lowercase)
// 2. Rate-limiting (clé: email)
// 3. Validation complète
// 4. Insertion (ON CONFLICT DO NOTHING)
```

## Security Notes

- L'extraction d'IP privilégie le header `X-Forwarded-For` (proxy Vercel/Cloudflare)
- Fallback gracieux en développement local (IP = "unknown")
- Rate-limiting appliqué **avant** validation = protection CPU
- Logs de monitoring sur chaque dépassement de limite

## Future Improvements (Phase 2)

1. Migration Redis pour scaling multi-instances
2. Dashboard Grafana avec métriques temps réel
3. IP whitelist pour sources de confiance
4. Limites dynamiques selon profil utilisateur
5. Intégration CAPTCHA après échecs répétés
