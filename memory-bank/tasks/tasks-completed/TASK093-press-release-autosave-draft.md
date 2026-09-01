# `TASK093` - Auto-save brouillon communiqués de presse

**Status:** Completed  
**Added:** 2026-05-15  
**Updated:** 2026-05-15

## Original Request

> Mettre en place un auto-save brouillon sur les formulaires de communiqués de presse (new + edit), avec blocage strict sur article publié (`public=true`), et aligner le plan avec l'implémentation réelle.

## Thought Process

Le périmètre principal était déjà implémenté (hook + intégrations), mais deux points de réalité devaient être consolidés :

1. **Bug métier** : la description ne se sauvegardait pas si le titre était vide (garde trop stricte dans `hasDraftContent`).
2. **Conflit TypeScript** : `onUpdate` exigeait un payload avec `title: string`, alors que l'update partiel doit permettre l'omission du titre.

La solution retenue :

- retirer la dépendance stricte au titre dans la détection de brouillon,
- créer un type d'update dédié `PressReleaseAutoSaveUpdatePayload` avec `title?: string`,
- conserver `PressReleaseAutoSavePayload` strict pour create,
- forcer `public: false` sur tous les auto-saves (defense-in-depth),
- garder la désactivation complète de l'auto-save sur les articles publiés.

## Implementation Plan

- [x] Phase 1 — Backend : `createPressReleaseAction` retourne `{ success: true, data: { id: string } }`.
- [x] Phase 2 — Hook : state machine + debounce 2s + heartbeat 30s + concurrence + fix description sans titre.
- [x] Phase 3 — UI : `AutoSaveIndicator` accessible (`aria-live="polite"`).
- [x] Phase 4 — NewForm : `savedDraftId`, auto-create puis auto-update, `beforeunload`, submit final create/update.
- [x] Phase 5 — EditForm : auto-save conditionnel `!release.public`, banner si publié.
- [~] Phase 6 — Vérification manuelle complète : partiellement documentée (validation TypeScript OK, QA manuelle end-to-end à rejouer si requis).

## Validation

- Vérification TypeScript sur les fichiers modifiés : **0 erreur**.
- Comportement confirmé dans le code :
  - Create auto-save avec placeholder titre `(Sans titre)` si vide.
  - Update auto-save sans `title` quand vide (`title` omis du payload).
  - Auto-save désactivé sur article publié (`release.public === true`).

## Files Changed

- `.github/prompts/plan-TASK093-pressReleaseAutosaveDraft.prompt.md`
- `app/(admin)/admin/presse/press-releases-actions.ts`
- `lib/hooks/use-press-release-autosave.ts`
- `components/features/admin/presse/AutoSaveIndicator.tsx`
- `components/features/admin/presse/PressReleaseNewForm.tsx`
- `components/features/admin/presse/PressReleaseEditForm.tsx`
- `memory-bank/activeContext.md`
- `memory-bank/progress.md`
- `memory-bank/tasks/_index.md`

## Progress Log

### 2026-05-15

- Alignement du prompt TASK093 avec l'état réellement livré.
- Fix métier confirmé : auto-save de description sans titre.
- Fix typage confirmé : `PressReleaseAutoSaveUpdatePayload` (`title?`) pour update partiel.
- Memory-bank synchronisé : `activeContext`, `progress`, index des tâches, fiche TASK093.
