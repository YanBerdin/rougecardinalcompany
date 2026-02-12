# Plan : Interface Admin Agenda (TASK055 - Phase 1 MVP)

✅ **IMPLÉMENTÉ** (2026-01-26) avec fix BigInt serialization

Créer l'interface CRUD admin pour la gestion des événements avec DAL dédié, Server Actions, pages dédiées (`/new`, `/[id]/edit`), et composants Select avec recherche. CRUD Lieux différé en Phase 2.

## ⚠️ BigInt Serialization Fix (Post-Implementation)

**Problème rencontré** : "Do not know how to serialize a BigInt" lors de l'update d'événements.

**Cause** : React Server Actions serialisent leur contexte d'exécution. Créer des `BigInt` dans les Server Actions (même temporairement) provoque une erreur de sérialisation.

**Solution finale** :
1. ✅ `ActionResult` simplifié : Ne retourne JAMAIS de data (seulement `{success: true/false}`)
2. ✅ Validation avec `EventFormSchema` (number IDs) au lieu de `EventInputSchema` (bigint IDs)
3. ✅ Type `EventDataTransport` pour IDs en string (pas BigInt) avant passage au DAL
4. ✅ Conversion format (datetime-local→ISO8601, HH:MM→HH:MM:SS) APRÈS validation dans Server Action
5. ✅ `router.refresh()` côté client pour récupérer les données mises à jour (évite retour de data)

**Pattern flux de données** :
```bash
Form (number IDs) → Action (valide + convertit string IDs) → DAL (convertit BigInt en interne) → router.refresh()
```

Voir commit détaillé : `.git-commit-bigint-fix.md`

## Steps

### 1. Créer le DAL admin-agenda

**Fichier** : `lib/dal/admin-agenda.ts`

**Directives obligatoires** :
```typescript
"use server";
import "server-only";
```

**Fonctions à implémenter** :

```typescript
// Lecture (avec cache React)
export const fetchAllEventsAdmin = cache(async (): Promise<DALResult<EventDTO[]>> => {
  await requireAdmin();
  // Query avec joins spectacles + lieux_evenements
  // SELECT e.*, s.titre as spectacle_titre, l.nom as lieu_nom
  // FROM evenements e
  // LEFT JOIN spectacles s ON e.spectacle_id = s.id
  // LEFT JOIN lieux_evenements l ON e.lieu_id = l.id
  // ORDER BY e.date_debut DESC
});

export const fetchEventByIdAdmin = cache(async (id: bigint): Promise<DALResult<EventDTO | null>> => {
  await requireAdmin();
  // Query single event avec relations
});

// Mutations
export async function createEvent(input: EventInput): Promise<DALResult<EventDTO>> {
  await requireAdmin();
  // Validation Zod déjà faite dans Server Action
  // INSERT avec select() pour retourner le DTO complet
}

export async function updateEvent(id: bigint, input: Partial<EventInput>): Promise<DALResult<EventDTO>> {
  await requireAdmin();
  // UPDATE avec select() pour retourner le DTO mis à jour
}

export async function deleteEvent(id: bigint): Promise<DALResult<null>> {
  await requireAdmin();
  // DELETE simple, retourne DALResult<null>
}

// Helper pour select lieux (Phase 1 - lecture seule)
export const fetchAllLieux = cache(async (): Promise<DALResult<LieuDTO[]>> => {
  await requireAdmin();
  // SELECT id, nom, ville, adresse FROM lieux_evenements
  // ORDER BY nom ASC
});
```

**Réutilisation existante** :
- `fetchAllSpectacles()` de `lib/dal/spectacles.ts` pour le select spectacles

**Pattern SOLID** :
- ✅ Directive `"use server"` + `import "server-only"`
- ✅ Retour `DALResult<T>` avec `dalSuccess()` / `dalError()` de `lib/dal/helpers/`
- ✅ `requireAdmin()` au début de chaque fonction
- ✅ Pas de `revalidatePath()` (uniquement dans Server Actions)
- ✅ Fonctions < 30 lignes (Clean Code)
- ✅ Error codes : `[ERR_AGENDA_001]`, `[ERR_AGENDA_002]`, etc.
- ✅ Cache React avec `cache()` pour les lectures

### 2. Créer les schémas Zod

**Fichier** : `lib/schemas/admin-agenda.ts`

