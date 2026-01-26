# TASK055 - Admin Agenda Management

**Status:** Complete (Phase 1 & 2)  
**Added:** 2026-01-25  
**Updated:** 2026-01-26  
**Priority:** High  
**Epic:** Milestone 2 - Admin Backoffice

## Audit Status

✅ **Implémentation complète** - Phase 1 & 2 terminées (2026-01-26)

- Architecture Next.js 16 (RSC, force-dynamic) ✅
- SOLID principles (DAL < 30 lignes) ✅  
- Server Actions pattern (validation → DAL → revalidate) ✅
- Clean Code (composants < 300 lignes) ✅
- Type safety (schémas Server/UI séparés) ✅
- BigInt serialization fix (ActionResult simplifié) ✅

## ⚠️ BigInt Serialization Fix (Post-Implementation)

**Problème rencontré** : "Do not know how to serialize a BigInt" lors de l'update d'événements sans modification.

**Cause** : React Server Actions sérialisent leur contexte d'exécution. Créer des `BigInt` durant la validation (via `EventInputSchema` avec `z.coerce.bigint()`) provoquait une erreur même si les valeurs n'étaient pas retournées explicitement.

**Solution finale** :

1. ✅ `ActionResult` simplifié : Ne retourne JAMAIS de data (seulement `{success: true/false}`)
2. ✅ Validation avec `EventFormSchema` (number IDs) au lieu de `EventInputSchema` (bigint IDs)
3. ✅ Type `EventDataTransport` pour IDs en string avant passage au DAL
4. ✅ Conversion format (datetime-local→ISO8601, HH:MM→HH:MM:SS) APRÈS validation dans Server Action
5. ✅ `router.refresh()` côté client pour récupérer données mises à jour (évite retour data avec BigInt)

**Pattern flux de données** :

```bash
Form (EventFormValues - number) 
  → Server Action (validate UI schema, convert to EventDataTransport - string) 
    → DAL (convert string→bigint internally) 
      → ActionResult {success: true/false only} 
        → router.refresh() (fetch updated data via Server Component)
```

**Impact** :

- ✅ Aucune valeur BigInt n'existe dans le scope des Server Actions
- ✅ Validation Zod ne crée que des `number`, jamais de `bigint`
- ✅ TypeScript strict (pas de `any`, types explicites `EventDataTransport`)
- ✅ Séparation claire UI layer (number) vs Server layer (bigint)

**Commits** :

- fix(admin-agenda): resolve BigInt serialization error in Server Actions
- Voir détail complet : `.git-commit-bigint-fix.md`

## Original Request

Créer l'interface d'administration pour la gestion de l'agenda (événements, spectacles, lieux).

## Context

La page publique Agenda existe déjà avec :

- `AgendaContainer.tsx` (Server Component) - fetch des événements
- `AgendaClientContainer.tsx` (Client Component) - state management
- `AgendaView.tsx` - affichage responsive
- DAL `lib/dal/agenda.ts` - fonctions `fetchUpcomingEvents()`, `fetchEventTypes()`
- Schémas Zod `lib/schemas/agenda.ts` - `EventSchema`, `EventTypeSchema`

Tables Supabase existantes :

- `evenements` - événements programmés (date, heure, lieu, spectacle, billetterie)
- `spectacles` - spectacles/productions (titre, description, statut, image)
- `lieux` - lieux de représentation (nom, adresse, ville, capacité)

## Implementation Plan

### Phase 1: Admin Events CRUD (P0)

1. **DAL Admin** (`lib/dal/admin-agenda.ts`)
   - `fetchAllEvents()` - liste complète pour admin
   - `fetchEventById()` - détail d'un événement
   - `createEvent()` - création événement
   - `updateEvent()` - modification événement
   - `deleteEvent()` - suppression événement

2. **Zod Schemas Admin** (`lib/schemas/admin-agenda.ts`)
   - `EventInputSchema` (Server - bigint pour IDs)
   - `EventFormSchema` (UI - number pour forms)
   - `EventDTO` type

3. **Server Actions** (`app/(admin)/admin/agenda/actions.ts`)
   - `createEventAction()` - création + revalidatePath
   - `updateEventAction()` - modification + revalidatePath
   - `deleteEventAction()` - suppression + revalidatePath

4. **Admin Pages**
   - `app/(admin)/admin/agenda/page.tsx` - liste des événements
   - `app/(admin)/admin/agenda/new/page.tsx` - création
   - `app/(admin)/admin/agenda/[id]/edit/page.tsx` - édition

5. **Components** (`components/features/admin/agenda/`)
   - `EventsContainer.tsx` - Server Component
   - `EventsView.tsx` - Client Component (liste + actions)
   - `EventForm.tsx` - formulaire création/édition
   - `EventFormFields.tsx` - champs du formulaire
   - `types.ts` - ViewProps interfaces

### Phase 2: Lieux Management (P1)

1. **DAL Lieux** (`lib/dal/admin-lieux.ts`)
   - CRUD complet pour les lieux

2. **Admin Pages Lieux**
   - `app/(admin)/admin/agenda/lieux/page.tsx` - liste
   - `app/(admin)/admin/agenda/lieux/new/page.tsx` - création
   - `app/(admin)/admin/agenda/lieux/[id]/edit/page.tsx` - édition

3. **Components Lieux**
   - `LieuxContainer.tsx`, `LieuxView.tsx`, `LieuForm.tsx`

### Phase 3: Spectacles Integration (P1)

1. **Sélecteur de spectacle** dans EventForm
   - Dropdown avec recherche des spectacles existants
   - Affichage titre + statut

2. **Lien rapide** vers gestion spectacles existante
   - `/admin/spectacles` déjà existant

### Phase 4: UX Enhancements (P2)

