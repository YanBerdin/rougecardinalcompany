# TASK064 — Admin Partners Audit Fix

**Status:** Completed  
**Added:** 2026-02-28  
**Updated:** 2026-02-28  
**Branch:** `fix/admin-partners-audit-violations`  
**Plan:** `.github/prompts/plan-adminPartnersAuditFix.prompt.md`

---

## Original Request

> "éxécute `.github/prompts/plan-adminPartnersAuditFix.prompt.md`"  
> "rédige une TASK correspondante au plan et commit l'implémentation sur une branche dédiée"

---

## Thought Process

Le plan identifiait 16 violations d'audit sur la feature `admin/partners` (2 CRITIQUES, 6 HAUTES, 4 MOYENNES, 4 BASSES). La stratégie consistait à refactorer par couche (DAL → Actions → Schemas → UI) en s'alignant sur les patterns établis (`admin-press-releases.ts`, `admin-lieux.ts`, `presse/types.ts`). Chaque étape est isolée et testable indépendamment. 3 correctifs post-déploiement ont été ajoutés (hydration, Image sizes, CSP + scroll-behavior).

---

## Implementation Plan (18 étapes)

### Couche DAL (`lib/dal/admin-partners.ts`)

1. **Extraire `mapToPartnerDTO()`** + remplacer `buildMediaUrl()` local par `buildMediaPublicUrl` (T3 Env) — suppression ~60 lignes dupliquées
2. **Utiliser `dalSuccess`/`dalError`** + codes d'erreur `[ERR_PARTNER_001]` à `[ERR_PARTNER_006]`
3. **Validation Zod** avec `.parseAsync()` (async superRefine) + constante `PARTNER_SELECT_FIELDS`
4. **`cache()` React** sur `fetchAllPartnersAdmin` et `fetchPartnerById`
5. **Réduire fonctions > 30 lignes** : extraction `getNextDisplayOrder()` et `buildPartnerUpdatePayload()`

### Couche Server Actions (`app/(admin)/admin/partners/actions.ts`)

6. **`import "server-only"`** + suppression `data` dans `ActionResult` (BigInt Three-Layer Pattern)

### Couche Schemas (`lib/schemas/partners.ts`)

7. **Convertir `PartnerDTO` en `interface`** (convention TS du projet)

### Couche UI

8. **Extraire `SortablePartnerCard.tsx`** depuis PartnersView (427→228 lignes) + `role="list"` DnD
9. **Créer `types.ts` colocalisé** avec interfaces `PartnersViewProps`, `SortablePartnerCardProps`, `PartnerFormProps`
10. **Corriger `useCallback` dependency** inutile (`deleteCandidate` retiré des deps)
11. **Supprimer cast `as Resolver<>`** + retirer `.default()` de `PartnerFormSchema`
12. **Corriger `<Link>` imbriquant `<Button>`** (WCAG : éléments interactifs imbriqués)
13. **Page edit : `export const dynamic`** + `revalidate = 0`
14. **Suspense inutile** retiré de `PartnersContainer.tsx`

### Tests

15. **Script `test-admin-partners.ts`** — 6/6 tests + script npm `test:partners`

### Post-fix

16. **Hydration DndContext** — `id="partners-dnd-context"` pour ID déterministe
17. **`<Image fill>` sans `sizes`** — ajout `sizes="56px"` et `sizes="64px"`
18. **CSP Google Fonts** + **scroll-behavior CSS → data attribute**

