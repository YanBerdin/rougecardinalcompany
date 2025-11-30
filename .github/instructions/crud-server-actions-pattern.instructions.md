---
applyTo: "**"
description: Pattern obligatoire pour implémenter des CRUDs avec Server Actions et re-render immédiat
---

# 🔄 CRUD avec Server Actions - Pattern obligatoire

> Guide d'implémentation pour tous les CRUDs admin nécessitant un re-render immédiat après mutation.  
> **Version** : 1.1 | **Date** : Novembre 2025  
> **Mise à jour** : Ajout règles schémas UI, split composants, suppression API Routes obsolètes

---

## 📋 Contexte

Ce pattern résout les problèmes de re-render rencontrés lors de l'implémentation des Hero Slides CRUD.

**Problème** : `revalidatePath()` appelé depuis une API Route ne déclenche pas de re-render immédiat.  
**Solution** : Utiliser des Server Actions + synchronisation d'état via `useEffect`.

---

## 🏗️ Architecture obligatoire

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE CRUD                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   app/(admin)/admin/[feature]/page.tsx                         │
│   ├── export const dynamic = 'force-dynamic'                    │
│   ├── export const revalidate = 0                               │
│   └── Server Component fetches data → passes to Client          │
│                              │                                  │
│                              ▼                                  │
│   components/features/admin/[feature]/Container.tsx             │
│   └── Suspense + fetches initial data                          │
│                              │                                  │
│                              ▼                                  │
│   components/features/admin/[feature]/View.tsx (Client)         │
│   ├── useState(initialProps)                                   │
│   ├── useEffect(() => setState(props), [props]) ← CRITIQUE     │
│   └── Calls Server Actions → router.refresh()                   │
│                              │                                  │
│                              ▼                                  │
│   lib/actions/[feature]-actions.ts (Server Actions)             │
│   ├── Calls DAL functions                                       │
│   └── revalidatePath() on success ← UNIQUEMENT ICI              │
│                              │                                  │
│                              ▼                                  │
│   lib/dal/[feature].ts (Data Access Layer)                      │
│   └── Database operations only (NO revalidatePath!)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des fichiers

```
lib/
├── actions/
│   └── [feature]-actions.ts     # Server Actions avec revalidatePath()
├── dal/
│   └── [feature].ts             # DAL sans revalidatePath()
└── schemas/
    └── [feature].ts             # Zod schemas (Server + UI)

app/(admin)/admin/[feature]/
└── page.tsx                      # dynamic + revalidate exports

components/features/admin/[feature]/
├── Container.tsx                 # Server Component
├── View.tsx                      # Client Component avec useEffect
├── Form.tsx                      # Client Component principal (<300 lignes)
├── FormFields.tsx                # Sous-composant : champs texte
└── FormImageSection.tsx          # Sous-composant : section image
```

### Règle Clean Code : Max 300 lignes par fichier

Si un formulaire dépasse 300 lignes, le splitter en sous-composants :
- `FormFields.tsx` — Champs texte (title, description, etc.)
- `FormImageSection.tsx` — Sélection d'image avec MediaLibraryPicker
- `FormCtaFields.tsx` — Champs CTA (label, url)
- `FormToggle.tsx` — Switches (active, published, etc.)

---

## 🔴 RÈGLE N°1 : Configuration de la page admin

**OBLIGATOIRE** pour chaque page admin CRUD :

```typescript
// app/(admin)/admin/[feature]/page.tsx
import { Container } from "@/components/features/admin/[feature]/Container";

export const metadata = {
  title: "[Feature] Management | Admin",
};

// ✅ OBLIGATOIRE : Force le re-fetch à chaque visite
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function FeaturePage() {
  return <Container />;
}
```

---

## 🔴 RÈGLE N°2 : Server Actions (PAS API Routes)

**`revalidatePath()` UNIQUEMENT dans les Server Actions**, jamais dans le DAL.

```typescript
// lib/actions/[feature]-actions.ts
"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { createFeature, updateFeature, deleteFeature } from "@/lib/dal/[feature]";
import { FeatureInputSchema } from "@/lib/schemas/[feature]";

export type ActionResult<T = unknown> = 
  | { success: true; data?: T } 
  | { success: false; error: string };

/**
 * CREATE
 */
export async function createFeatureAction(input: unknown): Promise<ActionResult> {
  try {
    // 1. Validation Zod
    const validated = FeatureInputSchema.parse(input);
    
    // 2. Appel DAL
    const result = await createFeature(validated);
    
    if (!result.success) {
      return { success: false, error: result.error ?? "Create failed" };
    }
    
    // 3. ✅ Revalidation UNIQUEMENT ICI
    revalidatePath("/admin/[feature]");
    revalidatePath("/"); // Si affecte la page publique
    
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

/**
 * UPDATE
 */
export async function updateFeatureAction(
  id: string, 
  input: unknown
): Promise<ActionResult> {
  try {
    const validated = FeatureInputSchema.partial().parse(input);
    const result = await updateFeature(BigInt(id), validated);
    
    if (!result.success) {
      return { success: false, error: result.error ?? "Update failed" };
    }
    
    revalidatePath("/admin/[feature]");
    revalidatePath("/");
    
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

/**
 * DELETE
 */
export async function deleteFeatureAction(id: string): Promise<ActionResult> {
  try {
    const result = await deleteFeature(BigInt(id));
    
    if (!result.success) {
      return { success: false, error: result.error ?? "Delete failed" };
    }
    
    revalidatePath("/admin/[feature]");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: unknown) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}
```

