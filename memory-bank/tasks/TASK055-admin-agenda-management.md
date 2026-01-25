# TASK055 - Admin Agenda Management

**Status:** Ready to Start  
**Added:** 2026-01-25  
**Updated:** 2026-01-25  
**Priority:** High  
**Epic:** Milestone 2 - Admin Backoffice

## Audit Status

✅ **Plan validé** - Conformité 98/100 (2026-01-25)

- Architecture Next.js 16 (RSC, force-dynamic) ✅
- SOLID principles (DAL < 30 lignes) ✅  
- Server Actions pattern (validation → DAL → revalidate) ✅
- Clean Code (composants < 300 lignes) ✅
- Type safety (schémas Server/UI séparés) ✅

**Améliorations intégrées** :

- Error Boundary (`error.tsx`) pour gestion erreurs React
- parseInt radix explicite (`parseInt(val, 10)`)
- Section tests RLS policies

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

### Phase 1 (MVP)

- [ ] Liste des événements dans `/admin/agenda`
- [ ] Création d'un événement avec sélection spectacle/lieu
- [ ] Édition d'un événement existant
- [ ] Suppression avec confirmation
- [ ] Validation Zod côté serveur et client
- [ ] RLS policies respectées (is_admin())
- [ ] Revalidation du cache après mutations
- [ ] Navigation dans sidebar admin

### Phase 2

- [ ] CRUD complet des lieux
- [ ] Sélecteur de lieu dans formulaire événement
- [ ] Géolocalisation optionnelle

### Phase 3

- [ ] Intégration fluide avec gestion spectacles
- [ ] Affichage du statut spectacle dans la liste

### Phase 4

- [ ] Vue calendrier fonctionnelle
- [ ] Export CSV des événements

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

### 2026-01-25

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
