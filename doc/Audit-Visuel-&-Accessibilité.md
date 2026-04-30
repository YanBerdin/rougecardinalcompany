# Audit Visuel & Accessibilité — Rouge Cardinal Homepage

**Date** : 30 avril 2026 · **Viewport testé** : 1280×720 (desktop) + 375×812 (mobile) · **URL** : `http://localhost:3000/`

---

## 1. Visual Hierarchy — 4 / 10

### Problème 1.1 — H1 et H2 du hero : taille identique (60px) `[P1]`

**Fichier** : HeroCTA.tsx  
**Position** : ~(390, 280) desktop · ~(187, 265) mobile  
**Constat** : Les deux niveaux de titre sont rendu à `font-size: 60px` Playfair Bold. Seule la couleur (or vs blanc) les distingue. Il n'y a aucune hiérarchie dimensionnelle.

```css
/* CSS Fix — réduire le sous-titre hero */
.hero-subtitle {                     /* classe actuelle : text-chart-6 */
  font-size: clamp(1.5rem, 3vw, 2.25rem);   /* 36px max vs 60px H1 */
  font-weight: 400;
}
```

### Problème 1.2 — Toutes les sections utilisent `font-sans` → `ui-sans-serif` `[P1]`

**Fichiers** : ShowsView.tsx, NewsView.tsx, NewsletterView.tsx, HomeTeamView.tsx, AboutContent.tsx  
**Constat** : La classe Tailwind `font-sans` mappe vers `ui-sans-serif, system-ui` — pas vers Geist, ni vers Playfair. Les 5 sections H2 s'affichent en police système quelconque. L'identité typographique de la marque (Playfair) disparaît totalement au-delà du hero.

```css
/* CSS Fix — remplacer dans tous les h2 de section */
section h2.font-sans {
  font-family: var(--font-playfair), Georgia, serif;   /* ou supprimer la classe font-sans */
}
```

### Problème 1.3 — Heading level skip : la Newsletter utilise `<h3>` `[P0]`

**Fichier** : NewsletterView.tsx  
**Position** : ~(0, 4480) desktop  
**Constat** : Les sections Shows et News ont des `<h2>`. La Newsletter utilise un `<h3>` sans `<h2>` parent dans la même section. Le heading tree saute un niveau → WCAG 1.3.1 failure.

```tsx
// Fix — changer <h3> en <h2>
- <h3 className="font-sans text-5xl font-bold text-white">
+ <h2 className="font-sans text-5xl font-bold text-white">
```

---

## 2. Spacing Rhythm — 5 / 10

### Problème 2.1 — Toutes les sections à `py-24` → monotonie métronomique `[P2]`

**Constat** : Hero, Shows, News, Newsletter, Team = `96px` top+bottom. L'œil ne perçoit aucun tempo, aucune respiration dramatique. Une seule exception : About à `py-32` (128px) sans motivation visuelle claire.

| Section | Padding | Ressenti |
| --- | --- | --- |
| Hero | `min-h-screen` | ✅ plein écran |
| Partners strip | `py-2` = **8px** | ❌ trop serré (contraste brutal) |
| Shows | `py-24` = 96px | — |
| News | `py-24` = 96px | — |
| Newsletter | `py-24` = 96px | — |
| Team | `py-24` = 96px | — |
| About | `py-32` = **128px** | incohérent |

```css
/* Fix — rythme progressif suggéré */
.section-shows     { padding-block: 5rem; }    /* 80px */
.section-news      { padding-block: 6rem; }    /* 96px */
.section-newsletter{ padding-block: 4rem; }    /* 64px — condensé = urgence */
.section-team      { padding-block: 6rem; }    /* 96px */
.section-about     { padding-block: 8rem; }    /* 128px — conclusion = espace */
```

### Problème 2.2 — Partners strip : `py-2` (8px) brûle la transition hero/sections `[P2]`

**Fichier** : PartnersView.tsx  
**Position** : ~(0, 720)  
**Constat** : Le strip partenaires occupe à peine 56px. La transition Hero → Shows est brutale, non résolue.

```css
/* Fix */
.partners-strip { padding-block: 1.5rem; }   /* py-6 = 24px ↑ de 8px */
```

### Problème 2.3 — Team cards : `gap-y-16` (64px) entre cartes membres `[P2]`

**Fichier** : HomeTeamView.tsx  
**Constat** : 64px de gouttière verticale entre les cartes membres — excessif pour une grille à 4 colonnes. Crée une impression de données éparpillées.

```css
/* Fix */
.team-grid { gap: 2rem 2rem; }   /* gap-8 = 32px, vs gap-y-16 = 64px */
```

