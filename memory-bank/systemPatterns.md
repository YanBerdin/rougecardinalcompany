# System Patterns

**Last Updated**: 2025-12-13

Architecture et patterns observés dans le projet:

- App Router Next.js (app/) pour pages et layouts.
- Pattern **Smart/Dumb** components: containers server-side pour la data, composants clients pour l'interactivité.
- DAL pattern recommandé: `lib/dal/` pour centraliser l'accès à la base (server-only modules).
- **DAL SOLID Pattern (Nov 2025)**: Tous les DAL retournent `DALResult<T>`, helpers centralisés dans `lib/dal/helpers/`.
- **Handler Factorization Pattern (Dec 2025)**: Logique partagée dans `lib/actions/*-server.ts`, réutilisée par API Routes et Server Actions.
- **ImageFieldGroup Pattern (Dec 2025)**: Composant réutilisable pour champs image avec validation SSRF intégrée.
- **Upload Générique Pattern (Dec 2025)**: `uploadMediaImage(formData, folder)` configurable par entité.
- Sécurité: combinaison GRANT (table-level) + RLS (policies) requise — ne pas considérer RLS comme substitut au GRANT.
- Migrations: `supabase/migrations/` est la source de vérité pour les modifications appliquées en base; `supabase/schemas/` sert de documentation/declarative reference.
- Tests & CI: vérifier explicitement que les roles `anon` et `authenticated` peuvent accéder aux DTO nécessaires (tests d'intégration DAL).

Conventions importantes:

1. Tous les changements de schéma doivent être accompagnés d'une migration.
2. Les migrations dangereuses (REVOKE massifs) doivent être revues et, si nécessaire, déplacées vers `supabase/migrations/legacy-migrations`.
3. Les scripts d'audit doivent être alignés avec le modèle de sécurité (ne pas considérer un GRANT comme "exposé" quand il est requis pour RLS).

## DAL SOLID Architecture (Nov 2025)

### DALResult<T> Pattern

**Pattern unifié** pour tous les modules DAL (17/17 compliant):

```typescript
// lib/dal/helpers/error.ts
export type DALResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export function toDALResult<T>(
  data: T | null,
  error: Error | null
): DALResult<T> {
  if (error) {
    return { success: false, error: error.message };
  }
  if (data === null) {
    return { success: false, error: "No data returned" };
  }
  return { success: true, data };
}
```

### DAL Helpers Structure

```bash
lib/dal/helpers/
├── error.ts      # DALResult<T> + toDALResult()
├── format.ts     # formatDate(), etc.
├── slug.ts       # generateSlug()
└── index.ts      # Barrel exports
```

### Server Actions Location

**Pattern** : Server Actions colocalisées avec les pages admin:

```bash
app/(admin)/admin/<feature>/
├── page.tsx        # Server Component
└── actions.ts      # Server Actions (validation + DAL + revalidatePath)
```

> [!CAUTION]
> **Règle critique ⚠️** : `revalidatePath()` UNIQUEMENT dans les Server Actions, JAMAIS dans le DAL.

### Schemas Dual Pattern

**Pattern** : Schémas Server (bigint) + UI (number) séparés:

```typescript
// lib/schemas/<feature>.ts

// Server schema (pour DAL/BDD)
export const FeatureInputSchema = z.object({
  id: z.coerce.bigint(),
  // ...
});

// UI schema (pour formulaires)
export const FeatureFormSchema = z.object({
  id: z.number().int().positive(),
  // ...
});
```

### Props Colocation Pattern

**Pattern** : Props composants colocalisées avec les composants:

```bash
components/features/admin/<feature>/
├── types.ts              # Props interfaces + re-exports
├── Container.tsx         # Smart component
├── View.tsx              # Client component
└── Form.tsx              # Form component
```

### CRUD Pages Pattern (Dec 2025)

**Pattern** : Formulaires CRUD sur pages dédiées (plus inline):

```bash
app/(admin)/admin/<feature>/
├── page.tsx              # Liste avec bouton "Ajouter"
├── loading.tsx           # Skeleton liste
├── actions.ts            # Server Actions CRUD
├── new/
│   ├── page.tsx          # Création (Server Component + FormWrapper)
│   └── loading.tsx       # Skeleton création
└── [id]/
    └── edit/
        ├── page.tsx      # Édition (Server Component + FormWrapper)
        └── loading.tsx   # Skeleton édition
```

**Composants associés** :

```bash
components/features/admin/<feature>/
├── <Feature>ManagementContainer.tsx   # Server Component (liste)
├── <Feature>Form.tsx                   # Form fields (react-hook-form)
├── <Feature>FormWrapper.tsx            # Bridge: sanitize → Server Action → redirect
├── <Feature>List.tsx                   # Liste/grille dumb component
└── <Feature>Card.tsx                   # Card individuel
```

**Avantages** :

- UX améliorée : URL dédiée, navigation back, refresh page
- Séparation claire : Container/Wrapper/Form responsibilities
- `sanitizePayload()` pour contraintes DB (empty string → null)

### Clean Code Pattern (Dec 2025)

**Pattern** : Extraction logique dans hooks et constantes pour conformité Clean Code.

#### Constants Pattern

**Location** : `lib/constants/<feature>.ts`

```typescript
// lib/constants/hero-slides.ts
export const HERO_SLIDE_LIMITS = {
  TITLE_MAX_LENGTH: 80,
  SUBTITLE_MAX_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

export const HERO_SLIDE_DEFAULTS = {
  title: "",
  is_active: true,
} as const;

export const ANIMATION_CONFIG = {
  duration: 0.2,
  ease: "easeInOut",
} as const;
```

**Naming** : `*_LIMITS`, `*_DEFAULTS`, `*_CONFIG`

#### Hooks Extraction Pattern

**Location** : `lib/hooks/use<Feature><Action>.ts`

```bash
lib/hooks/
├── useHeroSlideForm.ts       # Form state + submission (53 lines)
├── useHeroSlideFormSync.ts   # Props/form sync via useEffect (38 lines)
├── useHeroSlidesDnd.ts       # Drag & drop with @dnd-kit (73 lines)
└── useHeroSlidesDelete.ts    # Delete confirmation dialog (61 lines)
```

**Rules** :

- Extraire quand composant > 300 lignes
- Hook max ~70-80 lignes
- Single responsibility per hook

#### DRY Component Pattern

**Pattern** : Composant config-driven pour éliminer la duplication.

```typescript
// CtaFieldGroup.tsx — DRY CTA Primary/Secondary
const CTA_CONFIGS = {
  primary: { enabledField: "cta_primary_enabled", labelField: "cta_primary_label", urlField: "cta_primary_url" },
  secondary: { enabledField: "cta_secondary_enabled", ... },
} as const;

export function CtaFieldGroup({ form, type }: Props) {
  const config = CTA_CONFIGS[type];
  // Render fields using config...
}
```

#### ImageFieldGroup Pattern (Dec 2025)

**Pattern** : Composant générique réutilisable pour tous les champs image admin avec validation SSRF.

**Problème résolu** :

- Code dupliqué dans 4 formulaires admin (HeroSlide, Spectacle, TeamMember, AboutContent)
- Validation URL externe inconsistante (risque SSRF dans SpectacleForm)
- Gestion preview/fallback répétée

**Solution** :

**Composant** : `components/features/admin/media/ImageFieldGroup.tsx`

```typescript
interface ImageFieldGroupProps<TForm extends FieldValues> {
  form: UseFormReturn<TForm>;
  imageUrlField: Path<TForm>;
  imageMediaIdField?: Path<TForm>;
  altTextField?: Path<TForm>;
  label?: string;
  required?: boolean;
  showMediaLibrary?: boolean;
  showExternalUrl?: boolean;
  showAltText?: boolean;
}

export function ImageFieldGroup<TForm extends FieldValues>({
  form,
  imageUrlField,
  imageMediaIdField,
  altTextField,
  label = "Image",
  required = false,
  showMediaLibrary = true,
  showExternalUrl = true,
  showAltText = true,
}: ImageFieldGroupProps<TForm>) {
  // Encapsulates:
  // - MediaLibraryPicker integration
  // - validateImageUrl() SSRF protection
  // - Preview image with fallback placeholder
  // - Alt text field (optional)
}
```

**Usage** :

```tsx
// Dans n'importe quel formulaire admin
<ImageFieldGroup
  form={form}
  imageUrlField="image_url"
  imageMediaIdField="image_media_id"
  altTextField="alt_text"
  label="Image du spectacle"
  required
/>
```

**Fonctionnalités** :

- ✅ **SSRF Protection** : `validateImageUrl()` avec hostname allowlist
- ✅ **MediaLibraryPicker** : Sélection depuis la bibliothèque Supabase
- ✅ **External URL** : Saisie URL externe avec validation + aide exemple Unsplash
- ✅ **Preview** : Affichage avec fallback SVG placeholder
- ✅ **Alt Text** : Champ accessibilité optionnel
- ✅ **Type-safe** : Génériques TypeScript pour typage formulaire strict
- ✅ **Validation State** : Warning visuel si URL non validée
- ✅ **HTML Detection** : Message d'erreur spécifique si URL pointe vers page web

**Validation Conditionnelle (Dec 2025)** :

Pattern pour rendre l'image obligatoire selon une condition :

```typescript
// Schema Zod avec superRefine
export const spectacleFormSchema = z.object({
  image_url: z.string().url().optional().or(z.literal("")),
  public: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.public && (!data.image_url || data.image_url === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["image_url"],
      message: "Une image est requise pour un spectacle visible publiquement",
    });
  }
});

// Validation côté client dans onSubmit
if (data.public && (!data.image_url || data.image_url === "")) {
  toast.error("Image requise", {
    description: "Un spectacle visible publiquement doit avoir une image."
  });
  return;
}

// UI dynamique avec form.watch()
<ImageFieldGroup
  label={`Image${form.watch("public") ? " *" : ""}`}
  description={
    form.watch("public") 
      ? "⚠️ Image OBLIGATOIRE pour un spectacle visible publiquement."
      : "Image optionnelle."
  }
/>
```

**Formulaires migrés** :

- `HeroSlideForm.tsx` — Hero slides homepage
- `SpectacleForm.tsx` — Gestion spectacles (SSRF + validation conditionnelle)
- `TeamMemberForm.tsx` — Membres équipe
- `AboutContentForm.tsx` — Section À propos

#### Clean Code Compliance Checklist

- ✅ Max 30 lignes par fonction
- ✅ Max 300 lignes par fichier
- ✅ Aucun commentaire (code auto-documenté)
- ✅ Aucun magic number (constantes nommées)
- ✅ DRY (pas de duplication)
- ✅ Aucun console.log

### Handler Factorization Pattern (Dec 2025)

**Pattern** : Extraire la logique métier dans des handlers partagés réutilisés par API Routes et Server Actions.

#### Structure

```bash
lib/actions/
├── contact-server.ts      # handleContactSubmission()
├── newsletter-server.ts   # handleNewsletterSubscription()
├── media-actions.ts       # uploadMediaImage(), deleteMediaImage()
├── types.ts               # ActionResult<T>
└── index.ts               # Barrel exports

app/actions/
├── contact.actions.ts     # Server Action wrapper
└── newsletter.actions.ts  # Server Action wrapper

app/api/
├── contact/route.ts       # Délègue à handleContactSubmission()
└── newsletter/route.ts    # Délègue à handleNewsletterSubscription()
```

#### Handler Pattern

```typescript
// lib/actions/contact-server.ts
"use server";
import "server-only";
import { z } from "zod";
import { createContactMessage } from "@/lib/dal/contact";
import { sendContactNotification } from "@/lib/email/actions";
import type { ActionResult } from "./types";

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function handleContactSubmission(
  input: unknown
): Promise<ActionResult<{ status: "sent" }>> {
  try {
    // 1. Validation
    const validated = ContactSchema.parse(input);
    
    // 2. Persist (DAL)
    await createContactMessage(validated);
    
    // 3. Notification (non-bloquante)
    try {
      await sendContactNotification(validated);
    } catch (emailError) {
      console.error("[Contact] Email failed:", emailError);
      // Ne pas échouer l'opération principale
    }
    
    return { success: true, data: { status: "sent" } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
```

#### Idempotent DAL Pattern (Newsletter)

```typescript
// lib/dal/newsletter-subscriber.ts
export async function createNewsletterSubscriber(
  email: string
): Promise<DALResult<{ isNew: boolean }>> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("abonnes_newsletter")
    .insert({ email, active: true });
  
  // unique_violation = déjà abonné = succès idempotent
  if (error && isUniqueViolation(error)) {
    return { success: true, data: { isNew: false } };
  }
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, data: { isNew: true } };
}
```

#### Avantages

- ✅ **DRY** : Logique centralisée, pas de duplication entre API Route et Server Action
- ✅ **Rétrocompatibilité** : Routes API conservées pour clients externes (curl, mobile)
- ✅ **Progressive Enhancement** : Server Actions pour formulaires JS
- ✅ **Graceful Degradation** : Erreur email ne fait pas échouer l'opération
- ✅ **Idempotence** : Newsletter gère les doublons comme succès

### Upload Générique Pattern (Dec 2025)

**Pattern** : Actions d'upload configurables par folder pour toutes les entités.

#### Structure

```typescript
// lib/actions/media-actions.ts
"use server";
import "server-only";
import { requireAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "./types";

export async function uploadMediaImage(
  formData: FormData,
  folder: string = "team"
): Promise<ActionResult<{ url: string; mediaId: bigint }>> {
  await requireAdmin();
  
  const file = formData.get("file") as File;
  // Validation MIME + size
  // Upload to Supabase Storage
  // Insert metadata in medias table
  // Return URL + ID
}

export async function deleteMediaImage(
  mediaId: bigint
): Promise<ActionResult<void>> {
  await requireAdmin();
  // Delete from Storage + medias table
}
```

#### Usage

```typescript
// Team photos
const result = await uploadMediaImage(formData, "team");

// Spectacle images
const result = await uploadMediaImage(formData, "spectacles");

// Press releases
const result = await uploadMediaImage(formData, "press");
```

#### ActionResult<T> Type

```typescript
// lib/actions/types.ts
export type ActionResult<T = unknown> =
  | { success: true; data: T; warning?: string }
  | { success: false; error: string; status?: number };

export function isActionSuccess<T>(
  result: ActionResult<T>
): result is { success: true; data: T } {
  return result.success === true;
}
```

### Bfcache Handler Pattern (Dec 2025)

**Pattern** : Prévenir les erreurs d'hydratation React causées par le browser bfcache.

#### Problème

Quand un utilisateur navigue en arrière (ex: depuis une page 404), le browser peut restaurer la page depuis son bfcache (back-forward cache). React tente de re-hydrater avec de nouveaux IDs (`useId()`), causant un mismatch avec les IDs stockés dans le DOM bfcache.

```
Error: Hydration failed because the server rendered HTML didn't match the client.
React tree: id="_R_39bn5ri..."
Server HTML: id="_R_d5esnebn..."
```

#### Solution

**Composant** : `components/admin/BfcacheHandler.tsx`

```typescript
"use client";
import { useEffect } from "react";

export function BfcacheHandler() {
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);
  return null;
}
```

**Intégration** : Ajouter au layout admin (ou tout layout avec formulaires React).

```tsx
// app/(admin)/layout.tsx
import { BfcacheHandler } from "@/components/admin/BfcacheHandler";

export default function AdminLayout({ children }) {
  return (
    <>
      <BfcacheHandler />
      {/* ... rest of layout */}
    </>
  );
}
```

#### Conformité

- ✅ **web.dev/bfcache** : Pattern `pageshow` + `event.persisted` + `reload()` explicitement recommandé par Google
- ✅ **Next.js** : bfcache est distinct du Router Cache, pas de solution built-in
- ✅ **React** : Seule solution fiable pour les formulaires avec `useId()`

#### Quand utiliser

- Layouts admin avec formulaires contrôlés (react-hook-form)
- Pages utilisant `useId()` pour les IDs de formulaires
- Applications où les utilisateurs naviguent fréquemment en arrière

#### Référence

- [web.dev/articles/bfcache](https://web.dev/articles/bfcache) — Documentation officielle Google
- Section "Mettre à jour des données obsolètes ou sensibles après la restauration de bfcache"

## Patterns Architecturaux

### Security Patterns (Database)

#### RLS-Only Access Control Model

**Pattern** : Utiliser exclusivement les politiques RLS pour le contrôle d'accès, jamais de table-level grants.

```sql
-- ❌ ANTI-PATTERN: Table-level grants bypass RLS
GRANT SELECT ON TABLE public.articles_presse TO authenticated;

-- ✅ PATTERN: RLS policies only
CREATE POLICY "Public read published articles"
  ON public.articles_presse FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL);
```

**Rationale** : Table-level grants court-circuitent RLS et créent des failles de sécurité.

#### SECURITY INVOKER Views Pattern

**Pattern** : Toujours utiliser `WITH (security_invoker = true)` pour les vues.

```sql
-- ❌ ANTI-PATTERN: SECURITY DEFINER (default) = privilege escalation risk
CREATE VIEW public.articles_presse_public AS
  SELECT * FROM articles_presse WHERE published_at IS NOT NULL;

-- ✅ PATTERN: SECURITY INVOKER = principle of least privilege
CREATE VIEW public.articles_presse_public
WITH (security_invoker = true) AS
  SELECT * FROM articles_presse WHERE published_at IS NOT NULL;

-- ⚠️ REQUIRED: Grant permissions on base table for SECURITY INVOKER
GRANT SELECT ON public.articles_presse TO anon, authenticated;
```

**Defense in Depth** :

1. VIEW filtrage (published_at IS NOT NULL)
2. GRANT permissions (table base)
3. RLS policies (row-level filtering)

#### Function Security Pattern

**Pattern** : `SECURITY INVOKER` par défaut, `SECURITY DEFINER` uniquement si justifié.

```sql
-- ✅ DEFAULT PATTERN: SECURITY INVOKER + SET search_path
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER  -- Runs with caller's privileges
AS $$
BEGIN
  SET search_path = '';  -- Prevent SQL injection
  -- Function logic...
END;
$$;

-- ⚠️ EXCEPTION PATTERN: SECURITY DEFINER avec rationale documentée
-- SECURITY DEFINER rationale: requires elevated privileges for [specific reason]
-- Reviewed per ISSUE #27
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with creator (postgres) privileges
SET search_path = ''
AS $$
BEGIN
  -- Must run as postgres to access auth.jwt() and user_metadata
  RETURN (auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin';
END;
$$;
```

#### Admin Authorization Pattern

> [!CAUTION]
> **CRITICAL REQUIREMENT ⚠️** :
> Admin users MUST have profile entry with `role='admin'`

**Pattern** : Profile-based authorization avec `is_admin()` function pour RLS policies.

```sql
-- 1. Profile table with role column
CREATE TABLE public.profiles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  role text default 'user',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint profiles_userid_unique unique (user_id)
);

-- 2. is_admin() function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role 
  INTO user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$;

-- 3. RLS policy using is_admin()
CREATE POLICY "Authenticated users can create spectacles"
ON public.spectacles
FOR INSERT
TO authenticated
WITH CHECK ( (SELECT public.is_admin()) = true );

-- 4. Admin profile registration (manual)
INSERT INTO public.profiles (user_id, role, display_name)
VALUES (
  'UUID_FROM_AUTH_USERS',
  'admin',
  'Admin Name'
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

**Architecture Defense in Depth** :

1. **Middleware Level** : Route protection (`/admin/*` requires auth)
2. **API Level** : `withAdminAuth()` wrapper for endpoints
3. **Database Level** : RLS policies with `is_admin()`

**Common Pitfall** : Authenticated user ≠ Authorized admin

```typescript
// ❌ WRONG: Assume authenticated = admin
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  // User is authenticated but might not be admin!
  await supabase.from('spectacles').insert(data); // RLS ERROR 42501
}

// ✅ CORRECT: Check admin status
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return { error: 'Not authenticated', status: 401 };
}

const { data: isAdmin } = await supabase.rpc('is_admin');
if (!isAdmin) {
  return { error: 'Not authorized', status: 403 };
}

// Now safe to perform admin operations
await supabase.from('spectacles').insert(data);
```

**Registration Workflow** :

1. User registers via Supabase Auth → Entry in `auth.users`
2. Admin manually creates profile → Entry in `profiles` table with `role='admin'`
3. `is_admin()` function returns true → RLS allows admin operations

**Troubleshooting** :

```sql
-- Check if profile exists
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Test is_admin() (from application, NOT SQL Editor)
SELECT public.is_admin();

-- Verify auth.uid() (from application)
SELECT auth.uid();
```

**⚠️ SQL Editor Limitation** : Supabase SQL Editor uses `service_role` without user session. `auth.uid()` returns NULL in this environment. Always test user-context functions from the application.

**Complete Procedure** : See `memory-bank/procedures/admin-user-registration.md`

**Discovered in** : TASK021 - Admin Backoffice Spectacles CRUD (16 November 2025)

#### Whitelist Audit Pattern

**Pattern** : Exclure les objets système de l'audit de sécurité pour focus sur business objects.

```sql
-- audit_grants_filtered.sql (production)
SELECT
  schemaname,
  tablename,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'auth', 'extensions')
  AND schemaname NOT LIKE 'pg_%'
  AND grantee IN ('PUBLIC', 'anon', 'authenticated')
  -- Whitelist système Supabase
  AND NOT (schemaname = 'realtime' AND tablename IN ('messages', 'schema_migrations', 'subscription'))
  AND NOT (schemaname = 'storage' AND tablename IN ('buckets', 'objects', 'prefixes', 's3_multipart_uploads', 's3_multipart_uploads_parts'))
ORDER BY schemaname, tablename;
```

**Rationale** : Objets système PostgreSQL/Supabase se ré-appliquent automatiquement; focus sur business objects.

### App Router Pattern

```typescript
// Structure type d'une route
app / layout.tsx; // Layout partagé
page.tsx; // Page principale
loading.tsx; // État de chargement
error.tsx[param] / // Gestion d'erreur // Route dynamique
  page.tsx; // Page avec paramètre
```

### Route Groups Pattern (Next.js 15)

**Introduced**: 11 novembre 2025 - Migration architecture layouts

**Pattern** : Utiliser les parenthèses pour organiser les routes sans affecter l'URL.

```typescript
// Structure avec route groups
app/
  layout.tsx                    // Root: HTML shell + ThemeProvider
  (admin)/                      // Route group: admin zone
    layout.tsx                  // Admin layout: AppSidebar + requireAdmin()
    admin/
      team/page.tsx             // URL: /admin/team
      debug-auth/page.tsx       // URL: /admin/debug-auth
  (marketing)/                  // Route group: public zone
    layout.tsx                  // Public layout: Header + Footer
    page.tsx                    // URL: /
    spectacles/page.tsx         // URL: /spectacles
    compagnie/page.tsx          // URL: /compagnie
```

**Avantages** :

1. **Isolation zones fonctionnelles** : Comportements distincts (auth, UI, navigation)
2. **Layouts dédiés** : Chaque zone a son propre layout sans affecter l'URL
3. **Zero breaking URL** : `/admin/team` reste `/admin/team` (pas `/(admin)/admin/team`)
4. **Meilleure organisation** : Structure claire admin vs public

**Root Layout Pattern** :

```typescript
// app/layout.tsx - HTML shell only
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Admin Layout Pattern** :

```typescript
// app/(admin)/layout.tsx - Protected with sidebar
import { requireAdmin } from "@/lib/auth/is-admin";
import { AppSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // Auth guard
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

**Marketing Layout Pattern** :

```typescript
// app/(marketing)/layout.tsx - Public with header/footer
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

**Middleware Matching avec Route Groups** :

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const claims = await supabase.auth.getClaims();

  // Redirect to login if accessing admin routes without auth
  if (
    !claims &&
    request.nextUrl.pathname.startsWith('/admin')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api/auth (Supabase auth endpoints)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**BREAKING CHANGES** (migration checklist) :

- ✅ Vérifier tous imports/paths relatifs dans les composants
- ✅ Mettre à jour middleware matchers si nécessaire
- ✅ Tester navigation entre zones (admin ↔ public)
- ✅ Valider que layouts s'appliquent correctement
- ✅ Vérifier hydration warnings (pas de html/body dupliqués dans route groups)

**Références** :

- Documentation : `memory-bank/changes/2025-11-11-layouts-admin-sidebar.md`
- Blueprint : `memory-bank/architecture/Project_Architecture_Blueprint_v3.md`
- Commit : 6a2c7d8 "feat(architecture): Complete route groups migration"

### Server Actions Layer Pattern (Next.js 15)

**Introduced**: 27 novembre 2025 - Clean Code & TypeScript Conformity

**Pattern** : Architecture 4-layer avec Server Actions comme couche d'orchestration.

```
┌─────────────────────────────────────────────────────────────────┐
│  Presentation (Client Components)                               │
│  └── Form.tsx uses UI schema (number for IDs)                  │
├─────────────────────────────────────────────────────────────────┤
│  Server Actions (lib/actions/)                                  │
│  └── Validation + DAL call + revalidatePath() ← SEUL ENDROIT   │
├─────────────────────────────────────────────────────────────────┤
│  Data Access Layer (lib/dal/)                                   │
│  └── Database ops + DALResult<T> + error codes [ERR_*]         │
├─────────────────────────────────────────────────────────────────┤
│  Database (Supabase)                                            │
│  └── RLS policies + is_admin() checks                          │
└─────────────────────────────────────────────────────────────────┘
```

**Server Action Pattern** :

```typescript
// lib/actions/feature-actions.ts
"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { createFeature, updateFeature } from "@/lib/dal/feature";
import { FeatureInputSchema } from "@/lib/schemas/feature";

export type ActionResult<T = unknown> = 
  | { success: true; data?: T } 
  | { success: false; error: string };

export async function createFeatureAction(input: unknown): Promise<ActionResult> {
  try {
    // 1. Validation Zod (Server schema)
    const validated = FeatureInputSchema.parse(input);
    
    // 2. Appel DAL
    const result = await createFeature(validated);
    
    if (!result.success) {
      return { success: false, error: result.error ?? "Create failed" };
    }
    
    // 3. ✅ Revalidation UNIQUEMENT ICI
    revalidatePath("/admin/feature");
    
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}
```

**DAL Pattern (NO revalidatePath)** :

```typescript
// lib/dal/feature.ts
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { FeatureInput, FeatureDTO } from "@/lib/schemas/feature";

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
    // Error codes for debugging: [ERR_FEATURE_001]
    return { success: false, error: `[ERR_FEATURE_001] ${error.message}` };
  }

  // ❌ PAS DE revalidatePath() ICI
  return { success: true, data };
}
```

**Dual Zod Schemas Pattern** :

```typescript
// lib/schemas/feature.ts
import { z } from "zod";

// ✅ Schéma SERVER (pour DAL/BDD) — utilise bigint
export const FeatureInputSchema = z.object({
  title: z.string().min(1).max(80),
  image_media_id: z.coerce.bigint().optional(),
});
export type FeatureInput = z.infer<typeof FeatureInputSchema>;

// ✅ Schéma UI (pour formulaires) — utilise number
export const FeatureFormSchema = z.object({
  title: z.string().min(1).max(80),
  image_media_id: z.number().int().positive().optional(),
});
export type FeatureFormValues = z.infer<typeof FeatureFormSchema>;
```

**Client Component with useEffect Sync** :

```typescript
// components/features/admin/feature/View.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteFeatureAction } from "@/lib/actions/feature-actions";

export function View({ initialItems }: { initialItems: FeatureDTO[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  // ✅ CRITIQUE : Sync local state when props change (after router.refresh())
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleDelete = useCallback(async (id: bigint) => {
    const result = await deleteFeatureAction(String(id));
    if (result.success) {
      router.refresh(); // ✅ Déclenche re-fetch Server Component
    }
  }, [router]);

  return (/* UI */);
}
```

> [!CAUTION]
> **Règles Critiques** :
>
>1. `revalidatePath()` UNIQUEMENT dans Server Actions
>2. DAL retourne `DALResult<T>` sans revalidation
>3. Schémas UI (number) ≠ Schémas Server (bigint)
>4. useEffect sync pour re-render après router.refresh()
>5. Composants > 300 lignes doivent être splittés

**Références** :

- Documentation : `.github/instructions/crud-server-actions-pattern.instructions.md`
- Blueprint : `memory-bank/architecture/Project_Architecture_Blueprint.md`
- Commit : 8aaefe1 "refactor: Clean Code & TypeScript conformity for TASK026"

### Pattern de Server Components et Client Components

```typescript
// Composant Server par défaut
export default async function PageComponent() {
  const data = await fetchData();
  return <ClientComponent initialData={data} />;
}

