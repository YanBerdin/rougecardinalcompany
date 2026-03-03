# Audit de conformité — `components/features/public-site/home`

> **Date** : Juillet 2025  
> **Périmètre** : 6 sous-modules (hero, about, news, shows, newsletter, partners) + fichiers racine  
> **Fichiers analysés** : 30 fichiers  
> **Standards de référence** : Clean Code, TypeScript, React Composition Patterns, WCAG 2.2 AA, Next.js Best Practices, DAL SOLID, CRUD Server Actions Pattern

---

## Résumé exécutif

| Catégorie | Score | Niveau |
| ----------- | ------- | -------- |
| React Composition Patterns | 40% | 🔴 Non conforme |
| Clean Code | 45% | 🔴 Non conforme |
| TypeScript | 85% | 🟢 Conforme |
| Accessibilité (WCAG 2.2 AA) | 30% | 🔴 Non conforme |
| Next.js Best Practices | 65% | 🟡 Partiellement conforme |
| Architecture / SRP | 60% | 🟡 Partiellement conforme |

**Score global estimé : ~54%** — Refactoring nécessaire.

---

## Table des matières

1. [Structure & Organisation](#1-structure--organisation)
2. [React Composition Patterns](#2-react-composition-patterns)
3. [Clean Code](#3-clean-code)
4. [TypeScript](#4-typescript)
5. [Accessibilité (WCAG 2.2 Level AA)](#5-accessibilité-wcag-22-level-aa)
6. [Next.js Best Practices](#6-nextjs-best-practices)
7. [Architecture & SRP](#7-architecture--srp)
8. [Tableau récapitulatif par fichier](#8-tableau-récapitulatif-par-fichier)
9. [Plan de remédiation prioritaire](#9-plan-de-remédiation-prioritaire)

---

## 1. Structure & Organisation

### ✅ Points conformes

- **Barrel exports** : chaque sous-module a un `index.ts` propre.
- **Types colocalisés** : `types.ts` par sous-module (pattern attendu).
- **Server/Client split** : Container (Server) → Client (interactif) → View (présentation).
- **Naming** : PascalCase pour les composants, camelCase pour les hooks.

### 🔴 Violations

| ID | Fichier | Violation | Gravité |
| ---- | --------- | ----------- | --------- |
| S-01 | `home/types.ts` | 91 lignes de code mort (entièrement commenté) | Haute |
| S-02 | `hero/hooks.ts` | 179 lignes de code mort (entièrement commenté) | Haute |
| S-03 | `about/hooks.ts` | Entièrement commenté — fichier inutile | Haute |
| S-04 | `news/hooks.ts` | ~80 lignes de code mort, 2 copies du même mock commenté | Haute |
| S-05 | `shows/hooks.ts` | ~80 lignes de code mort, copié-collé du pattern news | Haute |
| S-06 | `partners/hooks.ts` | 104 lignes de code mort (entièrement commenté) | Haute |

**Impact total : ~600+ lignes de code mort** à supprimer.

> **Règle enfreinte** : Clean Code — **"Eliminate duplication (DRY)"** + fichiers inutiles polluant la base de code.

**Recommandation** : Supprimer les 6 fichiers `hooks.ts` morts et `home/types.ts`. Le seul `hooks.ts` utile est `newsletter/hooks.ts` (ré-export du hook centralisé).

---

## 2. React Composition Patterns

### 2.1 Boolean Prop Proliferation — 🟡 Partiellement conforme

Aucune prolifération de booleans de type `isThread | isEditing | isDMThread` n'est détectée. Cependant, plusieurs interfaces accumulent de nombreux props qui sont le symptôme d'un **manque de composition** :

| Interface | Nombre de props | Limite | Verdict |
| ----------- | ---------------- | -------- | --------- |
| `HeroProps` | **10** | 5 | 🔴 Violation |
| `NewsletterViewProps` | **7** (+ children) | 5 | 🔴 Violation |
| `NewsletterFormProps` | 5 (dont `isSubscribed` inutilisé) | 5 | 🟡 À nettoyer |

### 2.2 Compound Components — 🔴 Non implémenté

Aucun pattern compound component n'est utilisé dans le module home. Les composants sont **monolithiques** avec prop drilling direct.

> **Candidat prioritaire : Hero Carousel**

Actuellement, `HeroClient` gère tout l'état (carousel, auto-play, touch/swipe) et passe **10 props** à `HeroView`. Selon les instructions de composition, ce pattern devrait utiliser un **Context Provider** + **Compound Components** :

```tsx
// Pattern recommandé
const CarouselContext = createContext<CarouselContextValue | null>(null);

const Carousel = {
  Provider: CarouselProvider,   // State management (auto-play, touch, navigation)
  Frame: CarouselFrame,         // Section wrapper + touch handlers
  Slides: CarouselSlides,       // Slide rendering with transitions
  Content: CarouselContent,     // Title, subtitle, CTAs
  Navigation: CarouselNav,      // Prev/Next arrows
  Indicators: CarouselDots,     // Dot navigation
  Progress: CarouselProgress,   // Progress bar
};
```

> **Candidat secondaire : Newsletter**

`NewsletterClientContainer` passe `email`, `isLoading`, `isSubscribed`, `errorMessage`, `handleEmailChange`, `handleSubmit` à `NewsletterView` qui les repasse à `NewsletterForm` — c'est du **prop drilling classique**. Un Provider résoudrait ce problème.

### 2.3 State Management Decoupling — 🟡 Partiel

- ✅ Les containers serveur sont découplés de l'UI (data fetching séparé).
- ❌ `HeroClient` couple la logique de state (auto-play, touch, navigation) directement dans le composant — pas de provider dédié.
- ❌ `NewsletterClientContainer` passe tout via props au lieu d'un context.

### 2.4 Explicit Variants — ✅ Conforme

Chaque section de la homepage est un composant explicite séparé (`HeroContainer`, `AboutContainer`, etc.) sans flags booléens pour switcher entre modes.

---

## 3. Clean Code

### 3.1 Longueur des fonctions (max 30 lignes)

| Composant | Lignes (corps) | Limite | Verdict |
| ----------- | --------------- | -------- | --------- |
| `HeroView` | ~135 | 30 | 🔴 **×4.5 la limite** |
| `HeroClient` | ~100 | 30 | 🔴 **×3.3** |
| `ShowsView` | ~100 | 30 | 🔴 **×3.3** |
| `NewsView` | ~90 | 30 | 🔴 **×3** |
| `AboutView` | ~75 | 30 | 🔴 **×2.5** |
| `NewsletterView` | ~50 | 30 | 🔴 **×1.7** |
| `HeroContainer` | ~40 | 30 | 🟡 **×1.3** |
| `PartnersView` | ~30 | 30 | ✅ |

**7/8 composants principaux dépassent la limite de 30 lignes.**

### 3.2 Paramètres (max 5 par fonction)

| Interface | Params | Limite | Verdict |
| ----------- | -------- | -------- | --------- |
| `HeroProps` | 10 | 5 | 🔴 **×2** |
| `NewsletterViewProps` | 7 | 5 | 🔴 |
| `NewsletterFormProps` | 5 | 5 | 🟡 (1 inutilisé) |
| Tous les autres | 1-3 | 5 | ✅ |

### 3.3 Magic Numbers / Strings

| Fichier | Valeur | Description | Gravité |
| --------- | -------- | ------------- | --------- |
| `HeroClient` | `6000` | Intervalle auto-play (ms) | 🟡 |
| `HeroClient` | `10000` | Durée pause après interaction (ms) | 🟡 |
| `HeroClient` | `50` | Seuil minimum de swipe (px) | 🟡 |
| `HeroView` | `"saison 2025 – 2026"` | Texte hardcodé (TODO existant) | 🔴 |
| `NewsView/ShowsView` | `${index * 0.1}s` | Animation delay | 🟡 |

**Recommandation** : Extraire dans des constantes nommées :

```typescript
const AUTO_PLAY_INTERVAL_MS = 6000;
const PAUSE_AFTER_INTERACTION_MS = 10000;
const MIN_SWIPE_DISTANCE_PX = 50;
```

### 3.4 DRY — Duplications détectées

| Duplication | Fichiers | Action |
| ------------- | ---------- | -------- |
| Pattern toggle check identique | 6 Containers | Extraire un helper `withDisplayToggle()` |
| CSS `background-image` + `bg-cover bg-center` | NewsView, ShowsView, AboutView | Utiliser `next/image` ou composant partagé |
| Structure hooks.ts identique commentée | 5 fichiers | Supprimer les fichiers morts |
| Deprecated mock pattern copié-collé | news/hooks.ts, shows/hooks.ts | Supprimer |

### 3.5 Props inutilisés / Never-used

| Prop | Interface | Usage |
| ------ | ----------- | ------- |
| `isSubscribed` | `NewsletterFormProps` | Passé au form mais jamais lu |
| `isLoading` | `ShowsViewProps` | Exporté mais jamais utilisé (pas de loading state) |
| `isLoading` | `NewsViewProps` | Exporté mais jamais utilisé |
| `premiere` | `NewsItem` | Exporté dans le type mais jamais assigné |
| `isLoading` (toujours `false`) | `PartnersContainer → PartnersView` | Hardcodé à `false`, aucun état de chargement |

---

## 4. TypeScript

### ✅ Points conformes

- Aucun `any` détecté dans l'ensemble du module.
- Interfaces utilisées pour les props objets (correct).
- Types colocalisés dans les `types.ts` de chaque module.
- Gestion correcte de la nullabilité : `r.subtitle ?? ""`, `r.description ?? ""`.
- `Partner` type ré-exporté depuis `LogoCloud/types` (aucune duplication).

### 🟡 Points à améliorer

| ID | Fichier | Issue | Recommandation |
| ---- | --------- | ------- | ---------------- |
| T-01 | `newsletter/types.ts` | `errorMessage?: string \| null` — mélange `undefined` (via `?`) et `null` | Choisir un seul pattern : `errorMessage: string \| null` |
| T-02 | `news/types.ts` | `premiere?: string` jamais utilisé | Supprimer le champ |
| T-03 | `shows/types.ts` | `isLoading?: boolean` jamais utilisé | Supprimer le champ |
| T-04 | `news/types.ts` | `isLoading?: boolean` jamais utilisé | Supprimer le champ |
| T-05 | `about/types.ts` | `isLoading?: boolean` dans `AboutProps` jamais utilisé | Supprimer le champ |

---

## 5. Accessibilité (WCAG 2.2 Level AA)

### 5.1 Sémantique HTML & Headings

| Critère | Constat | Verdict |
| --------- | --------- | --------- |
| Landmark `<section>` | Toutes les sections utilisent `<section>` | ✅ |
| `<form>` sémantique | Newsletter utilise `<form>` | ✅ |
| Heading hierarchy | `HeroView` : h1 → h4 (saute h2/h3 pour "saison") | 🔴 WCAG 1.3.1 |
| Heading same level | NewsView : `<h3>` pour titre section ET titres cartes | 🔴 WCAG 1.3.1 |
| Heading same level | ShowsView : `<h3>` pour titre section ET titres cartes | 🔴 WCAG 1.3.1 |

**WCAG 1.3.1 (Info and Relationships)** : Les headings des cartes (news, shows) devraient être `<h4>` pour respecter la hiérarchie sous le `<h3>` de section.

### 5.2 Images & Alternatives textuelles

| Composant | Pattern image | Alt text | Verdict |
| ----------- | -------------- | ---------- | --------- |
| `HeroView` | `next/image` | ✅ `alt={slide.title}` | ✅ |
| `NewsView` | CSS `background-image` | ❌ Aucun alt | 🔴 WCAG 1.1.1 |
| `ShowsView` | CSS `background-image` | ❌ Aucun alt | 🔴 WCAG 1.1.1 |
| `AboutView` | CSS `background-image` | ❌ Aucun alt | 🔴 WCAG 1.1.1 |

Les images rendues via `background-image` sont **invisibles** pour les lecteurs d'écran. Elles doivent être remplacées par `next/image` (ou complétées par `role="img" aria-label="..."` sur le conteneur).

### 5.3 Carousel Accessibility

Le carousel hero enfreint plusieurs critères WCAG :

| Critère WCAG | Exigence | Implémentation | Verdict |
| ------------- | ---------- | ---------------- | --------- |
| 1.3.1 | `role="region"` + `aria-roledescription="carousel"` | Absent | 🔴 |
| 4.1.3 | `aria-live="polite"` pour annoncer les changements | Absent | 🔴 |
| 2.1.1 | Navigation au clavier (Flèches gauche/droite) | ❌ Aucun handler clavier | 🔴 |
| 2.2.2 | Mécanisme pour pauser l'auto-play | ✅ Pause au clic (implicite) | 🟡 |
| 2.2.2 | Bouton pause/play visible | ❌ Absent | 🔴 |
| 4.1.2 | `aria-current` sur l'indicateur actif | ❌ Absent | 🔴 |

### 5.4 Keyboard Navigation

| Composant | Keyboard accessible | Issue |
| ----------- | ------------------- | ------- |
| Hero nav arrows | ✅ `<button>` | Accessible |
| Hero indicators | ✅ `<button>` | Accessible |
| Hero slides | ❌ Pas de handler `onKeyDown` | Navigation clavier manquante |
| Shows hover overlay | ❌ Overlay buttons visibles seulement au hover | `:focus-within` manquant |
| Newsletter form | ✅ Standard form flow | OK |
| News card links | ✅ `<Link>` standard | OK |

**Violation critique** : Les boutons "Je réserve" / "Détails" de `ShowsView` apparaissent uniquement au hover CSS (`opacity-0 group-hover:opacity-100`). Un utilisateur clavier ne peut **jamais** voir ni atteindre ces boutons.

### 5.5 Color Contrast (estimé)

| Élément | Couleur | Fond | Ratio estimé | Verdict |
| --------- | --------- | ------ | ------------- | --------- |
| `text-chart-6` sur overlay sombre | Or/blanc | `bg-black/55-85` | ~3:1 ? | ⚠️ À vérifier |
| `text-white/50` placeholder | `rgba(255,255,255,0.5)` | `bg-white/10` | < 3:1 | 🔴 |
| `text-white/60` | `rgba(255,255,255,0.6)` | Dark bg | ~3:1 | 🟡 |
| `text-white/70` | `rgba(255,255,255,0.7)` | Dark bg | ~4:1 | 🟡 |
| `text-chart-6/50` indicators | 50% opacity | Dark bg | < 3:1 | 🔴 |

### 5.6 Motion & Reduced Motion

- ❌ **Aucune vérification `prefers-reduced-motion`** pour :
  - Auto-play du carousel (devrait être désactivé)
  - Animations `animate-fade-in-up` (devraient être supprimées)
  - `transition-transform` sur les hover des images
  - Dots `animate-pulse` du swipe indicator

> **WCAG 2.3.3** : Les animations doivent pouvoir être désactivées.

---

## 6. Next.js Best Practices

### ✅ Points conformes

| Critère | Constat |
| --------- | --------- |
| Server Components par défaut | ✅ Containers sont async Server Components |
| Client Components explicites | ✅ `"use client"` uniquement sur HeroClient, HeroView, NewsletterClientContainer, NewsletterView, PartnersView |
| Display Toggles | ✅ Vérifiés avant rendu dans chaque Container |
| DAL calls dans Server Components | ✅ `fetchActiveHomeHeroSlides()`, `fetchCompanyStats()`, etc. |
| Suspense | ✅ `PartnersContainer` dans `<Suspense>` |

### 🟡 Points à améliorer

| ID | Fichier | Issue |
| ---- | --------- | ------- |
| N-01 | `HeroView` | Marqué `"use client"` mais n'utilise aucun hook ni browser API — reçoit uniquement des callbacks. Pourrait être un Server Component si les handlers étaient restructurés. |
| N-02 | `NewsView` | CSS `background-image` au lieu de `next/image` — pas d'optimisation (format, taille, lazy loading) |
| N-03 | `ShowsView` | CSS `background-image` au lieu de `next/image` |
| N-04 | `AboutView` | CSS `background-image` au lieu de `next/image` |
| N-05 | `PartnersView` | Marqué `"use client"` — vérifier si nécessaire (LogoCloud peut nécessiter du JS) |

### 🔴 Performance

- **LCP** : Seul le HeroView utilise `next/image` avec `priority`. Les images des sections News, Shows et About ne bénéficient d'aucune optimisation Next.js (pas de lazy loading natif, pas de format WebP/AVIF auto, pas de responsive sizes).
- **Bundle** : `HeroView` est "use client" avec ~135 lignes de JSX envoyées au client sans nécessité apparente.

---

## 7. Architecture & SRP

### 🔴 Couplage Hero ↔ Partners

`HeroContainer` importe et rend directement `PartnersContainer` :

```tsx
// hero/HeroContainer.tsx (lignes 38-44)
return (
  <div className="relative">
    <HeroClient initialSlides={slides} />
    <div className="absolute bottom-0 left-0 right-0">
      <Suspense fallback={<PartnersSkeleton />}>
        <PartnersContainer />
      </Suspense>
    </div>
  </div>
);
```

**Problèmes** :

1. Viole SRP : le Hero est responsable de l'affichage des partenaires.
2. Si le toggle hero est désactivé (`return null`), les partenaires disparaissent aussi.
3. Crée une dépendance circulaire logique entre hero et partners.

**Recommandation** : La composition Hero + Partners devrait être gérée au niveau de la **page** (`app/(marketing)/page.tsx`), pas à l'intérieur du HeroContainer.

### 🟡 Newsletter — Architecture à 3 niveaux

Le newsletter a un bon split en 3 niveaux mais avec du prop drilling :

```bash
NewsletterContainer (Server: toggle check)
  └→ NewsletterClientContainer (Client: state via hook)
       └→ NewsletterView (Client: layout + conditional rendering)
            └→ NewsletterForm (Client: form inputs)
```

C'est le seul module qui utilise réellement un hook actif (`useNewsletterSubscribe`), mais le passage de props à travers 3 niveaux est évitable avec un context.

---

## 8. Tableau récapitulatif par fichier

| Fichier | Clean Code | TypeScript | A11y | Patterns | Action |
| --------- | ----------- | ------------ | ------ | ---------- | -------- |
| `home/types.ts` | 🔴 Dead code | — | — | — | **Supprimer** |
| `home/index.ts` | ✅ | ✅ | — | ✅ | — |
| `hero/HeroContainer.tsx` | 🟡 40 lignes | ✅ | — | 🔴 SRP (Partners) | Extraire Partners |
| `hero/HeroClient.tsx` | 🔴 100 lignes, magic numbers | ✅ | — | 🔴 Pas de Provider | Refactoring |
| `hero/HeroView.tsx` | 🔴 135 lignes, 10 params | ✅ | 🔴 Carousel a11y | 🔴 Monolithique | Refactoring majeur |
| `hero/hooks.ts` | 🔴 Dead code | — | — | — | **Supprimer** |
| `hero/types.ts` | ✅ | ✅ | — | — | — |
| `about/AboutContainer.tsx` | ✅ | ✅ | — | ✅ | — |
| `about/AboutView.tsx` | 🔴 75 lignes | ✅ | 🔴 bg-image sans alt | ✅ | `next/image` + split |
| `about/hooks.ts` | 🔴 Dead code | — | — | — | **Supprimer** |
| `about/types.ts` | 🟡 `isLoading` inutilisé | ✅ | — | — | Nettoyer |
| `news/NewsContainer.tsx` | ✅ | ✅ | — | ✅ | — |
| `news/NewsView.tsx` | 🔴 90 lignes | ✅ | 🔴 bg-image, h3 dupliqué | ✅ | `next/image` + split |
| `news/hooks.ts` | 🔴 Dead code ×2 | — | — | — | **Supprimer** |
| `news/types.ts` | 🟡 `premiere`, `isLoading` inutilisés | ✅ | — | — | Nettoyer |
| `shows/ShowsContainer.tsx` | ✅ | ✅ | — | ✅ | — |
| `shows/ShowsView.tsx` | 🔴 100 lignes | ✅ | 🔴 bg-image, hover-only | ✅ | Refactoring majeur |
| `shows/hooks.ts` | 🔴 Dead code | — | — | — | **Supprimer** |
| `shows/types.ts` | 🟡 `isLoading` inutilisé | ✅ | — | — | Nettoyer |
| `newsletter/NewsletterContainer.tsx` | ✅ | ✅ | — | ✅ | — |
| `newsletter/NewsletterClientContainer.tsx` | ✅ | ✅ | — | 🟡 Prop drilling | Context |
| `newsletter/NewsletterView.tsx` | 🔴 7+ props | ✅ | 🟡 Contraste | 🟡 | Context + split |
| `newsletter/hooks.ts` | ✅ Ré-export | ✅ | — | ✅ | — |
| `newsletter/types.ts` | 🟡 `errorMessage` nullabilité | ✅ | — | — | Nettoyer |
| `partners/PartnersContainer.tsx` | ✅ | ✅ | — | ✅ | — |
| `partners/PartnersView.tsx` | ✅ | ✅ | — | ✅ | — |
| `partners/hooks.ts` | 🔴 Dead code | — | — | — | **Supprimer** |
| `partners/types.ts` | ✅ | ✅ | — | ✅ | — |

---

## 9. Plan de remédiation prioritaire

### P0 — Critique (accessibilité + sécurité)

| # | Action | Fichiers | Effort |
| --- | -------- | ---------- | -------- |
| 1 | **Carousel a11y** : ajouter `role="region"`, `aria-roledescription`, `aria-live`, navigation clavier, bouton pause/play, `aria-current` | `HeroView`, `HeroClient` | M |
| 2 | **Remplacer `background-image` par `next/image`** dans NewsView, ShowsView, AboutView | 3 fichiers | M |
| 3 | **ShowsView hover-only overlay** : rendre les boutons accessibles au clavier (`:focus-within`) | `ShowsView` | S |
| 4 | **Heading hierarchy** : `<h4>` pour titres de cartes dans NewsView et ShowsView | 2 fichiers | XS |

### P1 — Haute (Clean Code + Dead Code)

| # | Action | Fichiers | Effort |
| --- | -------- | ---------- | -------- |
| 5 | **Supprimer les 6 hooks.ts dead** + `home/types.ts` | 7 fichiers | XS |
| 6 | **Nettoyer props inutilisés** : `isLoading`, `premiere`, `isSubscribed` des types | 5 fichiers | XS |
| 7 | **Extraire constantes** : `AUTO_PLAY_INTERVAL_MS`, `PAUSE_DURATION_MS`, `MIN_SWIPE_PX` | `HeroClient` | XS |
| 8 | **Résoudre le hardcoded "saison 2025 – 2026"** (rendre dynamique) | `HeroView` | S |

### P2 — Moyenne (Composition Patterns)

| # | Action | Fichiers | Effort |
| --- | -------- | ---------- | -------- |
| 9 | **Découpler Hero ↔ Partners** : déplacer le rendu de Partners vers la page | `HeroContainer`, `page.tsx` | S |
| 10 | **Implémenter Compound Components pour le Carousel** : Provider + sous-composants | hero/* | L |
| 11 | **Implémenter Context pour Newsletter** : éliminer le prop drilling | newsletter/* | M |
| 12 | **Splitter les View >30 lignes** en sous-composants | HeroView, ShowsView, NewsView, AboutView | M |

### P3 — Faible (améliorations)

| # | Action | Fichiers | Effort |
| --- | -------- | ---------- | -------- |
| 13 | **Ajouter `prefers-reduced-motion`** pour le carousel et les animations | HeroClient, HeroView | S |
| 14 | **Vérifier les ratios de contraste** pour `text-chart-6`, `text-white/50-70` | Tous les View | S |
| 15 | **Retirer `"use client"` de HeroView** si possible (callbacks via Context) | `HeroView` | M |
| 16 | **Extraire un helper `withDisplayToggle()`** pour les 6 Containers | Tous les Containers | S |

---

## Annexe : Comptage des violations par catégorie

| Catégorie | Violations 🔴 | Avertissements 🟡 | Conformes ✅ |
| ----------- | -------------- | ------------------- | ------------- |
| Dead Code | 7 | 0 | 0 |
| Longueur fonctions (>30 lignes) | 7 | 1 | 1 |
| Paramètres (>5) | 2 | 1 | — |
| Magic numbers | 1 (string) | 4 | — |
| Accessibilité images | 3 | 0 | 1 |
| Accessibilité carousel | 5 | 1 | 0 |
| Accessibilité clavier | 2 | 0 | 3 |
| Heading hierarchy | 3 | 0 | 2 |
| `next/image` usage | 3 | 0 | 1 |
| Composition patterns | 3 | 2 | 2 |
| SRP couplage | 1 | 1 | — |
| **Total** | **37** | **10** | **10** |

---

> **Note** : Ce code a été construit en pensant à l'accessibilité mais contient encore des problèmes significatifs. Une revue manuelle avec des outils comme [Accessibility Insights](https://accessibilityinsights.io/) et des tests avec un lecteur d'écran (VoiceOver, NVDA) est recommandée pour valider les corrections.