---

## 3. Color & Contrast — 5 / 10

### Problème 3.1 — Newsletter input : `rgba(255,255,255,0.1)` → champ quasi-invisible `[P1]`

**Fichier** : NewsletterView.tsx  
**Selector** : `section.newsletter input[type="email"]`  
**Constat mesuré** : `background-color: rgba(255, 255, 255, 0.10)` sur fond crimson `hsl(0,79%,31%)`. Le champ est presque invisible — l'utilisateur ne sait pas où cliquer.

```css
/* Fix */
section.newsletter input[type="email"] {
  background-color: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  color: #ffffff;
}
section.newsletter input::placeholder {
  color: rgba(255, 255, 255, 0.65);
}
```

### Problème 3.2 — Partner logos : `opacity-40 grayscale` sur fond sombre `[P1]`

**Fichier** : LogoCloud.tsx  
**Selector** : `.logo-cloud-track img`  
**Position** : ~(0, 660), h≈56px  
**Constat** : `opacity: 0.4` + `filter: grayscale(1)` sur le fond dégradé sombre du strip partenaires → logos à peine discernables. Discréditant pour les partenaires.

```css
/* Fix — meilleure visibilité au repos */
.logo-cloud-track img {
  opacity: 0.65;          /* ↑ de 0.40 */
  filter: grayscale(0.6); /* légèrement moins gris */
  transition: opacity 0.3s, filter 0.3s;
}
.logo-cloud-track img:hover {
  opacity: 1;
  filter: grayscale(0);
}
```

### Problème 3.3 — Sections Shows + About + News : fond quasi-identique, aucune alternance `[P1]`

**Constat mesuré** :

- Shows (`bg-chart-7`): `rgb(247, 247, 247)` ≈ `#F7F7F7`  
- About (`bg-chart-7`): `rgb(247, 247, 247)` ≈ `#F7F7F7`  
- News (`bg-background`): `rgb(245, 243, 240)` ≈ `#F5F3F0`  

Différence perçue : ~2 niveaux de luminosité. L'œil ne distingue pas les sections — effet de "document Word". Seule la Newsletter (crimson) crée un vrai break.

```css
/* Fix — alternance marquée */
.section-shows   { --section-bg: hsl(40, 20%, 95%); }   /* cream chaud #F5F3F0 */
.section-news    { --section-bg: hsl(0, 0%, 100%); }     /* blanc pur */
.section-team    { --section-bg: hsl(40, 20%, 95%); }    /* cream chaud */
.section-about   { --section-bg: hsl(0, 0%, 100%); }     /* blanc pur */
/* Plus lisible + cohérent avec la palette warm cream existante */
```

---

## 4. Accessibility — 4 / 10

### Problème 4.1 — 3 liens sociaux footer : `href="#"` + texte vide `[P0]`

**Fichier** : footer.tsx  
**Selector** : `footer a[href="#"]`  
**Position** : ~(26-112, 1064) desktop  
**Constat** : Facebook, Instagram, Twitter — tous `href="#"` (liens cassés) et aucun texte accessible (`aria-label` absent, texte visible absent, contenu uniquement SVG). WCAG 4.1.2 failure + lien mort.

```tsx
/* Fix */
<a href="https://facebook.com/rougecardinal" aria-label="Nous suivre sur Facebook">
  <FacebookIcon aria-hidden="true" />
</a>
```

### Problème 4.2 — Bouton hamburger mobile : aucun nom accessible `[P0]`

**Fichier** : header.tsx  
**Selector** : `header button` (mobile)  
**Position** : `(308, 8)`, `36×32px`  
**Constat mesuré** : `ariaLabel: null`, `text: ""`. La touche est aussi trop petite : `32px` de haut vs 44px minimum WCAG 2.5.8. Double échec.

```tsx
/* Fix */
<button 
  aria-label="Ouvrir le menu de navigation"
  className="... min-h-11 min-w-11"   /* 44px minimum */
>
  <MenuIcon aria-hidden="true" />
</button>
```

### Problème 4.3 — Liens de navigation desktop : hauteur de clic 28px `[P1]`

**Fichier** : header.tsx  
**Selector** : `header nav a`  
**Constat mesuré** : `height: 28px` sur desktop (760px+). WCAG 2.5.8 exige 24px minimum avec 3px d'espace libre — **mais** WCAG 2.5.5 (AA) recommande 44×44px. Sur mobile ce n'est pas applicable (menu caché).

```css
/* Fix */
header nav a {
  min-height: 2.75rem;      /* 44px */
  display: inline-flex;
  align-items: center;
  padding-inline: 0.75rem;
}
```