// Composant Client explicite
"use client";
export function ClientComponent({ initialData }) {
  const [state, setState] = useState(initialData);
  // ...
}
```

### Pattern d'Authentification Optimisée (Next.js 15 + Supabase)

⚠️ **Best Practice 2025** : Utiliser `getClaims()` au lieu de `getUser()` pour une performance 100x meilleure.

```typescript
// ❌ ANCIEN PATTERN (lent ~300ms)
export async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); // Appel réseau
  return user ? <UserMenu user={user} /> : <SignInButton />;
}

// ✅ NOUVEAU PATTERN (rapide ~2-5ms) - Client Component avec réactivité
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";

interface UserClaims {
  sub: string;
  email?: string;
  [key: string]: unknown;
}

export function AuthButton() {
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // ✅ OPTIMIZED: getClaims() = ~2-5ms (vérification JWT locale)
    const getClaims = async () => {
      const { data } = await supabase.auth.getClaims();
      setUserClaims(data?.claims ?? null);
      setLoading(false);
    };

    getClaims();

    // Écoute les changements auth en temps réel
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUserClaims({
            sub: session.user.id,
            email: session.user.email,
            ...session.user.user_metadata,
          });
        } else {
          setUserClaims(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) return <LoadingButton />;
  return userClaims ? <UserMenu email={userClaims.email} /> : <SignInButton />;
}
```

**Avantages** :

- Performance : 2-5ms au lieu de 300ms (100x plus rapide)
- Réactivité : mise à jour automatique via `onAuthStateChange()`
- Compatible : fonctionne dans les layouts qui ne se re-rendent pas
- Conformité : respecte `.github/instructions/nextjs-supabase-auth-2025.instructions.md`

### Pattern DAL (Data Access Layer) côté serveur

```typescript
// lib/dal/home-news.ts
import "server-only";
import { createClient } from "@/supabase/server";

