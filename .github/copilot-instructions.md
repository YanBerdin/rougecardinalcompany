# GitHub Copilot Instructions - Rouge Cardinal Company

## 🏗️ Architecture Overview

**Next.js 15 App Router** avec architecture en couches :
- **Server Components** (défaut) : Data fetching, SEO, rendu initial
- **Client Components** (`'use client'`) : Interactivité, hooks, événements utilisateur
- **Smart/Dumb Pattern** : Containers (logique métier) → Views (présentation pure)

**Supabase Integration** :
- `@supabase/ssr` (moderne) vs `@supabase/auth-helpers` (legacy)
- `getClaims()` pour l'authentification (~2-5ms vs ~300ms)
- RLS (Row Level Security) activé sur toutes les tables
- DAL (Data Access Layer) avec validation Zod

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── auth/                     # Routes d'authentification
│   ├── protected/                # Routes protégées
│   └── layout.tsx               # Layout racine
├── components/
│   ├── features/                # Composants métier (Smart/Dumb)
│   │   └── public-site/home/    # Feature: page d'accueil
│   └── ui/                      # Composants réutilisables (shadcn/ui)
├── lib/
│   ├── dal/                     # Data Access Layer (Server Actions)
│   ├── hooks/                   # Custom hooks
│   └── utils.ts                 # Utilitaires partagés
├── supabase/
│   ├── schemas/                 # Migrations SQL + RLS policies
│   ├── server.ts                # Client serveur Supabase
│   └── middleware.ts            # Middleware auth
└── middleware.ts                # Middleware Next.js
```

## 🔧 Development Workflow

### Démarrage
```bash
pnpm dev  # Turbopack activé (--turbopack)
```

### Variables d'environnement
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Admin seulement
```

### Build & Déploiement
```bash
pnpm build  # Production build
pnpm start  # Serveur production
```

## 🎯 Patterns Essentiels

### 1. Server/Client Components
```tsx
// ❌ MAUVAIS - Client Component avec data fetching
'use client'
export function BadComponent() {
  const [data, setData] = useState(null);
  // Data fetching côté client = mauvais pour SEO/perfs
}

// ✅ BON - Server Component pour data, Client pour UI
export async function GoodContainer() {
  const data = await fetchData(); // Server-side
  return <GoodClient data={data} />;
}

'use client'
export function GoodClient({ data }) {
  const [state, setState] = useState(data);
  // Interactivité côté client uniquement
}
```

### 2. Smart/Dumb Components
```tsx
// Smart Component (Container) - Logique métier
export async function HeroContainer() {
  const slides = await fetchActiveHomeHeroSlides();
  return <HeroClient initialSlides={slides} />;
}

// Dumb Component (View) - Présentation pure
export function HeroView({ slides, currentSlide, onNextSlide }) {
  return (
    <div>
      {slides.map((slide, index) => (
        <div key={index} className={index === currentSlide ? 'active' : ''}>
          {slide.title}
        </div>
      ))}
    </div>
  );
}
```

### 3. Data Access Layer (DAL)
```tsx
// lib/dal/contact.ts
"use server";
import "server-only";
import { z } from "zod";
import { createClient } from "@/supabase/server";

const ContactSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function createContactMessage(input: ContactMessageInput) {
  const validated = ContactSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("messages_contact").insert(validated);
  if (error) throw new Error("Failed to submit contact message");
  return { ok: true };
}
```

### 4. Authentification Supabase
```tsx
// Middleware - Vérification auth
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...);
  const claims = await supabase.auth.getClaims(); // ~2-5ms ⚡

  if (request.nextUrl.pathname.startsWith("/protected") && !claims) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

// Client auth
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);
```

### 5. Hooks Personnalisés
```tsx
// lib/hooks/useNewsletterSubscribe.ts
"use client";
export function useNewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true })
      });
      if (!res.ok) throw new Error('Subscription failed');
      setEmail('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, handleSubmit, isLoading };
}
```

## 🔒 Sécurité & RLS

