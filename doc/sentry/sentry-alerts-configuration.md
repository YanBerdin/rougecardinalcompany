# Sentry Alerts Configuration Guide

**Date:** 13 janvier 2026  
**Project:** rouge-cardinal-test  
**Organization:** none-a26  
**Dashboard:** https://none-a26.sentry.io/

---

## 🎯 Objectif

Configurer des alertes automatiques pour détecter et notifier les incidents critiques en production.

---

## 📋 Configuration des Alertes

### 1. Alert Rules (Règles d'Alerte)

Accédez à : **Settings → Alerts → Create Alert Rule**

#### 🔴 P0 - Erreurs Critiques (Alerte Immédiate)

**Nom:** `[P0] High Error Rate - Immediate Action Required`

**Conditions:**

```sql
WHEN number of errors
FOR rouge-cardinal-test
IS ABOVE 10 errors
IN 1 minute
```

**Actions:**

- ✅ Send a notification to **on-call email** (critical-alerts@rougecardinal.com)
- ✅ Send a notification to **dev team email** (dev-team@rougecardinal.com)
- ✅ Create an issue in **Linear/Jira** (optionnel)

**Severity:** Critical

---

#### 🟠 P1 - Erreurs Élevées (Alerte Différée)

**Nom:** `[P1] Elevated Error Rate - Investigation Needed`

**Conditions:**

```sql
WHEN number of errors
FOR rouge-cardinal-test
IS ABOVE 50 errors
IN 1 hour
```

**Actions:**

- ✅ Send an email to **monitoring@rougecardinal.com**
- ✅ Send a notification to **dev team email**

**Severity:** Warning

---

#### 🟡 Daily Digest (Rapport Quotidien)

**Nom:** `Daily Error Summary`

**Conditions:**

```sql
WHEN number of errors
FOR rouge-cardinal-test
IS ABOVE 1 error
IN 24 hours
```

**Actions:**

- ✅ Send a daily/weekly email digest to **dev-team@rougecardinal.com**

**Severity:** Low (pas Critical - pour éviter la confusion avec P0)

**Note:** Dans Sentry, configurez cette règle avec la fréquence "Daily" ou "Weekly" selon vos besoins. Évitez de marquer comme "Critical" pour ne pas surcharger les emails prioritaires.

---

### 2. Email Notifications

> **Settings → Notifications → Email**

**Configuration des emails :**

1. **Email personnel** → Settings → Account → Notifications
   - ✅ Critical issues (P0)
   - ✅ New issues assigned to me
   - ✅ Daily/Weekly summary

2. **Emails d'équipe** → Settings → Alerts → Alert Rules
   - ✅ critical-alerts@rougecardinal.com (P0)
   - ✅ monitoring@rougecardinal.com (P1)
   - ✅ dev-team@rougecardinal.com (P0 + P1)

**Unsubscribe from:**

- ❌ Every new issue (trop de bruit)
- ❌ Workflow notifications (non critique)

**Format des emails :**

Les emails Sentry incluent :

- Titre de l'erreur
- Stack trace minimale
- Lien direct vers l'issue
- Nombre d'occurrences
- Users affectés

---

### 3. Issue Ownership (Auto-assignment)

>**Settings → Ownership Rules**

Créez un fichier `.github/CODEOWNERS` dans votre repo :

```bash
# Backend errors
/lib/dal/**          @backend-team
/lib/actions/**      @backend-team

# Frontend errors
/components/**       @frontend-team
/app/**             @frontend-team

# Database
/supabase/**        @database-team
```

Puis dans Sentry :

1. **Settings → Issue Owners → Ownership Rules**
2. Sync with `CODEOWNERS`
3. Enable **Auto-assignment**

---

## 🧪 Test des Alertes

### 1. Test Alert Rule

Dans le dashboard Sentry :

1. Allez dans **Alerts → Alert Rules**
2. Sélectionnez votre alerte P0
3. Click **...** → **Send Test**
4. Vérifiez réception dans vos emails configurés

### 2. Test avec Erreur Réelle

```bash
# Dans votre terminal (dev)
curl http://localhost:3000/api/test-error
```

Créez l'endpoint de test :

```typescript
// app/api/test-error/route.ts
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  // Simulate critical error
  Sentry.captureException(new Error('[TEST] Alert configuration test'))
  
  return Response.json({ 
    status: 'error_sent',
    message: 'Check Sentry dashboard and Slack' 
  })
}
```

### 3. Vérification

✅ Checklist :

- [ ] Erreur visible dans Sentry dashboard
- [ ] Email P0 reçu sur critical-alerts@rougecardinal.com
- [ ] Email P0 reçu sur dev-team@rougecardinal.com
- [ ] Issue auto-assignée (si ownership activé)

---

## 📊 Métriques à Monitorer

### Dashboard Custom (Optionnel)

>**Settings → Dashboards → Create Dashboard**

**Widgets recommandés :**

