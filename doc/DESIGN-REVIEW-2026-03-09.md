# Design Review — Rouge Cardinal Company

**Date** : 9 mars 2026
**Viewports testés** : Desktop (1280×800), Tablette (768×1024), Mobile (375×812)
**Pages inspectées** : `/` (Accueil), `/compagnie`, `/spectacles`, `/agenda`, `/presse`, `/contact`
**Outil** : Playwright MCP (Chromium) + inspection code source

---

## Résumé exécutif

Le site présente une **architecture CSS/responsive solide** avec des layouts bien structurés sur les trois viewports. Les composants shadcn/ui sont correctement utilisés et les formulaires sont accessibles. **Aucun problème majeur de CSS ou de layout n'a été identifié dans le code source.**

Cependant, **de nombreuses données de test/debug subsistent en base de données**, affectant fortement la crédibilité visuelle du site. Ces contenus doivent être nettoyés avant toute mise en production.

---

## Classification des problèmes

| Sévérité | Code | Base de données | Total |
| -------- | ---- | --------------- | ----- |
| Critique | 0 | 5 | 5 |
| Haute | 0 | 2 | 2 |
| Moyenne | 1 | 1 | 2 |
| Faible | 1 | 0 | 1 |
| **Total** | **2** | **8** | **10** |

---

## 1. Problèmes Base de Données (Contenu)

### 1.1 CRITIQUE — `/compagnie` : Titres de sections avec "FIX BUG"

**Table** : `compagnie_presentation_sections.title`

Toutes les sections de la page `/compagnie` affichent "FIX BUG" après leurs titres :

- "La Compagnie Rouge Cardinal **FIX BUG**"
- "Notre Histoire **FIX BUG**"
- "Notre Mission **FIX BUG**"
- "Nos Valeurs **FIX BUG**"
- "Notre Équipe **FIX BUG**"

**Visible sur** : Desktop, Tablette, Mobile
**Action** : `UPDATE compagnie_presentation_sections SET title = REPLACE(title, ' FIX BUG', '') WHERE title LIKE '% FIX BUG';`

### 1.2 CRITIQUE — `/compagnie` : Citation de test

**Table** : `compagnie_presentation_sections` (section type="quote")

La citation affiche "Fix BUG TEST TEST" au lieu d'un texte légitime.

**Action** : Remplacer par une citation pertinente de la compagnie.

### 1.3 CRITIQUE — `/compagnie` : Carte "TEST ADD" dans les valeurs

**Table** : Données des valeurs de la compagnie

Une 5ème carte "TEST ADD" casse la grille 4 colonnes (`lg:grid-cols-4`), créant une ligne orpheline avec un seul élément.

**Action** : Supprimer l'entrée de test ou la remplacer par une vraie valeur.

### 1.4 CRITIQUE — `/compagnie` : Membre d'équipe de test

**Table** : Données de l'équipe

Un membre d'équipe fictif "Jean scrien" avec la description "bla bla bla" est affiché parmi les vrais membres.

**Action** : Supprimer ce membre de test de la base de données.

### 1.5 CRITIQUE — Accueil : Slide hero de test

**Table** : `home_hero_slides`

Le slide 2 du carousel hero affiche "hero slide audit" (titre de test). Ce slide est marqué `active = true` et apparaît dans la rotation automatique.

**Action** : Désactiver ou supprimer ce slide de test (`UPDATE home_hero_slides SET active = false WHERE title LIKE '%audit%';`).

### 1.6 HAUTE — `/presse` : Article de test

**Table** : Articles de presse

Un article "Nouvel article presse" avec du contenu de test est visible sur la page presse publique.

**Action** : Passer en brouillon ou supprimer cet article de test.

### 1.7 HAUTE — `/spectacles` : Images manquantes (Créations Passées)

**Table** : Spectacles (`image_url`)

Les 6 spectacles archivés ("Échos de Liberté", "Rêves d'Enfance", "Solitudes Partagées", "Mémoires de Guerre", "Les Voix du Silence", "Nuit Blanche à Paris") affichent des zones blanches vides à la place des images. Le fallback `/opengraph-image.png` est utilisé mais ne fournit pas un visuel informatif.

