# GitHub Copilot Instructions pour Rouge Cardinal Company

## Priority Guidelines

When generating code for this repository:

1. **Version Compatibility**: Always detect and respect the exact versions of languages, frameworks, and libraries used in this project
2. **Context Files**: Prioritize patterns and standards defined in the .github/copilot directory
3. **Codebase Patterns**: When context files don't provide specific guidance, scan the codebase for established patterns
4. **Architectural Consistency**: Maintain our Layered architectural style and established boundaries
5. **Code Quality**: Prioritize maintainability, performance, security, accessibility, and testability in all generated code

## Technology Version Detection

Before generating code, scan the codebase to identify:

1. **Language Versions**: 
   - TypeScript target: ES2017 (as specified in tsconfig.json)
   - React version: 19.0.0
   - Node.js environment: ^20 (specified in devDependencies)

2. **Framework Versions**:
   - Next.js: 15.4.5
   - Supabase: latest (from package.json)
   - Tailwind CSS: ^3.4.1
   - TypeScript: ^5

3. **Library Versions**:
   - Radix UI components: various versions (^1.x-^2.x)
   - Lucide React: ^0.511.0
   - Next Themes: ^0.4.6
   - ESLint: ^9
   - Never use APIs or features not available in the detected versions

## Context Files

Priority context directories to scan:

- `/app`: Next.js App Router structure
- `/components`: Reusable UI components
- `/lib/supabase`: Supabase integration code
- `/memory-bank`: Project documentation and context
- `/.github/copilot/`: Copilot-specific configuration and instruction files

Additional context available via MCP GitHub and MCP Supabase

## Codebase Scanning Instructions

When context files don't provide specific guidance:

1. Identify similar files to the one being modified or created
2. Analyze patterns for:
   - Naming conventions (camelCase for variables/functions, PascalCase for components)
   - Code organization (React hooks at the top, JSX at the bottom)
   - Error handling (try/catch with appropriate error handling)
   - Use of Server vs Client Components
   
3. Follow the most consistent patterns found in the codebase
4. When conflicting patterns exist, prioritize patterns in newer files or files with higher test coverage
5. Never introduce patterns not found in the existing codebase

## Architecture Guidelines

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
      StatsCard.tsx        # Dumb component
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

*Responsibilities*:

- Data fetching and mutations (Server: async data, Client: hooks)
- Business logic implementation and validation
- State management (local and global)
- Side effects (API calls, navigation, notifications)
- Error handling and loading states
- Orchestration of multiple dumb components

*Server vs Client Decision*:

- **Server Components** (default): Use for data fetching, SEO-critical content, initial page loads
- **Client Components** (add `'use client'`): Use for interactivity, real-time updates, user input handling

*Naming Conventions*:

- Suffix `Container`: `ContentContainer`, `AuthContainer`
- Business names: `AuthProvider`, `ContentManager`, `DashboardOrchestrator`

*Implementation Pattern*:

```tsx
// Server Smart Component Example
export async function ContentContainer() {
  const supabase = createClient()
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching articles:', error)
    return <ErrorMessage error={error} />
  }
  
  return <ArticleList articles={articles} />
}

// Client Smart Component Example
'use client'
export function InteractiveContentContainer() {
  const { articles, loading, error, createArticle, updateArticle } = useContent()
  const { user } = useAuth()
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  
  const handleCreate = async (data: CreateArticleData) => {
    try {
      await createArticle(data)
      toast.success('Article créé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la création')
      console.error(error)
    }
  }
  
  const handleEdit = (article: Article) => {
    setSelectedArticle(article)
  }
  
  if (loading) return <ContentSkeleton />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <>
      <ContentToolbar 
        onCreateArticle={handleCreate}
        canCreate={user?.role === 'admin'}
      />
      <ArticleGrid 
        articles={articles}
        onEditArticle={handleEdit}
        canEdit={user?.role === 'admin'}
      />
      {selectedArticle && (
        <ArticleEditor
          article={selectedArticle}
          onSave={updateArticle}
          onCancel={() => setSelectedArticle(null)}
        />
      )}
    </>
  )
}
```

**Dumb Components (Presentational)**:

*Responsibilities*:

- Pure rendering based on props
- UI interactions (hover, focus, simple animations)
- Layout and composition
- Accessibility implementation
- No business logic or side effects

*Characteristics*:

- Strict TypeScript interfaces for all props
- No direct API calls or external dependencies
- Easily testable in isolation
- Reusable across different features
- Can be Server or Client Components based on usage context

*Implementation Pattern*:

