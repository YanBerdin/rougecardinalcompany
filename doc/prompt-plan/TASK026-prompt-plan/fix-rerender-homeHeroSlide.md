# 🔥 Fix HeroSlides Re-render - Post-mortem et Solution

> **Date** : 26 novembre 2025  
> **Statut** : ✅ Résolu  
> **Branche** : `feature/backoffice`

---

## 📋 Résumé du problème

Le CRUD Hero Slides ne re-rendait pas la liste après les opérations CREATE, UPDATE, DELETE et REORDER. Les données étaient bien persistées en base de données mais l'interface restait figée.

---

## 🔍 Problèmes identifiés (3 bugs distincts)

### Bug 1 : Architecture `fetch()` vs Server Actions

**Symptôme** : `revalidatePath()` appelé depuis le DAL via API Routes ne déclenche pas de re-render immédiat.

**Cause racine** : D'après la documentation Next.js :

- **Server Action** : `revalidatePath()` → Re-render **immédiat**
- **API Route** : `revalidatePath()` → Re-render au **prochain visit** (navigation)

```bash
# ❌ Architecture incorrecte (avant)
Client Component
  → fetch() API Route (/api/admin/home/hero)
    → API Route appelle DAL
      → DAL appelle revalidatePath()
        ❌ Pas de re-render immédiat

# ✅ Architecture correcte (après)
Client Component
  → Server Action directe
    → Server Action appelle revalidatePath()
    → router.refresh()
      ✅ Re-render immédiat
```

---

### Bug 2 : État local non synchronisé avec les props

**Symptôme** : Même avec `router.refresh()`, la liste ne se mettait pas à jour.

**Cause racine** : Le composant `HeroSlidesView` utilisait :

```typescript
const [slides, setSlides] = useState(initialSlides);
```

`useState(initialSlides)` initialise l'état **une seule fois** au montage. Quand `router.refresh()` provoque un re-render du Server Component parent avec de nouvelles données, le Client Component garde son ancien état local.

**Solution** : Ajouter un `useEffect` pour synchroniser l'état avec les props :

```typescript
// ✅ Sync local state when props change (after router.refresh())
useEffect(() => {
    setSlides(initialSlides);
}, [initialSlides]);
```

---

### Bug 3 : Formulaire d'édition vide

**Symptôme** : Le formulaire d'édition s'ouvrait mais ne contenait pas les données du slide sélectionné.

**Cause racine** : `handleEdit` faisait un `fetch()` vers l'API `/api/admin/home/hero/[id]` pour récupérer les données fraîches, mais cette requête pouvait échouer silencieusement.

**Solution** : Utiliser directement les données du slide depuis l'état local (déjà fraîches grâce au sync avec le Server Component) :

```typescript
// ❌ Avant : fetch API qui pouvait échouer
const handleEdit = useCallback(async (slide: HeroSlideDTO) => {
    const response = await fetch(`/api/admin/home/hero/${slide.id}`);
    // ... erreur potentielle
}, []);

// ✅ Après : utilisation directe des données locales
const handleEdit = useCallback((slide: HeroSlideDTO) => {
    setEditingSlide(slide);
    setIsFormOpen(true);
}, []);
```

---

## ✅ Solution appliquée

### Étape 1 : Configuration page admin

**app/(admin)/admin/home/hero/page.tsx** :

```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### Étape 2 : Création des Server Actions

**lib/actions/home-hero-actions.ts** :

```typescript
"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { HeroSlideInputSchema, ReorderInputSchema } from "@/lib/schemas/home-content";
import { createHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlides } from "@/lib/dal/admin-home-hero";

export type ActionResult<T = unknown> = 
  | { success: true; data?: T } 
  | { success: false; error: string };

export async function createHeroSlideAction(input: unknown): Promise<ActionResult> {
  try {
    const validated = HeroSlideInputSchema.parse(input);
    const result = await createHeroSlide(validated);
    
    if (!result.success) return { success: false, error: result.error ?? "create failed" };
    
    revalidatePath("/admin/home/hero");
    revalidatePath("/");
    
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Idem pour updateHeroSlideAction, deleteHeroSlideAction, reorderHeroSlidesAction
```

### Étape 3 : Suppression de revalidatePath() du DAL

**lib/dal/admin-home-hero.ts** : Retirer tous les appels `revalidatePath()` - la revalidation se fait maintenant dans les Server Actions.

### Étape 4 : Synchronisation état/props dans le Client Component

**components/features/admin/home/HeroSlidesView.tsx** :

```typescript
import { useState, useCallback, useEffect } from "react";

export function HeroSlidesView({ initialSlides }: HeroSlidesViewProps) {
    const router = useRouter();
    const [slides, setSlides] = useState(initialSlides);

    // ✅ Sync local state when props change (after router.refresh())
    useEffect(() => {
        setSlides(initialSlides);
    }, [initialSlides]);

    // ✅ Appel direct des Server Actions (pas de fetch API)
    const handleDelete = useCallback(async (id: bigint) => {
        const result = await deleteHeroSlideAction(String(id));
        if (!result.success) throw new Error(result.error);
        toast.success("Slide deleted");
        router.refresh();
    }, [router]);

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        setEditingSlide(null);
        router.refresh();
    }, [router]);

    // ✅ Utilisation directe des données locales pour l'édition
    const handleEdit = useCallback((slide: HeroSlideDTO) => {
        setEditingSlide(slide);
        setIsFormOpen(true);
    }, []);
}
```

### Étape 5 : Appel direct des Server Actions dans le formulaire

**components/features/admin/home/HeroSlideForm.tsx** :

```typescript
import { createHeroSlideAction, updateHeroSlideAction } from "@/lib/actions/home-hero-actions";

const onSubmit = async (data: HeroSlideFormValues) => {
    const payload = { ...data };
    
    if (slide) {
        const result = await updateHeroSlideAction(String(slide.id), payload);
        if (!result.success) throw new Error(result.error);
        toast.success("Slide updated");
    } else {
        const result = await createHeroSlideAction(payload);
        if (!result.success) throw new Error(result.error);
        toast.success("Slide created");
    }
    
    await onSuccess();
    form.reset();
};
```

---

## 📊 Résumé des fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `app/(admin)/admin/home/hero/page.tsx` | Ajout `dynamic = 'force-dynamic'` et `revalidate = 0` |
| `lib/actions/home-hero-actions.ts` | **Nouveau** - Server Actions avec `revalidatePath()` |
| `lib/dal/admin-home-hero.ts` | Suppression des appels `revalidatePath()` |
| `components/features/admin/home/HeroSlidesView.tsx` | Ajout `useEffect` pour sync état/props + appel Server Actions |
| `components/features/admin/home/HeroSlideForm.tsx` | Appel direct Server Actions au lieu de fetch API |

---

## 🎯 Leçons apprises

1. **Server Actions vs API Routes** : Pour les mutations qui nécessitent un re-render immédiat, utiliser des Server Actions directement, pas des `fetch()` vers des API Routes.

2. **Synchronisation état/props** : Quand un Client Component utilise `useState(prop)`, ajouter un `useEffect` pour synchroniser l'état quand les props changent après un `router.refresh()`.

3. **Simplicité** : Utiliser les données déjà disponibles localement plutôt que de faire des fetch supplémentaires qui peuvent échouer.

---

## 📚 Références

- [Next.js - revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js - Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React - Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
