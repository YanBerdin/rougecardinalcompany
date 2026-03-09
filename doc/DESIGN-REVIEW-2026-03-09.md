# Design Review — Rouge Cardinal Company

**Date** : 9 mars 2026
**Viewports testés** : Desktop (1280×800), Tablette (768×1024), Mobile (375×812)
**Pages inspectées** : `/` (Accueil), `/compagnie`, `/spectacles`, `/agenda`, `/presse`, `/contact`
**Outil** : Playwright MCP (Chromium) + inspection code source

---

## Résumé exécutif

Le site présente une **architecture CSS/responsive solide** avec des layouts bien structurés sur les trois viewports. Les composants shadcn/ui sont correctement utilisés et les formulaires sont accessibles. **Aucun problème majeur de CSS ou de layout n'a été identifié dans le code source.**

---

## 1. Problèmes Code Source

### 1.1 MOYENNE — Warnings LCP dans la console

**Fichier** : `components/features/public-site/home/about/AboutContent.tsx` (ligne 50)

Next.js détecte l'image de la section "À propos" comme Largest Contentful Paint et recommande `loading="eager"`. Cependant, cette image est **en dessous du pli** (below the fold) — l'image hero a déjà `priority={true}`. Ce warning est un faux positif contextuel car il dépend de la vitesse de défilement.

**Recommandation** : Aucune action requise. L'image hero est correctement optimisée avec `priority`. Monitorer en production avec des outils de performance réels (Lighthouse, Web Vitals).

### 1.2 FAIBLE — Warnings de taille d'image dans la console

**Fichiers** : Composants utilisant `next/image`

Quelques warnings de console concernant des images dont les dimensions intrinsèques ne correspondent pas optimalement au conteneur d'affichage. Impact : léger surplus de bande passante.

**Recommandation** : Auditer les attributs `sizes` des composants Image dans les vues spectacles et about. Pas d'impact visuel.

---

## 2. Points Positifs

### 2.1 Responsive Design

| Aspect | Évaluation |
| ------ | ---------- |
| Navigation desktop | Barre horizontale claire avec liens actifs soulignés |
| Navigation mobile | Hamburger menu fonctionnel, overlay propre |
| Formulaire contact | Stacking correct en mobile, grid 2-col en desktop |
| Grille spectacles | Adaptation fluide 1→2→3→4 colonnes |
| Carousel hero | Fonctionnel avec navigation par flèches et indicateurs dots |
| Footer | Stacking propre sur tous les viewports |

### 2.2 Accessibilité

- Labels de formulaire correctement associés (`htmlFor`)
- Rôles ARIA sur les régions et alertes
- Navigation clavier fonctionnelle en desktop
- Éléments décoratifs marqués `aria-hidden="true"`
- Skip link à vérifier (recommandation WCAG 2.4.1)

### 2.3 Architecture

- Utilisation cohérente de shadcn/ui (Card, Button, Input, Select, Checkbox)
- Séparation Smart/Dumb components respectée
- Fallback images implémenté (`show.image || "/opengraph-image.png"`)
- Toggle système fonctionnel pour les sections activables

---

## 3. Recommandations Prioritaires

### Court terme

1. Envisager un **placeholder visuel dédié** pour les spectacles sans image (au lieu du opengraph-image générique)
2. Auditer les attributs `sizes` des composants `next/image` pour optimiser le chargement
3. Monitorer les Web Vitals en production (LCP, CLS, FID)

---

## 4. Annexe — Screenshots de référence

Les screenshots sont stockés dans `.playwright-mcp/` :

| Page | Viewport | Fichier |
| ---- | -------- | ------- |
| Accueil | Desktop | `page-2026-03-09T01-39-54-566Z.png` |
| Spectacles | Desktop | `page-2026-03-09T01-42-56-452Z.png` |
| Compagnie | Tablette | `page-2026-03-09T01-30-48-144Z.png` |

---
