# Plan d'Implémentation - TASK030: Display Toggles

## 📋 Vue d'Ensemble

**Objectif**: Implémenter un système de toggles pour contrôler l'affichage dynamique des sections (newsletter, partenaires, featured content) avec interface admin et effet immédiat.

**Complexité**: Moyenne  
**Durée Estimée**: 4-6 heures  
**Priorité**: Moyenne

---

## 🎯 Objectifs Détaillés

### Fonctionnalités Principales

1. **Backend**:
   - Système de configuration flexible en base de données
   - DAL pour lecture/écriture rapide
   - Validation des toggles
   - Audit trail des modifications

2. **Admin UI**:
   - Interface intuitive avec switches shadcn/ui
   - Organisation par page/section
   - Confirmations pour actions critiques
   - Feedback visuel immédiat

3. **Frontend Public**:
   - Gating côté serveur (Server Components)
   - Fallback gracieux si section désactivée
   - Zero impact performance

---

## 🗄️ Architecture Base de Données

### Schéma Existant

La table `configurations_site` existe déjà dans `10_tables_system.sql`:

```sql
create table public.configurations_site (
  id bigint generated always as identity primary key,
  key text not null unique,
  value jsonb not null,
  description text,
  category text,
  updated_at timestamptz default now() not null,
  updated_by uuid references auth.users(id)
);
```

> **Note Sécurité** : Toutes les vues créées pour ce système doivent utiliser `WITH (security_invoker = true)` conformément au guide `.github/prompts/plan-fixRlsBaseTablesAdminViewsSecurity/database-view-security-guide.md` (décembre 2025).

### Toggles à Implémenter

> ⚠️ **Note**: Les clés `public:home:*` existent déjà dans le seed. Seules les clés `public:compagnie:*` sont à créer.

| Key | Description | Default | Status |
|-----|-------------|---------|--------|
| `public:home:newsletter` | Newsletter sur homepage | `{"enabled": true, "double_optin": true}` | ✅ Existe |
| `public:home:partners` | Partenaires sur homepage | `{"enabled": true, "show_inactive": false}` | ✅ Existe |
| `public:home:spectacles` | Spectacles à la une | `{"enabled": true, "max_items": 6}` | ✅ Existe |
| `public:home:news` | Actualités/Presse | `{"enabled": true, "max_items": 3}` | ✅ Existe |
| `public:compagnie:values` | Valeurs compagnie | `{"enabled": true, "max_items": 12}` | ❌ À créer |
| `public:compagnie:presentation` | Sections présentation | `{"enabled": true}` | ❌ À créer |
| `public:presse:media_kit` | Kit média téléchargeable | `{"enabled": true}` | ⚠️ Migré depuis `public:presse:media_kit_enabled` |

### Migration Seed

> ✅ **Décision**: Structure JSON unifiée pour tous les toggles (Option 1)
> - Cohérence avec les autres clés `{"enabled": true, ...}`
> - Extensibilité pour paramètres futurs
> - Pattern uniforme = code DAL/UI simplifié

