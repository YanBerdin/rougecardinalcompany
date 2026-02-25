# 🧪 Tests d'Intégration Resend

Ce guide explique comment vérifier que l'intégration Resend + Supabase Auth fonctionne correctement.

## 📋 Tests Disponibles

### 1. Test API Endpoint (Principal)

```bash
# Tester via l'API REST - RECOMMANDÉ
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "newsletter",
    "email": "yandevformation@gmail.com"
  }'

# Test contact
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact",
    "contactData": {
      "name": "Test User Name",
      "email": "yandevformation@gmail.com",
      "subject": "Test Subject",
      "message": "Test message"
    }
  }'
```

### 2. Test Rapide (Script Node.js)

```bash
# Test simple avec Node.js - FAIT LES APPELS API RÉELS
pnpm run test:email
```

```bash
# Test simple avec Node.js - FAIT LES APPELS API RÉELS
pnpm run test:email
```

**Résultat attendu :**

- Test newsletter : ❌ Échoue (Resend limite aux emails de test)
- Test contact : ✅ Réussi (envoi à votre email)
- Vérification des logs en base de données

### 4. Test des Webhooks

```bash
# Vérifier la configuration des webhooks Resend
pnpm run test:webhooks
```

**Note :** La clé API standard ne permet pas de gérer les webhooks via API. Configuration manuelle requise.

```bash
# Vérifier les inscriptions newsletter et messages contact
pnpm run test:logs
```

**⚠️ Prérequis :** Vous devez avoir `SUPABASE_SERVICE_ROLE_KEY` (❌ legacy)  ou `SUPABASE_SECRET_KEY` dans votre `.env.local`

```bash
SUPABASE_SECRET_KEY=votre_clé_secrète_ici
# ou pour les anciennes configurations
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_ici
```

#### **Récupérez cette clé dans Supabase Dashboard > Settings > API > service_role > secret**

## ✅ Résultats Attendus

### Test API Endpoint

- **Newsletter** : Email de confirmation envoyé à `yandevformation@gmail.com`
- **Contact** : Email de notification envoyé à l'admin
- **Logs** : Enregistrement dans les tables Supabase appropriées

### Test Script Node.js

- **Console** : Messages de succès pour chaque type d'email
- **Base de données** : Nouvelles entrées dans `abonnes_newsletter` et `messages_contact`

### Vérification Base de Données

- **Newsletter** : Nouvelle ligne dans `abonnes_newsletter` avec l'email test
- **Contact** : Nouvelle ligne dans `messages_contact` avec les données du formulaire

## 🚨 Dépannage

### Emails non reçus

- Vérifiez les variables d'environnement `RESEND_API_KEY`
- Vérifiez les logs de l'application (`pnpm dev`)
- Vérifiez le dashboard Resend pour les erreurs

### Erreurs de compilation TypeScript

```bash
# Vérifier les types
npx tsc --noEmit --pretty
```

### Erreurs d'exécution

- Vérifiez les logs du terminal de développement
- Vérifiez les variables d'environnement
- Testez avec des emails de test (@example.com)

## 📊 Métriques à Surveiller

- **Taux de livraison** : Pourcentage d'emails délivrés
- **Taux d'ouverture** : Pourcentage d'emails ouverts
- **Taux de clic** : Pourcentage de clics sur les liens
- **Taux de plainte** : Pourcentage de signalements spam
- **Taux de rebond** : Pourcentage d'emails rejetés

## 🔧 Configuration Requise

### Variables d'Environnement

```bash
RESEND_API_KEY=your_resend_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
# ou pour les anciennes configurations
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Domaines Vérifiés

Assurez-vous que vos domaines d'envoi sont vérifiés dans Resend :

- Domaines d'envoi (FROM)
- Domaines de tracking (si utilisés)

## 🎯 Checklist de Validation

- [ ] Test API endpoint réussi
- [ ] Test script Node.js réussi
- [ ] Emails reçus dans l'inbox
- [ ] Contenu des emails correct
- [ ] Logs base de données mis à jour
- [ ] Dashboard Resend montre les envois
- [ ] Pas d'erreurs TypeScript
- [ ] Variables d'environnement correctes</content>
<parameter name="filePath">/home/yandev/projets/rougecardinalcompany/TESTING_RESEND.md