```typescript
import { z } from "zod";

// ✅ Schéma SERVER (pour DAL/BDD) — utilise bigint
export const EventInputSchema = z.object({
  spectacle_id: z.coerce.bigint(),
  lieu_id: z.coerce.bigint().nullable().optional(),
  date_debut: z.string().datetime(), // ISO 8601 string → timestamptz
  date_fin: z.string().datetime().nullable().optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), // HH:MM:SS
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).nullable().optional(),
  status: z.enum(["scheduled", "cancelled", "completed"]).default("scheduled"),
  ticket_url: z.string().url().nullable().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  price_cents: z.number().int().nonnegative().nullable().optional(),
});
export type EventInput = z.infer<typeof EventInputSchema>;

// ✅ Schéma UI (pour formulaires React Hook Form) — utilise number
// ⚠️ IMPORTANT: Validé dans Server Actions pour éviter BigInt serialization
export const EventFormSchema = z.object({
  spectacle_id: z.number().int().positive({ message: "Spectacle requis" }),
  lieu_id: z.number().int().positive().nullable().optional(),
  date_debut: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/), // datetime-local format
  date_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).nullable().optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM pour input type="time"
  end_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  status: z.enum(["scheduled", "cancelled", "completed"]).default("scheduled"),
  ticket_url: z.string().url().nullable().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  price_cents: z.number().int().nonnegative().nullable().optional(),
});
export type EventFormValues = z.infer<typeof EventFormSchema>;

// ✅ Type intermédiaire pour transport Server Action → DAL (IDs en string)
type EventDataTransport = Omit<EventInput, 'spectacle_id' | 'lieu_id'> & {
  spectacle_id: string;
  lieu_id: string | null;
};

// ✅ DTO (retourné par le DAL)
export type EventDTO = {
  id: bigint;
  spectacle_id: bigint;
  spectacle_titre?: string; // Join depuis spectacles
  lieu_id: bigint | null;
  lieu_nom?: string; // Join depuis lieux
  lieu_ville?: string;
  date_debut: string; // ISO 8601
  date_fin: string | null;
  start_time: string; // HH:MM:SS
  end_time: string | null;
  status: "scheduled" | "cancelled" | "completed";
  ticket_url: string | null;
  tags: string[];
  capacity: number | null;
  price_cents: number | null;
  created_at: string;
  updated_at: string;
};

// ✅ DTO Lieu (lecture seule)
export type LieuDTO = {
  id: bigint;
  nom: string;
  ville: string | null;
  adresse: string | null;
};
```

**Différences Server vs UI** :
- IDs : `bigint` (server) vs `number` (UI) — évite erreur sérialisation JSON
- Time : `HH:MM:SS` (server) vs `HH:MM` (UI) — compatible `<input type="time">`
- Validation messages : Uniquement dans schéma UI pour affichage utilisateur

### 3. Créer les Server Actions

**Fichier** : `app/(admin)/admin/agenda/actions.ts`

```typescript
"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { createEvent, updateEvent, deleteEvent } from "@/lib/dal/admin-agenda";
import { EventFormSchema } from "@/lib/schemas/admin-agenda-ui"; // ⚠️ UI schema, not server!
import type { EventInput } from "@/lib/schemas/admin-agenda";

// ✅ Type simplifié sans données - évite problèmes de sérialisation BigInt
export type ActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Type intermédiaire pour le transport de données
 * IDs en string avant conversion BigInt dans le DAL
 */
type EventDataTransport = Omit<EventInput, 'spectacle_id' | 'lieu_id'> & {
  spectacle_id: string;
  lieu_id: string | null;
};

/**
 * CREATE Event
 * ⚠️ PATTERN: Validate UI schema → Convert format → DAL → Never return data
 */
export async function createEventAction(input: unknown): Promise<ActionResult> {
  try {
    // 1. Validation avec schéma UI (number IDs) - Pas de BigInt ici !
    const validated = EventFormSchema.parse(input);
    
    // 2. Préparer les données pour le DAL (format serveur, mais IDs en string)
    const eventData: EventDataTransport = {
      spectacle_id: String(validated.spectacle_id),
      lieu_id: validated.lieu_id !== null && validated.lieu_id !== undefined 
        ? String(validated.lieu_id) 
        : null,
      date_debut: `${validated.date_debut}:00.000Z`, // datetime-local → ISO 8601
      date_fin: validated.date_fin ? `${validated.date_fin}:00.000Z` : null,
      start_time: `${validated.start_time}:00`, // HH:MM → HH:MM:SS
      end_time: validated.end_time ? `${validated.end_time}:00` : null,
      status: validated.status,
      ticket_url: validated.ticket_url ?? null,
      capacity: validated.capacity ?? null,
      price_cents: validated.price_cents ?? null,
    };
    
    // 3. Appel DAL (qui convertira string → bigint en interne)
    const result = await createEvent(eventData as unknown as EventInput);
    if (!result.success) {
      return { success: false, error: result.error ?? "Create failed" };
    }
    
    // 4. ✅ Revalidation UNIQUEMENT ICI (pas dans DAL)
    revalidatePath("/admin/agenda");
    revalidatePath("/agenda");
    
    // 5. ✅ Ne pas retourner de données - évite sérialisation BigInt
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation échouée: ${err.issues.map(i => i.message).join(", ")}`,
      };
    }
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Erreur inconnue" 
    };
  }
}