```tsx
interface ArticleListProps {
  articles: Article[]
  onEditArticle?: (article: Article) => void
  canEdit?: boolean
  loading?: boolean
}

export function ArticleList({ 
  articles, 
  onEditArticle, 
  canEdit = false,
  loading = false 
}: ArticleListProps) {
  if (loading) {
    return <ArticleListSkeleton />
  }
  
  if (articles.length === 0) {
    return (
      <EmptyState 
        title="Aucun article"
        description="Commencez par créer votre premier article"
      />
    )
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map(article => (
        <ArticleCard
          key={article.id}
          article={article}
          onEdit={canEdit ? onEditArticle : undefined}
          showEditButton={canEdit}
        />
      ))}
    </div>
  )
}

interface ArticleCardProps {
  article: Article
  onEdit?: (article: Article) => void
  showEditButton?: boolean
}

export function ArticleCard({ article, onEdit, showEditButton }: ArticleCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        <CardDescription>
          {new Date(article.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.excerpt}
        </p>
      </CardContent>
      
      {showEditButton && onEdit && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => onEdit(article)}
            className="w-full"
          >
            Modifier
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

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

**Example Complete Flow**:

```tsx
// 1. Page imports Smart Component
// app/admin/content/page.tsx
export default function AdminContentPage() {
  return (
    <div className="container mx-auto p-6">
      <PageHeader title="Gestion du contenu" />
      <ContentContainer /> {/* Smart Component */}
    </div>
  )
}

// 2. Smart Component orchestrates everything
// features/content/ContentContainer.tsx
'use client'
export function ContentContainer() {
  const { articles, loading, createArticle, updateArticle } = useContent()
  
  return (
    <ContentManager
      articles={articles}
      loading={loading}
      onCreateArticle={createArticle}
      onUpdateArticle={updateArticle}
    />
  )
}

// 3. Dumb Component handles presentation
// features/content/ContentManager.tsx
export function ContentManager({ articles, loading, onCreateArticle }: Props) {
  return (
    <div className="space-y-6">
      <CreateArticleForm onSubmit={onCreateArticle} />
      <ArticleList articles={articles} loading={loading} />
    </div>
  )
}

// 4. Hook manages data layer
// features/content/hooks.ts
export function useContent() {
  const queryClient = useQueryClient()
  
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles
  })
  
  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries(['articles'])
      toast.success('Article créé')
    },
    onError: (error) => {
      toast.error('Erreur lors de la création')
    }
  })
  
  return {
    articles: articles || [],
    loading: isLoading,
    createArticle: createMutation.mutate,
  }
}
```

### Feature Boundaries and Communication

**Rules for Inter-Feature Communication**:

- Features should be autonomous and self-contained
- Use shared types in `lib/types/` for cross-feature interfaces
- Communicate via props, context, or events, never direct imports
- Shared utilities go in `lib/` directory
- Shared UI components go in `components/ui/`

**Example Cross-Feature Communication**:

```tsx
// Shared types
// lib/types/shared.ts
export interface User {
  id: string
  role: 'admin' | 'editor' | 'viewer'
}

// Auth feature exposes user via context
// features/auth/AuthProvider.tsx
export const AuthContext = createContext<{ user: User | null }>()

// Content feature consumes user context
// features/content/ContentContainer.tsx
export function ContentContainer() {
  const { user } = useContext(AuthContext)
  const canEdit = user?.role === 'admin' || user?.role === 'editor'
  
  return <ContentList canEdit={canEdit} />
}
```

## Code Quality Standards

### Maintainability
- Write self-documenting code with clear naming
- Use PascalCase for component names and files (e.g., `ContentContainer.tsx`, `Hero.tsx`)
- Use camelCase for variables, functions, and instance methods
- Keep components focused on single responsibilities following Smart/Dumb pattern
- Organize hooks at the top of components
- Use React hooks appropriately (useState, useEffect, useCallback)
- Follow feature-based folder structure for new components
- One main smart component per feature when possible

### Performance
- Use useCallback for event handlers in components
- Implement appropriate memoization using React.memo or useMemo
- Optimize images using Next.js Image component
- Apply loading states and skeletons for async operations
- Use efficient state management techniques
- Implement pagination or virtualization for large lists

### Security
- Validate all user inputs
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

## Documentation Requirements

- Follow JSDoc style comments for functions and components
- Document non-obvious behaviors
- Add inline comments for complex logic
- Use consistent format for parameter descriptions
- Include example usage for complex components or functions
- Document feature boundaries and component responsibilities

## Testing Approach

### Unit Testing
- Focus on testing component behavior and functionality
- Test smart components for data handling and business logic
- Test dumb components for rendering and prop handling
- Use appropriate mocking for external dependencies
- Follow the testing patterns established in the codebase

## Technology-Specific Guidelines

### Next.js Guidelines

- Use App Router pattern with page.tsx and layout.tsx
- Properly differentiate between Server and Client Components
- Use "use client" directive only when necessary
- Leverage built-in Next.js features (Image, Link, etc.)
- Follow the metadata pattern for SEO
- Use dynamic imports for code splitting
- Pages should import Smart components (Containers) from features

### TypeScript Guidelines
- Use strict type checking
- Define interfaces for component props
- Use type inference where appropriate
- Avoid any type unless absolutely necessary
- Use proper type guards
- Use functional programming patterns with TypeScript features
- Create feature-specific types in dedicated types.ts files

**Type Definition Pattern**:
Always define types with Zod for validation and type safety:

```typescript
import { z } from "zod";

