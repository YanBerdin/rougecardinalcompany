# `TASK094` - Auto-save générique articles de presse + spectacles

**Status:** Complète ✅  
**Added:** 2026-05-15  
**Updated:** 2026-05-15  
**Branch:** `feat/task093-press-autosave-draft`

## Objectif

Étendre le pattern auto-save Google Docs (TASK093) aux **articles de presse** et **spectacles** en généralisant le hook `usePressReleaseAutosave` en un hook partagé. Règle invariante : **jamais d'auto-save sur entité publiée**, le payload force toujours l'état brouillon (defense-in-depth).

## Subtasks

| ID  | Description                                            | Status   | Updated    | Notes |
| --- | ------------------------------------------------------ | -------- | ---------- | ----- |
| 1.1 | Créer `useFormAutosave` générique                      | Complete | 2026-05-15 | ✅ 291L |
| 1.2 | Déplacer `AutoSaveIndicator` → `admin/shared/`        | Complete | 2026-05-15 | ✅ |
| 1.3 | Refactoriser `usePressReleaseAutosave` en wrapper     | Complete | 2026-05-15 | ✅ |
| 1.4 | Mettre à jour imports PressRelease forms              | Complete | 2026-05-15 | ✅ |
| 2.1 | `createArticleAction` → `{ id: string }`             | Complete | 2026-05-15 | ✅ |
| 2.2 | Brancher `ArticleNewForm` avec `useFormAutosave`      | Complete | 2026-05-15 | ✅ |
| 2.3 | Brancher `ArticleEditForm` + bannière publié          | Complete | 2026-05-15 | ✅ |
| 3.1 | Brancher `SpectacleForm` avec `useFormAutosave`       | Complete | 2026-05-15 | ✅ |
| 4.1 | Fichier plan `.github/prompts/plan-task094*.md`       | Complete | 2026-05-15 | ✅ 82L |

## Implémentation

### Phase 1 — Hook générique + composant partagé

**`lib/hooks/use-form-autosave.ts`** (291 lignes, NOUVEAU) :

```typescript
useFormAutosave<TFormValues, TPayload, TUpdatePayload>({
  form,                    // UseFormReturn<TFormValues>
  enabled,                 // false = désactive l'auto-save
  initialDraftId?,         // string — si brouillon DB existant
  triggerFields,           // (keyof TFormValues)[] — champs déclencheurs
  debounceMs = 2000,       // délai debounce (défaut 2s)
  intervalMs = 30000,      // heartbeat (défaut 30s)
  onCreate,                // (payload) => Promise<ActionResult<{ id: string }>>
  onUpdate,                // (id, payload) => Promise<ActionResult>
  buildDraftPayload,       // (values) => TPayload
  transformCreatePayload?, // (payload) => TPayload (optionnel)
  transformUpdatePayload?, // (payload) => TUpdatePayload (optionnel)
})
// Retourne: { status, lastSavedAt, errorMessage, draftId, isSaving }
```

Machine d'état : `idle | dirty | saving | saved | error`. Concurrence sécurisée via `isSavingRef` + `hasQueuedSaveRef`. Listener `beforeunload` actif pendant save en cours.

**`components/features/admin/shared/AutoSaveIndicator.tsx`** (déplacé + étendu depuis `presse/`) : composant visuel partagé par les 3 features (communiqués, articles, spectacles).

**`lib/hooks/use-press-release-autosave.ts`** : refactorisé de ~290L → wrapper léger autour de `useFormAutosave`.

### Phase 2 — Articles de presse

- Triggers : `["title", "source_publication", "chapo"]`
- Gate publication : `published_at IS NOT NULL`
- Payload force : `published_at: null`

**`press-articles-actions.ts`** : `createArticleAction` retourne `Promise<ActionResult<{ id: string }>>`.

**`ArticleNewForm.tsx`** : `savedDraftId` state, `useFormAutosave` branché, `<AutoSaveIndicator>`, `onSubmit` update si draft existe sinon create.

**`ArticleEditForm.tsx`** : `enabled: !isPublished && !isPending`, bannière "Article publié — sauvegarde manuelle requise" si `published_at IS NOT NULL`.

### Phase 3 — Spectacles

- Triggers : `["title", "short_description", "description"]`
- Gate publication : `public === true`
- Payload force : `public: false` + `status: "draft"`

**`SpectacleForm.tsx`** : `isPublished = defaultValues?.public === true`, `useFormAutosave` avec `enabled: !isPublished && !isSubmitting`, bannière pour spectacles publiés.

## Statistiques

- 12 fichiers modifiés/créés/renommés
- +765 insertions, −270 suppressions
- Lint : ✅ 0 erreurs (1 avertissement `baseline-browser-mapping` non lié)
- Build : ✅ succès complet

## Progress Log

### 2026-05-15

- Phase 1 : hook générique `useFormAutosave` créé (291L), `AutoSaveIndicator` déplacé, `usePressReleaseAutosave` refactorisé en wrapper léger, imports PressRelease forms mis à jour
- Phase 2 : `createArticleAction` adapté, `ArticleNewForm` + `ArticleEditForm` branchés avec bannière publié
- Phase 3 : `SpectacleForm` branché avec bannière, payload force `public: false` + `status: "draft"`
- Phase 4 (partielle) : fichier plan `.github/prompts/` créé ; section `.github/copilot-instructions.md` non ajoutée (hors scope commit)
- Lint ✅ + Build ✅ — commit + push + merge vers master