```sql
-- supabase/migrations/[timestamp]_migrate_display_toggles.sql

-- ============================================
-- STEP 1: Verify metadata columns (already present in 10_tables_system.sql)
-- ============================================
-- ✅ NOTE: Les colonnes description, category, updated_by existent déjà dans le schéma
-- ✅ NOTE: Cette section est conservée pour compatibilité avec anciennes versions

do $$
begin
  -- Vérification que les colonnes existent (normalement déjà présentes)
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'configurations_site' 
      and column_name = 'description'
  ) then
    alter table public.configurations_site add column description text;
    raise notice 'Column description added (unexpected - should exist in schema)';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'configurations_site' 
      and column_name = 'category'
  ) then
    alter table public.configurations_site add column category text;
    raise notice 'Column category added (unexpected - should exist in schema)';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'configurations_site' 
      and column_name = 'updated_by'
  ) then
    alter table public.configurations_site 
      add column updated_by uuid references auth.users(id) on delete set null;
    raise notice 'Column updated_by added (unexpected - should exist in schema)';
  end if;
end;
$$;

comment on column public.configurations_site.description is 'Description de la configuration pour l''interface admin';
comment on column public.configurations_site.category is 'Catégorie pour grouper les configurations (home_display, compagnie_display, presse_display)';
comment on column public.configurations_site.updated_by is 'Utilisateur ayant effectué la dernière modification';

-- ============================================
-- STEP 2: Migrate presse key to unified JSON structure
-- ⚠️ Breaking change: public:presse:media_kit_enabled → public:presse:media_kit
-- ============================================
update public.configurations_site
set 
  key = 'public:presse:media_kit',
  value = '{"enabled": true}'::jsonb,
  description = 'Kit média téléchargeable page presse',
  category = 'presse_display'
where key = 'public:presse:media_kit_enabled';

-- ============================================
-- STEP 3: UPDATE existing home keys with metadata
-- ============================================
update public.configurations_site set 
  description = 'Affichage section newsletter sur homepage',
  category = 'home_display'
where key = 'public:home:newsletter';

update public.configurations_site set 
  description = 'Affichage section partenaires sur homepage',
  category = 'home_display'
where key = 'public:home:partners';

update public.configurations_site set 
  description = 'Spectacles à la une sur homepage',
  category = 'home_display'
where key = 'public:home:spectacles';

update public.configurations_site set 
  description = 'Actualités/Presse sur homepage',
  category = 'home_display'
where key = 'public:home:news';

-- ============================================
-- STEP 4: INSERT new compagnie keys (only these don't exist)
-- ============================================
insert into public.configurations_site (key, value, description, category)
values
  (
    'public:compagnie:values',
    '{"enabled": true, "max_items": 12}'::jsonb,
    'Valeurs institutionnelles page compagnie',
    'compagnie_display'
  ),
  (
    'public:compagnie:presentation',
    '{"enabled": true}'::jsonb,
    'Sections présentation page compagnie',
    'compagnie_display'
  )
on conflict (key) do nothing;

-- ============================================
-- STEP 5: Fix typo in existing data (cleanup)
-- ============================================
update public.configurations_site 
set value = jsonb_set(
  value - 'show_archivedd', 
  '{show_archived}', 
  'false'::jsonb
)
where key = 'public:home:spectacles' 
  and value ? 'show_archivedd';
```

> ⚠️ **Breaking Change**: Le code lisant `public:presse:media_kit_enabled` doit être mis à jour vers `public:presse:media_kit`

### RLS Policies

```sql
-- Lecture publique des configs publiques
create policy "Anyone can read public site configs"
  on public.configurations_site for select
  to anon, authenticated
  using (key like 'public:%');

-- Admin full access
create policy "Admins can manage all site configs"
  on public.configurations_site for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
```

---

## 📦 Schémas Zod & Types

### lib/schemas/site-config.ts

```typescript
import { z } from "zod";

/**
 * Standardized value schema for display toggles
 * Uses `max_items` (not `limit`) for consistency with existing seed data
 */
const DisplayToggleValueSchema = z.object({
  enabled: z.boolean(),
  max_items: z.number().int().positive().optional(),
  // Additional optional fields from existing configs
  autoplay: z.boolean().optional(),
  interval: z.number().int().positive().optional(),
  show_stats: z.boolean().optional(),
  show_mission: z.boolean().optional(),
  show_archived: z.boolean().optional(),
  show_inactive: z.boolean().optional(),
  show_private: z.boolean().optional(),
  double_optin: z.boolean().optional(),
  show_consent: z.boolean().optional(),
});

// ✅ Server Schema (for validation)
export const DisplayToggleInputSchema = z.object({
  key: z.string().regex(/^public:[a-z]+:[a-z_]+$/),
  value: DisplayToggleValueSchema,
});

// ✅ UI Schema (for forms - simplified)
export const DisplayToggleFormSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  max_items: z.number().int().positive().optional(),
});

// ✅ DTO (returned by DAL - uses `key` as identifier, not `id`)
export type DisplayToggleDTO = {
  key: string;
  value: {
    enabled: boolean;
    max_items?: number;
    [key: string]: unknown; // Allow additional fields
  };
  description: string | null;
  category: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type DisplayToggleInput = z.infer<typeof DisplayToggleInputSchema>;
export type DisplayToggleFormValues = z.infer<typeof DisplayToggleFormSchema>;
```

