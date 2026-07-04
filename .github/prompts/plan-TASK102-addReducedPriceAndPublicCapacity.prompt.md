# Plan : Ajouter un tarif réduit (`price_reduced_cents`) + affichage public prix & capacité

Ajout d'une colonne `price_reduced_cents` (centimes, indépendante du plein tarif) sur la table `evenements`, propagée dans toute la chaîne admin (DB → schémas → DAL → actions → formulaire → détail), **et** affichage public des deux tarifs **et de la capacité** sur `/agenda` et `/spectacles/[slug]` (où aucun prix ni capacité n'est affiché aujourd'hui).

## Décisions validées

- Colonne DB : `price_reduced_cents` (integer null, en centimes, cohérent avec `price_cents`).
- Aucune contrainte entre plein tarif et tarif réduit (champs indépendants).
- Affichage public : OUI sur `/agenda` ET `/spectacles/[slug]` — pour les deux tarifs ET la capacité.
- `capacity` existe déjà en DB et dans toute la chaîne admin → aucune modif DB/admin, seule l'exposition publique manque.
- Formats : `0` → « Gratuit », `null` → masqué. Capacité : `null` → masqué, sinon « N places » (jauge, pas de « places restantes »).

## Contexte clé

- Le prix (`price_cents`) et la capacité (`capacity`) ne sont aujourd'hui affichés que dans l'admin (`EventDetail`). Public = rien.
- Duplication schémas : `lib/schemas/admin-agenda.ts` (EventInputSchema/EventFormSchema/EventDTO bigint) ET `lib/schemas/admin-agenda-ui.ts` (EventFormSchema number, celui réellement utilisé par le form).
- Duplication types client : `lib/types/admin-agenda-client.ts` (EventClientDTO) ET `lib/tables/event-table-helpers.ts` (EventClientDTO).
- Public agenda : `lib/dal/agenda.ts` → `mapRowToEventDTO` + `EventSchema` (`lib/schemas/agenda.ts`), affiché dans `AgendaEventList.tsx`. Deux fetchs : `fetchUpcomingEvents` + `fetchEventsForCalendar` (les 2 utilisent `mapRowToEventDTO` et le même select string).
- Détail spectacle : `app/(marketing)/spectacles/[slug]/page.tsx` utilise `fetchSpectacleTicketUrl` / `fetchSpectacleNextVenue` (closest future event). Il faudra une nouvelle fn regroupant prix + capacité + prop sur `SpectacleDetailView`.

## PHASE 1 — Base de données

1. `supabase/schemas/07_table_evenements.sql` : ajouter `price_reduced_cents integer null` (après `price_cents`) + comment.
2. `supabase/schemas/15_content_versioning.sql` : dans `restore_content_version`, bloc `entity_type='evenement'`, ajouter `price_reduced_cents = (content_snapshot->>'price_reduced_cents')::integer`.
3. Générer migration : `pnpm dlx supabase stop` puis `supabase db diff -f add_price_reduced_cents_evenements` (respecter guide déclaratif). Migration hotfix manuelle acceptable si diff indisponible.
4. Régénérer `lib/database.types.ts` (evenements Row/Insert/Update) via `supabase gen types` OU édition manuelle (3 endroits).

## PHASE 2 — Schémas & types admin

5. `lib/schemas/admin-agenda.ts` : ajouter `price_reduced_cents: z.number().int().nonnegative().nullable().optional()` à EventInputSchema, EventFormSchema (dup) et à EventDTO.
6. `lib/schemas/admin-agenda-ui.ts` : ajouter à EventFormSchema (UI, number).
7. `lib/types/admin-agenda-client.ts` : ajouter `price_reduced_cents: number | null` à EventClientDTO.
8. `lib/tables/event-table-helpers.ts` : ajouter à EventClientDTO (dup).

## PHASE 3 — DAL & Server Actions admin

9. `lib/dal/admin-agenda.ts` : ajouter `price_reduced_cents` aux 4 select (fetchAll, fetchById, create, update) + aux 4 mappings EventDTO.
10. `app/(admin)/admin/agenda/actions.ts` : ajouter à EventDataTransport + mapping create + mapping update (bloc `if (validated.price_reduced_cents !== undefined)`).

