# Rate Limiting - Guide de Test

## Tests Automatisés

### Contact Form

```bash
pnpm exec tsx scripts/test-rate-limit-contact.ts
```

**Tests exécutés**:

1. 5 requêtes successives (doivent passer)
2. 6ème requête (doit être bloquée avec message d'erreur)

### Newsletter

```bash
pnpm exec tsx scripts/test-rate-limit-newsletter.ts
```

**Tests exécutés**:

1. 3 requêtes successives (doivent passer)
2. 4ème requête (doit être bloquée avec message d'erreur)

## Tests Manuels avec curl

### Contact Form - Test Rate Limiting

```bash
# Test 6 requêtes consécutives avec simulation IP
for i in {1..6}; do
  echo "Requête $i/6"
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.100" \
    -d '{
      "name": "Test User",
      "email": "test@example.com",
      "subject": "Test",
      "reason": "booking",
      "message": "Test message",
      "consent": true
    }'
  echo "\n---"
  sleep 0.5
done
```

**Résultat attendu**:

- Requêtes 1-5: `{"success": true, "data": {"status": "sent"}}`
- Requête 6: `{"success": false, "error": "Trop de tentatives. Veuillez réessayer dans X minutes."}`

### Test avec IP différente

```bash
# Devrait passer malgré les 6 requêtes précédentes
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.200" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "reason": "booking",
    "message": "Test message",
    "consent": true
  }'
```

### Newsletter - Test Rate Limiting

```bash
# Test 4 requêtes consécutives
for i in {1..4}; do
  echo "Requête $i/4"
  curl -X POST http://localhost:3000/api/newsletter \
    -H "Content-Type: application/json" \
    -d '{"email": "test-curl@example.com", "consent": true, "source": "test"}'
  echo "\n---"
  sleep 0.5
done
```

**Résultat attendu**:

- Requêtes 1-3: `{"success": true, "data": {"status": "subscribed"}}`
- Requête 4: `{"success": false, "error": "Trop de tentatives d'inscription..."}`

### Test avec email différent

```bash
# Devrait passer malgré les 4 requêtes précédentes
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "autre-email@example.com", "consent": true, "source": "test"}'
```

## Vérification des Headers

### Extraction IP

Le système utilise les headers suivants par ordre de priorité :

1. `X-Forwarded-For` (premier IP de la liste)
2. `X-Real-IP`
3. Fallback: `"unknown"` (dev local)

**Test simulation proxy**:

```bash
# Simulation Cloudflare/Vercel
curl -X POST http://localhost:3000/api/contact \
  -H "X-Forwarded-For: 203.0.113.42, 198.51.100.178" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","reason":"booking","message":"Test","consent":true}'
```

L'IP utilisée sera : `203.0.113.42` (premier IP de la liste)

## Monitoring

### Logs à surveiller

**Rate limit dépassé**:

```bash
[Contact] Rate limit exceeded for IP: 192.168.1.100
[Newsletter] Rate limit exceeded for email: test@example.com
```

**Metadata enrichie** (vérifier en base `messages_contact.metadata`):

```json
{
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "rate_limit_remaining": 0
}
```

## Edge Cases

### Cas 1: IP inconnue (dev local)

```bash
# Sans header X-Forwarded-For ni X-Real-IP
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","reason":"booking","message":"Test","consent":true}'
```

Clé rate-limit: `contact:unknown`

### Cas 2: Email avec casse différente

```bash
# Email normalisé en lowercase
curl -X POST http://localhost:3000/api/newsletter \
  -d '{"email": "Test@Example.COM", "consent": true, "source": "test"}'
```

Clé rate-limit: `newsletter:test@example.com`

### Cas 3: Validation échoue (rate-limit appliqué quand même)

```bash
# Email invalide mais rate-limit appliqué
curl -X POST http://localhost:3000/api/newsletter \
  -d '{"email": "invalid-email", "consent": true, "source": "test"}'
```

**Note**: Pour newsletter, validation minimale effectuée AVANT rate-limiting pour normaliser l'email.

## Reset Manuel

Pour réinitialiser le rate-limiting en développement :

```typescript
import { resetRateLimit } from "@/lib/utils/rate-limit";

// Reset contact pour une IP
resetRateLimit("contact:192.168.1.100");

// Reset newsletter pour un email
resetRateLimit("newsletter:test@example.com");
```

## Production Testing

### Simulation Attaque DDoS

```bash
# Script bash pour tester résistance
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/contact \
    -H "X-Forwarded-For: 192.168.1.$((RANDOM % 255))" \
    -d '{"name":"Spam","email":"spam@test.com","subject":"Spam","reason":"autre","message":"Spam","consent":true}' &
done
wait
```

**Vérifier**:

- Temps de réponse reste < 100ms
- Logs warning pour IPs bloquées
- Pas de crash serveur
- Metadata correctement enregistrée

## Checklist Validation

- [ ] Contact: 5 requêtes passent, 6ème bloquée
- [ ] Newsletter: 3 requêtes passent, 4ème bloquée  
- [ ] Message d'erreur contient le temps d'attente
- [ ] IP extraction fonctionne (X-Forwarded-For prioritaire)
- [ ] Email normalisé en lowercase
- [ ] Metadata enrichie stockée en base
- [ ] Logs warning sur dépassement
- [ ] Tests automatisés passent tous
- [ ] Pas de régression fonctionnelle