### Politiques RLS (exemple newsletter)
```sql
-- Table: abonnes_newsletter
ALTER TABLE public.abonnes_newsletter ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut s'abonner
CREATE POLICY "Anyone can subscribe"
ON public.abonnes_newsletter FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Seuls les admins peuvent voir/gérer
CREATE POLICY "Admins can manage subscribers"
ON public.abonnes_newsletter FOR ALL
TO authenticated
USING ((select public.is_admin()));
```

### Validation Input
```tsx
// Toujours valider côté serveur avec Zod
const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
  consent: z.boolean().refine(v => v === true)
});
```

## 🎨 UI/UX Patterns

### shadcn/ui Components
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Composants cohérents avec le design system
<Button variant="default" size="lg">
  Action principale
</Button>
```

### Responsive Design
```tsx
// Mobile-first avec Tailwind
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Contenu responsive */}
</div>
```

### Loading States
```tsx
// Skeletons pour meilleure UX
<Suspense fallback={<HeroSkeleton />}>
  <HeroContainer />
</Suspense>
```

## 🚀 Performance

### Optimisations Next.js
- **Server Components** pour data fetching initial
- **Suspense** pour loading states
- **Image optimization** avec Next.js Image
- **Code splitting** automatique

### Supabase Optimisations
- `getClaims()` au lieu de `getSession()` (100x plus rapide)
- Requêtes optimisées avec select spécifique
- Indexes sur les colonnes fréquemment filtrées

## 📝 Conventions de Code

### Nommage
- **Composants** : `PascalCase` (HeroContainer, HeroView)
- **Fichiers** : `PascalCase.tsx` ou `kebab-case.ts`
- **Variables** : `camelCase`
- **Types** : `PascalCase` avec suffixe (HeroSlide, ContactFormData)

### Imports
```tsx
// Imports locaux avec alias @
import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";

// Imports externes groupés
import { useState, useEffect } from "react";
import { z } from "zod";
```

### Structure Fichiers
```tsx
// Composant complexe = dossier
hero/
├── HeroContainer.tsx    # Smart component
├── HeroClient.tsx       # Client logic
├── HeroView.tsx         # Dumb component
├── types.ts            # Types locaux
└── index.ts            # Exports
```

## 🔍 Debugging

### Logs Structurés
```tsx
// Logs cohérents avec contexte
console.log('[Hero] Loading slides for home page');
console.error('[Auth] Login failed:', error);
```

### Error Handling
```tsx
try {
  const result = await supabase.from('table').select('*');
  if (result.error) throw new Error(`DB Error: ${result.error.message}`);
} catch (error) {
  console.error('[Component] Operation failed:', error);
  // Gestion d'erreur utilisateur
}
```

## 🏗️ Architecture Détaillée

### Feature-Based Organization

**Core Principles**:
Organize code by business functionality with clear separation between data handling and presentation. Each feature is self-contained but can expose public APIs to other features.

**Project Features**:
- `auth`: Authentication, login, user management
- `content`: Article/content management, CRUD operations
- `public-site`: Homepage, company info, shows display
- `admin`: Dashboard, backoffice interface, analytics

**Complete Feature Structure**:
```bash
components/
  features/
    auth/                    # Authentication feature
      AuthContainer.tsx      # Smart component (Server/Client)
      AuthGuard.tsx         # Smart component for route protection
      LoginForm.tsx         # Dumb component
      SignUpForm.tsx        # Dumb component
      types.ts              # Auth-specific types and Zod schemas
      hooks.ts              # useAuth, useLogin, useSignUp hooks

    content/                 # Content management feature
      ContentContainer.tsx   # Smart component (Server/Client)
      ContentEditor.tsx     # Smart component for editing
      ArticleCard.tsx       # Dumb component
      ArticleList.tsx       # Dumb component
      ArticleGrid.tsx       # Dumb component
      types.ts              # Content types and validation schemas
      hooks.ts              # useContent, useArticles, useCreateArticle hooks

    public-site/            # Public website feature
      HeroContainer.tsx     # Smart component (Server for SEO)
      Hero.tsx             # Dumb component
      NewsContainer.tsx    # Smart component (Server for SEO)
      NewsList.tsx         # Dumb component
      ShowsContainer.tsx   # Smart component
      ShowCard.tsx         # Dumb component
      types.ts             # Public site types
      hooks.ts             # usePublicContent, useShows hooks

    admin/                  # Admin interface feature
      DashboardContainer.tsx # Smart component (Client for interactivity)
      Dashboard.tsx         # Dumb component
      StatsContainer.tsx    # Smart component
      StatsCard.tsx         # Dumb component
      UserManagement.tsx   # Dumb component
      types.ts             # Admin types and schemas
      hooks.ts             # useAdminData, useStats, useUserManagement hooks

  ui/                       # Reusable dumb components
    button.tsx
    card.tsx
    input.tsx
    modal.tsx
    skeleton.tsx
    ...

  layout/                   # Layout components
    header.tsx
    footer.tsx
    sidebar.tsx
    navigation.tsx
