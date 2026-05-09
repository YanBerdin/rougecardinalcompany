# Plan: Lieu cliquable → Google Maps

Rendre le lieu cliquable dans l'agenda (AgendaEventList) et la fiche spectacle (SpectacleDetailView) pour ouvrir sa localisation sur Google Maps dans un nouvel onglet. Aucune mutation DB ni migration : on enrichit uniquement le DAL spectacles pour exposer les colonnes déjà présentes dans `public.lieux` (adresse, latitude, longitude).

## Steps

1. Créer helper `lib/utils/google-maps.ts` → `buildGoogleMapsUrl({ name, address, city, latitude, longitude })` retourne `string | null`. Si lat/lng présents → `?api=1&query=lat,lng` ; sinon concaténation `name + address + city` avec `encodeURIComponent`. Retourne `null` si aucune donnée exploitable.
2. Enrichir `fetchSpectacleNextVenue` (lib/dal/spectacles.ts lines 44-82) : `.select("lieux(nom, ville, adresse, code_postal, latitude, longitude)")` + élargir le type de retour + JSDoc.
3. `SpectacleDetailView.tsx` : étendre l'interface `venue` (lines 27), calculer `mapsUrl` via le helper, wrapper le `Badge` MapPin (lines 130-133) dans `<a target="_blank" rel="noopener noreferrer">` avec `aria-label` explicite, classes `hover:underline focus-visible:ring-2`. Conserver le Badge non-cliquable quand venue est null ("À venir").
4. `AgendaEventList.tsx` (`EventCardMetaInline`, lines 128-150) : wrapper `MapPin + event.venue + city` dans `<a>` si `buildGoogleMapsUrl({ name: event.venue, address: event.address })` retourne non-null.
5. Tests Vitest `__tests__/utils/google-maps.test.ts` : 4 cas (lat/lng valides, adresse seule, données manquantes → null, encodage caractères spéciaux).

## Relevant files

- `lib/utils/google-maps.ts` (nouveau)
- `lib/dal/spectacles.ts` (lines 44-82)
- `components/features/public-site/spectacles/SpectacleDetailView.tsx` (lines 27-132)
- `components/features/public-site/agenda/AgendaEventList.tsx` (lines 128-150)
- `app/(marketing)/spectacles/[slug]/page.tsx` (aucune modification)
- `__tests__/utils/google-maps.test.ts` (nouveau)

## Verification

1. `pnpm lint` + `pnpm build` OK.
2. `pnpm vitest run __tests__/utils/google-maps.test.ts` — 4 tests passent.
3. Manuel `/agenda` : clic sur le lieu ouvre Google Maps dans un nouvel onglet.
4. Manuel `/spectacles/<slug>` : clic sur le badge MapPin ouvre Google Maps ; "À venir" reste non cliquable.
5. A11y : navigation Tab + Enter active le lien ; lecteur d'écran annonce le nouvel onglet via `aria-label`.
6. Vérifier `rel="noopener noreferrer"` sur tous les `<a target="_blank">`.

## Decisions

- Format d'URL : Google Maps URLs API (`?api=1&query=...`).
- Pas de modification du schéma `Event` (le champ `event.address` actuel suffit).
- Préférence lat/lng > adresse texte quand les deux sont disponibles.
- Hors scope : géocodage côté serveur, carte embarquée, multi-providers (Apple/OSM), colonne `gmaps_place_id`, modification de la table `lieux`.
- Pas de `Badge asChild` : simple wrapper `<a>` autour du Badge pour préserver le style existant.

--- 

