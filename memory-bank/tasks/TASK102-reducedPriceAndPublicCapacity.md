# TASK102 - Tarif réduit (`price_reduced_cents`) + affichage public prix & capacité

**Status:** ✅ COMPLETED
**Added:** 2026-07-04
**Updated:** 2026-07-04

## Original Request

Ajouter une colonne `price_reduced_cents` (centimes, indépendante du plein tarif) sur la table `evenements`, propagée dans toute la chaîne admin (DB → schémas → DAL → actions → formulaire → détail), **et** afficher publiquement les deux tarifs **et la capacité** sur `/agenda` et `/spectacles/[slug]` (où aucun prix ni capacité n'était affiché auparavant). Plan détaillé : `.github/prompts/plan-TASK102-addReducedPriceAndPublicCapacity.prompt.md`.

## Thought Process

### Décisions validées

- Colonne DB `price_reduced_cents` : `integer null`, en centimes, cohérente avec `price_cents`. Aucune contrainte entre plein tarif et tarif réduit (champs indépendants).
- Affichage public sur `/agenda` ET `/spectacles/[slug]`, pour les deux tarifs ET la capacité.
- `capacity` existait déjà en DB et dans toute la chaîne admin → seule l'exposition publique manquait.
- Formats : `0` → « Gratuit », `null` → masqué. Capacité : `null` → masqué, sinon « N places » (jauge, pas de « places restantes »).

### Incident migration : diff `supabase db diff` bruité

À la reprise de session, la Phase 1 (DB) était incomplète : la migration n'avait jamais été générée avec succès. Un `supabase db diff -f add_price_reduced_cents_evenements` a produit un fichier de **1242 lignes** avec des centaines de `revoke`/`grant` sur toutes les tables et des `drop`/`create` de vues, triggers et fonctions sans rapport (drift pré-existant entre l'historique des migrations et `supabase/schemas/`, non introduit par cette tâche).

Décision : suivre la convention observée dans les migrations précédentes du repo (fichiers courts et chirurgicaux, ex. `20260703120000_add_display_order_to_articles_presse.sql`) plutôt que d'appliquer le diff brut. Migration manuelle minimale écrite à la main, contenant uniquement :

1. `ALTER TABLE public.evenements ADD COLUMN IF NOT EXISTS price_reduced_cents integer null` + `COMMENT ON COLUMN`.
2. `CREATE OR REPLACE FUNCTION public.restore_content_version(...)` — recréée avec le bloc `evenement` mis à jour pour restaurer `price_reduced_cents` depuis le snapshot JSON.

Validation : `supabase db reset` applique la migration sans erreur ; un second `db diff` ne détecte plus aucune référence à `price_reduced_cents` (seul le bruit pré-existant du drift subsiste, hors scope).

### Incident runtime post-implémentation : erreur "column does not exist"

Après validation locale complète, une erreur runtime est apparue dans `pnpm dev` : `[ERR_AGENDA_001] column evenements.price_reduced_cents does not exist`. Cause : `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`) pointe vers le projet **Supabase Cloud lié** (`yvtrlvmbofklefxcxrzv.supabase.co`), pas vers l'instance locale Docker — la migration n'avait été appliquée qu'en local (`supabase db reset`), jamais poussée sur le cloud.

Résolution : `pnpm db:push` (wrapper `scripts/supabase-env.sh db push --linked`) → migration `20260704130737` appliquée sur le cloud. Vérifié avec `pnpm dlx supabase migration list --linked` et `pnpm db:push -- --dry-run` → « Remote database is up to date. ».

**Leçon retenue (mémorisée en repo memory)** : toujours pousser vers le cloud après validation locale — le serveur `pnpm dev` de ce projet utilise le Supabase Cloud lié, pas l'instance Docker locale.

## Implementation Plan

### PHASE 1 — Base de données

- `supabase/schemas/07_table_evenements.sql` : colonne `price_reduced_cents integer null` ajoutée après `price_cents` + commentaire.
- `supabase/schemas/15_content_versioning.sql` : `restore_content_version`, bloc `entity_type='evenement'`, restaure désormais `price_reduced_cents`.
- Migration manuelle `supabase/migrations/20260704130737_add_price_reduced_cents_evenements.sql` (DDL colonne + recréation fonction).
- `lib/database.types.ts` : déjà aligné (généré précédemment), vérifié sans drift sur `evenements`.

### PHASE 2 — Schémas & types admin

