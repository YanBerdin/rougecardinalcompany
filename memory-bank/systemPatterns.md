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

### Pattern de Server Compo### 3. Exceptions WCAG autorisées

- **Exception inline** : Liens dans un paragraphe de texte (exemple: lien intégré dans une phrase)
- **Exception équivalente** : Si plusieurs cibles effectuent la même action, une seule doit respecter 44px
- **Exception essentielle** : Quand modifier la taille changerait l'information (rare, documenter)

### 4. Recommandations mobiles

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
className: "h-11 w-full ..." // 44px (était 36px)
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

- **Exception inline** : Liens dans un paragraphe de texte (ex: "Voir nos [conditions générales](/)")
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
- Signature: `useNewsletterSubscription({ source?: string })`.
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

    return { fileUrl, /* ... */ };
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
return (data ?? []).map((row: MediaRow) => { /* ... */ });
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
const archivedShows = allSpectacles.filter(s => s.status === 'archive');
const currentShows = allSpectacles.filter(s => s.status !== 'archive');

// View (Client Component)
const [showAllArchived, setShowAllArchived] = useState(false);
const displayedArchived = showAllArchived ? archivedShows : archivedShows.slice(0, threshold);
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
    <Button className="mt-auto">
      Action
    </Button>
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
{pressReleases.map((release) => (
  <Card key={release.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="text-xl">{release.title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-1 flex flex-col">
      <div className="flex-1 space-y-4">
        <p className="text-muted-foreground">{release.description}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(release.date_publication), "d MMMM yyyy", { locale: fr })}
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
))}
```

### Résultat

Tous les boutons "Télécharger le PDF" sont parfaitement alignés horizontalement, même si les titres et descriptions ont des longueurs différentes.