export async function fetchFeaturedPressReleases(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communiques_presse")
    .select("id, title, slug, description, date_publication, image_url")
    .eq("public", true)
    .order("date_publication", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
```

### Pattern DAL Decomposition (Novembre 2025)

**Règle** : Toute fonction DAL > 30 lignes doit être décomposée en helpers focused (< 30 lignes chacun).

**Principes** :

1. **Single Responsibility** : Chaque helper une seule responsabilité (validation, opération DB, gestion erreurs)
2. **Type Guards** : error: unknown avec instanceof checks au lieu de type assertions
3. **Safety Checks** : Vérifications RGPD pour opérations destructives (hard-delete)
4. **JSDoc complète** : Documentation des comportements critiques

```typescript
// lib/dal/team.ts
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { revalidatePath } from "next/cache";

type DalResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
};

/**
 * Permanently deletes a team member from the database (RGPD compliance).
 *
 * CRITICAL: This operation is irreversible. The team member must be inactive
 * before deletion to prevent accidental data loss.
 *
 * @param id - Team member ID to delete
 * @returns Response indicating success or failure
 */
export async function hardDeleteTeamMember(id: number): Promise<DalResponse> {
  try {
    await requireAdmin();

    // Helper 1: Validation
    const validationResult = await validateTeamMemberForDeletion(id);
    if (!validationResult.success) return validationResult;

    // Helper 2: DB operation
    const deletionResult = await performTeamMemberDeletion(id);
    if (!deletionResult.success) return deletionResult;

    revalidatePath("/admin/team");
    return { success: true };
  } catch (error: unknown) {
    // Helper 3: Error handling
    return handleHardDeleteError(error);
  }
}

// ============================================================================
// Hard Delete Helpers (< 30 lines each)
// ============================================================================

/**
 * Validates team member exists and is inactive before deletion.
 * RGPD safety: prevents accidental deletion of active members.
 */
async function validateTeamMemberForDeletion(
  id: number
): Promise<DalResponse> {
  const member = await fetchTeamMemberById(id);

  if (!member) {
    return {
      success: false,
      error: "Team member not found",
      status: 404,
    };
  }

  if (member.active) {
    return {
      success: false,
      error: "Cannot delete active team member. Deactivate first.",
      status: 400,
    };
  }

  return { success: true };
}

/**
 * Performs database deletion operation.
 */
async function performTeamMemberDeletion(id: number): Promise<DalResponse> {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("membres_equipe")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("[DAL] Hard delete failed:", deleteError);
    return {
      success: false,
      error: "Failed to delete team member",
      status: 500,
    };
  }

  return { success: true };
}