1. **Error Rate**
   - Type: Line chart
   - Metric: `count()`
   - Group by: `error.type`

2. **Affected Users**
   - Type: Number
   - Metric: `count_unique(user)`

3. **Top 5 Errors**
   - Type: Table
   - Metric: `count()`
   - Group by: `error.value`

4. **Browser Breakdown**
   - Type: Pie chart
   - Metric: `count()`
   - Group by: `browser.name`

5. **Response Time (p95)**
   - Type: Line chart
   - Metric: `p95(transaction.duration)`

---

## 🔧 Configuration Avancée

### 1. Ignorer Erreurs Connues

>**Settings → Inbound Filters**

Filtres recommandés :

- ✅ Filter browser extensions errors
- ✅ Filter localhost errors
- ✅ Filter legacy browsers errors

**Custom filters** (dans `sentry.client.config.ts`) :

```typescript
beforeSend(event, hint) {
  // Ignore Next.js Turbopack known bug
  if (event.exception?.values?.[0]?.value?.includes('transformAlgorithm')) {
    return null;
  }
  
  // Ignore ResizeObserver loop errors
  if (event.message?.includes('ResizeObserver loop')) {
    return null;
  }
  
  return event;
}
```

### 2. Release Tracking

>**Settings → Releases**
>
>**Prérequis: Configurer SENTRY_AUTH_TOKEN dans GitHub**

1. **Générer le token dans Sentry**:
   - Connectez-vous à https://none-a26.sentry.io/
   - Allez dans **Settings → Auth Tokens**
   - Click **Create New Token**
   - Nom: `GitHub Actions Deploy`
   - Scopes: `project:releases`, `org:read`
   - Organization: `none-a26`
   - Click **Create Token** et **copiez-le immédiatement**

2. **Ajouter le secret dans GitHub**:
   - Allez dans votre dépôt GitHub
   - **Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   - Name: `SENTRY_AUTH_TOKEN`
   - Value: Collez le token Sentry
   - Click **Add secret**

3. **Utilisez le secret dans votre workflow CI/CD**:

Ajoutez dans `.github/workflows/deploy.yml` :

```yaml
- name: Create Sentry Release
  uses: getsentry/action-release@v1
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: none-a26
    SENTRY_PROJECT: rouge-cardinal-test
  with:
    environment: production
    version: ${{ github.sha }}
```

**Validation**: Le workflow ne devrait plus afficher "Context access might be invalid: SENTRY_AUTH_TOKEN"

### 3. Performance Monitoring

>**Settings → Performance**

**Thresholds recommandés :**

- Page Load (LCP): < 2.5s
- Interaction (FID): < 100ms
- Visual Stability (CLS): < 0.1

---

## 📱 Canaux de Notification

### Ordre de Priorité

| Priorité | Canal | Temps Réponse |
| ---------- | ------- | --------------- |
| P0 | Email critique (critical-alerts@) | < 15 min |
| P1 | Email monitoring (monitoring@) | < 2 heures |
| P2 | Email digest quotidien | Quotidien |

### Escalation

Si non résolu après :

- **30 min** → Escalade au lead technique
- **2 heures** → Escalade au CTO
- **4 heures** → Incident majeur (all-hands)

---

## 🎓 Bonnes Pratiques

### 1. Alert Fatigue (Éviter la Surcharge)

❌ **Mauvais :**

```bash
Alert: New error detected
Alert: New error detected
Alert: New error detected
(toutes les 30 secondes)
```

✅ **Bon :**

```bash
Alert: High error rate (10 errors/min)
(une seule alerte groupée)
```

### 2. Contexte dans les Alertes

Incluez toujours :

- Environnement (prod/staging)
- User ID (si disponible)
- URL concernée
- Stack trace minimale

### 3. Résolution Rapide

Dans Sentry dashboard :

- **Resolve** → Erreur corrigée
- **Ignore** → Erreur connue, non critique
- **Merge** → Dupliquer d'une autre issue

---

## 📚 Ressources

- [Sentry Alerts Documentation](https://docs.sentry.io/product/alerts/)
- [Email Notifications](https://docs.sentry.io/product/alerts/notifications/)
- [Ownership Rules](https://docs.sentry.io/product/issues/ownership-rules/)

---

## ✅ Checklist de Validation

Phase 3 complète quand :

- [ ] Alert Rule P0 configurée (>10 errors/min)
- [ ] Alert Rule P1 configurée (>50 errors/hour)
- [ ] Email notifications P0 configurées (critical-alerts@ + dev-team@)
- [ ] Email notifications P1 configurées (monitoring@ + dev-team@)
- [ ] Test alert envoyé et emails reçus
- [ ] Ownership rules définies
- [ ] Dashboard custom créé
- [ ] Filters configurés pour erreurs connues
- [ ] Documentation équipe mise à jour

---

**Next:** Testez le runbook avec un incident simulé → `doc/sentry/incident-response-runbook.md`
