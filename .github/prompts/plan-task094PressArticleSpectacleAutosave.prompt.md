
# Plan : Autosave brouillon — Articles de presse & Spectacles (TASK094)

Étendre le pattern auto-save Google Docs (TASK093) aux **articles de presse** et **spectacles** en généralisant le hook. Règle invariante : **pas d'auto-save sur entité publiée**, et le payload force toujours l'état "brouillon" (defense-in-depth).

## Phases

### Phase 1 — Mutualisation (préparatoire)

1. Créer `lib/hooks/use-form-autosave.ts` générique `useFormAutosave<TFormValues, TPayload, TUpdatePayload>` à partir de `lib/hooks/use-press-release-autosave.ts`. Conserver : state machine `idle|dirty|saving|saved|error`, debounce 2s, heartbeat 30s, `isSavingRef`/`hasQueuedSaveRef`, `beforeunload`, cleanup.
2. Créer `components/features/admin/shared/AutoSaveIndicator.tsx` (déplacement du composant `presse/AutoSaveIndicator.tsx`).
3. Migrer `usePressReleaseAutosave` → wrapper léger autour de `useFormAutosave` (ou suppression + remplacement direct des imports).
4. Mettre à jour imports dans `PressReleaseNewForm.tsx` et `PressReleaseEditForm.tsx`.

*Vérif* : `pnpm lint && pnpm build` + smoke test flow communiqués (comportement identique à TASK093).

### Phase 2 — Articles de presse *(parallèle avec phase 3)*

- Triggers : `["title", "source_publication", "chapo"]`. Gate publication : `published_at IS NOT NULL`. Auto-save force `published_at: null`.

1. `app/(admin)/admin/presse/press-articles-actions.ts` : `createArticleAction` → `Promise<ActionResult<{ id: string }>>` (renvoie `{ id: String(result.data.id) }`).
2. `lib/utils/press-utils.ts` : ajouter `buildArticleDraftPayload` (placeholder `"(Sans titre)"` si title vide, force `published_at: null`) + `buildArticleDraftUpdatePayload` (omet title si vide).
3. `components/features/admin/presse/ArticleNewForm.tsx` : brancher `useFormAutosave`, `savedDraftId` state, `<AutoSaveIndicator>`, `onSubmit` → update si draft existe sinon create, **pas de redirect pendant l'autosave**, image-validation gate uniquement sur submit final.
4. `components/features/admin/presse/ArticleEditForm.tsx` : `enabled: !isPublished && !isPending`, bannière "Article publié — sauvegarde manuelle requise" si publié.

*Vérif* : `pnpm lint && pnpm build` + DB : `published_at IS NULL` sur tous les autosaves + bannière sur articles publiés.

### Phase 3 — Spectacles *(parallèle avec phase 2)*

- Triggers : `["title", "short_description", "description"]`. Gate publication : `public === true`. Auto-save force `public: false` ET `status: "draft"`.

1. `app/(admin)/admin/spectacles/actions.ts` : `createSpectacleAction` → `Promise<ActionResult<{ id: string }>>`. `updateSpectacleAction` → `Promise<ActionResult>` (vérifier appelants qui lisent `result.data`).
2. `lib/forms/spectacle-form-helpers.ts` : ajouter `buildSpectacleDraftPayload` + `buildSpectacleDraftUpdatePayload` (forcer `public: false`, `status: "draft"`).
3. `components/features/admin/spectacles/SpectacleForm.tsx` : `isPublished = defaultValues?.public === true`, `useFormAutosave` avec `enabled: !isPublished && !isSubmitting`, bannière publié, conserver les gates de validation image actuels.
4. **Hors scope** : `SpectacleGalleryManager`, `SpectaclePhotoManager`, `landscape_photo_1_id/2_id` (modifiés hors form principal).

*Vérif* : DB : `public=false` & `status='draft'` sur autosaves + bannière sur spectacles publiés.

### Phase 4 — Doc & polish

- Référencer `useFormAutosave` dans `.github/copilot-instructions.md` section Patterns (paragraphe court).

## Relevant files

**À créer**

- `lib/hooks/use-form-autosave.ts` — hook générique partagé
- `components/features/admin/shared/AutoSaveIndicator.tsx` — composant d'état partagé

**À modifier**

- `lib/hooks/use-press-release-autosave.ts` — wrapper ou supprimé
- `components/features/admin/presse/PressReleaseNewForm.tsx` & `PressReleaseEditForm.tsx`
- `app/(admin)/admin/presse/press-articles-actions.ts`
- `components/features/admin/presse/ArticleNewForm.tsx` & `ArticleEditForm.tsx`
- `lib/utils/press-utils.ts`
- `app/(admin)/admin/spectacles/actions.ts`
- `components/features/admin/spectacles/SpectacleForm.tsx`
- `lib/forms/spectacle-form-helpers.ts`

## Verification

1. `pnpm lint && pnpm build` — pas d'erreurs TS
2. DB articles : autosave n'écrit jamais `published_at NOT NULL`
3. DB spectacles : autosave n'écrit jamais `public=true` ni `status='published'`
4. Auto-save désactivé sur entité publiée (3 features) + bannière visible
5. `beforeunload` actif pendant un save
6. Heartbeat 30s : save spontané si champ dirty sans frappe
7. Race conditions : frappes rapides → un seul save final consolidé

## Decisions

- **Hook partagé** retenu (DRY pour 3 features + futures)
- **Articles** : force `published_at: null`. **Spectacles** : force `public: false` + `status: "draft"`
- Titre placeholder `"(Sans titre)"` sur create ; sur update, omettre si vide (préserve valeur DB)
- **Hors scope** : galerie photos, photos landscape spectacles, purge brouillons orphelins, autosave médias upload

## Further considerations

1. **Migration TASK093** vers hook partagé : incluse en phase 1. Si phase 1 paraît trop large pour une PR, alternative = laisser TASK093 sur son hook actuel et créer le générique uniquement pour les nouvelles features. *Recommandation : tout migrer pour éviter la dette technique.*
2. **`updateSpectacleAction` signature** : l'action actuelle prend `{ id, ...input }` en un seul objet, le hook attend `onUpdate(id, payload)`. *Recommandation : adaptation locale dans le `onUpdate` du form (moins invasif qu'une nouvelle signature serveur).*
3. **DAL `admin-press-articles`** : vérifier au moment de l'implémentation que `createArticle` retourne bien `result.data.id` (bigint). Si non, ajustement DAL out-of-band nécessaire.