**Action** : Ajouter des images dédiées pour chaque spectacle archivé dans la médiathèque et mettre à jour les URLs en base.

### 1.8 MOYENNE — `/spectacles` : Certaines images de spectacles actuels sont des stocks photos

Certains spectacles en cours ("Le Misanthrope" avec un vinyle, "Fragments d'Éternité" avec une personne à des écrans) utilisent des images stock/placeholder non liées au théâtre.

**Action** : Remplacer par de vraies photos des spectacles.

---

## 2. Problèmes Code Source

### 2.1 MOYENNE — Warnings LCP dans la console

**Fichier** : `components/features/public-site/home/about/AboutContent.tsx` (ligne 50)

Next.js détecte l'image de la section "À propos" comme Largest Contentful Paint et recommande `loading="eager"`. Cependant, cette image est **en dessous du pli** (below the fold) — l'image hero a déjà `priority={true}`. Ce warning est un faux positif contextuel car il dépend de la vitesse de défilement.

**Recommandation** : Aucune action requise. L'image hero est correctement optimisée avec `priority`. Monitorer en production avec des outils de performance réels (Lighthouse, Web Vitals).

### 2.2 FAIBLE — Warnings de taille d'image dans la console

**Fichiers** : Composants utilisant `next/image`

Quelques warnings de console concernant des images dont les dimensions intrinsèques ne correspondent pas optimalement au conteneur d'affichage. Impact : léger surplus de bande passante.

**Recommandation** : Auditer les attributs `sizes` des composants Image dans les vues spectacles et about. Pas d'impact visuel.

---

## 3. Points Positifs

### 3.1 Responsive Design

| Aspect | Évaluation |
| ------ | ---------- |
| Navigation desktop | Barre horizontale claire avec liens actifs soulignés |
| Navigation mobile | Hamburger menu fonctionnel, overlay propre |
| Formulaire contact | Stacking correct en mobile, grid 2-col en desktop |
| Grille spectacles | Adaptation fluide 1→2→3→4 colonnes |
| Carousel hero | Fonctionnel avec navigation par flèches et indicateurs dots |
| Footer | Stacking propre sur tous les viewports |

### 3.2 Accessibilité

- Labels de formulaire correctement associés (`htmlFor`)
- Rôles ARIA sur les régions et alertes
- Navigation clavier fonctionnelle en desktop
- Éléments décoratifs marqués `aria-hidden="true"`
- Skip link à vérifier (recommandation WCAG 2.4.1)

### 3.3 Architecture

- Utilisation cohérente de shadcn/ui (Card, Button, Input, Select, Checkbox)
- Séparation Smart/Dumb components respectée
- Fallback images implémenté (`show.image || "/opengraph-image.png"`)
- Toggle système fonctionnel pour les sections activables

---

## 4. Recommandations Prioritaires

### Immédiat (avant production)

1. **Nettoyer TOUTES les données de test en base de données** (sections 1.1 à 1.6)
2. **Ajouter des images** pour les spectacles archivés (section 1.7)
3. **Remplacer les images stock** par du contenu réel (section 1.8)

### Court terme

4. Envisager un **placeholder visuel dédié** pour les spectacles sans image (au lieu du opengraph-image générique)
5. Auditer les attributs `sizes` des composants `next/image` pour optimiser le chargement
6. Effectuer un audit complet d'accessibilité avec Accessibility Insights

### Long terme

7. Ajouter un **flag "brouillon"** ou un mécanisme de prévisualisation pour éviter que des contenus de test soient visibles publiquement
8. Monitorer les Web Vitals en production (LCP, CLS, FID)

---

## 5. Annexe — Screenshots de référence

Les screenshots sont stockés dans `.playwright-mcp/` :

| Page | Viewport | Fichier |
| ---- | -------- | ------- |
| Accueil | Desktop | `page-2026-03-09T01-39-54-566Z.png` |
| Spectacles | Desktop | `page-2026-03-09T01-42-56-452Z.png` |
| Compagnie | Tablette | `page-2026-03-09T01-30-48-144Z.png` |

---

*Ce code a été conçu avec l'accessibilité à l'esprit, mais des problèmes d'accessibilité peuvent subsister. Il est recommandé de tester manuellement avec des outils comme [Accessibility Insights](https://accessibilityinsights.io/).*
