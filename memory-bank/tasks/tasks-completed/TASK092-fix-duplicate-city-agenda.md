# `TASK092` - Fix duplicate city in agenda venue label

**Status:** Completed  
**Added:** 2026-05-08  
**Updated:** 2026-05-08

## Original Request

> bug : la ville est affichée 2 fois (sur `/agenda`, ligne lieu Google Maps)

## Thought Process

Le label rendu était `Theatre Maurice Novarina, 74200 THONON-LES-BAINS, 74200 THONON-LES-BAINS`. Deux bugs cumulés :

1. **DAL** (`lib/dal/agenda.ts` `buildAddress`) : concaténait toujours `code_postal + ville` à `lieux.adresse`, alors que l'adresse en base contient déjà la ville (cas Thonon : `"4 Bis Av. d'Evian, 74200 Thonon-les-Bains"`).
2. **Composant** (`AgendaEventList.tsx` `extractPostalCity`) : regex gourmande `(\d{5})\s+(.+)` qui capturait toute la chaîne après le premier code postal, propageant la duplication dans le label.

Le cas Paris fonctionnait par chance car le nom du lieu contient "paris", déclenchant le court-circuit `venue.includes(cityName)` dans `buildVenueLabel`.

## Implementation Plan

- [x] Corriger `buildAddress` : ne pas réajouter la ville si déjà présente dans `adresse`.
- [x] Durcir `extractPostalCity` : regex non-gourmande `([^,]+)` pour s'arrêter à la première virgule.
- [x] Vérifier via curl (Thonon × 2 + Paris × 4).

## Validation

```bash
$ curl -s http://localhost:3000/agenda | grep -oE 'aria-label="Voir [^"]+"' | head -10
aria-label="Voir Theatre Maurice Novarina, 74200 THONON-LES-BAINS sur Google Maps (nouvel onglet)"
aria-label="Voir Theatre Maurice Novarina, 74200 THONON-LES-BAINS sur Google Maps (nouvel onglet)"
aria-label="Voir Centre Paris anim' La Jonquière sur Google Maps (nouvel onglet)"
aria-label="Voir Centre Paris anim' La Jonquière sur Google Maps (nouvel onglet)"
aria-label="Voir Centre Paris Anim' Beaujon sur Google Maps (nouvel onglet)"
aria-label="Voir Centre Paris Anim' Beaujon sur Google Maps (nouvel onglet)"
```

## Files Changed

- [lib/dal/agenda.ts](lib/dal/agenda.ts) — `buildAddress` : skip city append when already in `adresse`.
- [components/features/public-site/agenda/AgendaEventList.tsx](components/features/public-site/agenda/AgendaEventList.tsx) — `extractPostalCity` : regex `([^,]+)` + `.trim()`.

## Progress Log

### 2026-05-08

- Diagnostic : lecture DB (`lieux` id=4), DAL, composant. Identifié les deux bugs cumulés.
- Fix appliqué + validé via curl. Thonon affiche maintenant une seule fois la ville.
