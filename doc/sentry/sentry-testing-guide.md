# Sentry Alert Testing Guide

**Date:** 13 janvier 2026  
**Endpoint:** `/api/test-error`  
**Dashboard:** https://none-a26.sentry.io/issues/

---

## 🧪 Test Scenarios

### 1. Basic Error Test

Envoyez une seule erreur pour vérifier la capture :

```bash
curl http://localhost:3000/api/test-error
```

**Résultat attendu :**

- ✅ Erreur visible dans Sentry dashboard
- ❌ Pas d'alerte (en dessous du seuil P0)

---

### 2. P0 Alert Test (≥10 errors/min)

Simulez un pic d'erreurs pour déclencher l'alerte critique :

```bash
# Via URL params
curl "http://localhost:3000/api/test-error?count=15"

# Via POST (plus flexible)
curl -X POST http://localhost:3000/api/test-error \
  -H "Content-Type: application/json" \
  -d '{
    "count": 15,
    "type": "backend",
    "severity": "critical"
  }'
```

**Résultat attendu :**

- ✅ 15 erreurs envoyées en ~1.5s
- ✅ Alerte P0 déclenchée dans Sentry
- ✅ Notification Slack dans `#incidents` (si configuré)
- ✅ Email envoyé (si configuré)

---

### 3. P1 Alert Test (≥50 errors/hour)

Simulez un taux élevé d'erreurs sur une période plus longue :

```bash
# Méthode 1: Envoyer 50+ erreurs d'un coup
curl "http://localhost:3000/api/test-error?count=60"

# Méthode 2: Répéter le test toutes les 5 minutes
for i in {1..6}; do
  curl "http://localhost:3000/api/test-error?count=10"
  sleep 300  # 5 minutes
done
```

**Résultat attendu :**

- ✅ Alerte P1 déclenchée (seuil: 50/heure)
- ✅ Notification Slack dans `#monitoring`
- ✅ Email P1 envoyé

---

### 4. Frontend Error Simulation

Testez les erreurs frontend (navigateur) :

```bash
curl "http://localhost:3000/api/test-error?type=frontend&severity=warning"
```

**Tag Sentry attendu :**

- `error_type: frontend`
- `severity: warning`

---

### 5. Critical Error Test

Simulez une erreur critique (niveau fatal) :

```bash
curl "http://localhost:3000/api/test-error?severity=critical&count=1"
```

**Sentry Level:** `fatal` (niveau le plus élevé)

---

## 📊 Vérification Dashboard

### 1. Issues Dashboard

Allez sur : https://none-a26.sentry.io/issues/

**Filtres utiles :**

- `test:true` → Voir uniquement les erreurs de test
- `alert_test:true` → Erreurs de validation alertes
- `error_type:backend` → Filtrer par type

### 2. Alerts Dashboard

Allez sur : **Settings → Alerts → Alert Rules**

**Vérifier :**

- ✅ Rule P0 déclenchée (dernière activité)
- ✅ Rule P1 déclenchée (si applicable)
- ✅ Historique des notifications

### 3. Performance Dashboard

>**Metrics → Performance**

Vérifier que les spans sont enregistrés sans doublons.

---

## 🔍 Validation Checklist

Après avoir configuré les alertes dans Sentry UI, testez :

### Phase 1: Configuration Basique

- [ ] Alert P0 créée (>10 errors/min)
- [ ] Alert P1 créée (>50 errors/hour)
- [ ] Email notifications configurées
- [ ] Test simple : `curl http://localhost:3000/api/test-error`
- [ ] Erreur visible dans dashboard Sentry

### Phase 2: Intégration Slack

- [ ] Slack integration activée
- [ ] Webhook configuré pour `#incidents`
- [ ] Test P0 : `curl "http://localhost:3000/api/test-error?count=15"`
- [ ] Notification Slack reçue dans `#incidents`
- [ ] Message contient lien vers issue Sentry

### Phase 3: Notifications Email

- [ ] Email configuré dans Sentry settings
- [ ] Test P0 déclenché
- [ ] Email reçu avec détails erreur
- [ ] Lien vers dashboard fonctionnel

### Phase 4: Filtres et Contexte

- [ ] Erreurs taggées correctement (`test:true`)
- [ ] Contexte custom visible dans Sentry
- [ ] Filtres inbound configurés (browser extensions ignorés)
- [ ] Erreurs Next.js Turbopack filtrées

---

## 🧹 Cleanup (Avant Production)

Une fois les tests terminés :

### 1. Supprimer l'endpoint de test

```bash
rm app/api/test-error/route.ts
```

### 2. Nettoyer les erreurs de test dans Sentry

Dans Sentry Dashboard :

1. Filtrer : `test:true`
2. Sélectionner toutes les issues
3. Click **Resolve** → **Archive**

### 3. Ajuster les filtres

Dans `sentry.client.config.ts`, ajouter :

```typescript
beforeSend(event, hint) {
  // Ignore test errors in production
  if (event.tags?.test === 'true' && process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return event;
}
```

---

## 📈 Métriques de Réussite

Tests réussis si :

- ✅ **Detection time**: Erreur visible dans Sentry < 10s
- ✅ **Alert trigger time**: P0 alert < 1 min après seuil atteint
- ✅ **Slack notification**: Reçue < 30s après alert
- ✅ **Email notification**: Reçu < 2 min après alert
- ✅ **Context accuracy**: User ID, route, tags corrects
- ✅ **No duplicates**: Pas de doublons Supabase spans

---

## 🐛 Troubleshooting

### Erreur non capturée dans Sentry

**Cause possible :**

- DSN incorrect dans `.env.local`
- Sentry init pas appelé
- beforeSend returning null

**Solution :**

```bash
# Vérifier DSN
grep SENTRY_DSN .env.local

# Vérifier logs dev server
pnpm dev
# Chercher : "Sentry Logger [log]: Captured error event"
```

### Alert non déclenchée

**Cause possible :**

- Seuil non atteint
- Alert rule désactivée
- Filtre trop restrictif

**Solution :**

1. Vérifier rule status : **Settings → Alerts**
2. Vérifier conditions (>10/min vs >10/hour)
3. Vérifier project filter

### Notification Slack non reçue

**Cause possible :**

- Webhook URL incorrect
- Channel n'existe pas
- Bot pas invité dans channel

**Solution :**

```bash
# Inviter Sentry bot dans channel
/invite @Sentry

# Vérifier webhook
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test Sentry webhook"}'
```

---

## 📚 Ressources

- [Sentry Alerts Documentation](https://docs.sentry.io/product/alerts/)
- [Testing Sentry](https://docs.sentry.io/platforms/javascript/guides/nextjs/troubleshooting/)
- Guide de configuration : `doc/sentry/sentry-alerts-configuration.md`
- Runbook incidents : `doc/sentry/incident-response-runbook.md`

---

**⚠️ IMPORTANT:** Supprimer `/api/test-error` avant le déploiement en production !
