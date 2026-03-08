# Audit Accessibilité — `components/features/public-site`

> **Date** : juillet 2025  
> **Référentiel** : WCAG 2.2 Level AA (+ AAA ciblé pour WCAG 2.5.5 Target Size)  
> **Scope** : Tous les composants dans `components/features/public-site/` (Home, Agenda, Compagnie, Contact, Presse, Spectacles)  
> **Méthode** : Revue de code statique — ne remplace pas un test manuel avec technologies d'assistance

---

## Résumé Exécutif

| Sévérité | Nombre |
| -------- | ------ |
| 🔴 Critique | 2 |
| 🟠 Majeur | 6 |
| 🟡 Mineur | 11 |
| ✅ Points Forts | 12 |

Le code présente une **bonne base d'accessibilité** (landmarks, aria-labels, textes alternatifs, gestion de `prefers-reduced-motion` au niveau global, formulaire de contact exemplaire). Deux problèmes critiques bloquent des parcours utilisateur pour les personnes utilisant uniquement le clavier.

---

## 🔴 Problèmes Critiques

### C1 — Overlay de cartes spectacles inaccessible au clavier

**Fichiers** : `home/shows/ShowCard.tsx`, `spectacles/SpectaclesView.tsx` (section "Spectacles Actuels")  
**WCAG** : 2.1.1 Keyboard (A), 2.5.8 Target Size (AA)

L'overlay contenant les liens "Réserver mes billets" et "Détails" utilise `pointer-events-none` et ne devient interactif qu'au `group-hover:pointer-events-auto`. Cette approche :

1. **Bloque totalement l'accès clavier** aux liens dans l'overlay car `pointer-events-none` empêche le focus clavier.
2. Même si `group-focus-within:opacity-100` est appliqué dans `ShowCard.tsx` (ce qui rend l'overlay visible quand le lien image a le focus), les liens overlay restent **non focusables** puisque `pointer-events-none` est toujours actif — seul `group-hover` le bascule.
3. Le lien de réservation (action principale) n'est accessible que via l'overlay — les personnes utilisant un clavier ou un lecteur d'écran ne peuvent pas réserver.

**Recommandation** :

```tsx
{/* Remplacer pointer-events-none par une approche accessible */}
<div className="absolute inset-0 z-10 bg-black/60 opacity-0
  group-hover:opacity-100 group-focus-within:opacity-100
  transition-opacity duration-300 flex items-center justify-center">
  {/* Les liens reçoivent focus normalement */}
  <Link
    href={show.ticketUrl ?? getSpectacleUrl(show)}
    className="... focus-visible:ring-2 focus-visible:ring-ring"
    aria-label={`Réserver des billets pour ${show.title}`}
  >
    <Ticket className="h-4 w-4" aria-hidden="true" />
    Réserver mes billets
  </Link>
</div>
```

Alternativement, rendre les actions toujours focusables mais visuellement cachées sauf au focus/hover en utilisant `sr-only focus:not-sr-only` sur les liens individuels.

---

### C2 — Emojis utilisés comme icônes sans sémantique

**Fichier** : `presse/ContactPresseSection.tsx`  
**WCAG** : 1.1.1 Non-text Content (A), 4.1.2 Name, Role, Value (A)

Les emojis 📧 et 📱 sont utilisés comme substituts d'icônes dans du texte brut :

```tsx
<p>📧 presse@rouge-cardinal.fr</p>
<p>📱 +33 6 12 34 56 78</p>
```

Problèmes :

1. Les emojis n'ont ni `role="img"` ni `aria-label` — les lecteurs d'écran annoncent "enveloppe" ou "téléphone portable" de manière incohérente selon le lecteur.
2. L'email et le numéro de téléphone sont du texte brut, pas des liens `<a href="mailto:...">` et `<a href="tel:...">` — non activables au clavier ni par lecteur d'écran.

**Recommandation** :

```tsx
<p>
  <Mail className="inline h-4 w-4 mr-2" aria-hidden="true" />
  <a href="mailto:presse@rouge-cardinal.fr">presse@rouge-cardinal.fr</a>
</p>
<p>
  <Phone className="inline h-4 w-4 mr-2" aria-hidden="true" />
  <a href="tel:+33612345678">+33 6 12 34 56 78</a>
</p>
```

---

## 🟠 Problèmes Majeurs

### M1 — `hover:scale` directement sur un bouton interactif (violation pattern touch-hitbox)

**Fichier** : `home/newsletter/NewsletterForm.tsx` (ligne 42)  
**WCAG** : 2.5.5 Target Size (AAA), instruction interne `touch_hitbox.instructions.md`

Le bouton d'inscription utilise `hover:scale-95 active:scale-100` directement sur l'élément `<Button>`. Selon les instructions projet, le `hover:scale-*` doit être appliqué sur un élément enfant `<span>` à l'intérieur du bouton, avec la classe `touch-hitbox` sur le parent pour maintenir une hitbox stable via `::before`.

Le même problème existe pour `disabled:hover:scale-90`.

**Recommandation** :

```tsx
<Button
  type="submit"
  className="touch-hitbox bg-chart-6 border-white/30 ..."
>
  <span className="hover:scale-95 active:scale-100 transition-transform inline-flex items-center">
    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
    S'inscrire à la newsletter
  </span>
</Button>
```

---

### M2 — Association Label ↔ Select cassée (shadcn Select)

**Fichiers** : `agenda/AgendaFilters.tsx`, `contact/ContactForm.tsx`  
**WCAG** : 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)