---

## 🔧 Data Access Layer (DAL)

### lib/dal/site-config.ts

```typescript
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { DisplayToggleInputSchema, type DisplayToggleDTO } from "@/lib/schemas/site-config";
import type { DALResult } from "./helpers";

/**
 * Fetch display toggle by key
 * @param key - Config key (e.g., "public:home:newsletter")
 * @returns Display toggle configuration
 */
export async function fetchDisplayToggle(
  key: string
): Promise<DALResult<DisplayToggleDTO | null>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("configurations_site")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error("[DAL] fetchDisplayToggle error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Fetch all display toggles by category
 * @param category - Category filter (e.g., "home_display")
 * @returns Array of display toggles
 */
export async function fetchDisplayTogglesByCategory(
  category: string
): Promise<DALResult<DisplayToggleDTO[]>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("configurations_site")
    .select("*")
    .eq("category", category)
    .order("key", { ascending: true });

  if (error) {
    console.error("[DAL] fetchDisplayTogglesByCategory error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
}

/**
 * Update display toggle
 * IMPORTANT: Requires admin privileges
 * @param key - Config key
 * @param value - New toggle value
 * @returns Updated toggle
 */
export async function updateDisplayToggle(
  key: string,
  value: { enabled: boolean; max_items?: number }
): Promise<DALResult<DisplayToggleDTO>> {
  await requireAdmin();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("configurations_site")
    .update({
      value,
      updated_at: new Date().toISOString(),
      updated_by: user?.id,
    })
    .eq("key", key)
    .select()
    .single();

  if (error) {
    console.error("[DAL] updateDisplayToggle error:", error);
    return { success: false, error: `[ERR_CONFIG_001] ${error.message}` };
  }

  return { success: true, data };
}
```

### lib/dal/helpers/index.ts

```typescript
// Export existing + new types
export type { DALResult } from "./error";
export { toDALResult } from "./error";
```

---

## 🎬 Server Actions

### lib/actions/site-config-actions.ts

```typescript
"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { updateDisplayToggle } from "@/lib/dal/site-config";
import { DisplayToggleFormSchema } from "@/lib/schemas/site-config";
import type { ActionResult } from "./types";

/**
 * Update display toggle action
 * Revalidates affected paths automatically
 */
export async function updateDisplayToggleAction(
  input: unknown
): Promise<ActionResult<{ key: string }>> {
  try {
    // 1. Validation UI schema
    const validated = DisplayToggleFormSchema.parse(input);
    
    // 2. DAL call
    const result = await updateDisplayToggle(validated.key, {
      enabled: validated.enabled,
      max_items: validated.max_items,
    });
    
    if (!result.success) {
      return { success: false, error: result.error ?? "Update failed" };
    }
    
    // 3. ✅ Revalidation (UNIQUEMENT ICI)
    const pathsToRevalidate = getPathsForToggle(validated.key);
    pathsToRevalidate.forEach(path => revalidatePath(path));
    
    return { success: true, data: { key: validated.key } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Map toggle keys to affected paths for revalidation
 */
function getPathsForToggle(key: string): string[] {
  const pathMap: Record<string, string[]> = {
    "public:home:newsletter": ["/"],
    "public:home:partners": ["/"],
    "public:home:spectacles": ["/"],
    "public:home:news": ["/"],
    "public:compagnie:values": ["/compagnie"],
    "public:compagnie:presentation": ["/compagnie"],
    "public:presse:media_kit": ["/presse"],
  };
  
  return pathMap[key] || [];
}
```

---

## 🎨 Admin UI Components

### Structure

```bash
components/features/admin/site-config/
├── DisplayTogglesContainer.tsx   # Server Component
├── DisplayTogglesView.tsx         # Client Component
├── ToggleCard.tsx                 # Dumb component
└── types.ts                       # Props interfaces
```

### DisplayTogglesContainer.tsx (Server)