// Basic schema
export const CourseSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  slug: z.string(),
});

// Schema with data cleaning and transformation
export const ArticleSchema = z.object({
  title: z.string().transform(val => val.trim()).pipe(z.string().min(1).max(200)),
  content: z.string().transform(val => val.trim()),
  status: z.enum(['draft', 'published']),
  tags: z.array(z.string().transform(val => val.trim().toLowerCase())),
  publishedAt: z.coerce.date().optional()
});

export type Course = z.infer<typeof CourseSchema>;
export type Article = z.infer<typeof ArticleSchema>;
```

This pattern provides:
- Runtime validation for API inputs/outputs
- Automatic TypeScript type generation
- Consistent validation across features
- Better error handling and user feedback

### React Guidelines
- Use functional components with hooks
- Follow the hook rules (don't call hooks conditionally)
- Use controlled components for forms
- Implement proper error boundaries
- Use context API appropriately for global state
- Keep dumb components pure when possible
- Place custom hooks in feature hooks.ts files or lib/hooks/

### Supabase Guidelines
- Use the patterns established in lib/supabase
- Follow the Server Component pattern for data fetching
- Use Row Level Security (RLS) policies
- Apply proper error handling for database operations
- Use TypeScript types for database entities
- Validate data before sending to Supabase

### MCP GitHub Guidelines
- Use to directly access repository files, issues, pull requests, and discussions without manual copy-paste.
- Leverage MCP GitHub to retrieve information documented in `.github/copilot` and architecture files.
- Always review and validate retrieved data before generating code.

### MCP Supabase Guidelines
- Use to query the database, inspect the schema, or apply migrations directly from Copilot.
- Strictly respect Row Level Security (RLS) policies and server-side validations.
- Prefer secure, predefined queries over free-form SQL in prompts.

### Tailwind CSS Guidelines
- Use the established color palette and design tokens
- Follow the utility-first approach
- Use consistent spacing and sizing
- Apply responsive design patterns using breakpoints
- Use shadcn/ui component library styling conventions

## General Best Practices

- Follow naming conventions exactly as they appear in existing code
- Match code organization patterns from similar files
- Apply error handling consistent with existing patterns
- Match logging patterns from existing code
- Use the same approach to configuration as seen in the codebase
- Implement consistent loading states and error states
- Respect feature boundaries when creating cross-feature dependencies
- Keep shared utilities in lib/ and shared UI components in components/ui/

## Feature-Specific Component Examples

### Creating New Components

**Smart Component Example**:

```tsx
// Server Smart Component
export async function ContentContainer() {
  const articles = await fetchArticles() // Server-side data fetching
  return <ArticleList articles={articles} />
}

// Client Smart Component  
'use client'
export function InteractiveContentContainer() {
  const { data, loading } = useContent() // Client-side hook
  return <ContentEditor data={data} loading={loading} />
}
```

**Dumb Component Example**:

```tsx
interface ArticleListProps {
  articles: Article[]
}

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <div className="space-y-4">
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
```

## Project-Specific Guidance

### Rouge Cardinal Company Website
This project is a website for a theater company with these key features:
- Public-facing website with information about shows and events
- Authentication for admin users
- Content management capabilities
- Press resources and media library

**Feature Organization**:

- `public-site`: Hero, shows display, company information
- `admin`: Dashboard, content management interface
- `content`: Article management, media handling
- `auth`: Login, authentication guards

The project focuses on:
- Professional presentation of the company
- Easy access to show information
- Media resources for professionals
- Administrative capabilities

When implementing features, ensure they match the existing style, follow the Smart/Dumb component pattern, and are aligned with these goals.