/**
 * Handles errors with type guards (no assertions).
 */
function handleHardDeleteError(error: unknown): DalResponse {
  console.error("[DAL] hardDeleteTeamMember error:", error);

  // Type guard pattern instead of assertion
  if (error instanceof Error && error.message.includes("Forbidden")) {
    return {
      success: false,
      error: "Insufficient permissions",
      status: 403,
    };
  }

  return {
    success: false,
    error: "Internal error during deletion",
    status: 500,
  };
}
```

**Avantages** :

- ✅ Clean Code compliance (toutes fonctions < 30 lignes)
- ✅ Testabilité maximale (chaque helper testable indépendamment)
- ✅ Maintenabilité (responsabilités séparées)
- ✅ Sécurité RGPD (safety checks explicites)
- ✅ Type safety (type guards au lieu d'assertions)

### Pattern Next.js 15 Async Params (Novembre 2025)

**Nouveau pattern obligatoire** : Migration vers `await context.params` pour compatibilité future.

```typescript
// app/api/admin/team/[id]/hard-delete/route.ts

// ❌ OLD PATTERN (deprecated)
export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolved = (await params) as { id: string }; // Type assertion nécessaire
  const id = Number(resolved.id);
  // ...
}

// ✅ NEW PATTERN (Next.js 15 compatible)
type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(_request: Request, context: RouteContext) {
  // Await context.params (compatible Promise ou objet direct)
  const { id: idString } = await context.params;
  
  // Helper pour validation
  const id = parseTeamMemberId(idString);
  
  if (!id) {
    return NextResponse.json(
      { error: "Invalid team member ID" },
      { status: 400 }
    );
  }
  
  // Continue logic...
}

// Helper function pour validation ID
function parseTeamMemberId(id: string): number | null {
  const parsed = Number(id);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
```

**Avantages** :

- ✅ Type-safe sans assertions
- ✅ Compatible Next.js 15 async params
- ✅ Pattern consistant pour tous endpoints
- ✅ Validation centralisée dans helper

### Pattern Server Actions (Next.js 15)

⚠️ **Contrainte critique** : Dans un fichier marqué `"use server"`, tous les exports doivent être des fonctions async.

```typescript
// ❌ INCORRECT - Provoque "Server Actions must be async functions"
"use server";
export const MySchema = z.object({ ... }); // ❌ Export non-async

// ✅ CORRECT - Schema local, seules les fonctions sont exportées
"use server";
const MySchema = z.object({ ... }); // ✅ Local scope
export async function myAction(input) { // ✅ Async export
  const validated = MySchema.parse(input);
  // ...
}

// ✅ CORRECT - Types peuvent être exportés
export type MyInput = z.infer<typeof MySchema>;
```

### Pattern Upload Supabase Storage (TASK022)

**Upload Server Action avec Rollback :**

```typescript
"use server";
import { createClient } from "@/supabase/server";

export async function uploadTeamMemberPhoto(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  
  // 1. Validation
  if (!file || file.size > 5 * 1024 * 1024) {
    throw new Error("File too large (max 5MB)");
  }
  
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }
  
  // 2. Upload to Storage
  const fileName = `team/${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("medias")
    .upload(fileName, file);
    
  if (uploadError) throw uploadError;
  
  try {
    // 3. Insert metadata to database
    const { data: media, error: dbError } = await supabase
      .from("medias")
      .insert({
        category_id: categoryId,
        storage_path: uploadData.path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();
      
    if (dbError) throw dbError;
    return media;
    
  } catch (error) {
    // 4. Rollback: delete uploaded file if DB insert fails
    await supabase.storage.from("medias").remove([uploadData.path]);
    throw error;
  }
}
```

**Storage Bucket RLS Policies :**

```sql
-- Public read
create policy "Public read medias"
  on storage.objects for select
  to public
  using ( bucket_id = 'medias' );

-- Authenticated upload
create policy "Authenticated users can upload medias"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'medias' );

-- Authenticated update
create policy "Authenticated users can update medias"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'medias' )
  with check ( bucket_id = 'medias' );

-- Admin delete
create policy "Admins can delete medias"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'medias' and (select public.is_admin()) );
```

**Exemple DAL + Actions avec validation séparée :**

```typescript
// lib/dal/contact.ts
"use server";
const ContactSchema = z.object({ ... }); // Local
export type ContactInput = z.infer<typeof ContactSchema>;
export async function createContact(input: ContactInput) {
  const validated = ContactSchema.parse(input);
  // ...
}

// components/.../actions.ts
"use server";
const FormSchema = z.object({ ... }); // Dupliqué mais nécessaire
export async function submitForm(formData: FormData) {
  const parsed = FormSchema.parse(extractFromFormData(formData));
  await createContact(parsed as ContactInput);
}
```

Principes:

1. Modules `lib/dal/*` marqués `server-only` et sans code client.
2. Les pages/composants serveur appellent la DAL directement; les composants client reçoivent des props sérialisables.
3. Les requêtes respectent les RLS (lecture publique) et délèguent la logique métier au SQL quand pertinent.

### Pattern Suspense + Skeletons

```tsx
import { Suspense } from "react";
import { NewsSkeleton } from "./NewsSkeleton";
import NewsContainer from "./NewsContainer";

export function NewsSection() {
  return (
    <Suspense fallback={<NewsSkeleton />}>
      {/* Server Component */}
      <NewsContainer />
    </Suspense>
  );
}
```

Conseils:

- Les « containers » serveur peuvent inclure un délai artificiel temporaire pour valider l’UX des skeletons.
- Retirer les délais avant prod; garder Suspense pour les vrais temps réseau.
- Toujours retourner `null` si aucune donnée n’est disponible pour éviter un rendu vide cassé.

### Pattern de Gestion d'État

1. **Local State**: useState pour l'état des composants
2. **Global State**: Context API pour les données partagées
3. **Server State**: Server Components pour les données du serveur

## Patterns de Données

### Modèle d'Accès aux Données

```typescript
// Pattern de service Supabase
export async function fetchFeaturedShows(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("spectacles")
    .select("id, title, slug, image_url")
    .eq("public", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
```

### Pattern de Validation

```typescript
// Schéma de validation Zod
const spectacleSchema = z.object({
  title: z.string().min(1),
  date: z.string().datetime(),
  location: z.string(),
  description: z.string(),
});
```

## Patterns d'Interface Utilisateur

### Pattern de Layout

```typescript
// Layout de base
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### Pattern de Composant Section

```typescript
// Structure type d'une section
export function Section({
  title,
  description,
  children
}: SectionProps) {
  return (
    <section className="py-12">
      <div className="container">
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
      </div>
    </section>
  );
}
```

## Patterns de Sécurité

### Pattern d'Authentification

```typescript
// Middleware de protection des routes
export const config = {
  matcher: ["/protected/:path*"],
};

export async function middleware(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect("/auth/login");
  }
  return NextResponse.next();
}
```

### Pattern de Protection des Données

```sql
-- Politique RLS Supabase type (exemples)
create policy "Accès public aux spectacles"
  on spectacles
  for select
  to anon, authenticated
  using (public = true);

