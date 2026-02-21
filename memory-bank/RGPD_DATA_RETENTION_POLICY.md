# Politique de Rétention des Données - Rouge Cardinal Company

**Document RGPD - Conformité Article 5.1.e**  
**Dernière mise à jour:** 17 janvier 2026  
**Version:** 1.0

---

## 📋 Vue d'ensemble

Ce document définit les politiques de rétention des données personnelles et système pour Rouge Cardinal Company, conformément au Règlement Général sur la Protection des Données (RGPD) et aux meilleures pratiques de sécurité.

**Principe fondamental (RGPD Art. 5.1.e):**  
> Les données personnelles sont conservées **uniquement pour la durée nécessaire** aux finalités pour lesquelles elles sont traitées.

---

## 🎯 Durées de Rétention par Finalité

### Tableau récapitulatif

| Catégorie de données | Finalité du traitement | Base légale | Durée de rétention | Justification |
| --------------------- | ------------------------ | ------------- | ------------------- | --------------- |
| **Logs d'audit système** | Sécurité et détection d'incidents | Intérêt légitime (Art. 6.1.f) | **90 jours** | Conformité ISO 27001 + détection incidents de sécurité |
| **Désabonnements newsletter** | Respect du droit d'opposition | Obligation légale (Art. 6.1.c) | **90 jours** | Preuve du retrait du consentement + liste d'exclusion |
| **Messages de contact** | Gestion relation client et suivi | Exécution d'un contrat (Art. 6.1.b) | **1 an** | Suivi des conversations + obligation fiscale (Art. L123-22 Code Commerce) |
| **Événements analytics anonymisés** | Amélioration du service | Intérêt légitime (Art. 6.1.f) | **90 jours** | Optimisation UX (données pseudonymisées) |

---

## 🔐 Détail des Politiques de Rétention

### 1. Logs d'Audit Système (`logs_audit`)

**Nature des données:**

