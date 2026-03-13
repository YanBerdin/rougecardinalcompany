# 🎯 Plan : 2 CTA avec Toggles Indépendants

Solution complète avec **toggles indépendants** pour chaque CTA, en respectant strictement vos instructions de schéma déclaratif et de migration.

**Instructions de référence** :

- `.github/instructions/Declarative_Database_Schema.instructions.md`
- `.github/instructions/Create_migration.instructions.md`
- `supabase/reconstruction_database_plan/RECONSTRUCTION_PLAN.md`

---

## ⚠️ Workflow obligatoire (Schéma Déclaratif)

> **IMPORTANT** : Ne jamais écrire la migration manuellement. Suivre cet ordre :

```bash
# 1. Modifier le schéma déclaratif EN PREMIER
#    supabase/schemas/07d_table_home_hero.sql

# 2. Arrêter Supabase local
pnpm dlx supabase stop

# 3. Générer la migration automatiquement
pnpm dlx supabase db diff -f refactor_hero_slides_cta_with_toggles

# 4. Ajouter la DATA MIGRATION à la migration générée
#    (UPDATE des données existantes - voir section 2️⃣)

# 5. Tester en local
pnpm dlx supabase db reset

# 6. Pousser vers le cloud (quand prêt)
pnpm dlx supabase db push
```

---

## 📁 Fichiers à Créer/Modifier

### 1️⃣ **Schéma Déclaratif** : Mise à Jour

**Fichier** : `supabase/schemas/07d_table_home_hero.sql`

```sql
-- Table des slides Hero de la page d'accueil
-- Ordre: 07d - après 07c (sections présentation)
-- Représente les entrées HeroSlide[] (title, subtitle, description, image, cta primaire + secondaire)

drop table if exists public.home_hero_slides cascade;
create table public.home_hero_slides (
  id bigint generated always as identity primary key,
  slug text not null unique, -- identifiant stable (ex: saison-2025, creation-phare)
  title text not null,
  subtitle text,
  description text,
  image_url text, -- fallback externe
  image_media_id bigint null references public.medias(id) on delete set null, -- media prioritaire
  alt_text text not null default '', -- texte alternatif pour l'accessibilité (max 125 caractères)
  
  -- CTA Primaire (bouton principal - style plein)
  cta_primary_enabled boolean not null default false,
  cta_primary_label text,
  cta_primary_url text,
  
  -- CTA Secondaire (bouton secondaire - style outline)
  cta_secondary_enabled boolean not null default false,
  cta_secondary_label text,
  cta_secondary_url text,
  
  position smallint not null default 0,
  active boolean not null default true,
  starts_at timestamptz, -- fenêtre d'activation planifiée (optionnel)
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.home_hero_slides is 'Slides hero page d''accueil (carousel) avec CTA primaire/secondaire et planification optionnelle.';
comment on column public.home_hero_slides.slug is 'Identifiant stable pour ciblage et tracking.';
comment on column public.home_hero_slides.image_media_id is 'Référence media interne (prioritaire sur image_url).';
comment on column public.home_hero_slides.alt_text is 'Texte alternatif pour l''image (accessibilité, max 125 caractères).';
comment on column public.home_hero_slides.cta_primary_enabled is 'Activer/désactiver le CTA primaire (bouton plein).';
comment on column public.home_hero_slides.cta_primary_label is 'Label du bouton CTA primaire (max 50 caractères).';
comment on column public.home_hero_slides.cta_primary_url is 'URL du bouton CTA primaire.';
comment on column public.home_hero_slides.cta_secondary_enabled is 'Activer/désactiver le CTA secondaire (bouton outline).';
comment on column public.home_hero_slides.cta_secondary_label is 'Label du bouton CTA secondaire (max 50 caractères).';
comment on column public.home_hero_slides.cta_secondary_url is 'URL du bouton CTA secondaire.';
comment on column public.home_hero_slides.starts_at is 'Date/heure de début d''affichage (NULL = immédiat).';
comment on column public.home_hero_slides.ends_at is 'Date/heure de fin d''affichage (NULL = illimité).';

-- Contraintes de validation
alter table public.home_hero_slides
  add constraint home_hero_slides_alt_text_length 
    check (char_length(alt_text) <= 125),
  
  add constraint home_hero_slides_cta_primary_label_length 
    check (cta_primary_label is null or char_length(cta_primary_label) <= 50),
  
  add constraint home_hero_slides_cta_secondary_label_length 
    check (cta_secondary_label is null or char_length(cta_secondary_label) <= 50),
  
  -- CTA Primaire : si activé, label ET url requis
  add constraint home_hero_slides_cta_primary_consistency 
    check (
      (cta_primary_enabled = false) 
      or 
      (cta_primary_enabled = true and cta_primary_label is not null and cta_primary_url is not null)
    ),
  
  -- CTA Secondaire : si activé, label ET url requis
  add constraint home_hero_slides_cta_secondary_consistency 
    check (
      (cta_secondary_enabled = false) 
      or 
      (cta_secondary_enabled = true and cta_secondary_label is not null and cta_secondary_url is not null)
    );

-- Index
create index if not exists idx_home_hero_slides_active_order 
  on public.home_hero_slides(active, position) 
  where active = true;

create index if not exists idx_home_hero_slides_schedule 
  on public.home_hero_slides(starts_at, ends_at) 
  where active = true;

-- RLS
alter table public.home_hero_slides enable row level security;

-- Lecture publique (slides actifs + fenêtre valide)
drop policy if exists "Home hero slides are viewable by everyone" on public.home_hero_slides;
create policy "Home hero slides are viewable by everyone"
  on public.home_hero_slides for select
  to anon, authenticated
  using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

-- Admins can view all slides (including inactive)
drop policy if exists "Admins can view all home hero slides" on public.home_hero_slides;
create policy "Admins can view all home hero slides"
  on public.home_hero_slides for select
  to authenticated
  using ((select public.is_admin()));

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert home hero slides" on public.home_hero_slides;
create policy "Admins can insert home hero slides"
  on public.home_hero_slides for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update home hero slides" on public.home_hero_slides;
create policy "Admins can update home hero slides"
  on public.home_hero_slides for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete home hero slides" on public.home_hero_slides;
create policy "Admins can delete home hero slides"
  on public.home_hero_slides for delete
  to authenticated
  using ((select public.is_admin()));
```