- `lib/schemas/admin-agenda.ts` (EventInputSchema, EventFormSchema, EventDTO) et `lib/schemas/admin-agenda-ui.ts` (EventFormSchema UI number) : ajout `price_reduced_cents`.
- `lib/types/admin-agenda-client.ts` et `lib/tables/event-table-helpers.ts` (EventClientDTO dupliqué) : ajout `price_reduced_cents: number | null`.

### PHASE 3 — DAL & Server Actions admin

- `lib/dal/admin-agenda.ts` : `price_reduced_cents` ajouté aux 4 select (fetchAll, fetchById, create, update) + aux 4 mappings EventDTO.
- `app/(admin)/admin/agenda/actions.ts` : `EventDataTransport` + mapping create/update (`if (validated.price_reduced_cents !== undefined)`).

### PHASE 4 — UI admin

- `EventForm.tsx` : initialValues (edit + create) incluent `price_reduced_cents`.
- `EventFormFields.tsx` : nouveau champ « Tarif réduit (€) » (conversion euros↔centimes, pattern identique à `price_cents`) ; label existant renommé « Plein tarif (€) ».
- `EventsContainer.tsx` : ajouté au mapping `eventsForClient`.
- `EventDetail.tsx` : tarif réduit affiché dans la section Billetterie (InfoRow), label « Tarif » → « Plein tarif », condition « aucune info billetterie » étendue à `capacity` et aux deux prix.
- `app/(admin)/admin/agenda/[id]/page.tsx` et `[id]/edit/page.tsx` : `eventForClient` mis à jour.

### PHASE 5 — Affichage public `/agenda`

- `lib/schemas/agenda.ts` : `EventSchema` étendu avec `priceCents`, `priceReducedCents`, `capacity` (`z.number().nullable()`).
- `lib/dal/agenda.ts` : `SupabaseEventRow`, select strings de `fetchUpcomingEvents` et `fetchEventsForCalendar`, `mapRowToEventDTO` mis à jour.
- `AgendaEventList.tsx` : helper `formatPrice` (0 → Gratuit, null → masqué) + `buildPricingSummary` ; rendu dans `EventCardMetaInline` avec icônes `Tag` (prix, `aria-hidden`) et `Users` (capacité, `aria-hidden`). Format « Plein tarif 15 € · Tarif réduit 10 € · 100 places ».

### PHASE 6 — Affichage public `/spectacles/[slug]`

- `lib/dal/spectacles.ts` : nouvelle fonction `fetchSpectacleTicketInfo(spectacleId)` → `{ priceCents, priceReducedCents, capacity }` depuis le prochain événement futur (même pattern que `fetchSpectacleTicketUrl`, select minimal `price_cents, price_reduced_cents, capacity`).
- `app/(marketing)/spectacles/[slug]/page.tsx` : `fetchSpectacleTicketInfo` ajoutée au `Promise.all` (parallélisé avec les autres fetches).
- `SpectacleDetailView.tsx` : prop `ticketInfo` + rendu badges (plein tarif, tarif réduit, capacité) dans la section infos pratiques.

### PHASE 7 — Tests / vérif

- `scripts/test-admin-agenda-crud.ts` : `price_reduced_cents: 1000` ajouté au `newEvent` de test.
- Vérifications : `pnpm tsc --noEmit` (0 erreur), `pnpm eslint` sur les fichiers modifiés (0 erreur), `pnpm build` (succès, toutes les routes générées), `pnpm exec tsx scripts/test-admin-agenda-crud.ts` (exit code 0 — CRUD complet incluant `price_reduced_cents` validé en conditions réelles contre Supabase Cloud).

## Progress Tracking

**Overall Status:** ✅ COMPLETED — 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Colonne DB + schéma déclaratif | Complete | 2026-07-04 | `07_table_evenements.sql` + comment |
| 1.2 | `restore_content_version` mis à jour | Complete | 2026-07-04 | `15_content_versioning.sql` |
| 1.3 | Migration manuelle (diff CLI trop bruité) | Complete | 2026-07-04 | Écrite à la main, style chirurgical |
| 1.4 | Application locale + push cloud | Complete | 2026-07-04 | `db reset` puis `pnpm db:push` |
| 2-3 | Schémas Zod + DAL + Server Actions admin | Complete | 2026-07-04 | Conforme DAL SOLID + pattern CRUD |
| 4 | UI admin (form, détail, pages) | Complete | 2026-07-04 | Label « Plein tarif » / « Tarif réduit » |
| 5 | Affichage public `/agenda` | Complete | 2026-07-04 | `Tag` + `Users` icônes, a11y `aria-hidden` |
| 6 | Affichage public `/spectacles/[slug]` | Complete | 2026-07-04 | `fetchSpectacleTicketInfo`, parallélisé |
| 7 | Tests & validation | Complete | 2026-07-04 | tsc/eslint/build/script CRUD tous verts |