---

## 🔴 RÈGLE N°3 : Synchronisation état/props dans Client Component

**CRITIQUE** : `useState(initialProps)` n'initialise qu'une seule fois.

```typescript
// components/features/admin/[feature]/View.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteFeatureAction } from "@/lib/actions/[feature]-actions";
import type { FeatureDTO } from "@/lib/schemas/[feature]";

interface ViewProps {
  initialItems: FeatureDTO[];
}

export function View({ initialItems }: ViewProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeatureDTO | null>(null);

  // ✅ CRITIQUE : Sync local state when props change (after router.refresh())
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // ✅ DELETE : Appel direct Server Action + router.refresh()
  const handleDelete = useCallback(async (id: bigint) => {
    if (!confirm("Supprimer cet élément ?")) return;

    try {
      const result = await deleteFeatureAction(String(id));
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success("Élément supprimé");
      router.refresh(); // ✅ Déclenche re-fetch Server Component
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  }, [router]);

  // ✅ EDIT : Utiliser données locales (pas de fetch supplémentaire)
  const handleEdit = useCallback((item: FeatureDTO) => {
    setEditingItem(item); // ✅ Données déjà fraîches
    setIsFormOpen(true);
  }, []);

  // ✅ SUCCESS : Fermer form + refresh
  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
    router.refresh();
  }, [router]);

  return (
    <div>
      {/* ... UI */}
      <Form 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={handleFormSuccess}
        item={editingItem}
      />
    </div>
  );
}
```

---

## 🔴 RÈGLE N°4 : Formulaire avec Server Actions directes

### Schémas Zod : Server vs UI

**Problème** : `bigint` ne peut pas être sérialisé en JSON pour les formulaires UI.  
**Solution** : Créer un schéma UI séparé avec `number` au lieu de `bigint`.

```typescript
// lib/schemas/[feature].ts
import { z } from "zod";

// ✅ Schéma SERVER (pour DAL/BDD) — utilise bigint
export const FeatureInputSchema = z.object({
  title: z.string().min(1).max(80),
  image_media_id: z.coerce.bigint().optional(),
  // ...
});
export type FeatureInput = z.infer<typeof FeatureInputSchema>;

// ✅ Schéma UI (pour formulaires) — utilise number
export const FeatureFormSchema = z.object({
  title: z.string().min(1).max(80),
  image_media_id: z.number().int().positive().optional(),
  // ...
});
export type FeatureFormValues = z.infer<typeof FeatureFormSchema>;

// ✅ DTO (retourné par le DAL)
export type FeatureDTO = {
  id: bigint;
  title: string;
  image_media_id: bigint | null;
  // ...
};
```

### Formulaire avec schéma UI

```typescript
// components/features/admin/[feature]/Form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createFeatureAction, updateFeatureAction } from "@/lib/actions/[feature]-actions";
// ✅ Utiliser le schéma UI (pas le schéma Server)
import { FeatureFormSchema, type FeatureFormValues, type FeatureDTO } from "@/lib/schemas/[feature]";

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: FeatureDTO | null;
}

export function Form({ open, onClose, onSuccess, item }: FormProps) {
  const [isPending, setIsPending] = useState(false);
  
  // ✅ Utiliser FeatureFormValues (UI) — PAS FeatureInput (Server)
  // ✅ Utiliser FeatureFormSchema — évite le type casting `as unknown as Resolver<>`
  const form = useForm<FeatureFormValues>({
    resolver: zodResolver(FeatureFormSchema),
    defaultValues: item ? {
      // Map bigint → number pour l'UI
      title: item.title,
      image_media_id: item.image_media_id !== null ? Number(item.image_media_id) : undefined,
      // ...
    } : {
      title: "",
      image_media_id: undefined,
      // ...
    },
  });

  // ✅ Le type est FeatureFormValues (UI avec number)
  const onSubmit = async (data: FeatureFormValues) => {
    setIsPending(true);

    try {
      // ✅ Appel direct Server Action (pas de fetch API)
      // La Server Action valide avec le schéma Server et convertit number → bigint
      const result = item
        ? await updateHeroSlideAction(String(item.id), data)
        : await createHeroSlideAction(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(item ? "Mis à jour" : "Créé");
      form.reset();
      onSuccess(); // ✅ Déclenche router.refresh() dans le parent
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* ... formulaire */}
    </Dialog>
  );
}
```

---

## 🔴 RÈGLE N°5 : DAL sans revalidatePath()

Le DAL ne fait QUE les opérations database. La revalidation est dans les Server Actions.