1. **Calendrier visuel** - vue calendrier des événements
2. **Drag & Drop** - réorganisation des événements
3. **Filtres avancés** - par spectacle, lieu, date, statut
4. **Export CSV** - liste des événements

## Data Model

### Event Form Fields

| Field | Type | Required | Description |
| ------- | ------ | ---------- | ------------- |
| spectacle_id | bigint | ✅ | Référence au spectacle |
| lieu_id | bigint | ❌ | Référence au lieu (nullable) |
| date_debut | datetime | ✅ | Date et heure de début |
| date_fin | datetime | ❌ | Date et heure de fin |
| start_time | time | ❌ | Heure de début précise |
| end_time | time | ❌ | Heure de fin précise |
| status | string | ✅ | 'scheduled', 'cancelled', 'completed' |
| ticket_url | string | ❌ | URL billetterie externe |
| image_url | string | ❌ | Image spécifique à l'événement |
| type_array | string[] | ❌ | Types: spectacle, atelier, rencontre |
| capacity | integer | ❌ | Capacité de l'événement |
| price_cents | integer | ❌ | Prix en centimes |

### Lieu Form Fields

| Field | Type | Required | Description |
| ------- | ------ | ---------- | ------------- |
| nom | string | ✅ | Nom du lieu |
| adresse | string | ❌ | Adresse postale |
| ville | string | ❌ | Ville |
| code_postal | string | ❌ | Code postal |
| pays | string | ❌ | Pays (défaut: France) |
| latitude | number | ❌ | Coordonnées GPS |
| longitude | number | ❌ | Coordonnées GPS |
| capacite | integer | ❌ | Capacité d'accueil |

## Acceptance Criteria

### Phase 1 (MVP) ✅ COMPLETE

- [x] Liste des événements dans `/admin/agenda`
- [x] Création d'un événement avec sélection spectacle/lieu
- [x] Édition d'un événement existant
- [x] Suppression avec confirmation
- [x] Validation Zod côté serveur et client
- [x] RLS policies respectées (is_admin())
- [x] Revalidation du cache après mutations
- [x] Navigation dans sidebar admin
- [x] Fix BigInt serialization error

### Phase 2 ✅ COMPLETE

- [x] CRUD complet des lieux
- [x] Sélecteur de lieu dans formulaire événement
- [x] Géolocalisation optionnelle (latitude/longitude)
- [x] Correction join table (lieux au lieu de lieux_evenements)

### Phase 3 ✅ COMPLETE

- [x] Intégration fluide avec gestion spectacles
- [x] Affichage du statut spectacle dans la liste

### Phase 4 (Future)

- [ ] Vue calendrier fonctionnelle
- [ ] Export CSV des événements
- [ ] Drag & Drop réorganisation
- [ ] Filtres avancés

## Dependencies

- Tables Supabase: `evenements`, `spectacles`, `lieux` (existantes)
- RLS policies admin (existantes via `is_admin()`)
- Media Library pour images (existante)
- Sidebar admin (à mettre à jour)

## Technical Notes

### Pattern à suivre (CRUD Server Actions)

Référence: `.github/instructions/crud-server-actions-pattern.instructions.md`

```typescript
// Page setup
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server Action pattern
export async function createEventAction(input: unknown): Promise<ActionResult> {
  const validated = EventInputSchema.parse(input);
  const result = await createEvent(validated);
  if (!result.success) return result;
  revalidatePath("/admin/agenda");
  revalidatePath("/agenda"); // public page
  return { success: true, data: result.data };
}

// Client Component state sync
useEffect(() => {
  setEvents(initialEvents);
}, [initialEvents]);
```

### RLS existant

Tables `evenements` et `lieux` ont déjà les policies admin:

- `Admins can create/update/delete events/lieux`
- Lecture publique pour tous

## Progress Log

### 2026-01-26 (BigInt Fix & Documentation)

- **Fixed** : BigInt serialization error dans Server Actions
- **Refactored** : ActionResult simplifié (no data return)
- **Refactored** : Server Actions validant avec EventFormSchema (UI) au lieu de EventInputSchema (Server)
- **Added** : Type `EventDataTransport` pour transport avec IDs en string
- **Updated** : Conversion format déplacée dans Server Actions (datetime-local→ISO8601, HH:MM→HH:MM:SS)
- **Updated** : EventForm simplifié (envoie raw form data)
- **Updated** : Plan TASK055 avec détails du fix BigInt
- **Tested** : Update/Create événements fonctionnels sans erreur

### 2026-01-25 (Phase 1 & 2 Implementation)

- **Phase 1 Complete** : CRUD Events avec DAL, Server Actions, pages dédiées
- **Phase 2 Complete** : CRUD Lieux avec interface complète
- **Fixed** : Correction join `lieux_evenements` → `lieux` (table correcte)
- **Added** : Combobox Spectacle/Lieu avec recherche
- **Added** : EventsTable avec tri, EventForm validation
- Task created from epic request
- Analyzed existing public agenda implementation
- Defined 4-phase implementation plan
- Documented data model and acceptance criteria

## shadcn / TweakCN Checklist

- [ ] Use shadcn Calendar component for date picker
- [ ] Use shadcn Select with search for spectacle/lieu selection
- [ ] Use shadcn Table for events list with sorting
- [ ] Use shadcn Dialog for delete confirmation
- [ ] Apply TweakCN theme for admin consistency
- [ ] Responsive verification for mobile admin access

## Estimated Effort

| Phase | Effort | Dependencies |
| ------- | -------- | -------------- |
| Phase 1 | 3-4 jours | None |
| Phase 2 | 1-2 jours | Phase 1 |
| Phase 3 | 0.5 jour | Phase 1 |
| Phase 4 | 2-3 jours | Phase 1-3 |

**Total estimé:** 7-10 jours
