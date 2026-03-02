# Plan : Audit conformité public/compagnie (TASK069)

**TL;DR** — Refactorer le monolithe `CompagnieView.tsx` (242L) en 6 composants de section avec un `SECTION_RENDERERS` map, corriger 3 violations WCAG (titres, alt text, landmarks), nettoyer le dead code (hooks.ts, fonctions Legacy, commentaires morts), déplacer le fallback dans la couche DAL, et aligner l'architecture (force-dynamic). 17 violations identifiées, 8 phases, ~20 fichiers impactés.

Le pattern `SECTION_RENDERERS` est **nouveau** dans le projet (aucune implémentation existante). Il est préféré aux sous-dossiers par section (pattern Home) car les sections compagnie sont **pilotées dynamiquement par la DB** via un `sections.map()` — un mapping statique type→composant est plus adapté qu'une arborescence Container/View par section.

**Steps**

### Phase 1 — Nettoyage dead code (4 actions)

1. **Supprimer** `hooks.ts` entièrement (102L, 100% commenté) et retirer l'export commenté dans `index.ts` L4
2. **Supprimer** le bloc commenté `LucideIconMap` dans `CompagnieView.tsx` L2-L15 (~14 lignes mortes) et l'import `LucideIcons` inutilisé
3. **Supprimer** `fetchCompagnieValuesLegacy` et `fetchTeamMembersLegacy` dans `lib/dal/compagnie.ts` L116-L131 (0 consommateurs confirmés)
4. **Supprimer** le commentaire TODO périmé dans `app/(marketing)/compagnie/page.tsx` L20 ("retirer les délais artificiels") et le bloc Zod commenté dans `components/features/public-site/compagnie/data/presentation.ts` L8-L21

### Phase 2 — Inversion de dépendance : fallback

5. **Créer** `lib/dal/fallback/compagnie-presentation-fallback.ts` — déplacer le contenu de `data/presentation.ts` (export `compagniePresentationFallback`) dans ce nouveau fichier, en nettoyant le commentaire deprecated et le Zod schema commenté
6. **Mettre à jour** l'import dans `lib/dal/compagnie-presentation.ts` L7 : remplacer `@/components/features/public-site/compagnie/data/presentation` par `@/lib/dal/fallback/compagnie-presentation-fallback`
7. **Supprimer** `components/features/public-site/compagnie/data/presentation.ts` et le dossier `data/` s'il est vide
8. **Corriger** les 3 casts `as unknown as PresentationSection[]` dans `compagnie-presentation.ts` L103, L111, L129 — soit typer correctement le fallback avec le type `PresentationSection[]` directement, soit utiliser un type guard

### Phase 3 — Extraction des 6 composants de section

9. **Créer** le dossier `components/features/public-site/compagnie/sections/` avec 6 fichiers :
   - `SectionHero.tsx` — extrait des lignes ~L32-L56 de `CompagnieView`
   - `SectionHistory.tsx` — extrait des lignes ~L58-L91
   - `SectionQuote.tsx` — extrait des lignes ~L93-L119
   - `SectionValues.tsx` — extrait des lignes ~L121-L161
   - `SectionTeam.tsx` — extrait des lignes ~L163-L208
   - `SectionMission.tsx` — extrait des lignes ~L210-L234
   - `index.ts` — barrel exports des 6 composants

   Chaque composant reçoit en props `{ section: PresentationSection }` + les données spécifiques (`values`, `team`) si nécessaire. Chaque fichier doit être **< 30 lignes**.

10. **Créer** le `SECTION_RENDERERS` map dans `CompagnieView.tsx` refactoré :
    ```typescript
    const SECTION_RENDERERS: Record<string, ComponentType<SectionProps>> = {
      hero: SectionHero,
      history: SectionHistory,
      quote: SectionQuote,
      values: SectionValues,
      team: SectionTeam,
      mission: SectionMission,
    };
    ```
    Le `.map()` devient : récupérer le renderer via `SECTION_RENDERERS[section.kind]`, rendre `null` si inconnu. `CompagnieView.tsx` devrait passer sous **50 lignes** (map, renderers import, wrapper div).

### Phase 4 — Corrections accessibilité WCAG 2.2 AA

11. **Hiérarchie titres** (WCAG 1.3.1) — Dans chaque composant de section extrait :
    - `SectionHero` : garder `<h1>` (titre principal de la page)
    - Toutes les autres sections : remplacer `<h3>` par `<h2>` (sous-titres directs du h1)
    - Si des sous-titres existent dans les sections values/team, utiliser `<h3>`