Le composant shadcn `<Select>` ne rend pas un `<select>` natif mais un `<button>` custom. L'attribut `htmlFor` sur `<Label>` ne peut pas s'associer programmatiquement car le `<SelectTrigger>` n'a pas d'`id` correspondant.

Dans `AgendaFilters.tsx` :

```tsx
<Label htmlFor="event-type-filter" className="sr-only">Filtrer par type</Label>
<Select ...>
  <SelectTrigger aria-label="Filtrer par type d'événement">
```

L'association `htmlFor="event-type-filter"` ne pointe vers rien. Heureusement, `aria-label` sur le `SelectTrigger` compense partiellement, mais un clic sur le label visible ne focus pas le select.

**Recommandation** :

```tsx
<Select ...>
  <SelectTrigger id="event-type-filter" aria-label="Filtrer par type d'événement">
```

Ajouter `id` sur le `SelectTrigger` pour que `htmlFor` fonctionne.  
Même correction nécessaire pour le champ "Raison du contact" dans `ContactForm.tsx`.

---

### M3 — Sections sans étiquette sémantique (`aria-labelledby`)

**Fichiers** : `home/about/AboutView.tsx`, `home/news/NewsView.tsx`, `home/shows/ShowsView.tsx`, `home/newsletter/NewsletterView.tsx`  
**WCAG** : 1.3.1 Info and Relationships (A), 2.4.1 Bypass Blocks (A)

Ces `<section>` n'ont ni `aria-label` ni `aria-labelledby` pointant vers leur heading. Les personnes utilisant un lecteur d'écran naviguent par landmarks et ne peuvent pas identifier ces sections.

**Exemples** : `AboutView.tsx` rend `<section className="...">` sans label. `NewsView.tsx` a un `<h2>` mais pas d'association.

**Recommandation** : Ajouter `aria-labelledby` pointant vers l'`id` du heading de chaque section.

```tsx
<section aria-labelledby="about-heading">
  <h2 id="about-heading">...</h2>
</section>
```

Les sections dans **Compagnie**, **Agenda**, **Presse** et **SpectacleDetailView** implémentent correctement ce pattern — il suffit de l'appliquer uniformément.

---

### M4 — Taille cible des boutons de navigation du carrousel Hero insuffisante

**Fichier** : `home/hero/HeroNavigation.tsx`  
**WCAG** : 2.5.8 Target Size Minimum (AA, 24×24px), 2.5.5 Target Size Enhanced (AAA, 44×44px)

Les boutons pause/lecture utilisent `p-2` (8px padding × 2 + icône 20px = ~36px). Les boutons précédent/suivant utilisent `p-3` (~48px) — ceux-ci sont conformes.

Cependant, le bouton pause/play sur mobile est en dessous du minimum AAA de 44px visé par le projet.

**Recommandation** : Augmenter le padding à `p-3` ou utiliser `min-h-11 min-w-11` (44px) sur le bouton pause/play.

---

### M5 — Liens externes sans indication pour lecteurs d'écran

**Fichier** : `presse/RevueDePresse.tsx`  
**WCAG** : 2.4.4 Link Purpose (A), 3.2.5 Change on Request (AAA)

