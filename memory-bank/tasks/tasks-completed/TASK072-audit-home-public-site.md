# TASK072 - Audit conformité public/home

**Status:** Completed  
**Added:** 2026-03-03  
**Updated:** 2026-03-03

## Original Request

Audit de conformité de `components/features/public-site/home/` (6 sous-modules, ~34 fichiers) contre les instructions du projet : Clean Code, TypeScript strict, a11y WCAG 2.2, Composition Patterns, DAL SOLID, OWASP. Plan de remédiation en `.github/prompts/plan-TASK072-auditHomePublicSite.prompt.md`.

## Thought Process

Approche systématique en 7 étapes progressives (purge → constantes → a11y carousel → a11y images → SRP → splitting → composition). L'audit source a révélé des violations critiques : 5 fichiers hooks.ts 100% dead code, magic numbers dans le carousel, pas de navigation clavier WCAG, pas de pause/play auto-play, monolithes >100L, prop drilling newsletter sur 8 props. Deux sous-étapes optionnelles (7.2 compound carousel, 7.5 remove use client de HeroView) ont été SKIPPED car le splitting de l'étape 6 était suffisant. Un fix cascading non planifié a été nécessaire sur `AgendaNewsletter.tsx`.

## Implementation Plan

1. Purge dead code (5 hooks.ts + types.ts commenté) + nettoyage props/types
2. Extraction constantes (4 magic numbers + label saison Option C)
3. Accessibilité carousel (ARIA, keyboard nav, pause/play, reduced-motion)
4. Accessibilité images + ShowsView hover-only fix (`group-focus-within`) + heading hierarchy
5. Découplage SRP Hero ↔ Partners (page.tsx wrapper Suspense)
6. Splitting monolithes en sous-composants
7. Composition patterns (NewsletterContext, withDisplayToggle helper)

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID  | Description | Status | Updated | Notes |
| --- | ----------- | ------ | ------- | ----- |
| 1.1 | Supprimer 5x hooks.ts dead code | Complete | 2026-03-03 | hero, about, news, shows, partners |
| 1.2 | Supprimer home/types.ts (91L commenté) | Complete | 2026-03-03 | 100% dead code |
| 1.3 | Nettoyer isLoading des types (4 modules) | Complete | 2026-03-03 | about, news, shows, newsletter |
| 2.1 | Créer hero/constants.ts (4 constantes) | Complete | 2026-03-03 | AUTO_PLAY_INTERVAL_MS, PAUSE_AFTER_INTERACTION_MS, MIN_SWIPE_DISTANCE_PX, CURRENT_SEASON_LABEL |
| 2.2 | Décision saison → Option C variante | Complete | 2026-03-03 | Constante manuelle, migration `configurations_site` possible |
| 3.1 | ARIA carousel (role, aria-roledescription, aria-label, aria-live) | Complete | 2026-03-03 | HeroClient.tsx |
| 3.2 | Keyboard nav (ArrowLeft/Right) | Complete | 2026-03-03 | HeroClient.tsx |
| 3.3 | Bouton pause/play + prefers-reduced-motion | Complete | 2026-03-03 | HeroClient.tsx |
| 4.1 | ShowsView group-focus-within overlay | Complete | 2026-03-03 | ShowCard.tsx |
| 4.2 | Heading hierarchy (h3 sections + h4 cards) | Complete | 2026-03-03 | NewsCard, ShowCard |
| 5.1 | Retirer Partners de HeroContainer | Complete | 2026-03-03 | SRP strict |
| 5.2 | PartnersContainer Suspense dans page.tsx | Complete | 2026-03-03 | Wrapper relative |
| 6.1 | Splitter HeroView (192→62L) en 5 sous-composants | Complete | 2026-03-03 | HeroSlideBackground, HeroCTA, HeroNavigation, HeroIndicators, HeroProgressBar |
| 6.2 | Extraire AboutContent de AboutView (75→12L) | Complete | 2026-03-03 | Grid layout texte + stats |
| 6.3 | Extraire NewsCard de NewsView (94→41L) | Complete | 2026-03-03 | Carte article individuelle |
| 6.4 | Extraire ShowCard de ShowsView (117→37L) | Complete | 2026-03-03 | Carte spectacle hover+focus |
| 7.1 | NewsletterContext (Provider + useNewsletterContext) | Complete | 2026-03-03 | 59L, élimine prop drilling 8 props |
| 7.2 | Carousel Compound Components | Skipped | 2026-03-03 | Step 6 suffisant |
| 7.3 | Contrast ratio text-white/70 | Complete | 2026-03-03 | Implémenté |
| 7.4 | withDisplayToggle RSC helper | Complete | 2026-03-03 | 32L dans lib/utils/ |
| 7.5 | Retirer "use client" de HeroView | Skipped | 2026-03-03 | 7.2 non implémenté |
| 8.0 | Fix cascading AgendaNewsletter | Complete | 2026-03-03 | Non planifié, NewsletterProvider source="agenda" |
| 9.0 | Validation build/lint/type-check/rate-limit | Complete | 2026-03-03 | 4/4 ✅ |