---

### 2️⃣ **DATA MIGRATION** : À ajouter à la migration générée

> **Note** : La migration DDL (structure) sera générée par `supabase db diff`.
> Cette section contient uniquement les instructions **DATA MIGRATION** à ajouter manuellement.

**Données sources** : `supabase/migrations/20250918031500_seed_home_hero_slides.sql`

- 2 slides avec `cta_label` et `cta_url` existants

**Ajouter à la fin de la migration générée** :

```sql
-- ============================================================================
-- DATA MIGRATION : Migrer les anciennes données CTA
-- Source: 20250918031500_seed_home_hero_slides.sql (2 slides avec cta_label/cta_url)
-- ============================================================================

-- Migrer cta_label/cta_url → cta_primary_* pour les slides existants
update public.home_hero_slides
set 
  cta_primary_enabled = true,
  cta_primary_label = 'Voir la programmation',
  cta_primary_url = '/spectacles'
where slug = 'saison-2025';

update public.home_hero_slides
set 
  cta_primary_enabled = true,
  cta_primary_label = 'Découvrir le spectacle',
  cta_primary_url = '/spectacles'
where slug = 'creation-phare';

-- Ajouter CTA secondaire par défaut pour les slides actifs
update public.home_hero_slides
set 
  cta_secondary_enabled = true,
  cta_secondary_label = 'Réserver des billets',
  cta_secondary_url = '/agenda'
where slug = 'saison-2025';

update public.home_hero_slides
set 
  cta_secondary_enabled = true,
  cta_secondary_label = 'Voir tous nos spectacles',
  cta_secondary_url = '/spectacles'
where slug = 'creation-phare';
```

> **Pourquoi des UPDATE explicites ?**
>
> - Le schéma déclaratif avec `DROP TABLE ... CASCADE` + `CREATE TABLE` recrée la table vide
> - Le seed original (`20250918031500`) utilise les anciennes colonnes `cta_label/cta_url`
> - Ces UPDATE restaurent les données avec les nouvelles colonnes après la recréation