```

### Smart/Dumb Component Pattern

**Smart Components (Containers)**:
- **Responsibilities**: Data fetching, business logic, state management, side effects
- **Server vs Client**: Server for data fetching, Client for interactivity
- **Naming**: `Container` suffix (ContentContainer, AuthContainer)

**Dumb Components (Presentational)**:
- **Responsibilities**: Pure rendering, UI interactions, accessibility
- **Characteristics**: No business logic, easily testable, reusable
- **Naming**: Business names (ArticleCard, LoginForm)

### Data Flow Architecture

**Complete Flow Pattern**:
1. **Page/Layout** → imports Smart Component (Container)
2. **Smart Component (Server)** → fetches initial data server-side
3. **Smart Component (Client)** → uses hooks for client-side data management
4. **Smart Component** → processes business logic, handles errors
5. **Smart Component** → passes clean data as props to Dumb Components
6. **Dumb Components** → render UI and trigger callback events
7. **Smart Component** → handles callbacks, updates state, triggers side effects
8. **Hooks** → manage API calls, caching, and data synchronization

## 🛠️ Code Quality Standards

### Maintainability
- Write self-documenting code with clear naming
- Use PascalCase for component names and files
- Use camelCase for variables, functions, and instance methods
- Keep components focused on single responsibilities
- Organize hooks at the top of components
- Use React hooks appropriately (useState, useEffect, useCallback)
- Follow feature-based folder structure for new components

### Performance
- Use useCallback for event handlers in components
- Implement appropriate memoization using React.memo or useMemo
- Optimize images using Next.js Image component
- Apply loading states and skeletons for async operations
- Use efficient state management techniques
- Implement pagination or virtualization for large lists

### Security
- Validate all user inputs with Zod schemas
- Use Supabase's built-in security features
- Never expose sensitive information in client-side code
- Follow secure authentication patterns as seen in auth components
- Implement proper security checks in API routes

### Accessibility
- Use semantic HTML elements (buttons for actions, anchors for navigation)
- Include proper ARIA attributes where necessary
- Ensure keyboard navigation support
- Maintain sufficient color contrast
- Provide text alternatives for images
- Respect user preferences (like reduced motion)

### Testability
- Write code that is easy to test
- Keep components small and focused
- Avoid complex side effects
- Allow for dependency injection where appropriate
- Use clear interfaces and props

## 📋 Checklist Développement

### Avant commit
- [ ] ESLint passe (`pnpm lint`)
- [ ] Types TypeScript valides
- [ ] Tests passent (si présents)
- [ ] RLS policies respectées
- [ ] Composants testés manuellement

### Nouvelles Features
- [ ] DAL créé dans `lib/dal/`
- [ ] Composants dans `components/features/`
- [ ] Types dans fichiers dédiés
- [ ] Hooks dans `lib/hooks/`
- [ ] RLS policies ajoutées si nouvelle table

### Code Review Checklist
- [ ] Architecture respectée (Smart/Dumb pattern)
- [ ] DAL utilisé pour data access
- [ ] Validation Zod côté serveur
- [ ] Error handling approprié
- [ ] Performance optimisée
- [ ] Accessibilité respectée

---

**Priorité** : Respecter l'architecture existante. Quand en doute, examiner les patterns dans `lib/dal/`, `components/features/`, et `supabase/schemas/`.</content>
<parameter name="filePath">/home/yandev/projets/rougecardinalcompany/.github/copilot-instructions.md