-- Lecture publique des articles de presse publiés (RLS co-localisé dans 08_table_articles_presse.sql)
create policy "Public press articles are viewable by everyone"
  on articles_presse
  for select
  to anon, authenticated
  using (published_at is not null);

-- Gestion admin
create policy "Admins can update press articles"
  on articles_presse
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Vue publique pour contourner les problèmes RLS/JWT Signing Keys (oct. 2025)
-- SECURITY INVOKER: runs with querying user privileges (not creator/definer)
create view articles_presse_public
with (security_invoker = true)
as
select id, title, author, type, chapo, excerpt, source_publication, source_url, published_at, created_at
from articles_presse
where published_at is not null;

-- IMPORTANT: SECURITY INVOKER views require base table GRANT permissions
grant select on articles_presse to anon, authenticated;
grant select on articles_presse_public to anon, authenticated;
```

**Pattern Defense in Depth (oct. 2025)** :

Modèle de sécurité en trois couches pour SECURITY INVOKER views :

1. **VIEW (SECURITY INVOKER)** : Filtre WHERE + exécution avec privilèges utilisateur
2. **GRANT PERMISSIONS** : Contrôle d'accès de base sur table (anon/authenticated SELECT)
3. **RLS POLICIES** : Filtrage fin au niveau des lignes

**Root cause patterns (Troubleshooting RLS)** :

- RLS activé sans policies → PostgreSQL deny all by default (comportement sécurisé)
- SECURITY INVOKER sans GRANT → Vue inaccessible pour anon users
- **Fix** : Appliquer policies RLS + GRANT SELECT sur table base

Optimisations RLS recommandées:

- Appeler les fonctions dans les policies via `(select ...)` pour initPlan.
- Index partiels alignés sur les filtres RLS (ex: `published_at is not null` sur `articles_presse`).
- **Vues publiques** : pour contourner incompatibilités RLS avec JWT Signing Keys, créer des vues avec permissions directes.
- **Testing** : Toujours tester avec `SET ROLE anon` pour simuler utilisateurs anonymes

Documentation complète : `doc/rls-policies-troubleshooting.md`

Optimisations RLS recommandées:

- Appeler les fonctions dans les policies via `(select ...)` pour initPlan.
- Index partiels alignés sur les filtres RLS (ex: `published_at is not null` sur `articles_presse`).

## Patterns de Performance

### Pattern de Chargement d'Image

```typescript
// Utilisation optimisée des images
<Image
  src={imageUrl}
  alt={description}
  width={800}
  height={600}
  placeholder="blur"
  priority={isPriority}
/>
```

### Pattern de Loading State

```typescript
// État de chargement type
export default function Loading() {
  return (
    <div className="loading-container">
      <LoadingSpinner />
      <p>Chargement en cours...</p>
    </div>
  );
}
```

## Patterns de Test

### Pattern de Test Unitaire

```typescript
// Structure type d'un test
describe('SpectacleCard', () => {
  it('affiche correctement les informations du spectacle', () => {
    const spectacle = {
      title: 'Test Spectacle',
      date: '2025-12-01',
    };
    render(<SpectacleCard spectacle={spectacle} />);
    expect(screen.getByText('Test Spectacle')).toBeInTheDocument();
  });
});
```

## Documentation des Patterns

### Pattern de Documentation de Composant

```typescript
/**
 * Affiche une carte de spectacle avec les informations essentielles
 * @param {Spectacle} spectacle - Les données du spectacle à afficher
 * @param {boolean} [isPreview] - Si true, affiche une version réduite
 * @returns {JSX.Element} Carte de spectacle
 */
export function SpectacleCard({ spectacle, isPreview }: SpectacleCardProps) {
  // Implementation
}
```

## Patterns d'Extension

### Pattern de Plugin

```typescript
// Structure type d'un plugin
export interface Plugin {
  name: string;
  init: () => Promise<void>;
  hooks: {
    beforeRender?: () => Promise<void>;
    afterRender?: () => Promise<void>;
  };
}
```

## Pattern WCAG 2.5.5 Target Size (Accessibilité AAA)

Objectif: garantir une taille minimale de 44×44px pour tous les éléments interactifs (boutons, liens, champs de saisie) conformément au critère WCAG 2.5.5 (niveau AAA).

### 1. Composants UI de base (mise à niveau globale)

**Button (`components/ui/button.tsx`):**

```typescript
size: {
  default: "h-11 px-4 py-2",     // 44px (était 36px)
  sm: "h-11 rounded-md px-3",    // 44px (était 32px)
  lg: "h-12 rounded-md px-8",    // 48px (était 40px)
  icon: "h-11 w-11",             // 44px (était 36px)
}
```

**Input (`components/ui/input.tsx`):**

```typescript
className: "h-11 w-full ..."; // 44px (était 36px)
```

### 2. Plugin Tailwind touch-hitbox

Pour les éléments visuellement petits qui nécessitent une zone tactile étendue (ex: indicateurs de slides) :

**Plugin (`lib/plugins/touch-hitbox-plugin.js`):**

```javascript
'.touch-hitbox::before': {
  content: '""',
  position: 'absolute',
  minWidth: '44px',
  minHeight: '44px',
  // ... positionnement centré
}
```

**Usage:**

```tsx
<button className="touch-hitbox overflow-hidden">
  <span className="block w-3 h-3 rounded-full transition-all hover:scale-110">
    {/* Élément visuel petit (12px) */}
  </span>
</button>
```

### 3. Exceptions WCAG autorisées

- **Exception inline** : Liens dans un paragraphe de texte (ex: "Voir nos [<conditions générales>](`/`)")
- **Exception équivalente** : Si plusieurs cibles effectuent la même action, une seule doit respecter 44px
- **Exception essentielle** : Quand modifier la taille changerait l'information (rare, documenter)

### 4. Recommandations mobiles (bis)

```css
@media (max-width: 768px) {
  .interactive-element {
    min-width: 48px; /* Plus généreux sur tactile */
    min-height: 48px;
  }
}
```

Principes:

- **Cohérence** : Tous les boutons/inputs respectent automatiquement 44px minimum
- **Zone stable** : Le plugin `touch-hitbox` crée une zone de détection fixe indépendante des effets visuels (scale, hover)
- **Prévention du trembling** : L'effet `hover:scale-XX` s'applique sur l'enfant, pas sur la zone tactile
- **Documentation** : Voir `.github/copilot/wcag_target_size.instructions.md` et `touch_hitbox.instructions.md`

## Mise à Jour des Patterns

Ces patterns sont mis à jour au fur et à mesure que le projet évolue. Chaque nouveau pattern significatif doit être documenté ici pour maintenir la cohérence du code.

## Cartographie Épiques ↔ Schéma SQL

## Pattern Newsletter Unifiée

Objectif: unifier l'inscription newsletter derrière une API unique, factoriser la logique client via un hook partagé et contrôler l'affichage via un réglage DAL côté serveur.

Composants clés:

### 1. API route `app/api/newsletter/route.ts`

>

- Méthode POST, corps validé par Zod `{ email, consent?, source? }`.
- Upsert idempotent sur `public.abonnes_newsletter` avec `onConflict: 'email'`.
- Stocke `metadata` JSON: `{ consent, source }`.
- Retourne `{ status: 'subscribed' }` en succès, erreurs typées sinon.

### 2. Hook partagé `lib/hooks/useNewsletterSubscribe.ts`

>

- Signature: `useNewsletterSubscribe({ source?: string })`.
- Gère `email`, `isSubscribed`, `isLoading`, `errorMessage` et handlers `handleEmailChange`, `handleSubmit`.
- Appelle `POST /api/newsletter`; surface d'erreur unifiée pour l'UI.

### 3. Gating via DAL `lib/dal/home-newsletter.ts`

- Marqué `server-only`.
- Lit `configurations_site` clé `public:home:newsletter`.
- Valide via Zod et applique des valeurs par défaut (fallback sûrs).
- Les containers serveur retournent `null` si désactivé.

### 4. Server/Client split + Suspense

- Server Container: `NewsletterContainer.tsx` appelle la DAL et rend le Client seulement si activé.
- Client Container: consomme le hook partagé et passe l'état/handlers à la View.
- Envelopper dans `<Suspense fallback={<NewsletterSkeleton />}>` avec délai artificiel (1500 ms) temporaire pour valider l'UX; à retirer avant prod.

Principes:

- Aucune duplication entre Home et Contact: tous les formulaires postent vers la même API et réutilisent le même hook.
- RLS: insert anonyme autorisé sur `abonnes_newsletter` uniquement; lecture/gestion réservées aux admins.
- UI: affiche les messages d'erreur (`errorMessage`) et l'état de succès; neutralise les délais artificiels avant production.

## Pattern Page éditoriale (DAL + Fallback + Suspense)

Objectif: structurer une page éditoriale 100% Server Components en lisant les contenus via une DAL server-only, en enveloppant l’affichage avec Suspense + skeleton, et en garantissant un contenu de secours en cas d’absence de données en base (fallback automatique).

Composants clés (exemple « La Compagnie »):

1. DAL server-only
   - `lib/dal/compagnie.ts` → valeurs institutionnelles, membres d’équipe (RLS lecture publique).
   - `lib/dal/compagnie-presentation.ts` → sections éditoriales dynamiques depuis `public.compagnie_presentation_sections` (triées par `position`, `active = true`).
   - Validation Zod des enregistrements, mapping des champs spécifiques (`quote_text`, `quote_author` → bloc citation), et retour de types sérialisables.

2. Conteneur serveur (orchestration)
   - `components/features/public-site/compagnie/CompagnieContainer.tsx` (Server Component async): agrège les fetchs DAL en parallèle (`Promise.all`), peut inclure un délai artificiel temporaire (1500 ms) pour valider les skeletons durant le design/UX.
   - Passe des props propres à la View (sections, valeurs, équipe) — aucun état client ici.

3. View présentielle (dumb component)
   - `components/features/public-site/compagnie/CompagnieView.tsx`: rend les sections/valeurs/équipe à partir de props; aucun accès direct à la DAL.

4. Suspense + Skeleton
   - `app/compagnie/page.tsx` enveloppe `<CompagnieContainer />` dans `<Suspense fallback={<CompagnieSkeleton />}>`.
   - Conserver Suspense en prod; supprimer les délais artificiels.

5. Fallback automatique (robustesse)
   - Dans `lib/dal/compagnie-presentation.ts`: si la requête échoue ou retourne 0 lignes, retourner un contenu local de secours `compagniePresentationFallback` (ancien mock renommé et marqué « `[DEPRECATED FALLBACK]` »).
   - But: éviter les pages vides en environnement vierge ou lors d’un incident ponctuel; tracer l’erreur côté logs si pertinent.

6. Dépréciation des mocks
   - Les anciens hooks/données mocks sont conservés de façon transitoire avec en-tête `[DEPRECATED MOCK]` et ne doivent plus être importés directement. Toute lecture passe par la DAL côté serveur.

Principes:

- Serveur par défaut pour la lecture; aucune logique de fetching dans les composants client.
- Zod au plus près des frontières de données (DAL) pour sécuriser l’UI.
- Idempotence/robustesse: fallback local strictement limité à l’affichage public.
- Respect RLS: politiques SELECT publiques sur les tables éditoriales; mutations uniquement via back‑office.

## Pattern Page Spectacles (DAL + Suspense + dépréciation hooks)

Objectif: afficher la liste des spectacles à partir de la BDD en lecture serveur, en suivant le même pattern que les autres pages publiques (Server Container, DAL, Suspense/Skeleton), et en dépréciant les anciens hooks clients de mock.

Composants clés:

### 1. DAL server-only

- `lib/dal/spectacles.ts` → lit `public.spectacles` (id, title, slug, short_description, image_url, premiere, public). Retourne un tableau typed; logge les erreurs et fallback vide.

### 2. Conteneur serveur

- `components/features/public-site/spectacles/SpectaclesContainer.tsx` (async Server Component): ajoute un délai artificiel (≈1200 ms) pour valider les skeletons (TODO: remove), récupère les spectacles via DAL, mappe vers les props de `SpectaclesView` et split courant/archives en attendant une logique métier plus fine.

### 3. View présentielle (Client)

## Pattern Kit Média avec URLs Externes

Objectif: permettre le téléchargement de médias (logos, photos, PDFs) via URLs externes stockées dans metadata, sans dépendre de Supabase Storage pour les seeds de démo.

Composants clés:

### 1. Schéma de données flexible

- Table `medias` avec colonne `metadata jsonb` pour stocker des propriétés arbitraires
- Champ `metadata.external_url` (string optionnel) pour URLs de téléchargement externes
- Champ `metadata.type` pour catégoriser les médias (logo, photo, press_kit, etc.)

### 2. Seed avec URLs externes

```sql
-- Exemple de seed avec URL externe
insert into public.medias (storage_path, filename, mime, size_bytes, alt_text, metadata)
select 'photos/spectacle-scene-1.jpg', 'spectacle-scene-1.jpg', 'image/jpeg', 2048000,
  'Scène du spectacle - Photo 1',
  '{"type": "photo", "resolution": "300dpi", "usage": "press", "external_url": "https://images.unsplash.com/photo-xxx?w=1920"}' ::jsonb
