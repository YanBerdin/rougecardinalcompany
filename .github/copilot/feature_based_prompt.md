```yaml
description: |
  Organiser le code Next.js/Supabase par feature avec pattern smart/dumb components
  pour un site vitrine avec backoffice. Séparation claire entre logique métier et présentation.
globs: |
  app/**/*.tsx,
  app/**/*.ts,
  components/**/*.tsx,
  components/**/*.ts,
  lib/hooks/**/*.ts,
  lib/types/**/*.ts
alwaysApply: true
```

---

# Feature-Based Architecture avec Smart/Dumb Components

## 1. Organisation par Feature

### Structure des features

```bash
components/
  features/
    auth/                    # Authentification backoffice
      AuthContainer.tsx      # Smart component
      LoginForm.tsx         # Dumb component
      AuthGuard.tsx         # Smart component
      types.ts              # Types spécifiques
      hooks.ts              # Hooks custom
    
    content/                 # Gestion de contenu
      ContentContainer.tsx   # Smart component
      ArticleCard.tsx       # Dumb component
      ArticleList.tsx       # Dumb component
      ContentEditor.tsx     # Dumb component
      types.ts
      hooks.ts
    
    public-site/            # Site vitrine public
      HeroContainer.tsx     # Smart component
      Hero.tsx             # Dumb component
      NewsContainer.tsx    # Smart component
      NewsList.tsx         # Dumb component
      types.ts
      hooks.ts
    
    admin/                  # Interface backoffice
      DashboardContainer.tsx # Smart component
      Dashboard.tsx         # Dumb component
      StatsCard.tsx        # Dumb component
      types.ts
      hooks.ts
  
  ui/                       # Composants dumb réutilisables
    button.tsx
    card.tsx
    input.tsx
    ...
  
  layout/                   # Composants de layout
    header.tsx
    footer.tsx
    sidebar.tsx
```

## 2. Pattern Smart/Dumb Components

### Smart Components (Containers)

- **Responsabilités** :
  - Gestion des données (fetch, mutations, cache)
  - Logique métier et validation
  - État global et local
  - Effets de bord (API calls, navigation)
  - Orchestration des dumb components

- **Server vs Client** :
  - **Server Components** (par défaut) : Data fetching, logique serveur
  - **Client Components** : Ajoutez `'use client'` pour interactivité, state, browser APIs

- **Conventions de nommage** :
  - Suffixe `Container` : `AuthContainer`, `ContentContainer`
  - Ou nom métier : `AuthProvider`, `ContentManager`

- **Structure type** :

```tsx
// Smart Component Example (Server Component par défaut)
export async function ContentContainer() {
  const { articles, loading, error, createArticle } = useContent()
  const { user } = useAuth()
  
  const handleCreate = async (data: CreateArticleData) => {
    try {
      await createArticle(data)
      toast.success('Article créé')
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
  }
  
  if (loading) return <ContentSkeleton />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <ContentManager
      articles={articles}
      onCreateArticle={handleCreate}
      canEdit={user?.role === 'admin'}
    />
  )
}
```

### Dumb Components (Presentational)

- **Responsabilités** :
  - Affichage pur basé sur les props
  - Interactions UI simples (hover, focus)
  - Composition et layout
  - Pas d'appels API directs

- **Conventions** :
  - Interfaces TypeScript strictes
  - Props explicites et typées
  - Composants purement fonctionnels
  - Réutilisables entre features

- **Structure type** :

```tsx
// Dumb Component Example
interface ContentManagerProps {
  articles: Article[]
  onCreateArticle: (data: CreateArticleData) => void
  canEdit: boolean
}

export function ContentManager({ 
  articles, 
  onCreateArticle, 
  canEdit 
}: ContentManagerProps) {
  return (
    <div className="space-y-6">
      {canEdit && (
        <CreateArticleForm onSubmit={onCreateArticle} />
      )}
      <ArticleGrid articles={articles} />
    </div>
  )
}
```

## 3. Hooks et Types par Feature

### Custom Hooks (`hooks.ts`)

```tsx
// features/content/hooks.ts
export function useContent() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles
  })
  
  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => queryClient.invalidateQueries(['articles'])
  })
  
  return {
    articles: articles || [],
    loading: isLoading,
    createArticle: createMutation.mutate
  }
}
```

### Types spécifiques (`types.ts`)

```tsx
// features/content/types.ts
export interface Article {
  id: string
  title: string
  content: string
  status: 'draft' | 'published'
  createdAt: string
}

export interface CreateArticleData {
  title: string
  content: string
}

export interface ContentManagerProps {
  articles: Article[]
  onCreateArticle: (data: CreateArticleData) => void
  canEdit: boolean
}
```

## 4. Règles d'Implementation

### Flux de données

1. **Smart component** → appelle les hooks
2. **Hook** → fait l'appel API/Supabase
3. **Smart component** → passe les données aux dumb components
4. **Dumb component** → affiche et déclenche des callbacks
5. **Smart component** → gère les callbacks et met à jour l'état

### Séparation des responsabilités

- **Pages Next.js** (`app/`) → routing et layout
- **Smart components** → logique et données
- **Dumb components** → présentation pure
- **Hooks** → intégration API/Supabase
- **Types** → contrats d'interface

### Réutilisabilité

- **Dumb components** → réutilisables entre features
- **Smart components** → spécifiques à une feature
- **Hooks** → réutilisables si logique commune
- **Types** → partagés via `lib/types/` si nécessaire

## 5. Intégration Next.js/Supabase

### Pages Next.js

```tsx
// app/admin/content/page.tsx
import { ContentContainer } from '@/components/features/content/ContentContainer'

export default function AdminContentPage() {
  return (
    <div className="container mx-auto p-6">
      <h1>Gestion du contenu</h1>
      <ContentContainer />
    </div>
  )
}
```

### Hooks Supabase

```tsx
// features/content/hooks.ts
import { createClient } from '@/lib/supabase/client'

export function useContent() {
  const supabase = createClient()
  
  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
  
  // ... rest of the hook
}
```

## 6. Migration du code existant

### Étapes recommandées

1. **Identifier les features** : auth, content, admin, public-site
2. **Créer la structure** `components/features/`
3. **Migrer progressivement** :
   - Extraire la logique des composants actuels
   - Créer les smart components containers
   - Refactorer en dumb components
   - Créer les hooks spécifiques
4. **Tester et valider** chaque feature

### Exemple de migration

```tsx
// AVANT (components/sections/featured-news.tsx)
export function FeaturedNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchNews().then(setNews).finally(() => setLoading(false))
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {news.map(item => <NewsCard key={item.id} news={item} />)}
    </div>
  )
}

// APRÈS
// Smart: features/public-site/NewsContainer.tsx
export function NewsContainer() {
  const { news, loading } = useNews()
  
  if (loading) return <NewsSkeleton />
  
  return <NewsList news={news} />
}

// Dumb: features/public-site/NewsList.tsx  
interface NewsListProps {
  news: NewsItem[]
}

export function NewsList({ news }: NewsListProps) {
  return (
    <div className="grid gap-4">
      {news.map(item => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  )
}
```

---

Cette architecture permet de :

- ✅ Séparer clairement logique et présentation
- ✅ Faciliter les tests (dumb components)
- ✅ Améliorer la réutilisabilité
- ✅ Simplifier la maintenance
- ✅ Garder la compatibilité Next.js/Supabase