## Progress Log

### 2026-07-04 — Audit de conformité + finalisation migration + implémentation

- Audit des 22 fichiers déjà modifiés (Phases 2-7) : conformes aux patterns du projet (DAL SOLID, pas de `revalidatePath` hors Server Actions, pas de BigInt sérialisé côté client, accessibilité `aria-hidden` sur icônes décoratives, labels de formulaire associés).
- Phase 1 complétée : migration manuelle écrite après avoir écarté le diff CLI bruité (drift pré-existant hors scope). Appliquée en local (`supabase db reset`) puis poussée sur Supabase Cloud (`pnpm db:push`).
- Documentation ajoutée dans `supabase/migrations/migrations.md`.
- Validation complète : `pnpm tsc --noEmit`, `pnpm eslint` (fichiers modifiés), `pnpm build` — tous verts.
- Incident runtime post-déploiement local : erreur "column does not exist" dans `pnpm dev` car le serveur dev pointe vers Supabase Cloud (pas l'instance locale). Résolu par `pnpm db:push`.
- Script `scripts/test-admin-agenda-crud.ts` exécuté avec succès (exit code 0) contre Supabase Cloud, validant le CRUD complet incluant `price_reduced_cents`.
- Notes ajoutées en mémoire repo (`/memories/repo/supabase-migrations-workflow.md`) : quirks `supabase db diff` bruité, absence de `config.toml`, dev server sur Cloud et non local.

## Files Modified/Created

### Nouveaux fichiers (2)

1. `supabase/migrations/20260704130737_add_price_reduced_cents_evenements.sql` — Migration DDL (colonne + fonction)
2. `.github/prompts/plan-TASK102-addReducedPriceAndPublicCapacity.prompt.md` — Plan d'implémentation

### Fichiers modifiés (21)

1. `supabase/schemas/07_table_evenements.sql`
2. `supabase/schemas/15_content_versioning.sql`
3. `supabase/migrations/migrations.md`
4. `lib/schemas/admin-agenda.ts`
5. `lib/schemas/admin-agenda-ui.ts`
6. `lib/types/admin-agenda-client.ts`
7. `lib/tables/event-table-helpers.ts`
8. `lib/dal/admin-agenda.ts`
9. `app/(admin)/admin/agenda/actions.ts`
10. `components/features/admin/agenda/EventForm.tsx`
11. `components/features/admin/agenda/EventFormFields.tsx`
12. `components/features/admin/agenda/EventsContainer.tsx`
13. `components/features/admin/agenda/EventDetail.tsx`
14. `app/(admin)/admin/agenda/[id]/page.tsx`
15. `app/(admin)/admin/agenda/[id]/edit/page.tsx`
16. `lib/schemas/agenda.ts`
17. `lib/dal/agenda.ts`
18. `components/features/public-site/agenda/AgendaEventList.tsx`
19. `lib/dal/spectacles.ts`
20. `app/(marketing)/spectacles/[slug]/page.tsx`
21. `components/features/public-site/spectacles/SpectacleDetailView.tsx`
22. `lib/database.types.ts`
23. `scripts/test-admin-agenda-crud.ts`

## Validation Checklist

- [x] Colonne DB ajoutée avec contrainte nulle, sans dépendance à `price_cents`
- [x] `restore_content_version` restaure `price_reduced_cents`
- [x] Migration appliquée en local ET sur Supabase Cloud
- [x] Chaîne admin complète (schémas, DAL, Server Actions, formulaire, détail)
- [x] Affichage public `/agenda` (prix + capacité, formats Gratuit/masqué respectés)
- [x] Affichage public `/spectacles/[slug]` (prix + capacité, fetch parallélisé)
- [x] `pnpm tsc --noEmit` : 0 erreur
- [x] `pnpm eslint` (fichiers modifiés) : 0 erreur
- [x] `pnpm build` : succès
- [x] `scripts/test-admin-agenda-crud.ts` : exit code 0
- [x] Accessibilité : icônes décoratives `aria-hidden`, labels de formulaire associés
- [x] Aucune contrainte hors scope ajoutée (billetterie/paiement, tarifs multiples, i18n)