## PHASE 4 — UI admin

11. `components/features/admin/agenda/EventForm.tsx` : initialValues (edit + create) → `price_reduced_cents`.
12. `components/features/admin/agenda/EventFormFields.tsx` : nouveau champ « Tarif réduit (€) » avec conversion euros↔centimes (copier le pattern du champ price_cents). Renommer le label existant en « Plein tarif (€) ».
13. `components/features/admin/agenda/EventsContainer.tsx` : ajouter à eventsForClient map.
14. `components/features/admin/agenda/EventDetail.tsx` : afficher tarif réduit dans section Billetterie (InfoRow), renommer label « Tarif » → « Plein tarif ». Ajuster la condition « aucune info billetterie ».
15. `app/(admin)/admin/agenda/[id]/page.tsx` : ajouter à eventForClient.
16. `app/(admin)/admin/agenda/[id]/edit/page.tsx` : ajouter à eventForClient.

## PHASE 5 — Affichage public /agenda (prix + capacité)

> NB capacity : colonne DB + chaîne admin déjà en place. Seule l'exposition publique manque.

17. `lib/schemas/agenda.ts` : ajouter `priceCents`, `priceReducedCents`, `capacity` (tous `z.number().nullable()`) à EventSchema.
18. `lib/dal/agenda.ts` : SupabaseEventRow (+ price_cents, price_reduced_cents, capacity), select strings des 2 fetchs (fetchUpcomingEvents + fetchEventsForCalendar), mapRowToEventDTO (priceCents/priceReducedCents/capacity).
19. `components/features/public-site/agenda/AgendaEventList.tsx` : afficher prix (helper `formatPrice`) + capacité (« N places »). Rendu dans EventCardMetaInline ou près des actions. Icônes `Tag` (prix) + `Users` (capacité). Format « Plein 15 € · Réduit 10 € · 100 places ».

## PHASE 6 — Affichage public /spectacles/[slug] (prix + capacité)

20. `lib/dal/spectacles.ts` : nouvelle fn `fetchSpectacleTicketInfo(spectacleId)` → `{priceCents, priceReducedCents, capacity}` depuis closest future event (même pattern que `fetchSpectacleTicketUrl`, select `price_cents,price_reduced_cents,capacity`). Nom générique car regroupe prix + capacité.
21. `app/(marketing)/spectacles/[slug]/page.tsx` : ajouter fetchSpectacleTicketInfo au Promise.all + passer la/les prop(s) à SpectacleDetailView.
22. `components/features/public-site/spectacles/SpectacleDetailView.tsx` : nouvelle(s) prop(s) prix + capacité + rendu dans la section infos pratiques (près du lieu/dates).

## PHASE 7 — Tests / vérif

23. `scripts/test-admin-agenda-crud.ts` : ajouter `price_reduced_cents` dans newEvent (optionnel).
24. Vérif : `pnpm build` + typecheck ; test manuel CRUD admin + affichage /agenda + /spectacles/[slug].
25. E2E existants agenda ne cassent pas.

## Helper prix (réutilisable)

- centimes → euros ; `0` = « Gratuit » ; `null` = masqué. Déjà présent dans `EventDetail.formatPrice` (à dupliquer/mutualiser côté public).

## Hors scope

- Billetterie/paiement interne, catégories de tarifs multiples (> 2), logique « places restantes », i18n des libellés.

## Further Considerations

1. `lib/database.types.ts` : régénérer via `supabase gen types` (propre, DB à jour requise) ou édition manuelle des 3 blocs. Recommandation : régénération.
2. Duplication `EventClientDTO` / `EventFormSchema` (2 fichiers chacun) — maintenir les deux à l'identique ; mutualisation = refactor séparé, hors scope.
3. Placement prix/capacité sur la carte `/agenda` : méta inline (près heure/lieu) *(recommandé)* ou bloc actions près du bouton « Je réserve ».