---

### 3️⃣ ~~**Seed**~~ ❌ NE PAS MODIFIER

> **⚠️ IMPORTANT** : Le fichier `supabase/migrations/20250918031500_seed_home_hero_slides.sql` est une **migration déjà appliquée**.
>
> **Ne jamais modifier les migrations appliquées.**
>
> La mise à jour des données existantes est gérée dans la section 2️⃣ (migration générée) via les instructions `UPDATE`.

---

### 4️⃣ **Schemas Zod** : Mise à Jour Complète

**Fichier** : `lib/schemas/home-content.ts`

```typescript
import { z } from "zod";

// =============================================================================
// SERVER SCHEMAS (with bigint for database operations)
// =============================================================================

// Hero Slide Input Schema
export const HeroSlideInputSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    slug: z.string().max(100, "Slug max 100 characters").optional(),
    subtitle: z.string().max(150, "Subtitle max 150 characters").optional(),
    description: z.string().max(500, "Description max 500 characters").optional(),
    
    // Image
    image_url: z.preprocess((val) => {
        if (typeof val === "string") {
            const t = val.trim();
            return t === "" ? undefined : t;
        }
        return val;
    }, z.string().url("Invalid URL format").optional()),
    image_media_id: z.coerce.bigint().optional(),
    alt_text: z.string().min(1, "Alt text required for accessibility").max(125, "Alt text max 125 characters"),
    
    // CTA Primaire
    cta_primary_enabled: z.boolean().optional(),
    cta_primary_label: z.preprocess((val) => {
        if (typeof val === "string") {
            const t = val.trim();
            return t === "" ? undefined : t;
        }
        return val;
    }, z.string().max(50, "Primary CTA label max 50 characters").optional()),
    cta_primary_url: z.preprocess((val) => {
        if (typeof val === "string") {
            const t = val.trim();
            return t === "" ? undefined : t;
        }
        return val;
    }, z.string().refine(
        (val) => !val || val.startsWith('/') || /^https?:\/\//.test(val),
        { message: "URL must be relative (/path) or absolute (https://...)" }
    ).optional()),
    
    // CTA Secondaire
    cta_secondary_enabled: z.boolean().optional(),
    cta_secondary_label: z.preprocess((val) => {
        if (typeof val === "string") {
            const t = val.trim();
            return t === "" ? undefined : t;
        }
        return val;
    }, z.string().max(50, "Secondary CTA label max 50 characters").optional()),
    cta_secondary_url: z.preprocess((val) => {
        if (typeof val === "string") {
            const t = val.trim();
            return t === "" ? undefined : t;
        }
        return val;
    }, z.string().refine(
        (val) => !val || val.startsWith('/') || /^https?:\/\//.test(val),
        { message: "URL must be relative (/path) or absolute (https://...)" }
    ).optional()),
    
    active: z.boolean().optional(),
    position: z.number().int().min(0, "Position must be non-negative").optional(),
}).refine(
    (data) => data.image_media_id !== undefined || (typeof data.image_url === 'string' && data.image_url.trim().length > 0),
    { message: "An image is required (media ID or URL)", path: ["image_url"] }
).refine(
    // CTA Primaire : si enabled=true, label ET url requis
    (data) => {
        if (data.cta_primary_enabled === true) {
            const hasLabel = typeof data.cta_primary_label === 'string' && data.cta_primary_label.trim().length > 0;
            const hasUrl = typeof data.cta_primary_url === 'string' && data.cta_primary_url.trim().length > 0;
            return hasLabel && hasUrl;
        }
        return true;
    },
    { message: "Primary CTA requires both label and URL when enabled", path: ["cta_primary_label"] }
).refine(
    // CTA Secondaire : si enabled=true, label ET url requis
    (data) => {
        if (data.cta_secondary_enabled === true) {
            const hasLabel = typeof data.cta_secondary_label === 'string' && data.cta_secondary_label.trim().length > 0;
            const hasUrl = typeof data.cta_secondary_url === 'string' && data.cta_secondary_url.trim().length > 0;
            return hasLabel && hasUrl;
        }
        return true;
    },
    { message: "Secondary CTA requires both label and URL when enabled", path: ["cta_secondary_label"] }
);

export type HeroSlideInput = z.infer<typeof HeroSlideInputSchema>;

// About Content Input Schema (inchangé)
export const AboutContentInputSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    intro1: z.string().min(1, "First intro paragraph required").max(1000, "Intro 1 max 1000 characters"),
    intro2: z.string().min(1, "Second intro paragraph required").max(1000, "Intro 2 max 1000 characters"),
    mission_title: z.string().min(1, "Mission title required").max(80, "Mission title max 80 characters"),
    mission_text: z.string().min(1, "Mission text required").max(4000, "Mission text max 4000 characters"),
    image_url: z.string().url("Invalid URL format").optional(),
    image_media_id: z.coerce.bigint().optional(),
    alt_text: z.string().max(125, "Alt text max 125 characters").optional(),
});

export type AboutContentInput = z.infer<typeof AboutContentInputSchema>;

// Reorder Input Schema (inchangé)
export const ReorderInputSchema = z.array(
    z.object({
        id: z.coerce.bigint(),
        position: z.number().int().min(0),
    })
);

export type ReorderInput = z.infer<typeof ReorderInputSchema>;

// DTO Types for API responses
export interface HeroSlideDTO {
    id: bigint;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    image_url: string | null;
    image_media_id: bigint | null;
    alt_text: string;
    cta_primary_enabled: boolean;
    cta_primary_label: string | null;
    cta_primary_url: string | null;
    cta_secondary_enabled: boolean;
    cta_secondary_label: string | null;
    cta_secondary_url: string | null;
    active: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface AboutContentDTO {
    id: bigint;
    title: string;
    intro1: string;
    intro2: string;
    mission_title: string;
    mission_text: string;
    image_url: string | null;
    image_media_id: bigint | null;
    alt_text: string | null;
    position: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

// =============================================================================
// UI FORM SCHEMAS (with number for JSON serialization compatibility)
// =============================================================================

export const HeroSlideFormSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    slug: z.string().max(100, "Slug max 100 characters").optional(),
    subtitle: z.string().max(150, "Subtitle max 150 characters").optional(),
    description: z.string().max(500, "Description max 500 characters").optional(),
    
    // Image
    image_url: z.string().url("Invalid URL format").optional().or(z.literal("")),
    image_media_id: z.number().int().positive().optional(),
    alt_text: z.string().min(1, "Alt text required for accessibility").max(125, "Alt text max 125 characters"),
    
    // CTA Primaire
    cta_primary_enabled: z.boolean().optional(),
    cta_primary_label: z.string().max(50, "Primary CTA label max 50 characters").optional().or(z.literal("")),
    cta_primary_url: z.string().refine(
        (val) => !val || val.startsWith('/') || /^https?:\/\//.test(val),
        { message: "URL must be relative (/path) or absolute (https://...)" }
    ).optional().or(z.literal("")),
    
    // CTA Secondaire
    cta_secondary_enabled: z.boolean().optional(),
    cta_secondary_label: z.string().max(50, "Secondary CTA label max 50 characters").optional().or(z.literal("")),
    cta_secondary_url: z.string().refine(
        (val) => !val || val.startsWith('/') || /^https?:\/\//.test(val),
        { message: "URL must be relative (/path) or absolute (https://...)" }
    ).optional().or(z.literal("")),
    
    active: z.boolean().optional(),
    position: z.number().int().min(0, "Position must be non-negative").optional(),
}).refine(
    (data) => data.image_media_id !== undefined || (typeof data.image_url === 'string' && data.image_url.trim().length > 0),
    { message: "An image is required (media ID or URL)", path: ["image_url"] }
).refine(
    // CTA Primaire : si enabled=true, label ET url requis
    (data) => {
        if (data.cta_primary_enabled === true) {
            const hasLabel = typeof data.cta_primary_label === 'string' && data.cta_primary_label.trim().length > 0;
            const hasUrl = typeof data.cta_primary_url === 'string' && data.cta_primary_url.trim().length > 0;
            return hasLabel && hasUrl;
        }
        return true;
    },
    { message: "Primary CTA requires both label and URL when enabled", path: ["cta_primary_label"] }
).refine(
    // CTA Secondaire : si enabled=true, label ET url requis
    (data) => {
        if (data.cta_secondary_enabled === true) {
            const hasLabel = typeof data.cta_secondary_label === 'string' && data.cta_secondary_label.trim().length > 0;
            const hasUrl = typeof data.cta_secondary_url === 'string' && data.cta_secondary_url.trim().length > 0;
            return hasLabel && hasUrl;
        }
        return true;
    },
    { message: "Secondary CTA requires both label and URL when enabled", path: ["cta_secondary_label"] }
);

export type HeroSlideFormValues = z.infer<typeof HeroSlideFormSchema>;

export const AboutContentFormSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    intro1: z.string().min(1, "First intro paragraph required").max(1000, "Intro 1 max 1000 characters"),
    intro2: z.string().min(1, "Second intro paragraph required").max(1000, "Intro 2 max 1000 characters"),
    mission_title: z.string().min(1, "Mission title required").max(80, "Mission title max 80 characters"),
    mission_text: z.string().min(1, "Mission text required").max(4000, "Mission text max 4000 characters"),
    image_url: z.string().url("Invalid URL format").optional(),
    image_media_id: z.number().int().positive().optional(),
    alt_text: z.string().max(125, "Alt text max 125 characters").optional(),
});

export type AboutContentFormValues = z.infer<typeof AboutContentFormSchema>;
```