where not exists (select 1 from public.medias where storage_path = 'photos/spectacle-scene-1.jpg');
```

### 3. DAL avec priorisation des URLs externes

```typescript
// lib/dal/presse.ts
interface MediaMetadata {
  type?: string;
  title?: string;
  external_url?: string;
  [key: string]: string | number | boolean | undefined;
}

interface MediaRow {
  storage_path: string;
  metadata: MediaMetadata | null;
  // ...
}

export async function fetchMediaKit(): Promise<MediaKitItemDTO[]> {
  const { data } = await supabase
    .from("medias")
    .select("storage_path, metadata, ...")
    .or("storage_path.like.press-kit/%,storage_path.like.photos/%");

  return (data ?? []).map((row: MediaRow) => {
    // Prioriser l'URL externe si disponible
    const externalUrl = row.metadata?.external_url;
    const fileUrl = externalUrl
      ? String(externalUrl)
      : `/storage/v1/object/public/${row.storage_path}`;

    return { fileUrl /* ... */ };
  });
}
```

### 4. Types stricts (pas de `any`)

```typescript
// Interfaces explicites pour chaque type de row
interface MediaRow {
  storage_path: string;
  filename: string | null;
  metadata: MediaMetadata | null;
  // ...
}

// Utilisation stricte dans les maps
return (data ?? []).map((row: MediaRow) => {
  /* ... */
});
```

Principes:

- **Hybride Storage/Externe** : Les médias peuvent pointer vers Supabase Storage (chemin local) OU vers une URL externe (metadata.external_url)
- **Priorisation** : La DAL priorise toujours `metadata.external_url` si présent, sinon utilise `storage_path`
- **Idempotence** : Seeds utilisent `WHERE NOT EXISTS` pour éviter les duplications
- **Conformité TypeScript** : Aucun `any`, interfaces explicites pour tous les types de données
- **Flexibilité** : Permet des seeds de démo fonctionnels (Unsplash, PDFs publics) sans configuration Storage complexe

### 3. View présentielle (Client) (bis)

- `components/features/public-site/spectacles/SpectaclesView.tsx` (client) rend l’UI; affiche `<SpectaclesSkeleton />` si `loading`.

### 4. Suspense + Skeleton

- La page `app/spectacles/page.tsx` peut envelopper le container dans `<Suspense fallback={<SpectaclesSkeleton />}>` pour du streaming progressif.

### 5. Dépréciation des hooks mocks

- `components/features/public-site/spectacles/hooks.ts` → marqué `[DEPRECATED MOCK]`. L’export est retiré du barrel file; toute lecture passe par la DAL côté serveur.

Notes:

- - TODO remapper `genre`, `duration_minutes`, `cast`, `status`, `awards` selon le schéma réel lorsqu'ils seront disponibles (actuellement valeurs par défaut documentées dans le container).

## Pattern Spectacles Archivés (Octobre 2025)

Objectif: afficher les spectacles archivés de manière contrôlée via toggle utilisateur, en utilisant une approche RLS simplifiée.

### Approche choisie

Au lieu de créer une politique RLS complexe, les spectacles archivés sont marqués :

- `public = true` (comme les spectacles courants)
- `status = 'archive'` (pour différenciation)

### Avantages

1. **Simplicité RLS** : Pas besoin de politique additionnelle, la politique standard `public = true` fonctionne
2. **Flexibilité UI** : Le filtrage se fait côté application (Container/View)
3. **Maintenance** : Moins de complexité dans les politiques de sécurité

### Implémentation

```typescript
// Container (Server Component)
const allSpectacles = await fetchAllSpectacles();
const archivedShows = allSpectacles.filter((s) => s.status === "archive");
const currentShows = allSpectacles.filter((s) => s.status !== "archive");

// View (Client Component)
const [showAllArchived, setShowAllArchived] = useState(false);
const displayedArchived = showAllArchived
  ? archivedShows
  : archivedShows.slice(0, threshold);
```

### Migration de données

```sql
-- Seed migration (20250926153000_seed_spectacles.sql)
UPDATE public.spectacles
SET public = true
WHERE status = 'archive';
```

## Pattern UI Flexbox pour Alignement (Octobre 2025)

Objectif: garantir l'alignement des boutons d'action en bas des cartes, indépendamment de la hauteur du contenu variable.

### Pattern de base

```tsx
<Card className="flex flex-col">
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent className="flex-1 flex flex-col">
    <div className="flex-1">
      {/* Contenu variable (description, etc.) */}
      <p>{description}</p>
    </div>
    <Button className="mt-auto">Action</Button>
  </CardContent>
</Card>
```

### Classes clés

- `flex flex-col` sur Card : Active le flex vertical
- `flex-1 flex flex-col` sur CardContent : Prend tout l'espace disponible et active flex interne
- `flex-1` sur le conteneur de contenu : Pousse le contenu vers le haut
- `mt-auto` sur le Button : Pousse le bouton vers le bas

### Cas d'usage

- Press releases cards avec descriptions de longueurs variables
- Cards de spectacles avec différentes quantités d'informations
- Toute grille de cartes nécessitant un alignement cohérent

### Exemple appliqué (PresseView.tsx)

```tsx
{
  pressReleases.map((release) => (
    <Card
      key={release.id}
      className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
    >
      <CardHeader>
        <CardTitle className="text-xl">{release.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          <p className="text-muted-foreground">{release.description}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(release.date_publication), "d MMMM yyyy", {
              locale: fr,
            })}
          </p>
        </div>
        <Button asChild className="mt-auto">
          <Link href={release.pdf_url} target="_blank">
            <Download className="mr-2 h-4 w-4" />
            Télécharger le PDF
          </Link>
        </Button>
      </CardContent>
    </Card>
  ));
}
```

### Résultat

Tous les boutons "Télécharger le PDF" sont parfaitement alignés horizontalement, même si les titres et descriptions ont des longueurs différentes.

## Pattern Warning System (Octobre 2025)

Objectif: permettre les opérations critiques (BDD) même si les opérations secondaires (email) échouent, en retournant un avertissement.

### Pattern de base

```typescript
// API Route avec warning pattern
export async function POST(request: NextRequest) {
  const validated = Schema.parse(await request.json());

  // 1. Opération critique (BDD) toujours prioritaire
  await createRecord(validated);

  // 2. Opération secondaire (email) avec catch silencieux
  let emailSent = true;
  try {
    await sendEmail(validated);
  } catch (error) {
    console.error("[Email] Failed:", error);
    emailSent = false; // Ne pas throw, juste logger
  }

  // 3. Retour avec warning optionnel
  return NextResponse.json(
    {
      status: "success",
      ...(!emailSent && { warning: "Email notification could not be sent" }),
    },
    { status: 201 }
  );
}
```

### Server Action avec warning

```typescript
"use server";