12. **Alt text pour images** (WCAG 1.1.1) — Dans `SectionHistory` et `SectionTeam` :
    - Remplacer `style={{ backgroundImage: url(...) }}` par `<Image>` de `next/image` (ou `<img>` avec `alt` descriptif)
    - Pour history : `alt={section.title}` ou description contextuelle
    - Pour team : `alt={member.name}` (nom du membre comme alt text)
    - Utiliser `object-cover` + `fill` ou dimensions explicites pour le layout

13. **Landmarks** (WCAG 1.3.1 / 4.1.2) — Dans chaque composant de section :
    - Ajouter un `id` unique dérivé du titre de section (ex: `id={section.kind}`)
    - Ajouter `aria-labelledby` pointant vers le heading de la section
    - Pattern : `<section aria-labelledby={headingId}>` + `<h2 id={headingId}>`

### Phase 5 — TypeScript strict + constantes

14. **Return types explicites** — Ajouter `JSX.Element` ou `React.ReactElement` comme return type sur :
    - `CompagnieView` dans le fichier refactoré
    - `CompagnieContainer` dans `CompagnieContainer.tsx`
    - Les 6 nouveaux composants de section

15. **Extraire magic numbers en constantes** — Créer un fichier `constants.ts` (ou ajouter dans `types.ts`) :
    - `DEFAULT_ITEMS_LIMIT = 12` (utilisé dans `CompagnieContainer.tsx` L9-10 pour `fetchCompagnieValues(12)` et `fetchTeamMembers(12)`)
    - `ANIMATION_DELAY_STEP = 0.1` et `ANIMATION_BASE_DELAY = "0.2s"` (utilisés dans les sections extraites)
    - `FALLBACK_MEMBER_IMAGE = "/logo-florian.png"` (Container L13)

### Phase 6 — Architecture page.tsx

16. **Remplacer ISR par force-dynamic** dans `app/(marketing)/compagnie/page.tsx` L8 :
    - Supprimer `export const revalidate = 60`
    - Ajouter `export const dynamic = 'force-dynamic'` et `export const revalidate = 0`
    - Cohérent avec les autres pages marketing utilisant `createClient()` Supabase (le copilot-instructions.md liste déjà cette page comme nécessitant force-dynamic)

### Phase 7 — DAL cleanup

17. **Réduire** `fetchCompagniePresentationSections` dans `lib/dal/compagnie-presentation.ts` L84-L133 sous 30 lignes : extraire la logique de fallback dans un helper privé `handleFetchError()` ou `getDefaultSections()`
18. **Vérifier** que `fetchTeamMembers` dans `lib/dal/compagnie.ts` L71-L101 reste ≤ 30L après nettoyage des fonctions legacy (actuellement ~31L, marge limite)

### Phase 8 — Vérifications finales

19. **Mettre à jour** `components/features/public-site/compagnie/index.ts` : ajouter l'export du barrel `sections/index.ts`, supprimer toute ligne commentée restante
20. **Vérifier** `pnpm lint` et `pnpm build` passent sans erreur
21. **Vérifier** le rendu visuel de la page `/compagnie` (aucune régression d'affichage)

**Verification**

- `pnpm lint` — 0 erreurs/warnings
- `pnpm build` — build réussi sans erreur
- Vérification manuelle `/compagnie` — les 6 sections s'affichent correctement, responsive OK
- Accessibility Insights ou extension axe DevTools : 0 violations heading hierarchy, 0 missing alt, landmarks correctement identifiés
- Vérifier que `CompagnieView.tsx` refactoré est **< 60 lignes**
- Vérifier que chaque composant `sections/*.tsx` est **< 30 lignes**
- `grep -r "as unknown as" lib/dal/compagnie-presentation.ts` → 0 résultat
- `grep -r "hooks.ts" components/features/public-site/compagnie/` → 0 résultat

**Decisions**

- **SECTION_RENDERERS map** plutôt que sous-dossiers Container/View par section (pattern Home) : les sections compagnie sont pilotées par DB via `.map()`, pas composées manuellement — un mapping statique est plus simple et cohérent
- **`next/image`** plutôt que `<img>` pour remplacer les `background-image` CSS : bénéficie de l'optimisation automatique Next.js et du lazy loading
- **Fallback dans `lib/dal/fallback/`** : nouveau dossier dans la couche DAL, respecte l'inversion de dépendance sans restructuration majeure
- **`force-dynamic`** au lieu de ISR : alignement avec la directive du copilot-instructions.md et les autres pages marketing Supabase SSR
- **`ReactElement` comme return type** plutôt que `JSX.Element` : recommandé par les guidelines TypeScript React modernes