---

### 5️⃣ **Formulaire Admin** : Toggles Indépendants

**Fichier** : `components/features/admin/home/HeroSlideFormFields.tsx`

```typescript
"use client";

import { UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { HeroSlideFormValues } from "@/lib/schemas/home-content";

interface HeroSlideFormFieldsProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideFormFields({ form }: HeroSlideFormFieldsProps) {
    const watchSubtitle = form.watch("subtitle") ?? "";
    const watchDescription = form.watch("description") ?? "";

    return (
        <>
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                            <Input {...field} maxLength={80} placeholder="Main headline" />
                        </FormControl>
                        <FormDescription>
                            {field.value.length}/80 characters
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                            <Input {...field} maxLength={150} placeholder="Supporting text" />
                        </FormControl>
                        <FormDescription>
                            {watchSubtitle.length}/150 characters
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} maxLength={500} rows={3} />
                        </FormControl>
                        <FormDescription>
                            {watchDescription.length}/500 characters
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}

interface HeroSlideCtaFieldsProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideCtaFields({ form }: HeroSlideCtaFieldsProps) {
    const primaryEnabled = form.watch("cta_primary_enabled");
    const secondaryEnabled = form.watch("cta_secondary_enabled");

    return (
        <div className="space-y-6">
            {/* ========== CTA PRIMAIRE ========== */}
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="cta_primary_enabled"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-primary/5">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base font-semibold">
                                    🎯 Call-to-Action Principal
                                </FormLabel>
                                <div className="text-sm text-muted-foreground">
                                    Bouton d'action primaire avec style plein (ex: Réserver des billets)
                                </div>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {primaryEnabled && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary">
                        <FormField
                            control={form.control}
                            name="cta_primary_label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label CTA Principal *</FormLabel>
                                    <FormControl>
                                        <Input {...field} maxLength={50} placeholder="Réserver des billets" />
                                    </FormControl>
                                    <FormDescription>
                                        {(field.value || "").length}/50 caractères
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cta_primary_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL CTA Principal *</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="url" placeholder="/agenda" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </div>

            {/* ========== CTA SECONDAIRE ========== */}
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="cta_secondary_enabled"
                    render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-secondary/5">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-semibold">
                                        🔗 Call-to-Action Secondaire
                                    </FormLabel>
                                    <div className="text-sm text-muted-foreground">
                                        Bouton d'action secondaire avec style outline (ex: Voir tous nos spectacles)
                                    </div>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                            )}

                {secondaryEnabled && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-secondary">
                        <FormField
                            control={form.control}
                            name="cta_secondary_label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label CTA Secondaire *</FormLabel>
                                    <FormControl>
                                        <Input {...field} maxLength={50} placeholder="Voir tous nos spectacles" />
                                    </FormControl>
                                    <FormDescription>
                                        {(field.value || "").length}/50 caractères
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cta_secondary_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL CTA Secondaire *</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="url" placeholder="/spectacles" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

interface HeroSlideActiveToggleProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideActiveToggle({ form }: HeroSlideActiveToggleProps) {
    return (
        <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">
                            Display this slide on the homepage
                        </div>
                    </div>
                    <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
```