```typescript
import { Suspense } from "react";
import { fetchDisplayTogglesByCategory } from "@/lib/dal/site-config";
import { DisplayTogglesView } from "./DisplayTogglesView";
import { DisplayTogglesSkeleton } from "@/components/skeletons/DisplayTogglesSkeleton";

export async function DisplayTogglesContainer() {
  const homeResult = await fetchDisplayTogglesByCategory("home_display");
  const compagnieResult = await fetchDisplayTogglesByCategory("compagnie_display");
  const presseResult = await fetchDisplayTogglesByCategory("presse_display");
  
  if (!homeResult.success || !compagnieResult.success || !presseResult.success) {
    return <div>Error loading toggles</div>;
  }
  
  return (
    <Suspense fallback={<DisplayTogglesSkeleton />}>
      <DisplayTogglesView
        homeToggles={homeResult.data}
        compagnieToggles={compagnieResult.data}
        presseToggles={presseResult.data}
      />
    </Suspense>
  );
}
```

### DisplayTogglesView.tsx (Client)

```typescript
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateDisplayToggleAction } from "@/lib/actions/site-config-actions";
import { ToggleCard } from "./ToggleCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DisplayToggleDTO } from "@/lib/schemas/site-config";

interface DisplayTogglesViewProps {
  homeToggles: DisplayToggleDTO[];
  compagnieToggles: DisplayToggleDTO[];
  presseToggles: DisplayToggleDTO[];
}

export function DisplayTogglesView({
  homeToggles,
  compagnieToggles,
  presseToggles,
}: DisplayTogglesViewProps) {
  const router = useRouter();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  
  const handleToggle = useCallback(async (
    key: string,
    enabled: boolean
  ) => {
    setUpdatingKey(key);
    
    try {
      const result = await updateDisplayToggleAction({
        key,
        enabled,
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success("Configuration mise à jour", {
        description: `Section ${enabled ? "activée" : "désactivée"}`,
      });
      
      router.refresh(); // ✅ Déclenche re-fetch Server Component
    } catch (error) {
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setUpdatingKey(null);
    }
  }, [router]);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Affichage des Sections</h2>
        <p className="text-muted-foreground">
          Contrôlez la visibilité des sections sur les pages publiques
        </p>
      </div>
      
      <Separator />
      
      {/* Homepage Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Page d'Accueil</CardTitle>
          <CardDescription>
            Sections affichées sur la homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {homeToggles.map(toggle => (
            <ToggleCard
              key={toggle.key}
              toggle={toggle}
              onToggle={handleToggle}
              isUpdating={updatingKey === toggle.key}
            />
          ))}
        </CardContent>
      </Card>
      
      {/* Compagnie Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Page Compagnie</CardTitle>
          <CardDescription>
            Sections affichées sur la page compagnie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {compagnieToggles.map(toggle => (
            <ToggleCard
              key={toggle.key}
              toggle={toggle}
              onToggle={handleToggle}
              isUpdating={updatingKey === toggle.key}
            />
          ))}
        </CardContent>
      </Card>
      
      {/* Presse Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Page Presse</CardTitle>
          <CardDescription>
            Sections affichées sur la page presse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {presseToggles.map(toggle => (
            <ToggleCard
              key={toggle.key}
              toggle={toggle}
              onToggle={handleToggle}
              isUpdating={updatingKey === toggle.key}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

### ToggleCard.tsx (Dumb)

```typescript
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { DisplayToggleDTO } from "@/lib/schemas/site-config";

interface ToggleCardProps {
  toggle: DisplayToggleDTO;
  onToggle: (key: string, enabled: boolean) => Promise<void>;
  isUpdating: boolean;
}

