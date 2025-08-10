# Cahier des Charges – Création de site internet  

**Compagnie de Théâtre « Rouge Cardinal »**  
Date : juin 2025

---

## Table des matières

- [1. Présentation](#1-pr%C3%A9sentation)
- [2. Public cible](#2-public-cible)
- [3. Objectifs fonctionnels](#3-objectifs-fonctionnels)
- [4. Architecture technique & choix technologiques](#4-architecture-technique--choix-technologiques)
- [5. Architecture Backend Détaillée](#5-architecture-backend-d%C3%A9taill%C3%A9e)
- [6. Structure de Base de Données](#6-structure-de-base-de-donn%C3%A9es)
- [7. Sécurité et Conformité](#7-s%C3%A9curit%C3%A9-et-conformit%C3%A9)
- [8. Performance et Monitoring](#8-performance-et-monitoring)
- [9. API et Intégrations](#9-api-et-int%C3%A9grations)
- [10. User Stories Complètes](#10-user-stories-compl%C3%A8tes)
- [11. Livrables et Formation](#11-livrables-et-formation)
- [12. Compétences Requises du Prestataire](#12-comp%C3%A9tences-requises-du-prestataire)
- [13. Planning et Jalons](#13-planning-et-jalons)
- [14. Critères d'Acceptance](#14-crit%C3%A8res-dacceptance)
- [15. Annexes](#15-annexes)

## 1. Présentation

### 1.1. Coordonnées

- **Compagnie :** Rouge Cardinal  
- **Forme juridique :** Association loi 1901  
- **Siège social :** [Adresse complète]  
- **Contact projet :** [Prénom Nom], Président / Responsable communication  
- **Téléphone :** [Numéro]  
- **Email :** [adresse.email@rougecardinal.fr]

### 1.2. Description de l'établissement

Association à but non lucratif dédiée à la création et à la diffusion de projets culturels (spectacles de théâtre, expositions photographiques). Soutenue par des subventions et mécénats.

### 1.3. Contexte et objectifs

- Offrir une vitrine professionnelle  
- Valoriser les productions passées et en cours  
- Faciliter les demandes de subventions et partenariats  
- Exploiter Google Ad Grants pour accroître le trafic  

### 1.4. Références

- Logo (SVG) : rougecardinal_logo.svg
- RGAA (accessibilité)  
- Guide SEO Google (mai 2025)
- Charte graphique
- Mood board

---

## 2. Public cible

- Grand public (amateurs de théâtre et photographie)  
- Institutions culturelles, salles de spectacle  
- Presse spécialisée  
- Mécènes, donateurs, adhérents et bénévoles

---

## 3. Objectifs fonctionnels

1. Présenter la compagnie et son identité  
2. Mettre en avant spectacles et expositions (actuels et passés)  
3. Gérer un agenda interactif d'événements  
4. Centraliser la presse (communiqués, revues)  
5. Permettre une mise à jour autonome via un back-office sécurisé  
6. Optimiser le SEO et préparer Google Ad Grants
7. Gérer la newsletter et les contacts
8. Fournir un espace presse professionnel

---

## 4. Architecture technique & choix technologiques

| Élément               | Technologie retenue                               |
|-----------------------|---------------------------------------------------|
| **Frontend**          | Next.js 14 + Tailwind CSS + TypeScript           |
| **Backend**           | Supabase (PostgreSQL + Auth + API + Storage)     |
| **Back-office**       | Next.js Admin + Supabase Auth & RLS              |
| **Hébergement**       | Vercel (CI/CD, CDN, SSL)                         |
| **Cache**             | Redis (requêtes fréquentes)                      |
| **Stockage**          | Supabase Storage (images, PDF, vidéos)           |
| **Domaine**           | <www.rougecardinal.fr> (à configurer)              |
| **Analytics**         | Google Analytics / Matomo                        |
| **Email**             | Service externe (Mailchimp/Sendinblue)           |

### 4.1. Environnements

- Dev local (localhost + Supabase CLI)  
- Staging (preview Vercel)  
- Prod (rouge-cardinal.fr)

### 4.2. Exigences non-fonctionnelles

- **Mobile-First** : expérience optimale sur smartphones/tablettes.  
- **Performance** : < 3 s de chargement, lazy-loading, compression, cache Redis.  
- **SEO & Accessibilité** : meta-tags dynamiques, schéma événementiel, sitemap automatique, RGAA.  
- **Sécurité** : HTTPS, JWT, RLS, rate-limiting, cookies sécurisés, protection XSS/CSRF.  
- **RGPD** : double opt-in, droit à l'oubli, mentions légales visibles.  
- **Analytique** : Google Analytics / Matomo + statistiques internes.
- **Disponibilité** : SLA 99,9% uptime, monitoring en temps réel.

### 4.3. UI et Design – Tendances 2024

- Typographie audacieuse (titres XXL)  
- Esthétique minimaliste (espaces blancs)  
- Micro-interactions & animations subtiles  
- Mode sombre optionnel  
- Illustrations personnalisées (théâtre)

### 4.4. Capacités de billetterie & médias

- **Pages Productions** : synopsis, bande‑annonce, distribution, galerie HD.  
- **Billetterie** : lien vers plateforme externe, download billet  
- **Fichier .ics** : export calendrier pour ajout personnel  
- **Médiathèque** : photos HD, vidéos, documents presse

---

## 5. Architecture Backend Détaillée

### 5.1. Authentification et Autorisation

- **Supabase Auth** : JWT avec refresh tokens
- **Rôles** : `admin` (toutes permissions) et `editor` (contenu uniquement)
- **RLS** : Row Level Security sur toutes les tables sensibles
- **Sécurité** : Protection contre force brute, IDOR, sessions sécurisées
- **Middleware** : Vérification des droits par endpoint

### 5.2. Gestion de Contenu (CMS)

#### 5.2.1. Spectacles et Productions

- CRUD complet avec validation stricte
- Statuts : "À l'affiche", "Archives"
- Relations : équipe, dates, lieux, médias
- Upload et gestion des visuels
- Filtrage par année, type, statut
- Historique des modifications

#### 5.2.2. Agenda et Événements  

- CRUD événements avec types multiples
- Gestion des récurrences
- Association événement-spectacle
- Export iCal pour intégration calendrier
- Liens billetterie externes

#### 5.2.3. Présentation Compagnie

- Contenu éditorial (histoire, mission, valeurs)
- Gestion équipe (membres, photos, biographies)
- Timeline des étapes importantes
- Partenaires avec logos et liens
- Versioning du contenu

#### 5.2.4. Espace Presse

- CRUD communiqués de presse
- Upload documents PDF téléchargeables
- Revue de presse (articles, liens, médias)
- Médiathèque professionnelle (photos HD, vidéos)
- Gestion contacts presse
- Catégorisation et indexation

### 5.3. Gestion des Médias

- **Supabase Storage** : upload sécurisé multi-formats
- **Optimisation** : redimensionnement et compression automatiques
- **CDN** : diffusion optimisée avec cache intelligent
- **Organisation** : structure hiérarchique par dossiers
- **Nettoyage** : suppression automatique des fichiers orphelins
- **Sécurité** : URLs signées pour contenus sensibles

### 5.4. Communication

#### 5.4.1. Formulaire de Contact

- API sécurisée avec validation complète
- Protection antispam (CAPTCHA, rate limiting)
- Templates d'emails personnalisables
- Accusé de réception automatique
- Stockage avec statuts de traitement
- Notifications admin par email

#### 5.4.2. Newsletter

- Double opt-in obligatoire (RGPD)
- Gestion complète des abonnés
- Segmentation des listes
- Export pour campagnes (CSV, API)
- Statistiques d'abonnement
- Droit à l'oubli

### 5.5. SEO et Référencement

- **Technique** : sitemap.xml automatique, meta-tags dynamiques
- **Schema.org** : Organisation, Event, CreativeWork
- **Social** : Open Graph, Twitter Cards
- **Analytics** : intégration GA/Matomo + statistiques internes
- **Performance** : monitoring et rapports

---

## 6. Structure de Base de Données

### 6.1. Tables Principales

| Table | Description | Champs principaux |
|-------|-------------|-------------------|
| `users` | Utilisateurs admin/editor | id, email, role, created_at |
| `spectacles` | Productions théâtrales | id, title, synopsis, status, year |
| `events` | Agenda complet | id, title, date, type, spectacle_id |
| `articles` | Communiqués de presse | id, title, content, published_at |
| `media` | Fichiers et images | id, filename, type, url, metadata |
| `newsletter_subscribers` | Abonnés newsletter | id, email, confirmed_at, active |
| `contact_messages` | Messages de contact | id, name, email, message, status |
| `admin_logs` | Logs d'audit | id, user_id, action, table_name, timestamp |
| `company_content` | Contenu de présentation | id, section, content, version |
| `team_members` | Équipe de la compagnie | id, name, role, bio, photo_url |

### 6.2. Relations et Contraintes

- Clés étrangères avec contraintes d'intégrité
- Index optimisés pour les performances
- Triggers pour audit automatique
- Contraintes de validation des données

---

## 7. Sécurité et Conformité

### 7.1. Sécurité Technique

- **Validation** : sanitisation anti-XSS sur toutes les entrées
- **Protection** : CSRF, rate limiting par IP et utilisateur
- **Cookies** : HttpOnly, Secure, SameSite
- **Monitoring** : détection d'intrusion, scans de vulnérabilités
- **Backup** : sauvegardes chiffrées régulières

Pour garantir la sécurité du site et éviter les failles les plus courantes (IDOR, Open Redirect, XSS…), appliquer systématiquement la checklist suivante :

- ✅ Toutes les routes authentifiées sont protégées côté backend (contrôle d’accès strict, prévention IDOR).
- ✅ Ownership / droits d’accès bien vérifiés sur chaque ressource (aucun accès à une ressource qui n’appartient pas à l’utilisateur connecté).
- ✅ Pas de redirections externes non contrôlées (protection contre l’Open Redirect : n’autoriser que des URLs internes ou whitelist stricte pour les domaines externes).
- ✅ Inputs utilisateurs validés et/ou sanitized côté backend (prévention XSS, injections, etc.).
- ✅ Pas d’utilisation de `dangerouslySetInnerHTML` sans sanitation stricte (XSS).
- ✅ Les tokens JWT sont toujours vérifiés côté backend (signature, expiration, etc.).
- ✅ Les erreurs ne révèlent jamais d’informations sensibles en production.
- ✅ Les logs sont sécurisés et ne contiennent pas de données confidentielles.
- ✅ Les dépendances sont à jour et vérifiées contre les CVE connues.

> **Rappel** : IDOR (Insecure Direct Object Reference), Open Redirect et XSS sont parmi les failles les plus critiques du web. Leur prévention repose sur la rigueur du contrôle d’accès, la validation/sanitation des entrées, et la gestion stricte des redirections.

### 7.2. Conformité RGPD

- Consentement explicite pour newsletter
- Droit à l'oubli complet
- Export des données personnelles
- Pseudonymisation des logs
- Notification des violations
- Plan de continuité des données
- Collecte minimale des données personnelles.
- Anonymisation des données sensibles.
- Fonctionnalités pour droits d'accès, rectification, suppression.
- Procédure de notification en cas de violation (alerte utilisateurs & CNIL).

---

## 8. Performance et Monitoring

### 8.1. Optimisation

- **Cache Redis** : requêtes fréquentes
- **Pagination** : listes longues
- **Compression** : réponses API
- **Pool connexions** : base de données optimisée
- **Lazy loading** : relations et médias

### 8.2. Monitoring

- Health checks des services
- Métriques de performance temps réel
- Alertes automatiques en cas de surcharge
- Logging structuré avec niveaux
- Dashboard de supervision

---

## 9. API et Intégrations

### 9.1. API REST

- Documentation OpenAPI complète
- Versioning des endpoints (/api/v1/)
- Format JSON standardisé
- Codes d'erreur cohérents
- Pagination standard (limit/offset)

### 9.2. Intégrations Externes

- **Google Ad Grants** : préparation SEO
- **Réseaux sociaux** : partage automatique
- **Services emailing** : Mailchimp/Sendinblue
- **Analytics** : Google Analytics, Matomo
- **Billetterie** : liens vers plateformes externes

---

## 10. User Stories Complètes

### 10.1. Présentation de la compagnie

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Presentation-01 | Visiteur | Lire la page "La compagnie" avec histoire, mission, équipe | Comprendre l'identité et les valeurs |
| Presentation-02 | Admin | Modifier le contenu de présentation via le back-office | Maintenir les informations à jour |
| Presentation-03 | Admin | Gérer les membres de l'équipe (CRUD) | Présenter l'équipe actuelle |

### 10.2. Page d'Accueil

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Accueil-01 | Visiteur | Voir une bannière dynamique avec logo et menu | Impression engageante |
| Accueil-02 | Visiteur | Voir une animation de qualité (pas un carrousel) | Créer une ambiance immersive |
| Accueil-03 | Visiteur | Afficher les dernières actus/événements automatiquement | Rester informé |
| Accueil-04 | Visiteur | Lire un court paragraphe de présentation | Comprendre rapidement la mission |
| Accueil-05 | Visiteur | Accéder aux liens des réseaux sociaux | Engagement social |
| Accueil-06 | Visiteur | Voir mentions légales, RGPD et plan du site | Conformité juridique |

### 10.3. Spectacles / Productions

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Spectacles-01 | Visiteur | Voir les spectacles "À l'affiche" (image+titre) | Découvrir créations en cours |
| Spectacles-02 | Visiteur | Consulter la fiche complète d'une production | Décision de réservation |
| Spectacles-03 | Visiteur | Parcourir les archives avec filtres avancés | Explorer l'historique |
| Spectacles-04 | Visiteur | Cliquer sur "Voir l'agenda" depuis une fiche | Accéder aux dates |
| Spectacles-05 | Admin | Gérer CRUD des productions avec upload de médias | Maintenir la base à jour |
| Spectacles-06 | Admin | Voir l'historique des modifications | Traçabilité des changements |

### 10.4. Agenda

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Agenda-01 | Visiteur | Voir un calendrier interactif responsive | Planifier ma venue |
| Agenda-02 | Visiteur | Filtrer par type d'événement | Rapidité d'accès |
| Agenda-03 | Visiteur | Télécharger fichier .ics pour ajout à mon calendrier | Intégration personnelle |
| Agenda-04 | Visiteur | Accéder aux liens billetterie externes | Acheter mes billets |
| Agenda-05 | Admin | Gérer CRUD des événements avec récurrence | Mise à jour autonome |

### 10.5. Presse

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Presse-01 | Visiteur | Télécharger les communiqués de presse (PDF) | Accès aux documents officiels |
| Presse-02 | Visiteur | Parcourir revues de presse (articles, vidéos) | Connaître retours médias |
| Presse-03 | Journaliste | Accéder à la médiathèque HD | Illustrer mes articles |
| Presse-04 | Admin | Gérer CRUD des communiqués et revues | Centraliser gestion presse |
| Presse-05 | Admin | Uploader et organiser la médiathèque | Organisation des ressources |

### 10.6. Contact & Newsletter

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Contact-01 | Visiteur | Remplir un formulaire sécurisé | Poser une question |
| Contact-02 | Visiteur | Recevoir un accusé de réception automatique | Confirmation de prise en compte |
| Contact-03 | Admin | Consulter et traiter les messages reçus | Gérer les demandes |
| Newsletter-01 | Visiteur | M'inscrire avec double opt-in (RGPD) | Recevoir la newsletter |
| Newsletter-02 | Abonné | Me désinscrire facilement | Exercer mon droit |
| Newsletter-03 | Admin | Exporter liste des abonnés (CSV) | Gérer campagnes email |
| Newsletter-04 | Admin | Voir statistiques d'abonnement | Mesurer l'engagement |

### 10.7. Back-office Avancé

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| BO-01 | Administrateur | Me connecter avec authentification sécurisée | Sécuriser l'accès |
| BO-02 | Administrateur | Voir un dashboard avec statistiques | Vue d'ensemble |
| BO-03 | Éditeur | CRUD Spectacles, événements, presse via interface intuitive | Autonomie |
| BO-04 | Éditeur | Uploader et gérer médias avec prévisualisation | Organisation |
| BO-05 | Administrateur | Gérer rôles utilisateurs (admin/editor) | Contrôle d'accès |
| BO-06 | Administrateur | Consulter logs d'audit détaillés | Traçabilité |
| BO-07 | Administrateur | Recevoir alertes de sécurité | Monitoring |
| BO-08 | Utilisateur | Bénéficier d'une interface responsive | Mobilité |
| BO-09 | Administrateur| Choisir d'afficher ou non la section "A la Une" sur Page d'Accueil | Pouvoir mettre en avant ou pas les prochains évènements |

---

## 11. Livrables et Formation

### 11.1. Livrables Techniques

- Site fonctionnel sur rougecardinal.fr  
- Back-office sécurisé et documenté  
- API REST documentée (OpenAPI)
- Tests automatisés (unitaires + intégration)
- Scripts de migration et seeders
- Documentation technique complète
- Schéma de base de données

### 11.2. Livrables Utilisateur

- Guide utilisateur back-office (PDF)
- Guide d'administration système
- Procédures de sauvegarde et restauration
- Plan de continuité d'activité

### 11.3. Formation

- Formation back-office : 2 sessions de 2h
- Formation administration : 1 session de 2h
- Support à vie post-livraison

---

## 12. Compétences Requises du Prestataire

### 12.1. Frontend

- Next.js 14, Tailwind CSS, TypeScript
- UI/UX responsive mobile-first
- Optimisation performance et SEO
- Accessibilité RGAA

### 12.2. Backend

- Supabase (Auth, RLS, Storage, Functions)
- PostgreSQL avancé
- Redis pour cache
- Sécurité web et RGPD

### 12.3. DevOps

- Vercel CI/CD
- Monitoring et alertes
- Sauvegardes automatisées
- Environnements multiples

### 12.4. Spécialisations

- Google Ad Grants et SEO technique
- Intégrations tierces (email, analytics)
- Performance et optimisation
- Audit de sécurité

---

## 13. Planning et Jalons

### 13.1. Phase 1 - Architecture (2 semaines)

- Setup environnements
- Architecture base de données
- Configuration Supabase
- Authentification et RLS

### 13.2. Phase 2 - Backend API (3 semaines)

- APIs CRUD complètes
- Gestion des médias
- Système de logs
- Tests unitaires

### 13.3. Phase 3 - Frontend Public (3 semaines)

- Pages publiques responsive
- Intégration APIs
- SEO et performance
- Tests d'intégration

### 13.4. Phase 4 - Back-office (2 semaines)

- Interface d'administration
- Dashboard et statistiques
- Gestion des droits
- Tests utilisateur

### 13.5. Phase 5 - Finalisation (1 semaine)

- Tests complets
- Documentation
- Formation
- Mise en production

---

## 14. Critères d'Acceptance

### 14.1. Performance

- Temps de chargement < 3s
- Score Lighthouse > 90
- Fonctionnement sur mobile/tablette/desktop

### 14.2. Sécurité

- Tests de pénétration réussis
- Conformité RGPD validée
- Audit sécurité positif

### 14.3. Fonctionnel

- Toutes les user stories validées
- Back-office opérationnel
- Formation équipe réalisée

### 14.4. Technique

- Tests automatisés à 90% de couverture
- Documentation complète
- CI/CD fonctionnel

---

## 15. Annexes

- **Sites inspirants :**
  - [[Frontend](https://superlative-malabi-5d871b.netlify.app/)]
  - [[Exemple NExt/supabase](https://github.com/YanBerdin/supabase-next-template)]
- **Documents :** Logo SVG, charte graphique, Moodboard
- **Architecture technique :** Schémas détaillés
- **Spécifications API :** Documentation OpenAPI