---

### 6️⃣ **Mise à Jour HeroSlideForm** (useEffect)

**Fichier** : `components/features/admin/home/HeroSlideForm.tsx`

```typescript
// Dans useEffect, gérer les valeurs par défaut des toggles
useEffect(() => {
  if (open && slide) {
    console.log('[HeroSlideForm] Resetting form with slide ID:', String(slide.id));
    
    form.reset({
      title: slide.title,
      slug: slide.slug,
      subtitle: slide.subtitle ?? "",
      description: slide.description ?? "",
      image_url: slide.image_url ?? "",
      image_media_id: slide.image_media_id !== null ? Number(slide.image_media_id) : undefined,
      alt_text: slide.alt_text,
      
      // CTA Primaire
      cta_primary_enabled: slide.cta_primary_enabled,
      cta_primary_label: slide.cta_primary_label ?? "",
      cta_primary_url: slide.cta_primary_url ?? "",
      
      // CTA Secondaire
      cta_secondary_enabled: slide.cta_secondary_enabled,
      cta_secondary_label: slide.cta_secondary_label ?? "",
      cta_secondary_url: slide.cta_secondary_url ?? "",
      
      active: slide.active,
      position: slide.position,
    });
  } else if (open && !slide) {
    console.log('[HeroSlideForm] Resetting form for new slide');
    form.reset({
      title: "",
      slug: "",
      subtitle: "",
      description: "",
      image_url: "",
      image_media_id: undefined,
      alt_text: "",
      
      // CTA Primaire : désactivé par défaut
      cta_primary_enabled: false,
      cta_primary_label: "",
      cta_primary_url: "",
      
      // CTA Secondaire : activé par défaut avec valeurs
      cta_secondary_enabled: true,
      cta_secondary_label: "Voir tous nos spectacles",
      cta_secondary_url: "/spectacles",
      
      active: true,
      position: undefined,
    });
  }
}, [open, slide, form]);
```