---

## 5. AI-Slop Patterns — 3 / 10

### Problème 5.1 — Template identique × 5 sections `[P2]`

**Fichiers** : Tous les `*View.tsx` des sections home  
**Constat** : Chaque section applique strictement la même structure :

```bash
[Surtitle tracké en majuscules]
[Grand H2 centré, Playfair ou system-sans]
[Sous-titre en italic muted, centré]
[Grid ou liste]
[CTA → "Voir tous les X"]
```

Le rythme visuel est parfaitement monotone. Pas de section "cassant" le moule — sauf Newsletter (réussie justement parce qu'elle rompt avec le layout centré).

### Problème 5.2 — Statistiques et données "placeholder" `[P1]`

**Fichier** : AboutContent.tsx  
**Constat** : `3+ événements`, `600+ spectateurs`, `2+ années`, `+2 festivals`. Les chiffres semblent bas pour une compagnie de théâtre et ressemblent à des valeurs initiales non mises à jour. Idem pour le téléphone `+33 1 23 45 67 89` (séquence numérotée typique de placeholder).

### Problème 5.3 — CTAs de section : copie générique `[P2]`

**Fichiers** : ShowsView.tsx, NewsView.tsx, AboutContent.tsx

| CTA actuel | Problème |
| --- | --- |
| "Voir tout l'agenda" | fonctionnel mais plat |
| "Voir toutes les actualités" | copie de support technique |
| "Découvrir notre histoire" | générique absolu |

```
Suggestions théâtrales :
"Voir tout l'agenda"       → "Réserver votre prochain soir"
"Voir toutes les actualités" → "Lire les coulisses"
"Découvrir notre histoire"   → "Ce qui nous anime"
```

---

## 6. Motion / Animation — 7 / 10

### Point positif : couverture `prefers-reduced-motion` globale ✅

**Fichier** : globals.css  
Le bloc `@media (prefers-reduced-motion: reduce)` couvre `*, *::before, *::after` + toutes les animations nommées explicitement (`.animate-fade-in-up`, `.animate-shimmer`, `.animate-infinite-scroll`). Pratique exemplaire.

### Problème 6.1 — Pause-on-hover du LogoCloud : pas de label accessible `[P2]`

**Fichier** : LogoCloud.tsx  
**Constat** : Le mécanisme pause-on-hover utilise une variable CSS `--animation-state: paused/running`. Il n'y a pas de bouton "Pause" visible avec `aria-label` — WCAG 2.2.2 exige un mécanisme de pause pour toute animation qui dure plus de 5 secondes.

```tsx
/* Fix — bouton pause accessible */
<button 
  aria-label={isPaused ? "Reprendre le défilement" : "Mettre en pause le défilement"}
  onClick={() => setIsPaused(p => !p)}
  className="sr-only focus:not-sr-only focus:absolute"
/>
```

### Problème 6.2 — Header blur `var(--blur-3xl)` = 64px : très lourd visuellement `[P2]`

**Fichier** : globals.css (`.header-scrolled`)  
**Constat** : `backdrop-filter: blur(64px)` — visuellement spectaculaire mais peut causer une réduction de performance GPU sur mobile, et la valeur est 3× plus élevée que les conventions habituelles (8–20px).

```css
/* Fix — valeur plus raisonnable */
.header-scrolled {
  backdrop-filter: blur(20px);   /* var(--blur-lg) au lieu de var(--blur-3xl) */
}
```

---

## 7. Copy / CTA Quality — 5 / 10

### Point positif : hero copy ✅

- H1 `"L'Art de Raconter"` — évocateur, identitaire
- H2 `"Des histoires qui résonnent"` — complément poétique
- Newsletter `"Restez dans les coulisses"` — excellent positionnement intimiste

### Problème 7.1 — Inconsistance de ton entre hero et sections `[P2]`

Le hero investit un registre théâtral (Playfair, "coulisses", "résonner"). Les sections body reviennent à un langage de plaquette institutionnelle ("Découvrir notre histoire", "Voir toutes les actualités"). La voix de marque n'est pas maintenue.

### Problème 7.2 — Phone et stats semblent placeholder `[P1]`

Voir 5.2. Un numéro de téléphone `+33 1 23 45 67 89` et des stats minimalistes (`3+`) communiquent une compagnie naissante — potentiellement fidèle à la réalité, mais à présenter avec plus de contexte narratif si c'est délibéré.

### Problème 7.3 — Sous-titres de section tous au même registre `[P2]`

Chaque section a un sous-titre en `text-muted-foreground italic` 18–20px qui reformule platement le titre :

- "Les artistes et collaborateurs qui donnent vie à Rouge Cardinal"
- "Suivez l'actualité de la compagnie Rouge-Cardinal"

Ces sous-titres n'ajoutent pas de valeur émotionnelle. Ils pourraient être supprimés ou remplacés par une phrase qui crée de l'envie.

---

## Scores Récapitulatifs

| Catégorie | Score | Motif principal |
| --- | --- | --- |
| Visual Hierarchy | **4/10** | H1=H2 taille identique, 5 sections même template, heading skip |
| Spacing Rhythm | **5/10** | py-24 monolithique, partner strip 8px, team gap 64px |
| Color & Contrast | **5/10** | Input quasi-invisible, logos trop pâles, sections indifférenciables |
| Accessibility | **4/10** | 2 P0 (social links + hamburger), 2 P1 (nav targets + heading level) |
| AI-Slop Patterns | **3/10** | Template × 5, stats placeholder, copie générique |
| Motion/Animation | **7/10** | prefers-reduced-motion ✅, pause-on-hover ✅, blur 64px excessif |
| Copy/CTA Quality | **5/10** | Hero excellent, sections génériques, ton inconsistant |
| **Total** | **33/70** | **4.7 / 10** |

---

## Punch List finale — triée par Impact × Effort

### 🔴 Do First (impact élevé × effort minimal < 30 min)

| # | Priorité | Item | Fichier | Effort |
| --- | --- | --- | --- | --- |
| 1 | P0 | Hamburger mobile : ajouter `aria-label` + `min-h-11 min-w-11` | header.tsx | 5 min |
| 2 | P0 | Footer social links : `aria-label` + vrais `href` | footer.tsx | 15 min |
| 3 | P1 | Newsletter : changer `<h3>` → `<h2>` | NewsletterView.tsx | 2 min |
| 4 | P1 | Newsletter input : `rgba(0.1)` → `rgba(0.15)` + border | NewsletterView.tsx | 5 min |
| 5 | P2 | Footer : `mailto:` + `tel:` sur contact | footer.tsx | 10 min |

### 🟠 Next Sprint (impact élevé × effort moyen 1–4h)

| # | Priorité | Item | Fichier | Effort |
| --- | --- | --- | --- | --- |
| 6 | P1 | Section H2 font : remplacer `font-sans` par `font-playfair` ou `font-geist` | 5 fichiers View | 30 min |
| 7 | P1 | Hero H1/H2 différenciation de taille | HeroCTA.tsx | 20 min |
| 8 | P1 | Partner logos opacity : `opacity-40` → `opacity-65`, `grayscale` → `grayscale-60` | LogoCloud.tsx | 10 min |
| 9 | P1 | Nav links desktop : `min-h-11` (44px touch target) | header.tsx | 15 min |
| 10 | P1 | Alternance de fond sections : crème / blanc / crème / blanc | 4 fichiers View | 30 min |

### 🟡 Later (impact moyen × effort variable)

| # | Priorité | Item | Fichier | Effort |
| --- | --- | --- | --- | --- |
| 11 | P2 | "À la Une" letter-spacing : `tracking-widest` → `tracking-wide` | NewsView.tsx | 5 min |
| 12 | P2 | Team gap-y : `gap-y-16` → `gap-y-8` | HomeTeamView.tsx | 5 min |
| 13 | P2 | About py-32 → `py-24` (uniformisation) | AboutContent.tsx | 5 min |
| 14 | P2 | Header blur : `64px` → `20px` | globals.css | 5 min |
| 15 | P2 | Partner strip padding : `py-2` → `py-6` | PartnersView.tsx | 5 min |
| 16 | P2 | News cards grid : 2+1 → 3 colonnes égales desktop | NewsView.tsx | 45 min |
| 17 | P2 | LogoCloud : bouton pause accessible (WCAG 2.2.2) | LogoCloud.tsx | 45 min |
| 18 | P2 | CTAs : réécriture copy avec ton théâtral | 3 fichiers View | 2h |
| 19 | P2 | Rompre le template × 5 : redesign 2 sections | ShowsView + TeamView | 4h |
| 20 | P1 | Vérifier/remplacer stats et téléphone placeholder | AboutContent.tsx | 2h (contenu) |

---

**ROI maximum** : les items 1–5 prennent moins d'une heure au total et effacent les 2 P0 + les défauts les plus gênants. L'item 6 (fonts sections) est le changement visuel à plus fort impact avec peu d'effort — c'est la priorité sprint suivante.