```typescript
// lib/dal/[feature].ts
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { FeatureInput, FeatureDTO } from "@/lib/schemas/[feature]";

// ❌ NE PAS importer revalidatePath ici
// import { revalidatePath } from "next/cache";

export interface DALResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createFeature(
  input: FeatureInput
): Promise<DALResult<FeatureDTO>> {
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("features")
    .insert(input)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // ❌ PAS DE revalidatePath() ICI
  return { success: true, data };
}

// Idem pour update, delete, etc.
```

---

## ⚠️ Erreurs courantes à éviter

### ❌ Erreur 1 : `revalidatePath()` dans le DAL

```typescript
// ❌ INCORRECT
// lib/dal/feature.ts
export async function createFeature(input) {
  const result = await supabase.from("features").insert(input);
  revalidatePath("/admin/features"); // ❌ Ne fonctionne pas depuis DAL via API Route
  return result;
}
```

### ❌ Erreur 2 : Pas de `useEffect` pour sync état/props

```typescript
// ❌ INCORRECT
export function View({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  // ❌ items ne sera JAMAIS mis à jour après router.refresh()
}

// ✅ CORRECT
export function View({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
}
```

### ❌ Erreur 3 : Fetch API pour l'édition

```typescript
// ❌ INCORRECT : Fetch qui peut échouer
const handleEdit = async (item) => {
  const response = await fetch(`/api/admin/features/${item.id}`);
  const data = await response.json();
  setEditingItem(data); // Peut être undefined si erreur
};

// ✅ CORRECT : Utiliser données déjà présentes
const handleEdit = (item) => {
  setEditingItem(item); // Données fraîches grâce au useEffect
};
```

### ❌ Erreur 4 : Utiliser `useActionState` avec Server Actions

```typescript
// ❌ INCORRECT : useActionState complique le code
const [state, action] = useActionState(createFeatureAction, null);

// ✅ CORRECT : Appel direct avec useState pour pending
const [isPending, setIsPending] = useState(false);
const result = await createFeatureAction(data);
```

### ❌ Erreur 5 : Type casting `as unknown as Resolver<>`

```typescript
// ❌ INCORRECT : Casting dangereux dû à bigint/number mismatch
const form = useForm<FeatureInput>({
  resolver: zodResolver(FeatureInputSchema) as unknown as Resolver<FeatureInput>,
});

// ✅ CORRECT : Utiliser un schéma UI séparé avec number
const form = useForm<FeatureFormValues>({
  resolver: zodResolver(FeatureFormSchema), // Pas de casting nécessaire
});
```

### ❌ Erreur 6 : Garder les API Routes après migration

Après migration vers Server Actions, **supprimer les API Routes obsolètes** :

```bash
# ❌ À supprimer si non utilisées ailleurs
app/api/admin/[feature]/route.ts       # GET/POST
app/api/admin/[feature]/[id]/route.ts  # PATCH/DELETE
```

Vérifier qu'aucun autre fichier n'importe ces routes avant suppression.

---

## ✅ Checklist d'implémentation

Pour chaque nouveau CRUD, vérifier :

### Page admin

- [ ] `export const dynamic = 'force-dynamic'`
- [ ] `export const revalidate = 0`

### Server Actions (`lib/actions/`)

- [ ] Directive `"use server"` + `import "server-only"`
- [ ] Validation Zod de l'input
- [ ] Appel DAL
- [ ] `revalidatePath()` sur succès
- [ ] Return type `ActionResult<T>`

### DAL (`lib/dal/`)

- [ ] Directive `"use server"` + `import "server-only"`
- [ ] `requireAdmin()` au début
- [ ] **PAS** de `revalidatePath()`
- [ ] Return type `DALResult<T>`

### Client Component View

- [ ] `useState(initialProps)` pour l'état local
- [ ] `useEffect(() => setState(props), [props])` pour sync
- [ ] Handlers appellent Server Actions directement
- [ ] `router.refresh()` après succès
- [ ] `handleEdit` utilise données locales (pas fetch)

### Client Component Form
- [ ] `useState(false)` pour isPending
- [ ] Appel direct `createAction()` ou `updateAction()`
- [ ] `onSuccess()` callback pour refresh parent
- [ ] `form.reset()` après succès
- [ ] Utilise schéma UI (`FeatureFormSchema`) — pas schéma Server
- [ ] Pas de type casting `as unknown as Resolver<>`
- [ ] Fichier < 300 lignes (sinon splitter en sous-composants)

### Schémas Zod (`lib/schemas/`)
- [ ] Schéma Server avec `z.coerce.bigint()` pour IDs
- [ ] Schéma UI avec `z.number().int().positive()` pour IDs
- [ ] Types exportés : `FeatureInput`, `FeatureFormValues`, `FeatureDTO`

### Nettoyage
- [ ] Supprimer les API Routes obsolètes après migration

---

## 📚 Références

- [Next.js - revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js - Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React - Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- Documentation interne : `doc/fix-rerender-homeHeroSlide.md`

---

## 📝 Historique des modifications

| Version | Date | Changements |
|---------|------|-------------|
| 1.1 | 2025-11-27 | Ajout règle schémas UI séparés (bigint→number), règle split composants (<300 lignes), erreurs 5-6, checklist étendue |
| 1.0 | 2025-11 | Version initiale |