---

### 7️⃣ **Frontend Public** : Affichage Conditionnel

**Fichier** : `components/features/public-site/home/hero/HeroView.tsx`

```typescript
export function HeroView({ slides }: HeroViewProps) {
  return (
    <Carousel /* ... */>
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative h-[600px] md:h-screen">
              {/* Image de fond */}
              {slide.image_url && (
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
              
              {/* Contenu */}
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4 max-w-4xl text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  
                  {slide.subtitle && (
                    <p className="text-xl md:text-2xl mb-2 text-gray-200">
                      {slide.subtitle}
                    </p>
                  )}
                  
                  {slide.description && (
                    <p className="text-lg md:text-xl mb-8 text-gray-300">
                      {slide.description}
                    </p>
                  )}
                  
                  {/* CTA Buttons - Affichage Conditionnel */}
                  <div className="flex flex-wrap gap-4">
                    {/* CTA Principal (bouton plein) */}
                    {slide.cta_primary_enabled && slide.cta_primary_label && slide.cta_primary_url && (
                      <Link
                        href={slide.cta_primary_url}
                        className="px-8 py-3 bg-white text-red-600 rounded-full hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {slide.cta_primary_label}
                      </Link>
                    )}
                    
                    {/* CTA Secondaire (bouton outline) */}
                    {slide.cta_secondary_enabled && slide.cta_secondary_label && slide.cta_secondary_url && (
                      <Link
                        href={slide.cta_secondary_url}
                        className="px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-red-600 transition-all duration-300"
                      >
                        {slide.cta_secondary_label} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Carousel controls */}
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
```

---

### 8️⃣ **Types Frontend** : Mise à Jour

**Fichier** : `components/features/public-site/home/hero/types.ts`

