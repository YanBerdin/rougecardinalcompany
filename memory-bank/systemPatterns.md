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
// lib/dal/home-news.ts
import 'server-only';
import { createClient } from '@/supabase/server';

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
```

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

## Pattern Newsletter Unifiée

Objectif: unifier l'inscription newsletter derrière une API unique, factoriser la logique client via un hook partagé et contrôler l'affichage via un réglage DAL côté serveur.

Composants clés:

1. API route `app/api/newsletter/route.ts`
  - Méthode POST, corps validé par Zod `{ email, consent?, source? }`.
  - Upsert idempotent sur `public.abonnes_newsletter` avec `onConflict: 'email'`.
  - Stocke `metadata` JSON: `{ consent, source }`.
  - Retourne `{ status: 'subscribed' }` en succès, erreurs typées sinon.

2. Hook partagé `lib/hooks/useNewsletterSubscribe.ts`
  - Signature: `useNewsletterSubscription({ source?: string })`.
  - Gère `email`, `isSubscribed`, `isLoading`, `errorMessage` et handlers `handleEmailChange`, `handleSubmit`.
  - Appelle `POST /api/newsletter`; surface d'erreur unifiée pour l'UI.

3. Gating via DAL `lib/dal/home-newsletter.ts`
  - Marqué `server-only`.
  - Lit `configurations_site` clé `public:home:newsletter`.
  - Valide via Zod et applique des valeurs par défaut (fallback sûrs).
  - Les containers serveur retournent `null` si désactivé.

4. Server/Client split + Suspense
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
   - Dans `lib/dal/compagnie-presentation.ts`: si la requête échoue ou retourne 0 lignes, retourner un contenu local de secours `compagniePresentationFallback` (ancien mock renommé et marqué « [DEPRECATED FALLBACK] »).
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

1. DAL server-only
  - `lib/dal/spectacles.ts` → lit `public.spectacles` (id, title, slug, short_description, image_url, premiere, public). Retourne un tableau typed; logge les erreurs et fallback vide.

2. Conteneur serveur
  - `components/features/public-site/spectacles/SpectaclesContainer.tsx` (async Server Component): ajoute un délai artificiel (≈1200 ms) pour valider les skeletons (TODO: remove), récupère les spectacles via DAL, mappe vers les props de `SpectaclesView` et split courant/archives en attendant une logique métier plus fine.

3. View présentielle (Client)
  - `components/features/public-site/spectacles/SpectaclesView.tsx` (client) rend l’UI; affiche `<SpectaclesSkeleton />` si `loading`.

4. Suspense + Skeleton
  - La page `app/spectacles/page.tsx` peut envelopper le container dans `<Suspense fallback={<SpectaclesSkeleton />}>` pour du streaming progressif.

5. Dépréciation des hooks mocks
  - `components/features/public-site/spectacles/hooks.ts` → marqué `[DEPRECATED MOCK]`. L’export est retiré du barrel file; toute lecture passe par la DAL côté serveur.

Notes:
- TODO remapper `genre`, `duration_minutes`, `cast`, `status`, `awards` selon le schéma réel lorsqu’ils seront disponibles (actuellement valeurs par défaut documentées dans le container).