## Progress Log

### 2026-03-03

- Audit complet de 34 fichiers dans `components/features/public-site/home/` (6 sous-modules)
- Identifié violations réparties en catégories :
  - Clean Code P1 : 5 fichiers hooks.ts 100% dead code (hero, about, news, shows, partners) + types.ts 91L commenté
  - Clean Code P1 : Magic numbers dans HeroClient (6000, 10000, 50)
  - a11y WCAG P0 : Pas de navigation clavier carousel, pas de pause/play, pas de reduced-motion
  - a11y WCAG P0 : ShowsView hover-only overlay (pas accessible clavier)
  - Composition P2 : Monolithes HeroView 192L, ShowsView 117L, NewsView 94L, AboutView 75L
  - Composition P2 : Prop drilling newsletter 8 props
  - SRP P2 : HeroContainer responsable de Hero+Partners
- **Étape 1** : Supprimé 6 fichiers dead code (5 hooks.ts + 1 types.ts = ~604L), nettoyé isLoading des 4 types.ts
- **Étape 2** : Créé `hero/constants.ts` (16L) avec 4 constantes. Décision saison : Option C variante (constante manuelle)
- **Étape 3** : Ajouté au carousel — role="region", aria-roledescription="Carrousel", aria-label, aria-live="off"/"polite", aria-current dots, keyboard ArrowLeft/Right, bouton pause/play, prefers-reduced-motion query
- **Étape 4** : ShowCard avec `group-focus-within:opacity-100` pour accessibilité overlay. Headings corrigés : h3 sections, h4 cards
- **Étape 5** : Partners retiré de HeroContainer (SRP). PartnersContainer positionné dans `page.tsx` avec `<Suspense>` wrapper `relative`
- **Étape 6** : Split des 4 monolithes :
  - HeroView 192→62L avec 5 sous-composants (HeroSlideBackground 42L, HeroCTA 60L, HeroNavigation 65L, HeroIndicators 76L, HeroProgressBar 22L)
  - AboutView 75→12L + AboutContent 62L
  - NewsView 94→41L + NewsCard 64L
  - ShowsView 117→37L + ShowCard 92L
- **Étape 7** : NewsletterContext.tsx (59L) + NewsletterForm.tsx (49L) = zéro prop drilling. withDisplayToggle.tsx (32L) RSC helper. Steps 7.2 et 7.5 SKIPPED
- **Non planifié** : Fix cascading AgendaNewsletter.tsx — wrapper `<NewsletterProvider source="agenda">` ajouté pour maintenir la compatibilité
- Validation finale : `pnpm build` ✅, `tsc --noEmit` ✅, `pnpm lint` ✅, rate-limit tests 4/4 ✅
- Bilan : 22 fichiers modifiés, 6 supprimés, 14 créés. Net -983 lignes
