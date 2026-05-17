# `TASK095` - Footer Administrable

**Status:** Completed ✅  
**Added:** 2026-05-17  
**Updated:** 2026-05-17

## Original Request

Rendre le footer public éditable depuis le back-office : description, contact (email/téléphone/adresse) et réseaux sociaux (Facebook/Instagram/Twitter). Navigation, liens légaux, logo et copyright restent hors scope. Source de vérité : une ligne unique dans `public.configurations_site` avec la clé `public:footer:content`.

## Thought Process

- Réutiliser la table existante `configurations_site` (clé/valeur JSONB) plutôt que créer une nouvelle table : la convention `public:%` est déjà exposée par RLS pour lecture anon/auth, et la mutation est déjà gardée par `is_admin()`.
- Pas d'évolution de schéma SQL : tout le payload tient dans `value` jsonb.
- Pattern compatible BigInt Three-Layer : la clé étant un `text`, aucun ID DB ne traverse la frontière client → pas de problème de sérialisation.
- Schémas Zod uniformes (form ↔ input) car aucun champ ne diffère entre UI et DAL (pas d'ID).
- Fallback robuste : `FOOTER_DEFAULTS` matche le footer hardcodé actuel pour ne jamais casser le rendu public en cas d'erreur DB.

## Implementation Plan

12 étapes séquentielles selon `.github/prompts/plan-TASK095-footerAdmin.prompt.md`.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID  | Description                          | Status   | Updated    | Notes |
| --- | ------------------------------------ | -------- | ---------- | ----- |
| 1   | Schéma Zod `footer-config.ts`        | Complete | 2026-05-17 | `FOOTER_CONFIG_KEY`, `FOOTER_DEFAULTS`, `FooterConfigInputSchema` |
| 2   | Migration seed idempotente           | Complete | 2026-05-17 | `20260517212052_seed_footer_config.sql`, `INSERT ... ON CONFLICT (key) DO NOTHING` |
| 3   | DAL `lib/dal/footer-config.ts`       | Complete | 2026-05-17 | `cache()` + `.maybeSingle()` + fallback `FOOTER_DEFAULTS` |
| 4   | Server Action update                 | Complete | 2026-05-17 | `updateFooterConfigAction`, `parseAsync()`, `revalidatePath('/', 'layout')` |
| 5   | Refactor `components/layout/footer.tsx` | Complete | 2026-05-17 | Server Component async, fetch + rendu conditionnel des réseaux |
| 6   | Page admin `/admin/footer`           | Complete | 2026-05-17 | `requireAdminPageAccess()`, `dynamic = "force-dynamic"` |
| 7   | Composants admin (types/Container/View/Form) | Complete | 2026-05-17 | 4 fichiers dans `components/features/admin/footer/` |
| 8   | Entrée AdminSidebar                  | Complete | 2026-05-17 | Icône `LayoutTemplate`, `minRole: "admin"` |
| 9   | Tests Vitest schémas                 | Complete | 2026-05-17 | 13 tests, tous verts (525ms) |
| 10  | Validation (lint + tests + build)    | Complete | 2026-05-17 | `pnpm lint` ✅, `pnpm vitest` 13/13 ✅, `pnpm build` 15.7s ✅ |
| 11  | Memory-bank update                   | Complete | 2026-05-17 | `_index.md` + `activeContext.md` + ce fichier |
| 12  | Vérification sécurité Supabase MCP   | Complete | 2026-05-17 | RLS vérifiées sur prod : anon SELECT sur `public:%`, UPDATE gardée par `is_admin()` |

## Progress Log

### 2026-05-17

- Étapes 1→4 : schéma Zod, migration seed, DAL avec `cache()` + fallback, Server Action conforme au pattern BigInt-Three-Layer (`ActionResult<void>`).
- Étapes 5→8 : refactor footer public en Server Component async, page admin protégée, composants admin (compound Container/View/Form), entrée sidebar.
- Étape 9 : 13 tests Vitest sur le schéma (limites description 1-500, validation contact obligatoire, URLs optionnelles + chaîne vide acceptée pour masquer).
- Étape 10 : `pnpm lint` global = 0 erreur, `pnpm vitest run __tests__/schemas/footer-config.test.ts` = 13/13 ✅ en 525ms, `pnpm build` = succès en 15.7s (Next.js 16.2.6 Turbopack).
- Étape 12 : Vérification RLS via Supabase MCP sur projet `yvtrlvmbofklefxcxrzv`. Policies confirmées : `Anon can view public site configurations` (anon, `key ~~ 'public:%' OR key ~~ 'display_toggle_%'`), `Admins can update site configurations` (authenticated, `is_admin()` USING + WITH CHECK). Le `value` jsonb ne contient que du contenu public (description, contact, URLs sociales) — pas de secret. La migration seed n'a pas encore été poussée sur la prod (travail en dev, déploiement futur).

## Files Created / Modified

**Créés :**

- `lib/schemas/footer-config.ts`
- `lib/dal/footer-config.ts`
- `lib/actions/footer-config-actions.ts`
- `supabase/migrations/20260517212052_seed_footer_config.sql`
- `app/(admin)/admin/footer/page.tsx`
- `components/features/admin/footer/types.ts`
- `components/features/admin/footer/FooterConfigContainer.tsx`
- `components/features/admin/footer/FooterConfigView.tsx`
- `components/features/admin/footer/FooterConfigForm.tsx`
- `__tests__/schemas/footer-config.test.ts`

**Modifiés :**

- `components/layout/footer.tsx` (Server Component async + fetch DAL + fallback)
- `components/admin/AdminSidebar.tsx` (entrée Footer)
