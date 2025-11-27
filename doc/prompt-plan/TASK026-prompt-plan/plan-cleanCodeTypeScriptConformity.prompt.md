# Plan: Corrections Clean Code & TypeScript Conformity

Ce plan corrige les violations identifiées : refactoring AboutContentForm vers Server Actions, création du fichier home-about-actions.ts, déplacement de revalidatePath() hors du DAL, suppression du code commenté, et refactoring pour conformité Clean Code.

> **Note pédagogique** : Les `console.log` / `console.error` sont conservés intentionnellement pendant la phase de développement pour documenter l'avancement et tracer les erreurs. Ils seront supprimés avant la mise en production.

## Steps

1. ✅ **Créer lib/actions/home-about-actions.ts** — nouvelle Server Action `updateAboutContentAction()` basée sur le pattern de `home-hero-actions.ts`

2. ✅ **Refactorer lib/dal/admin-home-about.ts** — supprimer `revalidatePath()` (lignes 56-57), déplacer la revalidation dans les Server Actions

3. ✅ **Refactorer AboutContentForm.tsx** — remplacer `fetch()` (lignes 62-76) par appel à `updateAboutContentAction()`

4. ✅ **Supprimer le code commenté dans home-content.ts** — lignes 29-61 (ancien schéma commenté)

5. ✅ **Vérifier les redondances avec les helpers existants** — Analysé : pas de redondances actionables avec helpers.ts / spectacles-helpers.ts / use-debounce.ts

6. ✅ **Splitter HeroSlideForm.tsx** (316 → 200 lignes) — Extrait en sous-composants :
   - `HeroSlideFormFields.tsx` (143 lignes) — Champs texte (title, subtitle, description)
   - `HeroSlideImageSection.tsx` (85 lignes) — Section image avec MediaLibraryPicker
   - `HeroSlideCtaFields` + `HeroSlideActiveToggle` — Dans HeroSlideFormFields.tsx

7. ✅ **Créer schémas Zod séparés pour formulaires UI** — Éviter le type casting `as unknown as Resolver<>` :
   - Créé `HeroSlideFormSchema` dans `lib/schemas/home-content.ts` avec `number` au lieu de `bigint`
   - Créé `AboutContentFormSchema` équivalent
   - Les Server Actions continuent de valider avec le schéma original (coercion bigint)

8. ✅ **Supprimer les API routes obsolètes** — Après migration vers Server Actions :
   - Supprimé `app/api/admin/home/about/[id]/route.ts`
   - Supprimé `app/api/admin/home/about/route.ts`

## Tâches différées (avant production)

- [ ] Supprimer tous les `console.log` / `console.error` de debug (14 occurrences identifiées)

## Résumé d'exécution

**Date** : 2025-11-27  
**Status** : ✅ 8/8 étapes complétées  
**Vérification** : `pnpm exec tsc --noEmit` → ✅ Aucune erreur TypeScript

### Fichiers créés
- `lib/actions/home-about-actions.ts` — Server Action pour About content
- `components/features/admin/home/HeroSlideFormFields.tsx` (143 lignes)
- `components/features/admin/home/HeroSlideImageSection.tsx` (85 lignes)

### Fichiers modifiés
- `lib/dal/admin-home-about.ts` — Supprimé revalidatePath (déplacé dans Server Actions)
- `lib/schemas/home-content.ts` — Ajout HeroSlideFormSchema + AboutContentFormSchema (UI)
- `components/features/admin/home/AboutContentForm.tsx` — Migration fetch → Server Action
- `components/features/admin/home/HeroSlideForm.tsx` — Refactoré (316 → 200 lignes), utilise sous-composants

### Fichiers supprimés
- `app/api/admin/home/about/route.ts`
- `app/api/admin/home/about/[id]/route.ts`

## Analysis Results

### API Route Usage Check
- `/api/admin/home/about/${id}` — Utilisé UNIQUEMENT par `AboutContentForm.tsx` ligne 63
- Après migration vers Server Actions → **Peut être supprimé**

### Type Casting Issue
Le problème vient de la différence entre :
- **Schéma Zod** : `image_media_id: z.coerce.bigint()` (pour la BDD)
- **Formulaire UI** : `image_media_id?: number` (pour éviter les problèmes de sérialisation JSON)

**Solution** : Créer un schéma UI séparé qui utilise `number`, et laisser la Server Action faire la coercion vers `bigint` avec le schéma original.
