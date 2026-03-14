# Plan de Test Complet — Rouge Cardinal Company

> **Version** : 1.0  
> **Date** : Juillet 2025  
> **Application** : Site web de la Compagnie Rouge Cardinal  
> **Stack** : Next.js 16 + Supabase + shadcn/ui + Tailwind CSS  
> **URL de test** : `http://localhost:3000`  
> **Auteur** : GitHub Copilot — Mode Playwright Test Planner

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Prérequis et environnement](#2-prérequis-et-environnement)
3. [Pages publiques (Marketing)](#3-pages-publiques-marketing)
4. [Formulaire de contact](#4-formulaire-de-contact)
5. [Newsletter](#5-newsletter)
6. [Authentification](#6-authentification)
7. [Admin — Tableau de bord](#7-admin--tableau-de-bord)
8. [Admin — Équipe](#8-admin--équipe)
9. [Admin — Spectacles](#9-admin--spectacles)
10. [Admin — Agenda (Événements)](#10-admin--agenda-événements)
11. [Admin — Lieux](#11-admin--lieux)
12. [Admin — Presse](#12-admin--presse)
13. [Admin — Compagnie](#13-admin--compagnie)
14. [Admin — Médiathèque (Media)](#14-admin--médiathèque-media)
15. [Admin — Accueil / Hero Slides](#15-admin--accueil--hero-slides)
16. [Admin — Accueil / La compagnie (Chiffres clés)](#16-admin--accueil--la-compagnie-chiffres-clés)
17. [Admin — Accueil / Partenaires](#17-admin--accueil--partenaires)
18. [Admin — Affichage Sections (Site Config)](#18-admin--affichage-sections-site-config)
19. [Admin — Audit Logs](#19-admin--audit-logs)
20. [Admin — Analytics](#20-admin--analytics)
21. [Tests transversaux](#21-tests-transversaux)
22. [Annexe — Priorités et conventions](#22-annexe--priorités-et-conventions)

---

## 1. Vue d'ensemble

Ce plan de test couvre l'intégralité du site web de la Compagnie Rouge Cardinal, un site vitrine avec une interface d'administration complète. Il est organisé par zone fonctionnelle et inclut des scénarios de parcours normal (happy path), des cas limites, et des tests de validation d'erreurs.

**Zones fonctionnelles identifiées :**

| Zone | Pages | Type |
| ------ | ------- | ------ |
| Pages publiques | 6 pages (Accueil, Spectacles, Compagnie, Agenda, Contact, Presse) | Marketing |
| Authentification | 4 pages (Login, Sign-up, Forgot password, Update password) | Auth |
| Administration | 16+ sections (Dashboard, Team, Spectacles, Agenda, Lieux, Presse, Compagnie, Media, Hero, About, Partners, Site Config, Audit Logs, Analytics, Users, Settings) | Admin |

---

## 2. Prérequis et environnement

### Comptes de test

| Rôle | Email | Mot de passe | `app_metadata.role` |
| ------ | ------- | ------------- | -------------------- |
| Admin | `<ADMIN_TEST_EMAIL>` | `<ADMIN_TEST_PASSWORD>` | `admin` |
| Editor | `<EDITOR_TEST_EMAIL>` | `<EDITOR_TEST_PASSWORD>` | `editor` |
| User | `<USER_TEST_EMAIL>` | `<USER_TEST_PASSWORD>` | `user` |

> **Plan détaillé permissions** : voir [`specs/tests-permissions-et-rôles.md`](tests-permissions-et-rôles.md) pour les ~240 cas de test couvrant les 4 rôles (anon, user, editor, admin) aux niveaux unitaire, DAL, RLS SQL et E2E.

### État initial attendu

- Serveur de développement fonctionnel sur `http://localhost:3000`
- Base de données Supabase locale ou distante accessible
- Données de seed présentes (spectacles, membres d'équipe, etc.)
- Aucune session active avant les tests d'authentification

### Navigateurs cibles

- Chrome (dernière version)
- Firefox (dernière version)
- Safari (dernière version)
- Mobile Chrome / Safari (responsive)

---

## 3. Pages publiques (Marketing)

### 3.1 — Page d'Accueil (`/`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| PUB-HOME-001 | Chargement de la page d'accueil | Aucune session | 1. Naviguer vers `/` | La page se charge sans erreur, le carousel hero est visible | P0 |
| PUB-HOME-002 | Carousel Hero — Navigation automatique | Page d'accueil chargée | 1. Observer le carousel pendant 10s | Les slides défilent automatiquement | P1 |
| PUB-HOME-003 | Carousel Hero — Navigation manuelle | Page d'accueil chargée | 1. Cliquer sur les indicateurs de slide (dots) | Le slide correspondant s'affiche | P1 |
| PUB-HOME-004 | Carousel Hero — Boutons CTA | Page d'accueil chargée | 1. Cliquer sur le bouton CTA du slide actif (ex: "Découvrir le spectacle") | L'utilisateur est redirigé vers la page cible | P1 |
| PUB-HOME-005 | Section "À la une" | Page d'accueil chargée, toggle `home_a_la_une` activé | 1. Scroller jusqu'à la section "À la une" | Les spectacles mis en avant sont affichés | P1 |
| PUB-HOME-006 | Section "La compagnie" (Chiffres clés) | Toggle `home_about` activé | 1. Scroller jusqu'à la section chiffres clés | Les statistiques sont visibles (ex: "50+ Spectacles créés", "25000+ Spectateurs") | P1 |
| PUB-HOME-007 | Section Partenaires | Toggle `home_partners` activé | 1. Scroller jusqu'aux partenaires | Les logos partenaires actifs s'affichent | P1 |
| PUB-HOME-008 | Section Newsletter | Toggle `home_newsletter` activé | 1. Scroller jusqu'au formulaire newsletter | Le formulaire d'inscription newsletter est visible | P2 |
| PUB-HOME-009 | Navigation Header | Page d'accueil chargée | 1. Vérifier la présence du header avec logo et liens de navigation | Le header contient : logo, liens vers Spectacles, Compagnie, Agenda, Presse, Contact | P0 |
| PUB-HOME-010 | Footer | Page d'accueil chargée | 1. Scroller jusqu'au footer | Le footer contient les liens légaux, réseaux sociaux, coordonnées | P1 |
| PUB-HOME-011 | Lien "Aller au contenu principal" (skip link) | Page d'accueil chargée | 1. Appuyer sur Tab au chargement de la page | Un lien "Aller au contenu principal" apparaît et fonctionne | P2 |

### 3.2 — Page Spectacles (`/spectacles`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| PUB-SPEC-001 | Chargement de la liste des spectacles | Aucune | 1. Naviguer vers `/spectacles` | La grille de spectacles se charge, chaque carte affiche image, titre, genre | P0 |
| PUB-SPEC-002 | Accès à la page détail d'un spectacle | Liste chargée | 1. Cliquer sur une carte spectacle | La page `/spectacles/[slug]` s'affiche avec titre, description, image, distribution | P0 |
| PUB-SPEC-003 | Galerie photos du spectacle | Page détail chargée (spectacle avec galerie) | 1. Vérifier la présence d'une galerie photos | Les photos sont affichées, cliquables pour agrandir | P1 |
| PUB-SPEC-004 | Spectacles — Filtrage par genre (si présent) | Liste chargée | 1. Utiliser le filtre de genre s'il existe | La liste est filtrée par genre sélectionné | P2 |
| PUB-SPEC-005 | Spectacle non publié — Accès direct | Connaître un slug de spectacle non publié | 1. Naviguer directement vers `/spectacles/slug-non-publie` | Page 404 ou redirection, le spectacle non publié n'est pas accessible | P1 |

### 3.3 — Page Compagnie (`/compagnie`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| PUB-COMP-001 | Chargement de la page compagnie | Aucune | 1. Naviguer vers `/compagnie` | La page se charge avec les sections (Héro, Histoire, Citation, Mission, Valeurs, Équipe) | P0 |
| PUB-COMP-002 | Section Équipe | Page compagnie chargée | 1. Scroller jusqu'à la section Équipe | Les membres actifs de l'équipe sont affichés avec photo, nom, rôle | P1 |
| PUB-COMP-003 | Sections désactivées | Section admin marquée inactive | 1. Vérifier que la section n'apparaît pas | Les sections désactivées dans l'admin ne sont pas rendues | P1 |

### 3.4 — Page Agenda (`/agenda`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| PUB-AGENDA-001 | Chargement de l'agenda | Aucune | 1. Naviguer vers `/agenda` | La liste des événements à venir s'affiche avec spectacle, date, lieu | P0 |
| PUB-AGENDA-002 | Événements passés | Événements passés en base | 1. Vérifier l'affichage | Les événements passés ne sont pas affichés ou sont dans une section séparée | P1 |
| PUB-AGENDA-003 | Newsletter inline (si toggle activé) | Toggle `agenda_newsletter` activé | 1. Vérifier la présence du formulaire newsletter | Un formulaire d'inscription newsletter est intégré dans la page | P2 |

### 3.5 — Page Presse (`/presse`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| PUB-PRESSE-001 | Chargement de la page presse | Aucune | 1. Naviguer vers `/presse` | La page se charge avec les communiqués de presse publiés | P0 |
| PUB-PRESSE-002 | Section Kit Média | Toggle `media_kit` activé | 1. Vérifier la section Kit Média | La section Kit Média est visible avec les ressources téléchargeables | P1 |
| PUB-PRESSE-003 | Section Articles de presse | Toggle `presse_articles` activé | 1. Vérifier la section communiqués | Les communiqués publiés sont affichés | P1 |
| PUB-PRESSE-004 | Toggle Kit Média désactivé | Toggle `media_kit` à `false` | 1. Naviguer vers `/presse` | La section Kit Média est masquée (titre et contenu absents) | P1 |
| PUB-PRESSE-005 | Toggle Articles presse désactivé | Toggle `presse_articles` à `false` | 1. Naviguer vers `/presse` | La section communiqués est masquée (titre et contenu absents) | P1 |

### 3.6 — Page Contact (`/contact`)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| PUB-CONTACT-001 | Chargement de la page contact | Aucune | 1. Naviguer vers `/contact` | La page affiche le formulaire de contact, les coordonnées, et les contacts spécialisés | P0 |
| PUB-CONTACT-002 | Coordonnées affichées | Page contact chargée | 1. Vérifier le bloc coordonnées | Email, téléphone et adresse postale sont affichés | P1 |
| PUB-CONTACT-003 | Contacts spécialisés | Page contact chargée | 1. Vérifier la section contacts spécialisés | Contacts presse et billetterie sont affichés avec email et téléphone | P1 |

---

## 4. Formulaire de contact

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| CONTACT-001 | Soumission valide | Page `/contact` chargée | 1. Remplir Prénom: "Jean" 2. Remplir Nom: "Dupont" 3. Remplir Email: "jean@test.com" 4. Sélectionner Motif: "Information générale" 5. Remplir Message: "Test message complet" 6. Cocher la case RGPD 7. Cliquer "Envoyer le message" | Toast de succès, formulaire réinitialisé | P0 |
| CONTACT-002 | Bouton désactivé — champs vides | Page `/contact` chargée | 1. Ne remplir aucun champ 2. Observer le bouton "Envoyer le message" | Le bouton est désactivé (grisé, non cliquable) | P0 |
| CONTACT-003 | Validation — Email invalide | Page `/contact` chargée | 1. Remplir tous les champs obligatoires 2. Mettre un email invalide ("pasunmail") 3. Tenter de soumettre | Message d'erreur de validation sur le champ email | P0 |
| CONTACT-004 | Validation — Champs obligatoires manquants | Page `/contact` chargée | 1. Remplir seulement Prénom et Email 2. Tenter de soumettre | Le bouton reste désactivé ou des erreurs de validation s'affichent sur Nom, Motif, Message, RGPD | P0 |
| CONTACT-005 | Validation — Case RGPD non cochée | Tous les champs remplis sauf RGPD | 1. Ne pas cocher la case RGPD 2. Observer le bouton | Le bouton reste désactivé | P1 |
| CONTACT-006 | Champ Téléphone — optionnel | Page `/contact` chargée | 1. Remplir tous les obligatoires sans téléphone 2. Soumettre | La soumission réussit sans téléphone | P1 |
| CONTACT-007 | Motif — Combobox fonctionnel | Page `/contact` chargée | 1. Cliquer sur le champ Motif 2. Observer les options | Un menu déroulant s'affiche avec les options de motif (Information générale, Programmation, Partenariat, Presse, Autre) | P1 |
| CONTACT-008 | Message — Longueur minimale | Page `/contact` chargée | 1. Remplir Message avec "AB" (très court) 2. Soumettre | Erreur de validation si longueur minimale requise | P2 |
| CONTACT-009 | XSS — Injection script | Page `/contact` chargée | 1. Remplir Nom avec `<script>alert('xss')</script>` 2. Soumettre | Le HTML est échappé/nettoyé, pas d'exécution de script | P1 |

---

## 5. Newsletter

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| NEWS-001 | Inscription valide | Formulaire newsletter visible | 1. Saisir email: "test@newsletter.com" 2. Soumettre | Toast de succès "Inscription confirmée" | P0 |
| NEWS-002 | Email invalide | Formulaire newsletter visible | 1. Saisir: "pasunmail" 2. Soumettre | Message d'erreur de validation | P0 |
| NEWS-003 | Email vide | Formulaire newsletter visible | 1. Laisser le champ vide 2. Soumettre | Message d'erreur ou bouton désactivé | P1 |
| NEWS-004 | Double inscription | Email déjà inscrit | 1. Saisir le même email 2. Soumettre | Message approprié (succès ou "déjà inscrit") | P2 |
| NEWS-005 | Présence sur la page Contact | Toggle `contact_newsletter` activé, page `/contact` chargée | 1. Vérifier la section newsletter dans la sidebar | Le formulaire newsletter est affiché | P1 |

---

## 6. Authentification

### 6.1 — Connexion (Login)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| AUTH-LOGIN-001 | Connexion réussie — Admin | Aucune session | 1. Naviguer vers `/auth/login` 2. Saisir email admin 3. Saisir mot de passe 4. Cliquer "Login" | Redirection vers `/admin` (tableau de bord), session créée | P0 |
| AUTH-LOGIN-002 | Connexion échouée — Mauvais mot de passe | Aucune session | 1. Naviguer vers `/auth/login` 2. Saisir email admin 3. Saisir "MauvaisPassword123" 4. Cliquer "Login" | Message d'erreur affiché, pas de redirection | P0 |
| AUTH-LOGIN-003 | Connexion échouée — Email inexistant | Aucune session | 1. Naviguer vers `/auth/login` 2. Saisir "inconnu@test.com" 3. Saisir un mot de passe 4. Cliquer "Login" | Message d'erreur affiché | P0 |
| AUTH-LOGIN-004 | Connexion échouée — Champs vides | Page login | 1. Cliquer "Login" sans remplir les champs | Validation empêche la soumission | P1 |
| AUTH-LOGIN-005 | Lien vers inscription | Page login | 1. Cliquer "Sign up" | Redirection vers `/auth/sign-up` | P2 |
| AUTH-LOGIN-006 | Lien "Forgot your password?" | Page login | 1. Cliquer "Forgot your password?" | Redirection vers `/auth/forgot-password` | P2 |
| AUTH-LOGIN-007 | Persistance de session | Connecté comme admin | 1. Fermer l'onglet 2. Rouvrir le site 3. Naviguer vers `/admin` | La session est toujours active, accès direct au dashboard | P1 |

### 6.2 — Inscription (Sign-up)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| AUTH-SIGNUP-001 | Page inscription — Champs affichés | Aucune session | 1. Naviguer vers `/auth/sign-up` | 3 champs affichés : Email, Password, Repeat Password, bouton "Sign up" | P0 |
| AUTH-SIGNUP-002 | Mots de passe non concordants | Page sign-up | 1. Saisir email valide 2. Saisir password "Test1234!" 3. Saisir repeat: "AutreMotDePasse" 4. Cliquer "Sign up" | Erreur indiquant que les mots de passe ne concordent pas | P0 |
| AUTH-SIGNUP-003 | Mot de passe trop court | Page sign-up | 1. Saisir email valide 2. Saisir password "abc" 3. Même repeat 4. Soumettre | Erreur de validation sur la longueur du mot de passe | P1 |
| AUTH-SIGNUP-004 | Lien vers connexion | Page sign-up | 1. Cliquer "Login" | Redirection vers `/auth/login` | P2 |

### 6.3 — Mot de passe oublié

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| AUTH-FORGOT-001 | Page mot de passe oublié — Champs | Aucune session | 1. Naviguer vers `/auth/forgot-password` | Champ Email et bouton "Send reset email" affichés | P0 |
| AUTH-FORGOT-002 | Soumission email valide | Page forgot-password | 1. Saisir email admin 2. Cliquer "Send reset email" | Message de confirmation "email envoyé" | P1 |
| AUTH-FORGOT-003 | Email invalide | Page forgot-password | 1. Saisir "pasunmail" 2. Soumettre | Erreur de validation | P1 |

### 6.4 — Protection des routes

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| AUTH-PROTECT-001 | Accès admin sans session | Aucune session | 1. Naviguer directement vers `/admin` | Redirection vers `/auth/login` | P0 |
| AUTH-PROTECT-002 | Accès admin/team sans session | Aucune session | 1. Naviguer vers `/admin/team` | Redirection vers `/auth/login` | P0 |
| AUTH-PROTECT-003 | Déconnexion | Connecté comme admin | 1. Cliquer sur le bouton de déconnexion dans le sidebar/header | Session détruite, redirection vers la page publique ou login | P0 |
| AUTH-PROTECT-004 | Accès backoffice éditorial — Editor | Connecté editor | 1. Naviguer vers `/admin` | Dashboard affiché, sidebar filtrée (items éditoriaux uniquement) | P0 |
| AUTH-PROTECT-005 | Accès page admin-only — Editor bloqué | Connecté editor | 1. Naviguer vers `/admin/team` | Redirection vers `/admin` (page non autorisée pour editor) | P0 |
| AUTH-PROTECT-006 | Accès backoffice — User bloqué | Connecté user | 1. Naviguer vers `/admin` | Redirection vers `/` (rôle insuffisant pour le backoffice) | P0 |
| AUTH-PROTECT-007 | Accès page éditoriale — User bloqué | Connecté user | 1. Naviguer vers `/admin/spectacles` | Redirection vers `/` (rôle insuffisant) | P1 |

---

## 7. Admin — Tableau de bord

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-DASH-001 | Chargement du dashboard | Connecté admin | 1. Naviguer vers `/admin` | Le tableau de bord s'affiche avec statistiques (cartes récapitulatives) | P0 |
| ADM-DASH-002 | Navigation sidebar | Dashboard affiché | 1. Vérifier tous les liens du sidebar | Tous les liens de la sidebar fonctionnent : Général (Tableau de bord, Équipe, Utilisateurs), Pages (Spectacles, Agenda, Lieux, Presse, Compagnie, Médiathèque), Accueil (Slides, La compagnie, Partenaires), Autres (Analytics, Affichage Sections, Audit Logs, Paramètres, Debug Auth) | P0 |
| ADM-DASH-003 | Lien "Retour au site publique" | Sidebar | 1. Cliquer sur "Retour au site publique" | Redirection vers `/` (page publique) | P1 |

---

## 8. Admin — Équipe

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-TEAM-001 | Liste des membres | Connecté admin | 1. Naviguer vers `/admin/team` | La liste des membres s'affiche en cartes avec photo, nom, rôle, statut | P0 |
| ADM-TEAM-002 | Ajouter un membre | Page `/admin/team` | 1. Cliquer "Ajouter un membre" 2. Remplir nom, rôle, bio, photo 3. Sauvegarder | Le nouveau membre apparaît dans la liste, toast de succès | P0 |
| ADM-TEAM-003 | Modifier un membre | Page `/admin/team` | 1. Cliquer "Modifier" sur un membre 2. Changer le rôle 3. Sauvegarder | La carte affiche le rôle mis à jour, toast de succès | P0 |
| ADM-TEAM-004 | Désactiver un membre | Page `/admin/team` | 1. Cliquer "Désactiver" sur un membre 2. Confirmer | Le membre disparaît de la liste par défaut | P0 |
| ADM-TEAM-005 | Afficher membres inactifs | Membre(s) désactivé(s) | 1. Activer le toggle "Afficher inactifs" | Les membres inactifs apparaissent avec indicateur visuel | P1 |
| ADM-TEAM-006 | Réactiver un membre | Mode "Afficher inactifs" activé | 1. Cliquer "Activer" sur un membre inactif | Le membre redevient actif | P1 |
| ADM-TEAM-007 | Validation — Nom vide | Formulaire d'ajout ouvert | 1. Laisser le nom vide 2. Tenter de sauvegarder | Erreur de validation, sauvegarde bloquée | P1 |
| ADM-TEAM-008 | Impact public — Membre désactivé masqué | Membre désactivé dans l'admin | 1. Naviguer vers `/compagnie` (section Équipe) | Le membre désactivé n'apparaît pas sur la page publique | P1 |

---

## 9. Admin — Spectacles

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-SPEC-001 | Liste des spectacles | Connecté admin | 1. Naviguer vers `/admin/spectacles` | Table avec colonnes : Titre, Genre, Statut, Durée, Première, Visibilité, Actions | P0 |
| ADM-SPEC-002 | Tri des colonnes | Table affichée | 1. Cliquer sur l'en-tête "Titre" 2. Cliquer à nouveau | Les spectacles sont triés par titre (asc puis desc) | P1 |
| ADM-SPEC-003 | Créer un spectacle | Page `/admin/spectacles` | 1. Cliquer "Nouveau spectacle" 2. Remplir titre, genre, durée, description 3. Sauvegarder | Le spectacle apparaît dans la table | P0 |
| ADM-SPEC-004 | Modifier un spectacle | Table avec spectacles | 1. Cliquer "Éditer" sur un spectacle 2. Modifier le titre 3. Sauvegarder | Le titre est mis à jour dans la table | P0 |
| ADM-SPEC-005 | Supprimer un spectacle | Table avec spectacles | 1. Cliquer "Supprimer" sur un spectacle 2. Confirmer | Le spectacle disparaît de la table, toast de confirmation | P0 |
| ADM-SPEC-006 | Voir le spectacle (prévisualisation) | Table avec spectacles | 1. Cliquer "Voir" sur un spectacle | Ouverture de la page publique du spectacle ou prévisualisation | P1 |
| ADM-SPEC-007 | Galerie photos d'un spectacle | Table avec spectacles | 1. Cliquer "Galerie" sur un spectacle 2. Ajouter une photo 3. Sauvegarder | La photo est ajoutée à la galerie, visible sur la page publique | P1 |
| ADM-SPEC-008 | Validation — Titre vide | Formulaire de création | 1. Laisser le titre vide 2. Sauvegarder | Erreur de validation | P1 |
| ADM-SPEC-009 | Statut et visibilité | Spectacle brouillon | 1. Publier un spectacle 2. Vérifier `/spectacles` | Le spectacle apparaît sur la page publique | P1 |
| ADM-SPEC-010 | 16 spectacles — Pagination/Scroll | 16 spectacles en base | 1. Vérifier que tous sont affichés | Les 16 spectacles sont visibles (pagination ou scroll) | P2 |

---

## 10. Admin — Agenda (Événements)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-AGENDA-001 | Liste des événements | Connecté admin | 1. Naviguer vers `/admin/agenda` | Table avec colonnes : Spectacle, Date, Lieu, Statut, Actions | P0 |
| ADM-AGENDA-002 | Créer un événement | Page `/admin/agenda` | 1. Cliquer "Nouvel Événement" 2. Sélectionner spectacle, date, lieu 3. Sauvegarder | L'événement apparaît dans la table | P0 |
| ADM-AGENDA-003 | Modifier un événement | Table avec événements | 1. Cliquer "Modifier" 2. Changer la date 3. Sauvegarder | La date est mise à jour | P0 |
| ADM-AGENDA-004 | Supprimer un événement | Table avec événements | 1. Cliquer "Supprimer" 2. Confirmer | L'événement disparaît de la table | P0 |
| ADM-AGENDA-005 | Impact public — Nouvel événement visible | Événement créé et publié | 1. Naviguer vers `/agenda` | Le nouvel événement apparaît dans l'agenda public | P1 |
| ADM-AGENDA-006 | Association spectacle-lieu | Formulaire événement | 1. Vérifier les sélecteurs spectacle et lieu | Les spectacles et lieux existants sont proposés dans les listes déroulantes | P1 |

---

## 11. Admin — Lieux

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-LIEU-001 | Liste des lieux | Connecté admin | 1. Naviguer vers `/admin/lieux` | Table avec colonnes : Nom, Ville (CP), Adresse, Capacité, Actions | P0 |
| ADM-LIEU-002 | Créer un lieu | Page `/admin/lieux` | 1. Cliquer "Nouveau Lieu" 2. Remplir nom, ville, code postal, adresse, capacité 3. Sauvegarder | Le lieu apparaît dans la table | P0 |
| ADM-LIEU-003 | Modifier un lieu | Table avec lieux | 1. Cliquer "Modifier" sur un lieu 2. Changer la capacité 3. Sauvegarder | La capacité est mise à jour | P0 |
| ADM-LIEU-004 | Supprimer un lieu | Table avec lieux | 1. Cliquer "Supprimer" 2. Confirmer | Le lieu disparaît de la table | P0 |
| ADM-LIEU-005 | 6+ lieux affichés | Données de seed | 1. Compter les lignes dans la table | Au moins 6 lieux visibles (Centre Culturel Jacques Brel, Maison de la Culture de Grenoble, etc.) | P2 |
| ADM-LIEU-006 | Validation — Nom vide | Formulaire création | 1. Laisser le nom vide 2. Sauvegarder | Erreur de validation | P1 |
| ADM-LIEU-007 | Suppression avec dépendance | Lieu associé à un événement | 1. Tenter de supprimer le lieu | Erreur ou avertissement indiquant la dépendance | P1 |

---

## 12. Admin — Presse

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-PRESSE-001 | Chargement avec 3 onglets | Connecté admin | 1. Naviguer vers `/admin/presse` | 3 onglets visibles : Communiqués, Articles, Contacts | P0 |
| ADM-PRESSE-002 | Liste communiqués | Onglet Communiqués actif | 1. Vérifier la liste | 14 communiqués affichés avec titre, date, statut | P0 |
| ADM-PRESSE-003 | Créer un communiqué | Onglet Communiqués | 1. Cliquer "Nouveau" 2. Remplir titre, contenu, date 3. Sauvegarder | Le communiqué apparaît dans la liste | P0 |
| ADM-PRESSE-004 | Modifier un communiqué | Liste communiqués | 1. Cliquer "Modifier" 2. Modifier le titre 3. Sauvegarder | Le titre est mis à jour | P0 |
| ADM-PRESSE-005 | Prévisualiser un communiqué | Liste communiqués | 1. Cliquer "Prévisualiser" | Aperçu du communiqué tel qu'il apparaîtra publiquement | P1 |
| ADM-PRESSE-006 | Publier/Dépublier un communiqué | Liste communiqués | 1. Cliquer "Dépublier" sur un communiqué publié | Le communiqué passe en brouillon, disparaît de la page publique `/presse` | P0 |
| ADM-PRESSE-007 | Supprimer un communiqué | Liste communiqués | 1. Cliquer "Supprimer" 2. Confirmer | Le communiqué est supprimé de la liste | P1 |
| ADM-PRESSE-008 | Onglet Articles | Page presse admin | 1. Cliquer sur l'onglet "Articles" | La liste des articles de presse s'affiche | P1 |
| ADM-PRESSE-009 | Onglet Contacts | Page presse admin | 1. Cliquer sur l'onglet "Contacts" | La liste des contacts presse s'affiche | P1 |
| ADM-PRESSE-010 | Impact public — Communiqué publié | Communiqué publié | 1. Naviguer vers `/presse` | Le communiqué est visible sur la page publique | P1 |

---

## 13. Admin — Compagnie

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-COMP-001 | Chargement avec 2 onglets | Connecté admin | 1. Naviguer vers `/admin/compagnie` | 2 onglets : Présentation, Valeurs | P0 |
| ADM-COMP-002 | 6 sections de présentation | Onglet Présentation | 1. Vérifier les sections affichées | 6 sections : Héro, Histoire, Citation, Mission, Valeurs, Équipe — chacune avec type, titre, statut Actif | P0 |
| ADM-COMP-003 | Modifier une section | Onglet Présentation | 1. Cliquer "Modifier" sur la section "Histoire" 2. Modifier le contenu 3. Sauvegarder | Le contenu est mis à jour | P0 |
| ADM-COMP-004 | Activer/Désactiver une section | Onglet Présentation | 1. Désactiver la section "Citation" 2. Naviguer vers `/compagnie` | La section Citation n'apparaît plus sur la page publique | P1 |
| ADM-COMP-005 | Lien "Visualiser" | Onglet Présentation | 1. Cliquer "Visualiser" | Redirection vers la prévisualisation de la présentation | P2 |
| ADM-COMP-006 | Onglet Valeurs | Page admin compagnie | 1. Cliquer sur "Valeurs" | La liste des valeurs s'affiche avec options de gestion | P1 |

---

## 14. Admin — Médiathèque (Media)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-MEDIA-001 | Hub médiathèque | Connecté admin | 1. Naviguer vers `/admin/media` | Hub avec 3 sections : Bibliothèque (29 médias), Tags (2 tags), Dossiers (11 dossiers), taille totale (12.7 MB) | P0 |
| ADM-MEDIA-002 | Bibliothèque — Liste des médias | Hub médiathèque | 1. Cliquer sur "Bibliothèque" | Liste/Grille des 29 médias avec vignettes | P0 |
| ADM-MEDIA-003 | Upload d'un fichier image | Section Bibliothèque | 1. Cliquer "Upload" 2. Sélectionner une image JPEG < 10MB 3. Valider | L'image est uploadée, la vignette est générée, le média apparaît dans la liste | P0 |
| ADM-MEDIA-004 | Upload — Fichier trop gros (>10MB) | Section Bibliothèque | 1. Tenter d'uploader un fichier > 10MB | Erreur : fichier trop volumineux | P1 |
| ADM-MEDIA-005 | Upload — Format non supporté | Section Bibliothèque | 1. Tenter d'uploader un fichier .exe | Erreur : format non supporté | P1 |
| ADM-MEDIA-006 | Upload — Vérification magic bytes | Section Bibliothèque | 1. Renommer un .txt en .jpg 2. Tenter l'upload | Erreur : le fichier est rejeté (magic bytes invalides) | P1 |
| ADM-MEDIA-007 | Recherche de médias | Section Bibliothèque | 1. Utiliser la barre de recherche 2. Saisir un nom de fichier | Les résultats correspondent au terme de recherche | P1 |
| ADM-MEDIA-008 | Supprimer un média | Section Bibliothèque | 1. Sélectionner un média 2. Cliquer "Supprimer" 3. Confirmer | Le média est supprimé, vignette retirée | P0 |
| ADM-MEDIA-009 | Gestion des tags | Section Tags | 1. Cliquer sur "Tags" 2. Créer un nouveau tag 3. Assigner à un média | Le tag est créé et assigné | P1 |
| ADM-MEDIA-010 | Gestion des dossiers | Section Dossiers | 1. Cliquer sur "Dossiers" 2. Vérifier les 9 dossiers de base (spectacles, team, press, gallery, hero, about, partners, documents, misc) | Les dossiers sont affichés avec le nombre de médias | P1 |
| ADM-MEDIA-011 | Formats supportés — JPEG, PNG, WebP, AVIF, GIF, SVG, PDF | Section Bibliothèque | 1. Uploader un fichier de chaque format supporté | Chaque format est accepté et affiche correctement | P2 |

---

## 15. Admin — Accueil / Hero Slides

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-HERO-001 | Liste des slides | Connecté admin | 1. Naviguer vers `/admin/home/hero` | 4 slides affichés avec titre, statut (Active/Inactive), description, CTA | P0 |
| ADM-HERO-002 | Ajouter un slide | Page hero slides | 1. Cliquer "Ajouter un slide" 2. Remplir titre, description, CTA, image 3. Sauvegarder | Le nouveau slide apparaît dans la liste | P0 |
| ADM-HERO-003 | Modifier un slide | Page hero slides | 1. Cliquer "Modifier" sur un slide 2. Changer le titre 3. Sauvegarder | Le titre est mis à jour | P0 |
| ADM-HERO-004 | Supprimer un slide | Page hero slides | 1. Cliquer "Supprimer" 2. Confirmer | Le slide disparaît de la liste | P0 |
| ADM-HERO-005 | Drag & drop — Réordonner | Page hero slides | 1. Glisser-déposer un slide vers une nouvelle position | L'ordre est mis à jour, persiste après rechargement | P1 |
| ADM-HERO-006 | Activer/Désactiver un slide | Page hero slides | 1. Désactiver un slide 2. Vérifier la page d'accueil | Le slide désactivé n'apparaît pas dans le carousel public | P1 |
| ADM-HERO-007 | CTA — Lien fonctionnel | Slide avec CTA | 1. Modifier le lien CTA d'un slide 2. Vérifier sur la page publique | Le bouton CTA redirige vers l'URL configurée | P1 |
| ADM-HERO-008 | Impact public — Ordre des slides | Slides réordonnés | 1. Naviguer vers `/` | Les slides apparaissent dans l'ordre défini | P1 |

---

## 16. Admin — Accueil / La compagnie (Chiffres clés)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-ABOUT-001 | Liste des statistiques | Connecté admin | 1. Naviguer vers `/admin/home/about` | 5 statistiques affichées : "50+ Spectacles créés", "25000+ Spectateurs", "15+ Années d'expérience", "7 Prix & distinctions", "100+ Updated Label" | P0 |
| ADM-ABOUT-002 | Ajouter une statistique | Page about | 1. Cliquer "Ajouter une statistique" 2. Remplir label et valeur 3. Sauvegarder | La statistique apparaît dans la liste | P0 |
| ADM-ABOUT-003 | Modifier une statistique | Page about | 1. Cliquer "Modifier" 2. Changer la valeur 3. Sauvegarder | La valeur est mise à jour | P0 |
| ADM-ABOUT-004 | Supprimer une statistique | Page about | 1. Cliquer "Supprimer" 2. Confirmer | La statistique disparaît | P0 |
| ADM-ABOUT-005 | Impact public — Chiffres visibles | Toggle `home_about` activé | 1. Naviguer vers `/` 2. Scroller à la section chiffres | Les statistiques modifiées apparaissent sur la page publique | P1 |

---

## 17. Admin — Accueil / Partenaires

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-PART-001 | Liste des partenaires | Connecté admin | 1. Naviguer vers `/admin/partners` | 4 partenaires affichés avec logo, nom, site web, statut (Actif/Inactif) | P0 |
| ADM-PART-002 | Ajouter un partenaire | Page partenaires | 1. Cliquer "Nouveau partenaire" 2. Remplir nom, logo, site web 3. Sauvegarder | Le partenaire apparaît dans la liste | P0 |
| ADM-PART-003 | Modifier un partenaire | Page partenaires | 1. Cliquer "Modifier" 2. Changer le site web 3. Sauvegarder | L'URL est mise à jour | P0 |
| ADM-PART-004 | Supprimer un partenaire | Page partenaires | 1. Cliquer "Supprimer" 2. Confirmer | Le partenaire disparaît de la liste | P0 |
| ADM-PART-005 | Drag & drop — Réordonner | Page partenaires | 1. Glisser-déposer un partenaire | L'ordre est mis à jour, persiste après rechargement | P1 |
| ADM-PART-006 | Activer/Désactiver un partenaire | Page partenaires | 1. Désactiver un partenaire (ex: "Ville de Paris" déjà Inactif) 2. Vérifier la page d'accueil | Le partenaire Inactif n'apparaît pas sur la page publique | P1 |
| ADM-PART-007 | Impact public — Logos visibles | Toggle `home_partners` activé | 1. Naviguer vers `/` 2. Scroller à la section partenaires | Seuls les partenaires actifs sont affichés avec leurs logos | P1 |

---

## 18. Admin — Affichage Sections (Site Config)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-CONFIG-001 | Liste des toggles | Connecté admin | 1. Naviguer vers `/admin/site-config` | 10 toggles organisés en 4 groupes : Page d'Accueil (6), Page Presse (2), Page Agenda (1), Page Contact (1) | P0 |
| ADM-CONFIG-002 | Désactiver un toggle | Toggle `home_hero` activé | 1. Désactiver le toggle `home_hero` 2. Naviguer vers `/` | La section hero n'apparaît plus sur la page d'accueil | P0 |
| ADM-CONFIG-003 | Réactiver un toggle | Toggle `home_hero` désactivé | 1. Réactiver le toggle 2. Naviguer vers `/` | La section hero réapparaît | P0 |
| ADM-CONFIG-004 | Toggle Page d'Accueil — À la une | Toggle `home_a_la_une` | 1. Désactiver 2. Vérifier `/` 3. Réactiver 4. Vérifier `/` | La section "À la une" est masquée/affichée selon le toggle | P1 |
| ADM-CONFIG-005 | Toggle Page d'Accueil — About | Toggle `home_about` | 1. Désactiver 2. Vérifier `/` | La section chiffres clés est masquée | P1 |
| ADM-CONFIG-006 | Toggle Page d'Accueil — Partenaires | Toggle `home_partners` | 1. Désactiver 2. Vérifier `/` | La section partenaires est masquée | P1 |
| ADM-CONFIG-007 | Toggle Page d'Accueil — Spectacles | Toggle `home_spectacles` | 1. Désactiver 2. Vérifier `/` | La section spectacles est masquée | P1 |
| ADM-CONFIG-008 | Toggle Page d'Accueil — Newsletter | Toggle `home_newsletter` | 1. Désactiver 2. Vérifier `/` | Le formulaire newsletter est masqué sur le home | P1 |
| ADM-CONFIG-009 | Toggle Presse — Kit Média | Toggle `media_kit` | 1. Désactiver 2. Vérifier `/presse` | La section Kit Média est masquée | P1 |
| ADM-CONFIG-010 | Toggle Presse — Articles | Toggle `presse_articles` | 1. Désactiver 2. Vérifier `/presse` | La section communiqués est masquée | P1 |
| ADM-CONFIG-011 | Toggle Agenda — Newsletter | Toggle `agenda_newsletter` | 1. Désactiver 2. Vérifier `/agenda` | Le formulaire newsletter est masqué sur l'agenda | P2 |
| ADM-CONFIG-012 | Toggle Contact — Newsletter | Toggle `contact_newsletter` | 1. Désactiver 2. Vérifier `/contact` | Le formulaire newsletter est masqué sur la page contact | P2 |
| ADM-CONFIG-013 | Persistance après rechargement | Toggle modifié | 1. Modifier un toggle 2. Recharger `/admin/site-config` | L'état du toggle est persisté | P1 |

---

## 19. Admin — Audit Logs

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-AUDIT-001 | Chargement des logs | Connecté admin | 1. Naviguer vers `/admin/audit-logs` | Table avec colonnes : Date, Utilisateur, Action, Table, Record ID, IP | P0 |
| ADM-AUDIT-002 | Données réelles affichées | Logs en base | 1. Vérifier qu'au moins une entrée est présente | Des logs récents apparaissent (ex: UPDATE sur partners) | P0 |
| ADM-AUDIT-003 | Filtre par action | Table logs chargée | 1. Utiliser le combobox filtre action 2. Sélectionner "UPDATE" | Seules les entrées UPDATE sont affichées | P1 |
| ADM-AUDIT-004 | Filtre par table | Table logs chargée | 1. Utiliser le combobox filtre table 2. Sélectionner "partners" | Seules les entrées de la table partners sont affichées | P1 |
| ADM-AUDIT-005 | Recherche textuelle | Table logs chargée | 1. Saisir un terme dans la recherche (ex: "yandev") | Les logs sont filtrés selon le terme | P1 |
| ADM-AUDIT-006 | Période de dates | Table logs chargée | 1. Sélectionner une période avec le sélecteur de dates | Les logs sont filtrés par période | P1 |
| ADM-AUDIT-007 | Tri par date | Table logs chargée | 1. Cliquer sur l'en-tête "Date" | Les logs sont triés chronologiquement | P1 |
| ADM-AUDIT-008 | Tri par action | Table logs chargée | 1. Cliquer sur l'en-tête "Action" | Les logs sont triés par type d'action | P2 |
| ADM-AUDIT-009 | Export CSV | Table logs chargée | 1. Cliquer "Export CSV" | Un fichier CSV est téléchargé contenant les logs filtrés | P1 |
| ADM-AUDIT-010 | Rafraîchir | Table logs chargée | 1. Cliquer "Rafraîchir" | La table se recharge avec les données les plus récentes | P2 |
| ADM-AUDIT-011 | Log généré après action admin | Page admin quelconque | 1. Créer/modifier/supprimer un élément dans une section admin 2. Naviguer vers `/admin/audit-logs` | Un nouveau log correspondant à l'action est présent | P1 |

---

## 20. Admin — Analytics

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| ADM-ANALYTICS-001 | Chargement de la page | Connecté admin | 1. Naviguer vers `/admin/analytics` | La page se charge sans erreur | P0 |
| ADM-ANALYTICS-002 | Contenu affiché (si données) | Données analytics en base | 1. Vérifier le contenu principal | Des graphiques ou statistiques sont affichés | P2 |
| ADM-ANALYTICS-003 | État vide | Aucune donnée analytics | 1. Vérifier l'affichage sans données | Un message d'état vide ou une interface de configuration s'affiche | P2 |

---

## 21. Tests transversaux

### 21.1 — Responsive Design

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| CROSS-RESP-001 | Page d'accueil — Mobile (375px) | Page d'accueil chargée | 1. Réduire le viewport à 375px de largeur | Le contenu est lisible, pas de débordement horizontal, le menu est en hamburger | P0 |
| CROSS-RESP-002 | Page d'accueil — Tablette (768px) | Page d'accueil chargée | 1. Viewport à 768px | La mise en page s'adapte correctement | P1 |
| CROSS-RESP-003 | Admin — Sidebar en mobile | Admin sur viewport 375px | 1. Vérifier la sidebar | La sidebar est rétractable ou en overlay | P1 |
| CROSS-RESP-004 | Formulaire contact — Mobile | Page contact, viewport 375px | 1. Remplir et soumettre le formulaire | Tous les champs sont accessibles et fonctionnels | P1 |
| CROSS-RESP-005 | Tables admin — Mobile | Page spectacles admin, viewport 375px | 1. Vérifier l'affichage de la table | La table utilise un scroll horizontal ou un layout alternatif | P2 |

### 21.2 — Accessibilité (a11y)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| CROSS-A11Y-001 | Skip link | Page d'accueil chargée | 1. Appuyer Tab 2. Vérifier le lien d'évitement | Le lien "Aller au contenu principal" apparaît et fonctionne | P1 |
| CROSS-A11Y-002 | Navigation clavier — Header | Page quelconque | 1. Naviguer au clavier (Tab) dans le header | Tous les liens du header sont atteignables et ont un focus visible | P1 |
| CROSS-A11Y-003 | Formulaire contact — Labels | Page contact | 1. Inspecter les labels avec un lecteur d'écran | Chaque champ a un label associé (`<label>` avec `for`) | P1 |
| CROSS-A11Y-004 | Contraste des textes | Pages publiques | 1. Vérifier le contraste texte/arrière-plan avec un outil (Accessibility Insights) | Ratio ≥ 4.5:1 pour le texte normal, ≥ 3:1 pour le texte large | P1 |
| CROSS-A11Y-005 | Images — Alt text | Pages publiques | 1. Vérifier les images | Les images informatives ont un `alt` descriptif, les décoratives ont `alt=""` | P1 |
| CROSS-A11Y-006 | Navigation clavier — Formulaires admin | Pages admin CRUD | 1. Créer/modifier un élément au clavier uniquement | Toutes les actions sont réalisables sans souris | P2 |
| CROSS-A11Y-007 | Aria-live pour les toasts | Après une action admin | 1. Effectuer une action 2. Vérifier le toast avec un lecteur d'écran | Le toast est annoncé par le lecteur d'écran (role="alert" ou aria-live) | P2 |

### 21.3 — Thème (Dark/Light)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| CROSS-THEME-001 | Basculer le thème | Page d'accueil | 1. Cliquer sur le bouton de changement de thème | Le thème bascule entre clair et sombre sans erreur visuelle | P1 |
| CROSS-THEME-002 | Persistance du thème | Thème sombre activé | 1. Recharger la page | Le thème sombre est conservé | P2 |
| CROSS-THEME-003 | Thème admin | Admin en thème sombre | 1. Naviguer dans les pages admin | Toutes les pages admin sont lisibles en mode sombre | P2 |

### 21.4 — Sécurité (RLS & Permissions)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| CROSS-SEC-001 | Données admin inaccessibles en anon | Aucune session | 1. Tenter d'accéder à l'API admin via `fetch('/api/admin/...')` | Erreur 401/403 ou redirection | P0 |
| CROSS-SEC-002 | RLS — Spectacles non publiés | Aucune session | 1. Requêter directement la table `spectacles` via API publique | Seuls les spectacles publiés sont retournés | P0 |
| CROSS-SEC-003 | RLS — Membres équipe inactifs | Aucune session | 1. Requêter la table `membres_equipe` | Seuls les membres actifs sont retournés | P0 |
| CROSS-SEC-004 | XSS — Injection dans champs admin | Connecté admin | 1. Créer un spectacle avec titre `<img src=x onerror=alert(1)>` 2. Vérifier l'affichage public | Le HTML est échappé, pas d'exécution de script | P0 |
| CROSS-SEC-005 | CSRF — Server Actions | Connecté admin | 1. Vérifier que les mutations passent par Server Actions (POST) | Les actions sont protégées par l'architecture Server Actions de Next.js | P1 |
| CROSS-SEC-006 | RLS — Editor CRUD tables éditoriales | Connecté editor | 1. INSERT/UPDATE/DELETE sur `spectacles`, `evenements`, `media` | Opérations autorisées par RLS (`has_min_role('editor')`) | P0 |
| CROSS-SEC-007 | RLS — Editor bloqué tables admin-only | Connecté editor | 1. INSERT/UPDATE sur `membres_equipe`, `contacts_presse`, `configurations_site` | Opérations refusées par RLS (`is_admin()`) | P0 |
| CROSS-SEC-008 | RLS — User bloqué écriture | Connecté user | 1. INSERT/UPDATE/DELETE sur n'importe quelle table éditoriale ou admin | Toutes les mutations refusées par RLS | P0 |
| CROSS-SEC-009 | Middleware — Résolution rôle JWT | Connecté editor | 1. Vérifier que le middleware lit `app_metadata.role` du JWT 2. Naviguer dans le backoffice | Le rôle est correctement résolu, accès accordé aux routes éditoriales | P1 |
| CROSS-SEC-010 | Middleware — Fallback `user_metadata` | Connecté avec rôle dans `user_metadata` uniquement | 1. Naviguer vers `/admin` | Le middleware utilise le fallback et résout le rôle correctement | P2 |

> **Couverture complète** : voir [`specs/tests-permissions-et-rôles.md`](tests-permissions-et-rôles.md) pour les tests permissions détaillés (unit, DAL, RLS SQL, E2E).

### 21.5 — Performance

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| CROSS-PERF-001 | Temps de chargement — Accueil | Serveur démarré | 1. Mesurer le temps de chargement de `/` | La page charge en moins de 3 secondes | P1 |
| CROSS-PERF-002 | Temps de chargement — Admin | Connecté admin | 1. Mesurer le temps de chargement de `/admin` | Le dashboard charge en moins de 3 secondes | P2 |
| CROSS-PERF-003 | Navigation fluide | Site ouvert | 1. Naviguer entre les pages publiques | Les transitions sont fluides (pas de flash blanc) | P2 |

### 21.6 — Gestion d'erreurs

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| ---- | ---------- | --------------- | -------- | ------------------- | ---------- |
| CROSS-ERR-001 | Page 404 | Aucune | 1. Naviguer vers `/page-inexistante` | Une page 404 s'affiche avec navigation pour revenir | P0 |
| CROSS-ERR-002 | Erreur serveur simulée | Supabase indisponible | 1. Couper la connexion à Supabase 2. Charger une page | Un message d'erreur s'affiche (error boundary), pas de crash blanc | P1 |
| CROSS-ERR-003 | Toast après action échouée | Connecté admin | 1. Simuler une erreur lors d'une mutation | Un toast d'erreur s'affiche avec message explicatif | P1 |

---

## 22. Annexe — Priorités et conventions

### Niveaux de priorité

| Priorité | Description | Critère |
| ---------- | ------------- | --------- |
| **P0** | Bloquant | Fonctionnalité critique — doit fonctionner pour le lancement |
| **P1** | Important | Fonctionnalité significative — à corriger rapidement si cassée |
| **P2** | Normal | Amélioration ou fonctionnalité secondaire |
| **P3** | Bas | Nice-to-have, amélioration future |

### Statistiques du plan

| Métrique | Valeur |
| ---------- | -------- |
| Total de scénarios | 143 |
| Scénarios P0 | 39 |
| Scénarios P1 | 71 |
| Scénarios P2 | 30 |
| Scénarios P3 | 3 |
| Zones couvertes | 22 |

### Conventions de nommage des IDs

- `PUB-*` : Pages publiques
- `CONTACT-*` : Formulaire de contact
- `NEWS-*` : Newsletter
- `AUTH-*` : Authentification
- `ADM-*` : Administration
- `CROSS-*` : Tests transversaux

### Environnement de validation recommandé

- **Automated** : Playwright E2E pour les scénarios P0 et P1
- **Manuel** : Scénarios d'accessibilité, responsive, performance
- **Outils** : Playwright, Accessibility Insights, Lighthouse, Chrome DevTools

---

> **Note** : Ce plan a été construit avec l'accessibilité à l'esprit mais peut contenir des lacunes. Il est recommandé de compléter les tests manuels d'accessibilité avec des outils comme [Accessibility Insights](https://accessibilityinsights.io/).