/**
 * UPDATE Event
 * ⚠️ PATTERN: Same as create - validate UI schema, convert, never return data
 */
export async function updateEventAction(
  id: string, 
  input: unknown
): Promise<ActionResult> {
  try {
    // 1. Validation avec schéma UI (number IDs)
    const validated = EventFormSchema.partial().parse(input);
    
    // 2. Préparer les données (format serveur, IDs en string)
    const eventData: Partial<EventDataTransport> = {};
    
    if (validated.spectacle_id !== undefined) {
      eventData.spectacle_id = String(validated.spectacle_id);
    }
    if (validated.lieu_id !== undefined) {
      eventData.lieu_id = validated.lieu_id !== null ? String(validated.lieu_id) : null;
    }
    if (validated.date_debut !== undefined) {
      eventData.date_debut = `${validated.date_debut}:00.000Z`;
    }
    if (validated.date_fin !== undefined) {
      eventData.date_fin = validated.date_fin ? `${validated.date_fin}:00.000Z` : null;
    }
    if (validated.start_time !== undefined) {
      eventData.start_time = `${validated.start_time}:00`;
    }
    if (validated.end_time !== undefined) {
      eventData.end_time = validated.end_time ? `${validated.end_time}:00` : null;
    }
    if (validated.status !== undefined) {
      eventData.status = validated.status;
    }
    if (validated.ticket_url !== undefined) {
      eventData.ticket_url = validated.ticket_url ?? null;
    }
    if (validated.capacity !== undefined) {
      eventData.capacity = validated.capacity ?? null;
    }
    if (validated.price_cents !== undefined) {
      eventData.price_cents = validated.price_cents ?? null;
    }
    
    // 3. Appel DAL avec ID converti en bigint
    const result = await updateEvent(BigInt(id), eventData as Partial<EventInput>);
    
    if (!result.success) {
      return { success: false, error: result.error ?? "Update failed" };
    }
    
    // 4. Revalidation
    revalidatePath("/admin/agenda");
    revalidatePath("/agenda");
    
    // 5. ✅ Ne pas retourner de données - évite sérialisation BigInt
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation échouée: ${err.issues.map(i => i.message).join(", ")}`,
      };
    }
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Erreur inconnue" 
    };
  }
}

/**
 * DELETE Event
 */
export async function deleteEventAction(id: string): Promise<ActionResult> {
  try {
    // ✅ Conversion string → bigint pour le DAL
    const result = await deleteEvent(BigInt(id));
    
    if (!result.success) {
      return { success: false, error: result.error ?? "Delete failed" };
    }
    
    revalidatePath("/admin/agenda");
    revalidatePath("/agenda");
    
    return { success: true };
  } catch (err: unknown) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Erreur inconnue" 
    };
  }
}
```

**Règles CRUD Pattern** :
- ✅ Directive `"use server"` + `import "server-only"`
- ✅ Validation Zod AVANT appel DAL
- ✅ `revalidatePath()` sur `/admin/agenda` ET `/agenda` (public)
- ✅ Try/catch avec gestion `ZodError` + erreurs génériques
- ✅ Retour `ActionResult<T>` cohérent
- ✅ Pas de logique métier (délégué au DAL)

### 4. Créer les pages admin agenda

**4.1. Page Liste** — `app/(admin)/admin/agenda/page.tsx`

```typescript
import { EventsContainer } from "@/components/features/admin/agenda/EventsContainer";

export const metadata = {
  title: "Gestion Agenda | Admin",
};

// ✅ OBLIGATOIRE : Force le re-fetch à chaque visite
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AgendaPage() {
  return <EventsContainer />;
}
```

**4.2. Page Création** — `app/(admin)/admin/agenda/new/page.tsx`

```typescript
import { Suspense } from "react";
import { EventForm } from "@/components/features/admin/agenda/EventForm";
import { fetchAllSpectacles } from "@/lib/dal/spectacles";
import { fetchAllLieux } from "@/lib/dal/admin-agenda";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Nouvel Événement | Admin",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function NewEventFormData() {
  const [spectaclesResult, lieuxResult] = await Promise.all([
    fetchAllSpectacles(),
    fetchAllLieux(),
  ]);

  const spectacles = spectaclesResult.success ? spectaclesResult.data : [];
  const lieux = lieuxResult.success ? lieuxResult.data : [];

  return (
    <EventForm 
      spectacles={spectacles} 
      lieux={lieux} 
    />
  );
}

export default function NewEventPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Nouvel Événement</h1>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <NewEventFormData />
      </Suspense>
    </div>
  );
}
```

**4.3. Page Édition** — `app/(admin)/admin/agenda/[id]/edit/page.tsx`

```typescript
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/features/admin/agenda/EventForm";
import { fetchEventByIdAdmin, fetchAllLieux } from "@/lib/dal/admin-agenda";
import { fetchAllSpectacles } from "@/lib/dal/spectacles";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Modifier Événement | Admin",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditEventPageProps {
  params: { id: string };
}

async function EditEventFormData({ id }: { id: string }) {
  const [eventResult, spectaclesResult, lieuxResult] = await Promise.all([
    fetchEventByIdAdmin(BigInt(id)),
    fetchAllSpectacles(),
    fetchAllLieux(),
  ]);

  if (!eventResult.success || !eventResult.data) {
    notFound();
  }

  const spectacles = spectaclesResult.success ? spectaclesResult.data : [];
  const lieux = lieuxResult.success ? lieuxResult.data : [];

  return (
    <EventForm 
      event={eventResult.data}
      spectacles={spectacles} 
      lieux={lieux} 
    />
  );
}

export default function EditEventPage({ params }: EditEventPageProps) {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Modifier Événement</h1>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <EditEventFormData id={params.id} />
      </Suspense>
    </div>
  );
}
```

**4.4. Loading State** — `app/(admin)/admin/agenda/loading.tsx`

```typescript
import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-10 w-48 mb-6" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
```

**Pattern Pages Dédiées** :
- ✅ `/new` : Page séparée pour création (UX claire)
- ✅ `/[id]/edit` : Page séparée pour édition (URL shareable)
- ✅ Fetching parallèle avec `Promise.all()`
- ✅ `force-dynamic` + `revalidate=0` sur toutes les pages
- ✅ Suspense boundaries pour streaming

### 5. Créer les composants

**Dossier** : `components/features/admin/agenda/`

**5.1. EventsContainer.tsx** (Server Component)

```typescript
import { Suspense } from "react";
import { EventsView } from "./EventsView";
import { fetchAllEventsAdmin } from "@/lib/dal/admin-agenda";
import { Skeleton } from "@/components/ui/skeleton";

export async function EventsContainer() {
  const result = await fetchAllEventsAdmin();
  const events = result.success ? result.data : [];

  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <EventsView initialEvents={events} />
    </Suspense>
  );
}
```

**5.2. EventsView.tsx** (Client Component)

```typescript
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteEventAction } from "@/app/(admin)/admin/agenda/actions";
import type { EventDTO } from "@/lib/schemas/admin-agenda";
import { EventsTable } from "./EventsTable";

interface EventsViewProps {
  initialEvents: EventDTO[];
}

export function EventsView({ initialEvents }: EventsViewProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);

  // ✅ CRITIQUE : Sync local state when props change
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const handleDelete = useCallback(async (id: bigint) => {
    if (!confirm("Supprimer cet événement ?")) return;

    try {
      const result = await deleteEventAction(String(id));
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success("Événement supprimé");
      router.refresh(); // ✅ Déclenche re-fetch Server Component
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }, [router]);

  const handleEdit = useCallback((id: bigint) => {
    router.push(`/admin/agenda/${id}/edit`);
  }, [router]);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion Agenda</h1>
        <Button onClick={() => router.push("/admin/agenda/new")}>
          Nouvel Événement
        </Button>
      </div>
      <EventsTable 
        events={events}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

**5.3. EventForm.tsx** (< 300 lignes)

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EventFormFields } from "./EventFormFields";
import { SpectacleSelect } from "./SpectacleSelect";
import { LieuSelect } from "./LieuSelect";
import { createEventAction, updateEventAction } from "@/app/(admin)/admin/agenda/actions";
import { EventFormSchema, type EventFormValues, type EventDTO, type LieuDTO } from "@/lib/schemas/admin-agenda";
import type { SpectacleDTO } from "@/lib/schemas/spectacle";

interface EventFormProps {
  event?: EventDTO;
  spectacles: SpectacleDTO[];
  lieux: LieuDTO[];
}

export function EventForm({ event, spectacles, lieux }: EventFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: event ? {
      spectacle_id: Number(event.spectacle_id),
      lieu_id: event.lieu_id ? Number(event.lieu_id) : null,
      date_debut: event.date_debut,
      date_fin: event.date_fin ?? undefined,
      start_time: event.start_time.slice(0, 5), // HH:MM:SS → HH:MM
      end_time: event.end_time?.slice(0, 5) ?? undefined,
      status: event.status,
      notes: event.notes ?? undefined,
      ticket_url: event.ticket_url ?? undefined,
      tags: event.tags,
      capacity: event.capacity ?? undefined,
      price_cents: event.price_cents ?? undefined,
    } : {
      status: "scheduled",
      tags: [],
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    setIsPending(true);

    try {
      // Convertir time HH:MM → HH:MM:SS pour le serveur
      const serverData = {
        ...data,
        start_time: `${data.start_time}:00`,
        end_time: data.end_time ? `${data.end_time}:00` : undefined,
      };

      const result = event
        ? await updateEventAction(String(event.id), serverData)
        : await createEventAction(serverData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(event ? "Événement mis à jour" : "Événement créé");
      router.push("/admin/agenda");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SpectacleSelect 
          form={form} 
          spectacles={spectacles} 
        />
        
        <LieuSelect 
          form={form} 
          lieux={lieux} 
        />
        
        <EventFormFields form={form} />
        
        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement..." : event ? "Mettre à jour" : "Créer"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**5.4. EventFormFields.tsx** (Champs texte/dates)

```ts
"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { EventFormValues } from "@/lib/schemas/admin-agenda";

interface EventFormFieldsProps {
  form: UseFormReturn<EventFormValues>;
}

export function EventFormFields({ form }: EventFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="date_debut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date début *</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date_fin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date fin</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heure début *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heure fin</FormLabel>
              <FormControl>
                <Input type="time" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Statut</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ticket_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Billetterie</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://..." {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea rows={4} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacité</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value ?? ""} 
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price_cents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix (centimes)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value ?? ""} 
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
```

**5.5. SpectacleSelect.tsx** (Combobox shadcn/ui)

```typescript
"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { UseFormReturn } from "react-hook-form";
import type { EventFormValues } from "@/lib/schemas/admin-agenda";
import type { SpectacleDTO } from "@/lib/schemas/spectacle";

interface SpectacleSelectProps {
  form: UseFormReturn<EventFormValues>;
  spectacles: SpectacleDTO[];
}

export function SpectacleSelect({ form, spectacles }: SpectacleSelectProps) {
  return (
    <FormField
      control={form.control}
      name="spectacle_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Spectacle *</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? spectacles.find((s) => Number(s.id) === field.value)?.titre
                    : "Sélectionner un spectacle"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Rechercher..." />
                <CommandEmpty>Aucun spectacle trouvé</CommandEmpty>
                <CommandGroup>
                  {spectacles.map((spectacle) => (
                    <CommandItem
                      key={String(spectacle.id)}
                      value={spectacle.titre}
                      onSelect={() => {
                        form.setValue("spectacle_id", Number(spectacle.id));
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          Number(spectacle.id) === field.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {spectacle.titre}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

**5.6. LieuSelect.tsx** (Combobox shadcn/ui)

```typescript
"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { UseFormReturn } from "react-hook-form";
import type { EventFormValues, LieuDTO } from "@/lib/schemas/admin-agenda";

interface LieuSelectProps {
  form: UseFormReturn<EventFormValues>;
  lieux: LieuDTO[];
}

export function LieuSelect({ form, lieux }: LieuSelectProps) {
  return (
    <FormField
      control={form.control}
      name="lieu_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Lieu</FormLabel>
          {lieux.length === 0 && (
            <FormDescription>
              Aucun lieu disponible. Le CRUD Lieux sera implémenté en Phase 2.
            </FormDescription>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={lieux.length === 0}
                  className={cn(
                    "justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? lieux.find((l) => Number(l.id) === field.value)?.nom
                    : "Sélectionner un lieu (optionnel)"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Rechercher..." />
                <CommandEmpty>Aucun lieu trouvé</CommandEmpty>
                <CommandGroup>
                  {lieux.map((lieu) => (
                    <CommandItem
                      key={String(lieu.id)}
                      value={lieu.nom}
                      onSelect={() => {
                        form.setValue("lieu_id", Number(lieu.id));
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          Number(lieu.id) === field.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {lieu.nom} {lieu.ville && `(${lieu.ville})`}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

**5.7. EventsTable.tsx** (Liste avec tri/filtres)

```typescript
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { EventDTO } from "@/lib/schemas/admin-agenda";

interface EventsTableProps {
  events: EventDTO[];
  onEdit: (id: bigint) => void;
  onDelete: (id: bigint) => void;
}

export function EventsTable({ events, onEdit, onDelete }: EventsTableProps) {
  const [sortField, setSortField] = useState<keyof EventDTO>("date_debut");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === null || bVal === null) return 0;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [events, sortField, sortOrder]);

  const handleSort = (field: keyof EventDTO) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getStatusBadge = (status: EventDTO["status"]) => {
    const variants = {
      scheduled: "default",
      cancelled: "destructive",
      completed: "secondary",
    } as const;
    
    const labels = {
      scheduled: "Programmé",
      cancelled: "Annulé",
      completed: "Terminé",
    };
    
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort("spectacle_titre")} className="cursor-pointer">
            Spectacle
          </TableHead>
          <TableHead onClick={() => handleSort("date_debut")} className="cursor-pointer">
            Date
          </TableHead>
          <TableHead onClick={() => handleSort("lieu_nom")} className="cursor-pointer">
            Lieu
          </TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedEvents.map((event) => (
          <TableRow key={String(event.id)}>
            <TableCell className="font-medium">{event.spectacle_titre}</TableCell>
            <TableCell>
              {new Date(event.date_debut).toLocaleDateString("fr-FR")}
              <br />
              <span className="text-sm text-muted-foreground">
                {event.start_time.slice(0, 5)}
              </span>
            </TableCell>
            <TableCell>
              {event.lieu_nom ?? "-"}
              {event.lieu_ville && (
                <span className="text-sm text-muted-foreground block">
                  {event.lieu_ville}
                </span>
              )}
            </TableCell>
            <TableCell>{getStatusBadge(event.status)}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onEdit(event.id)}
              >
                Modifier
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onDelete(event.id)}
              >
                Supprimer
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**5.8. types.ts**

```typescript
import type { EventDTO, LieuDTO, EventFormValues } from "@/lib/schemas/admin-agenda";
import type { SpectacleDTO } from "@/lib/schemas/spectacle";

export type { EventDTO, LieuDTO, EventFormValues, SpectacleDTO };
```

**Règles Clean Code respectées** :
- ✅ EventForm < 300 lignes (splittage en EventFormFields)
- ✅ Pattern Smart/Dumb : Container (server) → View (client)
- ✅ `useEffect()` pour sync état/props (re-render immédiat)
- ✅ Combobox shadcn/ui avec recherche intégrée
- ✅ Gestion gracieuse si aucun lieu (message Phase 2)

### 6. Corriger la sidebar + exports

| Fichier | Modification |
|---------|--------------|
| `components/admin/app-sidebar.tsx` | Href `/admin/events` → `/admin/agenda` |
| `lib/dal/index.ts` | Export `admin-agenda` |
| `lib/schemas/index.ts` | Export `admin-agenda` |

## Acceptance Criteria (Phase 1)

### Fonctionnel
- [ ] Liste des événements dans `/admin/agenda` avec tri par date
- [ ] Création d'un événement avec validation complète
- [ ] Édition d'un événement existant (page dédiée `/[id]/edit`)
- [ ] Suppression avec confirmation modale
- [ ] Sélection spectacle via Combobox avec recherche
- [ ] Sélection lieu via Combobox (optionnel, message si vide)
- [ ] Affichage status avec badges colorés
- [ ] Navigation sidebar corrigée (`/admin/agenda`)

### Technique
- [ ] DAL avec directive `"use server"` + `import "server-only"`
- [ ] Retour `DALResult<T>` cohérent sur toutes les fonctions
- [ ] Server Actions avec `revalidatePath()` (pas dans DAL)
- [ ] Validation Zod côté serveur ET client
- [ ] Schémas Server (bigint) vs UI (number) séparés
- [ ] RLS policies `is_admin()` respectées
- [ ] Pages avec `force-dynamic` + `revalidate=0`
- [ ] `useEffect()` pour sync état/props dans EventsView
- [ ] Fonctions < 30 lignes (DAL SOLID)
- [ ] Composants < 300 lignes (Clean Code)
- [ ] TypeScript strict (pas de `any`)
- [ ] Error codes tracés `[ERR_AGENDA_XXX]`

### Tests manuels
- [ ] Création événement → apparaît dans liste
- [ ] Édition événement → modifications sauvegardées
- [ ] Suppression événement → disparaît de la liste
- [ ] Recherche spectacle dans Combobox fonctionne
- [ ] Message "Aucun lieu" si table lieux_evenements vide
- [ ] Tri par colonne fonctionne
- [ ] Navigation `/new`, `/[id]/edit`, retour `/admin/agenda`
- [ ] Toast notifications affichées correctement
- [ ] Router.refresh() déclenche re-render immédiat

## Notes

### Lieux (Phase 2)
En Phase 1, le select lieux utilise les données existantes (lecture seule). Si aucun lieu n'existe en BDD, afficher un message "Aucun lieu disponible". Le CRUD Lieux complet sera implémenté en Phase 2.

### Dépendances existantes
- Tables `evenements`, `lieux_evenements`, `spectacles` ✅
- RLS policies admin (`is_admin()`) ✅
- Media Library pour images ✅
- Pattern CRUD Server Actions documenté ✅

### Fichiers de référence
- **DAL pattern** : `lib/dal/spectacles.ts` (structure SOLID)
- **Actions pattern** : `app/(admin)/admin/spectacles/actions.ts` (revalidatePath)
- **Form pattern** : `components/features/admin/spectacles/SpectacleForm.tsx` (< 300 lignes)
- **Schemas pattern** : `lib/schemas/spectacle.ts` (Server vs UI)
- **Combobox pattern** : shadcn/ui Command component
- **CRUD Pattern** : `.github/instructions/crud-server-actions-pattern.instructions.md`
- **DAL SOLID** : `.github/instructions/dal-solid-principles.instructions.md`

### Ordre d'implémentation recommandé

1. **Schémas Zod** (`lib/schemas/admin-agenda.ts`) — Définir les types avant tout
2. **DAL** (`lib/dal/admin-agenda.ts`) — Logique database isolée
3. **Server Actions** (`app/(admin)/admin/agenda/actions.ts`) — Couche entre UI et DAL
4. **Pages liste** (`app/(admin)/admin/agenda/page.tsx`) — Point d'entrée admin
5. **Composants** (Container → View → Form) — UI progressive
6. **Pages new/edit** — Routes dédiées création/édition
7. **Sidebar + exports** — Navigation finale

### Commandes de test après implémentation

```bash
# 1. Vérifier que Supabase local tourne
pnpm dlx supabase status

# 2. Lancer Next.js en dev
pnpm dev

# 3. Naviguer vers
# http://localhost:3000/admin/agenda

# 4. Tester le flow complet
# - Cliquer "Nouvel Événement"
# - Remplir formulaire avec spectacle/lieu
# - Sauvegarder → vérifier redirection + toast
# - Modifier un événement existant
# - Supprimer avec confirmation

# 5. Vérifier les données en BDD
pnpm dlx supabase db dump --data-only --table=evenements
```

### Points d'attention

1. **Conversion time** : UI utilise `HH:MM`, serveur attend `HH:MM:SS` → conversion dans EventForm.onSubmit
2. **BigInt sérialization** : Conversion `String(event.id)` dans deleteEventAction
3. **Nullable fields** : Bien gérer `?? undefined` dans defaultValues du formulaire
4. **Lieux vides** : Afficher message "Aucun lieu disponible - Phase 2" si `lieux.length === 0`
5. **Tri par défaut** : Date décroissante (`date_debut DESC`) pour afficher événements récents en premier