```typescript
import { z } from "zod";

export const HeroSlideSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  
  // CTA Primaire
  cta_primary_enabled: z.boolean(),
  cta_primary_label: z.string().nullable(),
  cta_primary_url: z.string().nullable(),
  
  // CTA Secondaire
  cta_secondary_enabled: z.boolean(),
  cta_secondary_label: z.string().nullable(),
  cta_secondary_url: z.string().nullable(),
  
  position: z.number(),
});

export type HeroSlide = z.infer<typeof HeroSlideSchema>;
```

---

## 📋 Checklist d'Application

### Avant la migration (Workflow Déclaratif)

```bash
# 1. Modifier le schéma déclaratif
#    Éditer: supabase/schemas/07d_table_home_hero.sql

# 2. Arrêter Supabase local
pnpm dlx supabase stop

# 3. Générer la migration automatiquement
pnpm dlx supabase db diff -f refactor_hero_slides_cta_with_toggles

# 4. Ajouter la DATA MIGRATION (UPDATE) à la migration générée
#    Voir section 2️⃣ pour les instructions UPDATE
```

### Test et déploiement

```bash
# 5. Tester en local
pnpm dlx supabase db reset

# 6. Vérifier les données migrées
psql $DATABASE_URL -c "SELECT slug, cta_primary_enabled, cta_primary_label, cta_secondary_enabled, cta_secondary_label FROM home_hero_slides;"

# 7. Mettre à jour les fichiers TypeScript
# - lib/schemas/home-content.ts
# - components/features/admin/home/HeroSlideFormFields.tsx
# - components/features/admin/home/HeroSlideForm.tsx (intégrer les sous-composants)
# - components/features/public-site/home/hero/HeroView.tsx
# - components/features/public-site/home/hero/types.ts

# 8. Tester l'application
pnpm dev

# 9. Tester admin
# - Créer nouveau slide avec 2 CTA
# - Désactiver CTA primaire
# - Désactiver CTA secondaire
# - Vérifier validations

# 10. Tester frontend
# - Vérifier affichage avec 2 CTA
# - Vérifier affichage avec 1 CTA
# - Vérifier affichage sans CTA

# 11. Pousser vers le cloud (quand prêt)
pnpm dlx supabase db push
```

### Documentation post-migration

- [ ] Ajouter entrée dans `supabase/migrations/migrations.md` :

  ```markdown
  - `YYYYMMDDHHMMSS_refactor_hero_slides_cta_with_toggles.sql` — Refactoring CTA avec toggles indépendants
    - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/07d_table_home_hero.sql`
  ```

### ⚠️ NE PAS FAIRE

- ❌ Ne pas modifier les seeds existants (migrations appliquées)
- ❌ Ne pas écrire la migration manuellement (utiliser `db diff`)
- ❌ Ne pas oublier la DATA MIGRATION pour les données existantes

---

## ✅ Points Clés de Conformité

| Instruction | Respect | Détail |
|-------------|---------|--------|
| **Schéma Déclaratif** | ✅ | `07d_table_home_hero.sql` modifié EN PREMIER |
| **Migration Générée** | ✅ | Via `supabase db diff` (pas manuelle) |
| **Contraintes CHECK** | ✅ | `cta_*_consistency` garantit cohérence enabled/label/url |
| **Commentaires SQL** | ✅ | COMMENT ON COLUMN pour chaque champ CTA |
| **Migrations Appliquées** | ✅ | Seeds existants NON modifiés |
| **Validation Zod URL** | ✅ | Accepte `/path` ET `https://...` |
| **Types TypeScript** | ✅ | Schemas séparés Server (bigint) / UI (number) |

---

## 🔄 Rollback (si nécessaire)

En cas de problème, générer la migration inverse :

```bash
# 1. Restaurer le schéma déclaratif précédent
git checkout HEAD~1 -- supabase/schemas/07d_table_home_hero.sql

# 2. Générer la migration de rollback
pnpm dlx supabase stop
pnpm dlx supabase db diff -f rollback_hero_slides_cta

# 3. Appliquer
pnpm dlx supabase db reset
```

---

Cette solution vous donne **2 CTA complètement indépendants et configurables** ! 🚀