- Actions utilisateurs (connexion, modifications)
- Métadonnées système (timestamps, IP, user-agent)
- Contexte de sécurité (tentatives d'accès)

**Finalité:**

- Détection et investigation d'incidents de sécurité
- Audit des accès et modifications
- Conformité réglementaire (traçabilité des opérations)

**Durée de rétention:** 90 jours

**Justification:**

- **Délai suffisant** pour détecter et investiguer la plupart des incidents de sécurité
- **Conformité ISO 27001:** recommandation de conservation logs 3 mois minimum
- **Équilibre RGPD:** limitation de conservation vs besoin légitime de sécurité

**Purge automatique:**

- Basée sur la colonne `expires_at` (calculée automatiquement)
- Fonction: `cleanup_expired_audit_logs()`
- Fréquence: quotidienne (2h00 UTC)

---

### 2. Désabonnements Newsletter (`abonnes_newsletter`)

**Nature des données:**

- Email (donnée personnelle)
- Date de désinscription (`unsubscribed_at`)
- Statut d'abonnement (`subscribed`)

**Finalité:**

- **Conservation de la preuve** du retrait du consentement (opt-out)
- **Liste d'exclusion** pour éviter re-sollicitation accidentelle (intérêt légitime)

**Durée de rétention:** 90 jours après désinscription

**Justification:**

- **CNIL (délibération 2013-370):** recommande conservation preuve opt-out 90 jours minimum
- **Protection contre re-sollicitation:** période de grâce pour synchronisation systèmes
- **RGPD Art. 7.1:** obligation de prouver le consentement (et son retrait)

**Purge automatique:**

- Basée sur `unsubscribed_at` + 90 jours
- Fonction: `cleanup_unsubscribed_newsletter()`
- **Préservation:** Les abonnements ACTIFS (`subscribed = true`) sont conservés indéfiniment
- Fréquence: quotidienne (2h00 UTC)

---

### 3. Messages de Contact (`messages_contact`)

**Nature des données:**

- Nom, email, téléphone (optionnel)
- Contenu du message
- Métadonnées (date, statut traitement)

**Finalité:**

- Gestion des demandes de renseignement
- Suivi de la relation client
- Archivage légal (obligation fiscale)

**Durée de rétention:** 1 an

**Justification:**

- **Code de Commerce Art. L123-22:** conservation documents comptables et commerciaux 1 an minimum
- **Proportionnalité RGPD:** durée raisonnable pour suivi relation client
- **Intérêt légitime:** réponses différées, suivi long-terme des demandes

**Purge automatique:**

- Basée sur `created_at` + 365 jours
- Fonction: `cleanup_old_contact_messages()`
- **Pas d'archivage froid** (suppression définitive par défaut)
- Fréquence: quotidienne (2h00 UTC)

---

### 4. Événements Analytics (`analytics_events`)

**Nature des données:**

- Pages visitées, actions utilisateur
- Métadonnées techniques (user-agent, résolution écran)
- **Données pseudonymisées** (pas d'identifiants personnels directs)

**Finalité:**

- Optimisation de l'expérience utilisateur
- Analyse de performance du site
- Décisions marketing basées sur données agrégées

**Durée de rétention:** 90 jours

**Justification:**

- **Données pseudonymisées:** risque faible sur la vie privée (considération 26 RGPD)
- **Utilité décroissante:** analyses sur fenêtres courtes (tendances récentes)
- **Optimisation base de données:** limite la croissance de données volumineuses

**Purge automatique:**

- Basée sur `created_at` + 90 jours
- Fonction: `cleanup_expired_data('analytics_events')`
- Fréquence: quotidienne (2h00 UTC)

---

## ⚙️ Processus Technique de Purge

### Architecture du système

```bash
┌─────────────────────────────────────────┐
│  Supabase Edge Function                 │
│  (scheduled-cleanup)                    │
│  Déclenchement: Cron quotidien 2h00 UTC │
└──────────────┬──────────────────────────┘
               │
               ├─► cleanup_expired_audit_logs()
               ├─► cleanup_unsubscribed_newsletter()
               ├─► cleanup_old_contact_messages()
               └─► cleanup_expired_data('analytics_events')
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Audit Trail (data_retention_audit)     │
│  Conservation: 1 an (preuve conformité) │
└─────────────────────────────────────────┘
```

### Caractéristiques de sécurité

1. **Automatisation complète:** Aucune intervention manuelle requise
2. **Traçabilité:** Tous les logs de purge enregistrés dans `data_retention_audit`
3. **Sécurité:** Fonctions `SECURITY DEFINER` (bypass RLS, accès système uniquement)
4. **Réversibilité:** Backups PITR Supabase (7 jours) permettent restauration d'urgence
5. **Monitoring:** Vue `data_retention_monitoring` pour supervision admin

### Méthode de suppression

>**Suppression définitive (pas d'archivage par défaut)**

- Les données sont **supprimées de manière permanente** de la base de données principale
- **Aucun archivage "froid"** (S3, cold storage) par défaut
- **Restauration possible** uniquement via backups PITR dans la fenêtre de 7 jours

**Exceptions:**

- Si besoin d'archivage légal spécifique (ex: contentieux), migration manuelle vers système séparé

---

## 👤 Droits des Personnes Concernées

### Droit à l'oubli (Art. 17 RGPD)

**Suppression immédiate sur demande:**

- Les personnes peuvent demander la suppression de leurs données **avant** la fin de la période de rétention
- Contact: **privacy@rougecardinalcompany.fr**
- Délai de traitement: **30 jours maximum** (Art. 12.3 RGPD)

**Procédure:**

1. Demande par email avec justificatif d'identité
2. Vérification identité (protection contre demandes frauduleuses)
3. Suppression manuelle via fonction `delete_user_data(user_email)`
4. Confirmation par email sous 48h

### Droit d'accès (Art. 15 RGPD)

**Export complet des données:**

- Interface admin: Export JSON de toutes les données personnelles
- Délai: **30 jours maximum**
- Format: JSON structuré + explications lisibles

### Droit de rectification (Art. 16 RGPD)

**Correction des données inexactes:**

- Contact: privacy@rougecardinalcompany.fr
- Interface admin pour modification si besoin

---

## 📊 Monitoring et Conformité

### Dashboard Admin

**Vue de monitoring (`data_retention_monitoring`):**

- État de chaque job de purge (dernière exécution, statut)
- Nombre de lignes supprimées par table
- Health status (ok, warning, critical)

**Alertes automatiques:**

- Job non exécuté depuis >48h → Warning
- Job non exécuté depuis >7 jours → Critical
- Échec de purge → Critical

### Audit de conformité

**Logs de purge conservés 1 an:**

- Table `data_retention_audit`
- Preuve RGPD: démonstration active de conformité (Art. 5.2 - accountability)

**Revue annuelle:**

- Analyse des durées de rétention (ajustement si nécessaire)
- Validation des bases légales
- Mise à jour politique si évolution légale

---

## 📚 Références Légales

### Textes applicables

1. **RGPD (Règlement UE 2016/679)**
   - Article 5.1.e: Limitation de la conservation
   - Article 5.2: Responsabilité (accountability)
   - Article 6: Licéité du traitement
   - Article 17: Droit à l'effacement

2. **Code de Commerce français**
   - Article L123-22: Conservation documents comptables (1 an minimum)

3. **CNIL (Commission Nationale Informatique & Libertés)**
   - Délibération 2013-370: Conservation preuve consentement newsletter
   - Guide pratique "Durées de conservation" (2023)

4. **ISO 27001 (Sécurité de l'information)**
   - Section A.12.4.1: Conservation logs d'événements (90 jours recommandé)

### Documentation complémentaire

- Guide CNIL: https://www.cnil.fr/fr/durees-de-conservation
- RGPD texte intégral: https://eur-lex.europa.eu/eli/reg/2016/679/oj

---

## 📝 Historique du Document

| Version | Date | Auteur | Modifications |
| --------- | ------ | -------- | --------------- |
| 1.0 | 17/01/2026 | Équipe technique | Création initiale - implémentation TASK053 |

---

## ✉️ Contact

**Délégué à la Protection des Données (DPO):**  
Email: privacy@rougecardinalcompany.fr

**Support technique:**  
Email: tech@rougecardinalcompany.fr

---

**Dernière révision:** 17 janvier 2026  
**Prochaine révision planifiée:** 17 janvier 2027