Les liens "Lire l'article" ouvrent dans un nouvel onglet (`target="_blank"`) mais le texte `aria-label` ne mentionne pas l'ouverture dans un nouvel onglet. Contrairement à `NewsCard.tsx` qui ajoute un `<span className="sr-only">(s'ouvre dans un nouvel onglet)</span>`, `RevueDePresse.tsx` ne le fait pas.

**Recommandation** : Ajouter `(s'ouvre dans un nouvel onglet)` au `aria-label` ou ajouter un `<span className="sr-only">` après le texte visible.

---

### M6 — Contraste potentiel : texte blanc sur dégradé (`hero-gradient`)

**Fichiers** : `presse/HeroSection.tsx`, `presse/AccreditationSection.tsx`, `spectacles/SpectaclesView.tsx`, `contact/ContactPageView.tsx`, `agenda/AgendaHero.tsx`, `compagnie/sections/SectionHero.tsx`  
**WCAG** : 1.4.3 Contrast Minimum (AA, 4.5:1)

Le texte `text-white/80` (rgba blanc 80% opacité) est affiché sur `hero-gradient`. La classe `hero-gradient` utilise vraisemblablement des nuances de rouge cardinal (#ad0000). Le ratio de contraste entre `rgba(255,255,255,0.8)` et `#ad0000` est d'environ **3.5:1** — en dessous du seuil AA de 4.5:1 pour le texte normal.

Le texte de paragraphe (non large) dans ces héros (`text-lg md:text-xl`) est en dessous du seuil de texte "large" (≥24px ou ≥18.5px bold) sur certains breakpoints.

**Recommandation** : Vérifier le ratio réel et soit augmenter l'opacité à `text-white/90` ou `text-white`, soit ajouter un fond semi-transparent derrière le texte.

---

## 🟡 Problèmes Mineurs

### m1 — `hover:scale-[1.02]` directement sur le conteneur d'affiche spectacle

**Fichier** : `spectacles/SpectacleDetailView.tsx` (ligne 134)  
**Instruction** : `touch_hitbox.instructions.md`

Le `<div>` contenant l'affiche du spectacle utilise `hover:scale-[1.02]` directement. Bien que ce soit un conteneur et non un bouton, cela modifie la hitbox au survol.

**Recommandation** : Appliquer le scale sur l'image enfant uniquement (déjà fait avec `group-hover:scale-105`), retirer `hover:scale-[1.02]` du parent.

---

### m2 — `<dl>` utilisé sans `<dt>`/`<dd>` dans NewsletterView

**Fichier** : `home/newsletter/NewsletterView.tsx`  
**WCAG** : 1.3.1 Info and Relationships (A)

Le composant utilise un élément `<dl>` mais contient des `<div>` et `<p>` au lieu de `<dt>`/`<dd>`. Sémantiquement incorrect — utiliser `<div>` simple ou restructurer avec `<dt>`/`<dd>` si c'est vraiment une liste de définitions.

---

### m3 — Heading h2 dupliqué dans MediaKitSection

**Fichier** : `presse/MediaKitSection.tsx`  
**WCAG** : 1.3.1 Info and Relationships (A)

La section a un `<h2>Kit Média</h2>` en titre de section, puis chaque carte utilise aussi `<h2>` pour le type de fichier. Les cartes devraient utiliser `<h3>` pour maintenir la hiérarchie.

---

### m4 — Images de cartes spectacles : alt text perfectible

**Fichiers** : `spectacles/SpectaclesView.tsx`, `home/shows/ShowCard.tsx`  
**WCAG** : 1.1.1 Non-text Content (A)

`alt={`Affiche du spectacle ${show.title}`}` est correct mais pour les spectacles archivés dont l'affiche est un fallback (`/opengraph-image.png`), l'alt text dit "Affiche du spectacle X" alors qu'il n'y a pas d'affiche réelle.

**Recommandation** : Conditionner l'alt text :

```tsx
alt={show.image 
  ? `Affiche du spectacle ${show.title}` 
  : `Image par défaut – affiche non disponible pour ${show.title}`}
```

---

### m5 — ContactInfoSidebar : liens email/téléphone sans aria-label explicite

**Fichier** : `contact/ContactInfoSidebar.tsx`  
**WCAG** : 2.4.4 Link Purpose (A)

Les liens email (`mailto:`) et téléphone (`tel:`) contiennent le texte visible mais pas d'`aria-label` complémentaire indiquant l'action (ex: "Envoyer un email à…", "Appeler le…"). Mineur car le texte visible rend le but clair, mais un label enrichi améliore l'expérience.

---

### m6 — Bouton "Envoyer un autre message" sans aria-label contextuel

**Fichier** : `contact/ContactSuccessView.tsx`  
**WCAG** : 2.4.4 Link Purpose (A)  
Le bouton "Envoyer un autre message" est clair visuellement mais le `role="status"` est sur le parent qui inclut le bouton — le bouton fait partie du statut, ce qui peut créer une annonce redondante au lecteur d'écran.

**Recommandation** : Sortir le bouton du `<div role="status">`.

---

### m7 — Absence de `aria-label` sur la section Hero de SpectaclesView

**Fichier** : `spectacles/SpectaclesView.tsx` (section Hero, section "Spectacles Actuels", section Archives)  
**WCAG** : 1.3.1 Info and Relationships (A)

Aucune des trois sections n'a d'`aria-label` ou `aria-labelledby`.

---

### m8 — `role="tablist"` pour les dots du carrousel (sémantique discutable)

**Fichier** : `spectacles/SpectacleCarousel.tsx`  
**WCAG** : 4.1.2 Name, Role, Value (A)

L'utilisation de `role="tablist"` avec `role="tab"` sur les indicateurs de carrousel est inhabituelle. Le pattern ARIA recommandé pour un carrousel est `role="region"` + `aria-roledescription="carousel"` (déjà fait) avec des boutons simples pour les dots, pas des tabs. L'utilisation de tabs implique un pattern de navigation par tabulation (Arrow keys switch tab) qui n'est pas implémenté ici.

Le carrousel Hero (`HeroIndicators.tsx`) utilise correctement des simples `<button>` — alignez SpectacleCarousel sur ce pattern.

**Recommandation** : Remplacer `role="tablist"` par un simple `<div role="group" aria-label="Navigation slides">` et retirer `role="tab"` des boutons.

---

### m9 — `animate-spin` sans reset reduced-motion

**Fichier** : `contact/ContactForm.tsx` (spinner de chargement)  
**WCAG** : 2.3.3 Animation from Interactions (AAA)

Le spinner de chargement utilise `animate-spin` (classe Tailwind). Le reset global dans `globals.css` couvre `*` avec `animation-duration: 0.01ms`, ce qui est techniquement correct. Cependant, un `aria-label` sur le spinner serait bienvenu plutôt que de compter uniquement sur le texte "Envoi en cours…" adjacent.

---

### m10 — Heading h2 dans RevueDePresse avec `hover:text-primary` (non-interactif)

**Fichier** : `presse/RevueDePresse.tsx`  
**WCAG** : 1.4.1 Use of Color (A)

Le titre de chaque article (`<h2>`) a un `hover:text-primary`. Cela suggère que c'est un lien mais le `<h2>` n'est pas cliquable — faux signal visuel.

**Recommandation** : Retirer `hover:text-primary` du h2 si ce n'est pas un lien, ou en faire un lien vers l'article.

---

### m11 — Section "Archives" : overlay hover-only "Détails" accessible mais non-focusable

**Fichier** : `spectacles/SpectaclesView.tsx` (section archives)  
**WCAG** : La section archives wrap le tout dans un `<Link>`, ce qui rend l'overlay décoratif. Cependant, l'overlay contient un `<span>` stylisé en bouton ("Détails") qui n'est pas un vrai bouton — simple décoration visuelle au hover. Ce n'est pas bloquant car le `<Link>` englobant est accessible, mais c'est confondant visuellement.

---

## ✅ Points Forts (Bonnes Pratiques)

| # | Domaine | Détails |
| --- | -------- | -------- |
| 1 | **Carrousel Hero** | Excellent : `role="region"`, `aria-roledescription="carousel"`, navigation clavier Arrow L/R, `aria-live="polite"` pour annonces, `prefers-reduced-motion` respecté via `matchMedia`, bouton pause/lecture avec `aria-pressed`, indicateurs avec `aria-label` et `aria-current` |
| 2 | **Formulaire Contact** | Exemplaire : `htmlFor`+`id` sur tous les champs, `aria-required="true"`, `role="alert"` sur les erreurs, `<span aria-hidden="true">*</span>` pour les astérisques visuels, `noValidate` pour validation custom |
| 3 | **NewsletterCard** | Excellente : `aria-invalid`, `aria-describedby` conditionnel pour les erreurs, `aria-busy` sur le bouton, `sr-only` label, `autoComplete="email"` |
| 4 | **Reduced Motion** | La CSS globale désactive correctement toutes les animations custom (`animate-fade-in-up`, `animate-fade-in`, etc.) via `@media (prefers-reduced-motion: reduce)`. Le carrousel Embla respecte aussi ce setting via hook dédié `usePrefersReducedMotion()` |
| 5 | **Icons décoratives** | Usage systématique de `aria-hidden="true"` sur toutes les icônes Lucide (vérifié : 40+ occurrences) |
| 6 | **Sections Compagnie** | Toutes les sections utilisent `aria-labelledby` avec un `id` dynamique sur le heading — pattern exemplaire |
| 7 | **Spectacle Carousel** | `role="region"`, `aria-roledescription="carousel"`, chaque slide a `role="group"` + `aria-roledescription="slide"` + label numéroté, navigation clavier, dots avec labels descriptifs |
| 8 | **SpectacleDetailView** | Skip link "Aller au contenu principal", aria-label informatif sur `<main>`, awards list avec `aria-label`, bonne hiérarchie de headings |
| 9 | **SpectacleCTABar** | Tous les liens ont des `aria-label` descriptifs mentionnant le titre du spectacle, icônes avec `aria-hidden` |
| 10 | **Download Links (Presse)** | Les liens de téléchargement ont des `aria-label` détaillés incluant type + description + taille du fichier |
| 11 | **AgendaHero** | `aria-labelledby="agenda-heading"` correctement implémenté |
| 12 | **Images Alt text** | Textes alternatifs significatifs sur la majorité des images ("Affiche du spectacle X", "Photo de Y", fallbacks avec titre) |

---

## Plan d'Action Priorisé

### Priorité 1 — Bloquant (sprint courant)

| ID | Action | Fichier(s) | Effort |
| ---- | -------- | ------------ | -------- |
| C1 | Rendre les overlays de cartes spectacles accessibles au clavier | `ShowCard.tsx`, `SpectaclesView.tsx` | M |
| C2 | Remplacer emojis par icônes + transformer en liens `mailto:`/`tel:` | `ContactPresseSection.tsx` | S |

### Priorité 2 — Important (prochain sprint)

| ID | Action | Fichier(s) | Effort |
| ---- | -------- | ------------ | -------- |
| M1 | Appliquer pattern touch-hitbox sur bouton newsletter | `NewsletterForm.tsx` | S |
| M2 | Ajouter `id` sur SelectTrigger pour association label | `AgendaFilters.tsx`, `ContactForm.tsx` | S |
| M3 | Ajouter `aria-labelledby` sur 4 sections Home | `AboutView.tsx`, `NewsView.tsx`, `ShowsView.tsx`, `NewsletterView.tsx` | S |
| M4 | Augmenter taille cible bouton pause Hero | `HeroNavigation.tsx` | XS |
| M5 | Ajouter indication nouvel onglet sur liens presse | `RevueDePresse.tsx` | XS |
| M6 | Vérifier/corriger contraste texte blanc sur gradient | Multiples héros | M |

### Priorité 3 — Amélioration (backlog)

| ID | Action | Effort |
| ---- | -------- | -------- |
| m1–m11 | Corrections mineures listées ci-dessus | S–M par item |

---

## Recommandations Générales

1. **Test avec lecteur d'écran** : Effectuer un passage complet NVDA/VoiceOver sur les pages Spectacles et Presse (les deux zones avec le plus de problèmes identifiés).
2. **Test clavier** : Vérifier que chaque spectacle est navigable et que les actions de réservation sont accessibles sans souris.
3. **Vérification contraste** : Passer les héros dans un analyseur de contraste (ex: Accessibility Insights) pour valider les ratios sur les dégradés.
4. **Automatisation** : Ajouter `npx @axe-core/cli http://localhost:3000 --exit` dans le CI pour détecter les régressions.

---

> Ce rapport a été rédigé avec une attention particulière à l'accessibilité, mais des problèmes supplémentaires peuvent exister. Il est recommandé de compléter cette revue statique par des tests manuels avec des technologies d'assistance et des outils comme [Accessibility Insights](https://accessibilityinsights.io/).
