# Patterns Système

## Patterns Architecturaux

### App Router Pattern

```typescript
// Structure type d'une route
app/
  layout.tsx       // Layout partagé
  page.tsx         // Page principale
  loading.tsx      // État de chargement
  error.tsx        // Gestion d'erreur
  [param]/         // Route dynamique
    page.tsx       // Page avec paramètre
```

### Pattern de Server Components

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

### Pattern DAL (Data Access Layer) côté serveur

```typescript
// lib/dal/news.ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function fetchFeaturedPressReleases(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('communiques_presse')
    .select('id, title, slug, description, date_publication, image_url')
    .eq('public', true)
    .order('date_publication', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
```

Principes:

1. Modules `lib/dal/*` marqués `server-only` et sans code client.
2. Les pages/composants serveur appellent la DAL directement; les composants client reçoivent des props sérialisables.
3. Les requêtes respectent les RLS (lecture publique) et délèguent la logique métier au SQL quand pertinent.

### Pattern Suspense + Skeletons

```tsx
import { Suspense } from 'react';
import { NewsSkeleton } from './NewsSkeleton';
import NewsContainer from './NewsContainer';

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
    .from('spectacles')
    .select('id, title, slug, image_url')
    .eq('public', true)
    .order('updated_at', { ascending: false })
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
-- Politique RLS Supabase type
create policy "Accès public aux spectacles"
  on spectacles
  for select
  to anon
  using (published = true);
```

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
export function SpectacleCard({ 
  spectacle,
  isPreview 
}: SpectacleCardProps) {
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

## Mise à Jour des Patterns

Ces patterns sont mis à jour au fur et à mesure que le projet évolue. Chaque nouveau pattern significatif doit être documenté ici pour maintenir la cohérence du code.

## Cartographie Épiques ↔ Schéma SQL