export async function submitAction(formData: FormData) {
  const validated = Schema.parse(extractData(formData));

  // Opération BDD
  await createRecord(validated);

  // Email avec catch
  let emailSent = true;
  try {
    await sendEmail(validated);
  } catch (error) {
    console.error("[Action] Email failed:", error);
    emailSent = false;
  }

  return {
    success: true,
    ...(!emailSent && { warning: "Email could not be sent" }),
  };
}
```

### Cas d'usage

- Newsletter: `{status:'subscribed', warning?:'Confirmation email could not be sent'}`
- Contact: `{status:'sent', warning?:'Admin notification could not be sent'}`
- Toute opération où l'email est secondaire

## Pattern RGPD Data Protection (Octobre 2025)

Objectif: protéger les données personnelles via RLS Supabase et pattern d'insertion sécurisé conforme RGPD.

### DAL avec INSERT sans SELECT

```typescript
"use server";
import "server-only";

export async function createContactMessage(input: ContactInput) {
  const supabase = await createClient();

  // RGPD: INSERT sans SELECT pour éviter exposition RLS
  // Si RLS bloque SELECT, l'erreur n'affecte pas l'insertion
  const { error } = await supabase.from("messages_contact").insert(payload);
  // ❌ PAS DE .select() ici

  if (error) {
    // Idempotence: unique_violation = déjà enregistré = succès
    if (error.code === "23505") {
      return { success: true };
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return { success: true };
}
```

### RLS Policies Pattern

```sql
-- Lecture: Admin seulement (protection données sensibles)
CREATE POLICY "Admin can read personal data"
  ON messages_contact FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Insertion: Public (formulaires)
CREATE POLICY "Anyone can insert messages"
  ON messages_contact FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

### Commentaires RGPD dans le code

```typescript
// lib/dal/contact.ts
// RGPD: Utilise .insert() sans .select() pour éviter les blocages RLS
// Les données personnelles (email, nom) ne sont lisibles que par les admins

// supabase/schemas/10_tables_system.sql
-- RGPD: Seuls les admins peuvent lire les données personnelles
-- (prénom, nom, email, téléphone)
CREATE POLICY "Admin can read all contact messages"...
```

### Principes RGPD

1. **Data Minimization**: Ne retourner que le nécessaire
2. **Access Control**: RLS empêche lecture publique
3. **Insert-only Pattern**: `.insert()` sans `.select()` évite erreurs RLS
4. **Audit Trail**: Logs SQL pour traçabilité
5. **Idempotence**: Error 23505 traité comme succès

### Documentation conformité

- Vérifier conformité avec `.github/instructions/Create_RLS_policies.Instructions.md`
- Vérifier conformité avec `.github/instructions/Declarative_Database_Schema.Instructions.md`
- Documenter dans `doc/RGPD-Compliance-Validation.md`

## Pattern Email Service Architecture (Octobre 2025)

Objectif: architecture en couches pour l'envoi d'emails transactionnels via Resend avec templates React Email, validation Zod, et logging en base de données.

### Architecture en couches

```bash
User → API Endpoint → Zod Validation → DAL Insert →
  Email Action → Template Render → Resend API → Email Sent
```

### Composants clés

**1. Template Layer** (`emails/`)

- Templates React Email avec Tailwind CSS
- `email-layout.tsx` : Layout partagé (header/footer branding)
- `components.utils.tsx` : Composants réutilisables (sections, boutons, texte)
- Templates : `newsletter-confirmation.tsx`, `contact-message-notification.tsx`

**2. Action Layer** (`lib/email/actions.ts`)

```typescript
"use server";

import { Resend } from "resend";
import { SITE_CONFIG } from "@/lib/site-config";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react
}: SendEmailParams) {
  const { data, error } = await resend.emails.send({
    from: SITE_CONFIG.EMAIL.FROM,
    to,
    subject,
    react
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}

export async function sendNewsletterConfirmation(email: string) {
  await sendEmail({
    to: email,
    subject: "Confirmation d'inscription newsletter",
    react: <NewsletterConfirmation email={email} />
  });
}
```

**3. Validation Layer** (`lib/email/schemas.ts`)

```typescript
import { z } from "zod";

export const NewsletterSubscriptionSchema = z.object({
  email: z.string().email("Email invalide"),
  consent: z.boolean().optional(),
  source: z.string().optional(),
});

export type NewsletterSubscription = z.infer<
  typeof NewsletterSubscriptionSchema
>;
```

**4. API Layer** (`app/api/newsletter/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { NewsletterSubscriptionSchema } from "@/lib/email/schemas";
import { createNewsletterSubscription } from "@/lib/dal/home-newsletter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = NewsletterSubscriptionSchema.parse(body);

    // Insert en base (triggers email via Supabase function)
    await createNewsletterSubscription(validated);

    return NextResponse.json({ status: "subscribed" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
```

**5. Custom Hooks** (`lib/hooks/`)

```typescript
// lib/hooks/useNewsletterSubscribe.ts
"use client";

import { useState, FormEvent } from "react";

export function useNewsletterSubscribe({ source }: { source?: string } = {}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true, source }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Subscription failed");
      }

      setIsSubscribed(true);
      setEmail("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    handleSubmit,
    isLoading,
    errorMessage,
    isSubscribed,
  };
}
```

### Principes

- **Server-only actions** : Directive `"use server"` obligatoire sur tous les fichiers d'actions email
- **Validation Zod** : Double validation (runtime + types) pour sécurité maximale
- **Error handling** : Gestion explicite des erreurs avec messages utilisateur clairs
- **Database logging** : Tous les emails envoyés sont loggés dans Supabase pour audit
- **Template consistency** : Utilisation du layout partagé pour branding cohérent
- **Hook reusability** : Hooks partagés dans `lib/hooks/` pour éviter duplication

### Database Tables

```sql
-- abonnes_newsletter
CREATE TABLE public.abonnes_newsletter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  date_inscription timestamptz DEFAULT now(),
  statut text DEFAULT 'active',
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- messages_contact
CREATE TABLE public.messages_contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  consent boolean NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

### Testing

> **Scripts de test** (`scripts/`)

- `test-email-integration.ts` : Test envoi emails via API
- `check-email-logs.ts` : Vérification logs base de données
- `test-webhooks.ts` : Test configuration webhooks Resend

> **Commandes**

```bash
pnpm run test:email     # Test emails
pnpm run test:logs      # Check DB logs
pnpm run test:webhooks  # Test webhooks
pnpm run test:resend    # Run all tests
```

### Documentation

- `memory-bank/architecture/Email_Service_Architecture.md` : Architecture complète
- `TESTING_RESEND.md` : Guide de test
- `.github/instructions/resend_supabase_integration.md` : Instructions d'intégration

### Admin Invitation System Patterns (Novembre 2025)

**Introduced**: 21 novembre 2025 - TASK032 Admin User Invitation System

**Pattern**: Architecture sécurisée pour inviter des utilisateurs externes à devenir admins, avec validation, rate limiting, audit logging et email notifications.

#### Core Components Pattern

```typescript
// 1. DAL Layer - Server-only data access with validation
// lib/dal/admin-users.ts
"use server";
import "server-only";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";

const InviteUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function inviteUser(input: unknown) {
  // Validation
  const validated = InviteUserSchema.parse(input);
  
  // Admin authorization
  await requireAdmin();
  
  // Rate limiting (5 invites/hour per admin)
  await checkRateLimit();
  
  // Business logic
  const supabase = await createClient();
  const { data: existingUser } = await supabase.auth.admin.getUserByEmail(validated.email);
  
  if (existingUser) {
    throw new Error("User already exists");
  }
  
  // Create invitation record
  const invitation = await createInvitationRecord(validated);
  
  // Send invitation email
  await sendInvitationEmail(invitation);
  
  // Audit logging
  await logAdminAction('user_invitation', { email: validated.email });
  
  return invitation;
}
```

#### Email Service Integration Pattern

```typescript
// 2. Email Actions - React Email templates with Resend
// lib/email/actions.ts
"use server";

import { Resend } from "resend";
import { InvitationEmail } from "@/emails/invitation-email";

export async function sendInvitationEmail(invitation: InvitationData) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: invitation.email,
    subject: "Invitation à rejoindre l'équipe admin",
    react: <InvitationEmail 
      firstName={invitation.firstName}
      inviteLink={invitation.inviteLink}
      expiresAt={invitation.expiresAt}
    />
  });
  
  if (error) {
    console.error("[Email] Invitation failed:", error);
    throw new Error("Failed to send invitation email");
  }
  
  return data;
}
```

#### Database Schema Pattern

```sql
-- 3. Database Tables - Invitation tracking with expiration
CREATE TABLE public.user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  invite_token text NOT NULL UNIQUE,
  invite_link text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz NOT NULL,
  invited_by uuid REFERENCES auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies - Admin-only access
CREATE POLICY "Admins can manage invitations"
  ON public.user_invitations
  FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));
```

#### Admin UI Pattern

```typescript
// 4. Admin UI - Smart/Dumb component separation
// components/features/admin/users/UsersManagementContainer.tsx (Smart)
export async function UsersManagementContainer() {
  const invitations = await fetchPendingInvitations();
  const users = await fetchAdminUsers();
  
  return (
    <UsersManagementView 
      invitations={invitations}
      users={users}
      onInvite={inviteUserAction}
      onCancel={cancelInvitationAction}
    />
  );
}

// components/features/admin/users/UsersManagementView.tsx (Dumb)
interface UsersManagementViewProps {
  invitations: Invitation[];
  users: User[];
  onInvite: (data: InviteFormData) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export function UsersManagementView({ 
  invitations, 
  users, 
  onInvite, 
  onCancel 
}: UsersManagementViewProps) {
  // Pure presentation logic
  return (
    <div className="space-y-6">
      <InviteUserForm onSubmit={onInvite} />
      <InvitationsList invitations={invitations} onCancel={onCancel} />
      <AdminUsersList users={users} />
    </div>
  );
}
```

#### Security Patterns

**Rate Limiting Pattern**:

```typescript
// Rate limiting - 5 invites per hour per admin
async function checkRateLimit() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { count } = await supabase
    .from('user_invitations')
    .select('*', { count: 'exact', head: true })
    .eq('invited_by', user!.id)
    .gte('created_at', oneHourAgo.toISOString());
    