export function ToggleCard({ toggle, onToggle, isUpdating }: ToggleCardProps) {
  const sectionName = getSectionName(toggle.key);
  
  return (
    <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
      <div className="space-y-0.5 flex-1">
        <Label htmlFor={toggle.key} className="text-base font-medium">
          {sectionName}
        </Label>
        {toggle.description && (
          <p className="text-sm text-muted-foreground">
            {toggle.description}
          </p>
        )}
        <div className="flex gap-2 mt-2">
          {toggle.value.max_items && (
            <Badge variant="outline">Max: {toggle.value.max_items}</Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
        <Switch
          id={toggle.key}
          checked={toggle.value.enabled}
          onCheckedChange={(checked) => onToggle(toggle.key, checked)}
          disabled={isUpdating}
          aria-label={`Toggle ${sectionName}`}
        />
      </div>
    </div>
  );
}

function getSectionName(key: string): string {
  const names: Record<string, string> = {
    "public:home:newsletter": "Newsletter",
    "public:home:partners": "Partenaires",
    "public:home:spectacles": "Spectacles à la une",
    "public:home:news": "Actualités",
    "public:compagnie:values": "Valeurs",
    "public:compagnie:presentation": "Présentation",
    "public:presse:media_kit": "Kit Média",
  };
  
  return names[key] || key;
}
```

---

## 🚪 Admin Page

### app/(admin)/admin/site-config/page.tsx

```typescript
import { DisplayTogglesContainer } from "@/components/features/admin/site-config/DisplayTogglesContainer";

export const metadata = {
  title: "Configuration Affichage | Admin",
  description: "Gérer l'affichage des sections du site",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SiteConfigPage() {
  return (
    <div className="container py-6">
      <DisplayTogglesContainer />
    </div>
  );
}
```

### app/(admin)/admin/site-config/loading.tsx

```typescript
import { DisplayTogglesSkeleton } from "@/components/skeletons/DisplayTogglesSkeleton";

export default function Loading() {
  return <DisplayTogglesSkeleton />;
}
```

---

## 🎭 Frontend Gating Pattern

### Exemple: Homepage Spectacles

```typescript
// components/features/public-site/home/shows/ShowsContainer.tsx
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { ShowsView } from "./ShowsView";

export async function ShowsContainer() {
  // ✅ Check toggle - uses `public:home:spectacles` (not `shows`)
  const toggleResult = await fetchDisplayToggle("public:home:spectacles");
  
  if (!toggleResult.success || !toggleResult.data?.value.enabled) {
    return null; // Section désactivée
  }
  
  const maxItems = toggleResult.data.value.max_items ?? 6;
  // ... fetch spectacles data with maxItems limit
  
  return <ShowsView {...props} />;
}
```

### Exemple: Homepage Newsletter (Reference - Already Implemented)

```typescript
// components/features/public-site/home/newsletter/NewsletterContainer.tsx
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { NewsletterView } from "./NewsletterView";

export async function NewsletterContainer() {
  // ✅ Check toggle
  const toggleResult = await fetchDisplayToggle("public:home:newsletter");
  
  if (!toggleResult.success || !toggleResult.data?.value.enabled) {
    return null; // Section désactivée
  }
  
  // ... fetch newsletter data
  
  return <NewsletterView {...props} />;
}
```

### Exemple: Page Compagnie Values

```typescript
// components/features/public-site/compagnie/CompagnieContainer.tsx
export async function CompagnieContainer() {
  const toggleResult = await fetchDisplayToggle("public:compagnie:values");
  
  const showValues = toggleResult.success && toggleResult.data?.value.enabled;
  const maxItems = toggleResult.data?.value.max_items ?? 12;
  
  const values = showValues ? await fetchCompagnieValues(maxItems) : [];
  
  return <CompagnieView values={values} showValues={showValues} />;
}
```

---

## 📊 Dashboard Stats Integration

### lib/dal/dashboard.ts (Update)

```typescript
/**
 * Fetch display toggles stats
 * Returns counts of enabled/disabled sections per category
 */
export async function fetchDisplayTogglesStats(): Promise<DALResult<{
  homeEnabled: number;
  homeDisabled: number;
  compagnieEnabled: number;
  compagnieDisabled: number;
  presseEnabled: number;
  presseDisabled: number;
}>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("configurations_site")
    .select("category, value");
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  const stats = {
    homeEnabled: 0,
    homeDisabled: 0,
    compagnieEnabled: 0,
    compagnieDisabled: 0,
    presseEnabled: 0,
    presseDisabled: 0,
  };
  
  data?.forEach(config => {
    const enabled = config.value.enabled;
    switch (config.category) {
      case "home_display":
        enabled ? stats.homeEnabled++ : stats.homeDisabled++;
        break;
      case "compagnie_display":
        enabled ? stats.compagnieEnabled++ : stats.compagnieDisabled++;
        break;
      case "presse_display":
        enabled ? stats.presseEnabled++ : stats.presseDisabled++;
        break;
    }
  });
  
  return { success: true, data: stats };
}
```

---

## 🧪 Testing Strategy

### 1. Unit Tests (DAL)

```typescript
// __tests__/dal/site-config.test.ts
describe("fetchDisplayToggle", () => {
  it("should return toggle configuration", async () => {
    const result = await fetchDisplayToggle("public:home:newsletter");
    
    expect(result.success).toBe(true);
    expect(result.data?.key).toBe("public:home:newsletter");
    expect(result.data?.value.enabled).toBeDefined();
  });
  
  it("should return null for non-existent key", async () => {
    const result = await fetchDisplayToggle("invalid:key");
    
    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });
});
```

### 2. Integration Tests (Server Actions)

```typescript
// scripts/test-display-toggles.ts
async function testToggleUpdate() {
  console.log("🧪 Testing display toggle update...");
  
  const result = await updateDisplayToggleAction({
    key: "public:home:newsletter",
    enabled: false,
  });
  
  expect(result.success).toBe(true);
  console.log("✅ Toggle updated successfully");
}
```

### 3. Manual UI Testing Checklist

- [ ] Admin peut voir tous les toggles organisés par catégorie
- [ ] Switch fonctionne avec feedback visuel immédiat
- [ ] Toast notifications s'affichent correctement
- [ ] Page publique se met à jour après toggle (F5)
- [ ] Section disparaît quand toggle désactivé
- [ ] Skeleton s'affiche pendant le chargement
- [ ] Accessibilité: navigation clavier fonctionne
- [ ] Accessibilité: aria-labels corrects

---

## 📝 Checklist d'Implémentation

### Phase 1: Backend (2h)

- [ ] Créer migration `add_display_toggles.sql` (colonnes + seed)
- [ ] Tester migration localement avec `supabase db reset`
- [ ] Vérifier colonnes ajoutées avec `\d configurations_site`
- [ ] Créer `lib/schemas/site-config.ts` avec schémas (standardisé `max_items`)
- [ ] Implémenter `lib/dal/site-config.ts` (3 fonctions)
- [ ] Créer `lib/actions/site-config-actions.ts` avec revalidation
- [ ] Tester DAL via script `test-display-toggles.ts`

### Phase 2: Admin UI (2h)

- [ ] Créer dossier `components/features/admin/site-config/`
- [ ] Implémenter `DisplayTogglesContainer.tsx` (Server)
- [ ] Implémenter `DisplayTogglesView.tsx` (Client + useEffect)
- [ ] Implémenter `ToggleCard.tsx` (Dumb component)
- [ ] Créer `DisplayTogglesSkeleton.tsx`
- [ ] Créer page admin `app/(admin)/admin/site-config/page.tsx`
- [ ] Ajouter lien dans `AdminSidebar.tsx`

### Phase 3: Frontend Gating (1h)

- [x] ~~Mettre à jour `NewsletterContainer.tsx` avec gating~~ (déjà implémenté via `fetchToggleEnabled`)
- [ ] Mettre à jour `PartnersContainer.tsx` avec gating
- [ ] Mettre à jour `ShowsContainer.tsx` avec gating (`public:home:spectacles`)
- [ ] Mettre à jour `NewsContainer.tsx` avec gating
- [ ] Mettre à jour `CompagnieContainer.tsx` avec gating
- [ ] Mettre à jour `PresseContainer.tsx` avec gating (`public:presse:media_kit`)

### Phase 4: Dashboard Stats (30min)

- [ ] Ajouter `fetchDisplayTogglesStats()` dans DAL dashboard
- [ ] Créer `StatsCard` pour afficher toggles actifs/inactifs
- [ ] Intégrer dans `DashboardStatsContainer.tsx`

### Phase 5: Testing & Polish (1h)

- [ ] Tests unitaires DAL
- [ ] Tests intégration Server Actions
- [ ] Test manuel complet UI admin
- [ ] Test manuel pages publiques (toggle on/off)
- [ ] Vérifier accessibilité (WCAG 2.1 AA)
- [ ] Vérifier performance (Lighthouse)
- [ ] Documentation mise à jour

---

## 🎯 Acceptance Criteria

### Must Have ✅

- [ ] Admin peut activer/désactiver chaque section
- [ ] Changements visibles immédiatement après F5
- [ ] UI admin organisée par catégorie (Home/Compagnie/Presse)
- [ ] Feedback toast sur succès/erreur
- [ ] Audit trail (updated_by, updated_at)
- [ ] RLS policies correctes (public read, admin write)
- [ ] Conformité Clean Code (<300 lignes/fichier)
- [ ] Conformité TypeScript (aucun `any`)

### Nice to Have 🌟

- [ ] Confirmation modal pour désactivation sections critiques
- [ ] Dashboard stats avec graphique toggles actifs/inactifs
- [ ] Historique des modifications (via logs_audit)
- [ ] Preview mode (voir résultat avant enregistrement)
- [ ] Bulk actions (activer/désactiver tout une catégorie)

---

## � Sécurité et Conformité

### Checklist Sécurité (Basée sur Audits Décembre 2025)

- [ ] **RLS Policies** : Conformes au pattern établi dans `10_tables_system.sql`
  - ✅ Public read : `key like 'public:%'` OR `(select public.is_admin())`
  - ✅ Admin full access : `(select public.is_admin())` pour INSERT/UPDATE/DELETE
- [ ] **SECURITY INVOKER** : Si vues créées, utiliser `WITH (security_invoker = true)`
  - Référence : `.github/prompts/plan-fixRlsBaseTablesAdminViewsSecurity/database-view-security-guide.md`
- [ ] **DAL Pattern** : `DALResult<T>`, pas de `revalidatePath()` dans DAL
- [ ] **Server Actions** : `requireAdmin()` explicite + `revalidatePath()` dans actions uniquement
- [ ] **TypeScript** : Pas de `any`, types stricts, validation Zod
- [ ] **Tests Sécurité** : Script pour tester accès anon vs admin

### Références Audits

- Audit RLS complet : 31 décembre 2025 (36/36 tables protégées)
- SECURITY INVOKER enforcement : 31 décembre 2025 (11 vues sécurisées)
- Tests passés : 13/13 ✅ (`scripts/check-views-security.ts`)

---

## 📚 Références

### Documentation Interne

- `.github/instructions/crud-server-actions-pattern.instructions.md`
- `.github/instructions/dal-solid-principles.instructions.md`
- `.github/prompts/plan-fixRlsBaseTablesAdminViewsSecurity/database-view-security-guide.md`
- `supabase/schemas/README.md`
- `memory-bank/systemPatterns.md`

### Patterns Utilisés

- ✅ **CRUD Server Actions Pattern** — Toutes mutations via Server Actions
- ✅ **DAL SOLID Pattern** — DALResult<T>, pas de revalidatePath dans DAL
- ✅ **Dual Schema Pattern** — Server (bigint) vs UI (number)
- ✅ **Smart/Dumb Components** — Container/View séparation
- ✅ **Suspense + Skeleton** — Loading states UX

### shadcn/ui Components

- `Switch` — Toggle principal
- `Card` — Conteneur sections
- `Badge` — Metadata (position, limit)
- `Separator` — Séparation visuelle
- `Label` — Accessibilité
- `Loader2` — Feedback pending state

---

## 🚨 Risques & Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Cache pages publiques pas invalidé | Haut | Moyen | `revalidatePath()` mapping complet |
| Toggle désactive section critique | Moyen | Faible | Confirmation modal + audit trail |
| Performance dégradée (fetch toggle) | Moyen | Faible | Cache DAL + RLS optimisé |
| Erreur schéma jsonb | Faible | Faible | Validation Zod stricte |

---

## 🎉 Résultat Attendu

Un système de toggles production-ready permettant:

- ✅ **Flexibilité**: Admin contrôle total sur affichage sections
- ✅ **Réactivité**: Changements visibles immédiatement
- ✅ **Sécurité**: RLS + requireAdmin() + audit trail
- ✅ **Performance**: DAL optimisé + revalidation ciblée
- ✅ **UX**: Interface intuitive avec feedback clair
- ✅ **Maintenance**: Code clean, typé, testé

**Temps Total Estimé**: 4-6 heures  
**Complexité**: Moyenne  