---

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID | Description | Status | Notes |
| --- | --- | --- | --- |
| 1 | `mapToPartnerDTO()` + `buildMediaPublicUrl` | Complete | Suppression `process.env` direct |
| 2 | `dalSuccess`/`dalError` + codes erreur | Complete | 6 codes `[ERR_PARTNER_NNN]` |
| 3 | Validation Zod `.parseAsync()` + `PARTNER_SELECT_FIELDS` | Complete | Async superRefine obligatoire |
| 4 | `cache()` React sur lectures | Complete | Déduplication intra-request |
| 5 | Fonctions < 30 lignes | Complete | 2 fonctions extraites |
| 6 | `import "server-only"` + ActionResult simplifié | Complete | BigInt Three-Layer Pattern |
| 7 | `PartnerDTO` → `interface` | Complete | Convention TS projet |
| 8 | `SortablePartnerCard.tsx` extrait | Complete | 427→228 lignes |
| 9 | `types.ts` colocalisé | Complete | 3 interfaces |
| 10 | `useCallback` dependency fix | Complete | `deleteCandidate` retiré |
| 11 | Cast `Resolver<>` supprimé | Complete | `.default()` retiré du FormSchema |
| 12 | `<Link>` + `<Button>` imbriqués | Complete | WCAG fix |
| 13 | `dynamic = "force-dynamic"` page edit | Complete | + `revalidate = 0` |
| 14 | Suspense inutile retiré | Complete | Container simplifié |
| 15 | Script test 6/6 | Complete | `pnpm test:partners` |
| 16 | Hydration DndContext | Complete | `id="partners-dnd-context"` |
| 17 | Image sizes prop | Complete | `56px` mobile, `64px` desktop |
| 18 | CSP + scroll-behavior | Complete | Google Fonts autorisé, CSS → data attr |

---

## Fichiers modifiés/créés

### Modifiés (12)

- `lib/dal/admin-partners.ts` — 258 lignes (DAL refactoring complet)
- `lib/schemas/partners.ts` — 60 lignes (interface DTO, suppression `.default()` FormSchema)
- `app/(admin)/admin/partners/actions.ts` — 123 lignes (`server-only`, `.parseAsync()`, ActionResult simplifié)
- `app/(admin)/admin/partners/[id]/edit/page.tsx` — 43 lignes (`dynamic`, `revalidate`)
- `components/features/admin/partners/PartnersView.tsx` — 228 lignes (extraction SortablePartnerCard, DnD id)
- `components/features/admin/partners/PartnersContainer.tsx` — Suspense retiré
- `components/features/admin/partners/PartnerForm.tsx` — 186 lignes (cast supprimé, Link fix)
- `next.config.ts` — CSP Google Fonts (`style-src`, `font-src`)
- `app/globals.css` — `scroll-behavior: smooth` supprimé
- `app/layout.tsx` — `data-scroll-behavior="smooth"` ajouté sur `<html>`
- `package.json` — script `test:partners` ajouté
- `.github/prompts/plan-adminPartnersAuditFix.prompt.md` — Plan synchronisé avec implémentation

### Créés (3)

- `components/features/admin/partners/SortablePartnerCard.tsx` — 194 lignes
- `components/features/admin/partners/types.ts` — Interfaces colocalisées
- `scripts/test-admin-partners.ts` — 6 tests validation non-régression

---

## Vérification

- ✅ `pnpm lint` — 0 erreurs
- ✅ `pnpm test:partners` — 6/6 tests passés
- ✅ Tous fichiers < 300 lignes (DAL 258, View 228, Form 186, Card 194)
- ✅ `grep process.env.NEXT_PUBLIC_SUPABASE_URL lib/dal/admin-partners.ts` — 0 résultats
- ✅ Hydration : pas de mismatch `aria-describedby`
- ✅ Console : 0 warnings CSP, Image sizes, scroll-behavior

---

## Décisions techniques

1. **`mapToPartnerDTO()` dans le fichier DAL** (pas dans helpers/) — mapping spécifique à partners, pattern `admin-press-releases.ts#L17`
2. **`dalSuccess`/`dalError`** — alignement sur `admin-lieux.ts` et `admin-agenda.ts`
3. **`<Button asChild><Link>`** pour "Nouveau partenaire" (SEO, prefetch) vs `router.push()` pour "Retour" (bouton d'action)
4. **Script test plutôt que E2E Playwright** — cohérent avec pattern existant (`test-admin-access.ts`)
5. **`.parseAsync()`** au lieu de `.parse()` — `addImageUrlValidation` utilise `superRefine` async (fetch HTTP)
6. **`.default()` retiré du `PartnerFormSchema`** uniquement — conservé dans `PartnerInputSchema` (Server) car le DAL peut recevoir des données partielles