  if (count >= 5) {
    throw new Error("Rate limit exceeded: 5 invitations per hour");
  }
}
```

**Audit Logging Pattern**:

```typescript
// Audit trail for admin actions
async function logAdminAction(action: string, details: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('admin_audit_log').insert({
    admin_id: user!.id,
    action,
    details,
    ip_address: getClientIP(),
    user_agent: getUserAgent(),
  });
}
```

#### Error Handling Pattern

```typescript
// Graceful degradation - Primary operations succeed even if secondary fail
export async function inviteUser(input: unknown) {
  try {
    // Primary: Create invitation record
    const invitation = await createInvitationRecord(validated);
    
    // Secondary: Send email (don't fail if email fails)
    try {
      await sendInvitationEmail(invitation);
    } catch (emailError) {
      console.error("[Invitation] Email failed:", emailError);
      // Log but don't throw - invitation is still valid
    }
    
    return { success: true, invitation };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
```

#### Testing Patterns

**Integration Testing**:

```typescript
// scripts/test-full-invitation.js
async function testInvitationFlow() {
  console.log("🧪 Testing admin invitation flow...");
  
  // 1. Create invitation
  const inviteResult = await createTestInvitation();
  expect(inviteResult.success).toBe(true);
  
  // 2. Verify database record
  const dbRecord = await checkInvitationInDB(inviteResult.invitation.id);
  expect(dbRecord.status).toBe('pending');
  
  // 3. Verify email sent (mock or check logs)
  const emailSent = await checkEmailLogs(inviteResult.invitation.email);
  expect(emailSent).toBe(true);
  
  console.log("✅ Invitation flow test passed");
}
```

**Security Testing**:

```typescript
// scripts/test-admin-access.ts
async function testInvitationSecurity() {
  // Test 1: Non-admin cannot invite
  const nonAdminResult = await attemptInviteAsNonAdmin();
  expect(nonAdminResult.error).toContain("Unauthorized");
  
  // Test 2: Rate limiting works
  await createMultipleInvitations(6); // Exceed limit
  const rateLimitResult = await createOneMoreInvitation();
  expect(rateLimitResult.error).toContain("Rate limit exceeded");
  
  // Test 3: Duplicate emails blocked
  const duplicateResult = await inviteExistingEmail();
  expect(duplicateResult.error).toContain("User already exists");
}
```

#### Migration Patterns

**Database Migrations**:

```sql
-- 20251121185458_allow_admin_update_profiles.sql
-- Allow admins to update user profiles for invitation management
GRANT UPDATE ON public.profiles TO authenticated;
-- Note: RLS policies restrict to admin users only

-- 20251120231121_create_user_invitations.sql
CREATE TABLE public.user_invitations (...);
-- RLS policies ensure only admins can manage invitations

-- 20251120231146_create_pending_invitations.sql
-- Additional indexes and constraints for performance
CREATE INDEX idx_user_invitations_status_expires 
ON public.user_invitations(status, expires_at);
```

**Environment Variables**:

```bash
# .env.example updates
# Email service for invitations
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Invitation settings
INVITATION_EXPIRE_HOURS=24
MAX_INVITES_PER_HOUR=5
```

#### Dev/Redirect Pattern for Emails

```typescript
// lib/email/utils/dev-redirect.ts
export function getEmailRecipient(originalEmail: string): string {
  if (process.env.NODE_ENV === 'development') {
    return process.env.DEV_EMAIL_REDIRECT || 'dev@example.com';
  }
  return originalEmail;
}

// Usage in email actions
const recipient = getEmailRecipient(invitation.email);
await sendEmail({ to: recipient, ... });
```

**Benefits**:

1. **Development Safety**: All emails redirect to dev email in development
2. **Production Integrity**: Real emails sent in production
3. **Testing Flexibility**: Easy to test email flows without spamming real users
4. **Configuration Simplicity**: Single environment variable controls behavior

#### Complete Flow Architecture

```bash
Admin UI → Server Action → DAL Validation → Database Insert → Email Service → Audit Log
     ↓              ↓              ↓                    ↓              ↓            ↓
  Form       Rate Limiting   Admin Auth         RLS Policies    React Email   Admin Log
```

**Key Principles**:

- **Defense in Depth**: Multiple security layers (auth, RLS, rate limiting, validation)
- **Graceful Degradation**: Core functionality works even if email fails
- **Audit Trail**: All admin actions logged for compliance
- **User Experience**: Clear error messages and loading states
- **Testability**: Comprehensive test scripts for all components
- **Scalability**: Rate limiting and efficient database queries

**References**:

- Implementation: `lib/dal/admin-users.ts`, `lib/email/actions.ts`
- UI: `app/(admin)/admin/users/`, `components/features/admin/users/`
- Database: `supabase/migrations/2025112*`
- Tests: `scripts/test-full-invitation.js`, `scripts/test-admin-access.ts`
- Documentation: `memory-bank/tasks/TASK032-user-role-management.md`

## Pattern Client-Side Token Processing for Invitations (Novembre 2025)

**Introduced**: 22 novembre 2025 - Critical fix for invitation system 404 error

**Problem**: Users clicking invitation email links were getting 404 errors on `/auth/setup-account` because Supabase invitation tokens are passed in the URL hash (`#access_token=...`) instead of query parameters, but server-side middleware couldn't access hash-based tokens.

**Root Cause**:

- Supabase Auth uses URL fragments (`#`) for sensitive tokens to prevent server-side logging
- Next.js middleware runs server-side and cannot read `window.location.hash`
- Server Components cannot access client-side URL state**Solution Pattern**: Convert setup-account page to Client Component that extracts tokens from `window.location.hash` and establishes Supabase session client-side.

### Client Component Pattern for Auth Pages

```typescript
// app/(marketing)/auth/setup-account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { SetupAccountForm } from "@/components/auth/SetupAccountForm";

export default function SetupAccountPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function processInvitationToken() {
      try {
        // Extract tokens from URL hash (client-side only)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (!accessToken || type !== "signup") {
          setError("Invalid or expired invitation link");
          setIsProcessing(false);
          return;
        }

        // Establish Supabase session with invitation tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });

        if (sessionError || !data.user) {
          throw sessionError || new Error("Failed to establish session");
        }

        // Fetch invitation details from database
        const { data: invitation } = await supabase
          .from("user_invitations")
          .select("*")
          .eq("invite_token", hashParams.get("invite_token"))
          .single();

        if (!invitation) {
          throw new Error("Invitation not found");
        }

        // Clear URL hash for security
        window.history.replaceState(null, "", window.location.pathname);

        setInvitationData(invitation);
        setIsProcessing(false);
      } catch (err) {
        console.error("[SetupAccount] Token processing failed:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setIsProcessing(false);
      }
    }

    processInvitationToken();
  }, [supabase.auth]);

  if (isProcessing) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!invitationData) {
    return <InvalidInvitation />;
  }

  return <SetupAccountForm invitation={invitationData} />;
}
```

#### Key Implementation Details

**1. Client-Side Token Extraction**:

```typescript
// ❌ Server-side approach (doesn't work)
const searchParams = useSearchParams(); // Cannot access hash
const token = searchParams.get("access_token"); // null

// ✅ Client-side approach
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get("access_token"); // Works!
```

**2. Session Establishment**:

```typescript
const { data, error } = await supabase.auth.setSession({
  access_token: accessToken,
  refresh_token: refreshToken || "",
});
```

**3. Security Cleanup**:

```typescript
// Remove sensitive tokens from URL after processing
window.history.replaceState(null, "", window.location.pathname);
```

**4. Error Handling with User Context**:

```typescript
if (error.includes("expired")) {
  return <ExpiredInvitation onResend={handleResend} />;
}
if (error.includes("already accepted")) {
  return <AlreadyAccepted redirectTo="/auth/login" />;
}
```

#### Database Schema Updates

```sql
-- Add invite_token column for token lookup
ALTER TABLE public.user_invitations 
ADD COLUMN invite_token text UNIQUE;

-- Update invitation creation to generate secure tokens
UPDATE public.user_invitations 
SET invite_token = encode(gen_random_bytes(32), 'hex')
WHERE invite_token IS NULL;
```

#### Email Template Updates

```typescript
// lib/email/actions.ts
const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/setup-account#access_token=${accessToken}&refresh_token=${refreshToken}&type=signup&invite_token=${inviteToken}`;
```

#### Testing Pattern

```typescript
// scripts/test-invitation-flow.ts
async function testInvitationFlow() {
  // 1. Create invitation
  const invitation = await createTestInvitation();
  
  // 2. Simulate email click (construct URL with hash)
  const inviteUrl = `${BASE_URL}/auth/setup-account#access_token=${invitation.accessToken}&type=signup`;
  
  // 3. Test page load and token processing
  const pageResponse = await fetch(inviteUrl);
  expect(pageResponse.status).toBe(200);
  
  // 4. Verify session establishment
  const { data: { user } } = await supabase.auth.getUser();
  expect(user?.email).toBe(invitation.email);
}
```

#### Security Considerations

**Token Handling**:

- Tokens processed client-side only (never server-side)
- URL hash cleared after session establishment
- Tokens expire after 24 hours (configurable)

**Session Security**:

- `setSession()` establishes authenticated session
- Automatic token refresh via Supabase
- Middleware protects admin routes

**Error Boundaries**:

- Invalid tokens show user-friendly error messages
- Expired invitations offer resend option
- Network errors handled gracefully

#### Migration Checklist

- [x] Convert `/auth/setup-account` to Client Component
- [x] Update email templates to use hash-based URLs
- [x] Add `invite_token` column to database
- [x] Update invitation creation logic
- [x] Test end-to-end invitation flow
- [x] Update documentation

#### Performance Impact

- **Before**: 404 errors, broken user experience
- **After**: Seamless invitation acceptance, ~2-5ms token processing
- **JWT Optimization**: Uses fast `getClaims()` instead of `getUser()`

#### References

- Implementation: `app/(marketing)/auth/setup-account/page.tsx`
- Email templates: `emails/invitation-email.tsx`
- Database: `supabase/migrations/20251122*`
- Tests: `scripts/test-invitation-flow.ts`
- Documentation: `memory-bank/activeContext.md` (entry 2025-11-22)
