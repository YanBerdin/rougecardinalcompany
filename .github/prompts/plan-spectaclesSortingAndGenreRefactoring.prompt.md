# 📋 Plan de Refactorisation - Tri & Genres Spectacles

## 🎯 Objectifs

1. **Tri multi-colonnes** : Titre, Genre, Statut, Durée, Première, Visibilité
2. **Select Genre dynamique** : Réutilisation + création si nécessaire
3. **Normalisation Status** : Remplacer underscores par espaces
4. **Capitalisation** : Genres et Statuts avec majuscule initiale

---

## 📐 Architecture Proposée

```
lib/
├── tables/
│   └── spectacle-table-helpers.ts      # Ajout : sortSpectacles()
├── forms/
│   └── spectacle-form-helpers.ts       # Ajout : capitalizeFirstLetter()
└── dal/
    └── spectacles.ts                    # Ajout : fetchDistinctGenres()

components/features/admin/spectacles/
├── SpectacleForm.tsx                    # Modifier : Genre select
├── SpectaclesTable.tsx                  # Ajouter : Column headers cliquables
└── SpectaclesManagementContainer.tsx    # Ajouter : Sort state
```

---

## 📝 TASK 1 : Normalisation Database (Status sans underscores)

### A. Migration Database

**Objectif** : Remplacer `en_cours` → `en cours`, `termine` → `terminé`

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_normalize_spectacles_status.sql

-- Update existing values
UPDATE public.spectacles
SET status = CASE
  WHEN status = 'en_cours' THEN 'en cours'
  WHEN status = 'termine' THEN 'terminé'
  ELSE status
END
WHERE status IN ('en_cours', 'termine');

-- Add comment for documentation
COMMENT ON COLUMN public.spectacles.status IS
'Status: draft, published, archived, en cours, terminé, projet (no underscores, capitalize first letter)';
```

**Checklist** :

- [ ] Créer migration `normalize_spectacles_status.sql`
- [ ] Appliquer sur Cloud : `pnpm dlx supabase db push`
- [ ] Vérifier data dans SQL Editor (Supabase Dashboard) : `SELECT DISTINCT status FROM spectacles;`

---

### B. Update Constants

**Fichier** : `lib/tables/spectacle-table-helpers.ts`

```typescript
// ❌ AVANT
export const STATUS_VARIANTS = {
  en_cours: "default",
  termine: "secondary",
  projet: "outline",
};

export const STATUS_LABELS = {
  en_cours: "En cours",
  termine: "Terminé",
  projet: "Projet",
};

// ✅ APRÈS
export const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  "en cours": "default",
  terminé: "secondary",
  projet: "outline",
  draft: "outline",
  published: "default",
  archived: "secondary",
};

export const STATUS_LABELS: Record<string, string> = {
  "en cours": "En cours",
  terminé: "Terminé",
  projet: "Projet",
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};
```

**Checklist** :

- [ ] Update `STATUS_VARIANTS`
- [ ] Update `STATUS_LABELS`
- [ ] Ajouter values manquantes (draft, published, archived)
- [ ] Test : `pnpm tsc --noEmit`

---

## 📝 TASK 2 : Helper Capitalisation

### A. Helper Function

**Fichier** : `lib/forms/spectacle-form-helpers.ts`

```typescript
// ============================================================================
// String Formatting Helpers
// ============================================================================

/**
 * Capitalizes first letter of each word and normalizes spaces
 * @example capitalizeWords("en cours") → "En cours"
 * @example capitalizeWords("tragédie") → "Tragédie"
 */
export function capitalizeWords(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Normalizes status: removes underscores and capitalizes
 * @example normalizeStatus("en_cours") → "En cours"
 */
export function normalizeStatus(status: string): string {
  return capitalizeWords(status.replace(/_/g, " "));
}

/**
 * Normalizes genre: capitalizes first letter only
 * @example normalizeGenre("tragédie") → "Tragédie"
 * @example normalizeGenre("comédie musicale") → "Comédie musicale"
 */
export function normalizeGenre(genre: string): string {
  const trimmed = genre.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}
```

**Tests** :

```typescript
// lib/forms/__tests__/spectacle-form-helpers.test.ts
import {
  capitalizeWords,
  normalizeStatus,
  normalizeGenre,
} from "../spectacle-form-helpers";

describe("String Formatting Helpers", () => {
  test("capitalizeWords handles multiple words", () => {
    expect(capitalizeWords("en cours")).toBe("En cours");
    expect(capitalizeWords("EN_COURS")).toBe("En_cours"); // underscores preserved
  });

  test("normalizeStatus removes underscores", () => {
    expect(normalizeStatus("en_cours")).toBe("En cours");
    expect(normalizeStatus("termine")).toBe("Terminé"); // ❌ Fails - need accent
  });

  test("normalizeGenre capitalizes correctly", () => {
    expect(normalizeGenre("tragédie")).toBe("Tragédie");
    expect(normalizeGenre("COMÉDIE")).toBe("Comédie");
  });
});
```

**Checklist** :

- [ ] Créer helpers dans `spectacle-form-helpers.ts`
- [ ] Créer tests unitaires
- [ ] Gérer accents correctement (`terminé` pas `termine`)
- [ ] Export depuis `lib/forms/spectacle-form-helpers.ts`

---

## 📝 TASK 3 : Genre Select Dynamique

### A. DAL - Fetch Distinct Genres

**Fichier** : `lib/dal/spectacles.ts`

```typescript
/**
 * Fetches all distinct genres used in spectacles
 * Returns sorted array of non-null genres
 *
 * @example
 * const genres = await fetchDistinctGenres();
 * // ["Comédie", "Drame", "Tragédie"]
 */
export async function fetchDistinctGenres(): Promise<string[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("spectacles")
      .select("genre")
      .not("genre", "is", null)
      .order("genre");

    if (error) {
      console.error("[DAL] fetchDistinctGenres error:", error);
      return [];
    }

    // Extract unique genres and filter out nulls/empty
    const uniqueGenres = Array.from(
      new Set(
        data
          .map((row) => row.genre?.trim())
          .filter((g): g is string => Boolean(g))
      )
    );

    return uniqueGenres.sort((a, b) => a.localeCompare(b, "fr"));
  } catch (error) {
    console.error("[DAL] fetchDistinctGenres exception:", error);
    return [];
  }
}
```

**Checklist** :

- [ ] Ajouter fonction dans `lib/dal/spectacles.ts`
- [ ] Gérer nulls et empty strings
- [ ] Trier alphabétiquement (locale 'fr')
- [ ] Type de retour : `Promise<string[]>`

---

### B. Server Component - Load Genres

**Fichier** : `app/(admin)/admin/spectacles/new/page.tsx`

```typescript
import { fetchDistinctGenres } from "@/lib/dal/spectacles";

export default async function NewSpectaclePage() {
  // ... existing auth check

  const existingGenres = await fetchDistinctGenres();

  return (
    <div className="space-y-6">
      {/* ... existing header */}
      <div className="max-w-2xl">
        <SpectacleForm existingGenres={existingGenres} />
      </div>
    </div>
  );
}
```

**Fichier** : `app/(admin)/admin/spectacles/[id]/edit/page.tsx`

```typescript
export default async function EditSpectaclePage({ params }: Props) {
  // ... existing code

  const [spectacle, existingGenres] = await Promise.all([
    fetchSpectacleById(spectacleId),
    fetchDistinctGenres(),
  ]);

  // ... existing code

  return (
    <div className="max-w-2xl">
      <SpectacleForm
        defaultValues={defaultValues}
        spectacleId={spectacle.id}
        existingGenres={existingGenres}
      />
    </div>
  );
}
```

**Checklist** :

- [ ] Update `new/page.tsx`
- [ ] Update `[id]/edit/page.tsx`
- [ ] Passer `existingGenres` en prop à `SpectacleForm`

---

### C. Form Component - Combobox Genre

**Fichier** : `components/features/admin/spectacles/SpectacleForm.tsx`

```typescript
interface SpectacleFormProps {
  defaultValues?: Partial<SpectacleFormValues>;
  spectacleId?: number;
  onSuccess?: () => void;
  existingGenres?: string[]; // ✅ New prop
}

export default function SpectacleForm({
  defaultValues,
  spectacleId,
  onSuccess,
  existingGenres = [], // ✅ Default empty array
}: SpectacleFormProps) {
  const [isCreatingNewGenre, setIsCreatingNewGenre] = useState(false);

  // ... existing form setup

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ... existing fields */}

        {/* Genre Field - Replace Input with Combobox */}
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              {!isCreatingNewGenre && existingGenres.length > 0 ? (
                <div className="flex gap-2">
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value === "__new__") {
                        setIsCreatingNewGenre(true);
                        field.onChange("");
                      } else {
                        field.onChange(value);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un genre existant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {existingGenres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__">
                        ➕ Créer un nouveau genre
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="Tragédie, Comédie..."
                      {...field}
                      onChange={(e) => {
                        // Capitalize first letter on input
                        const normalized = normalizeGenre(e.target.value);
                        field.onChange(normalized);
                      }}
                    />
                  </FormControl>
                  {existingGenres.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatingNewGenre(false)}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              )}
              <FormDescription>
                {isCreatingNewGenre
                  ? "Saisissez un nouveau genre (première lettre en majuscule)"
                  : "Sélectionnez un genre existant ou créez-en un nouveau"
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ... rest of form */}
      </form>
    </Form>
  );
}
```

**Checklist** :

- [ ] Ajouter prop `existingGenres?: string[]`
- [ ] State `isCreatingNewGenre`
- [ ] Conditional render : Select vs Input
- [ ] Option spéciale `__new__` dans Select
- [ ] Normalisation avec `normalizeGenre()` sur input
- [ ] Import `normalizeGenre` depuis helpers

---

## 📝 TASK 4 : Tri Multi-Colonnes

### A. Sort State & Logic

**Fichier** : `components/features/admin/spectacles/SpectaclesManagementContainer.tsx`

```typescript
type SortColumn =
  | 'title'
  | 'genre'
  | 'status'
  | 'duration_minutes'
  | 'premiere'
  | 'public';

type SortDirection = 'asc' | 'desc';

interface SortState {
  column: SortColumn | null;
  direction: SortDirection;
}

export default function SpectaclesManagementContainer({
  initialSpectacles,
}: SpectaclesManagementContainerProps) {
  const router = useRouter();
  const [spectacles, setSpectacles] = useState<SpectacleSummary[]>(initialSpectacles);
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: 'asc',
  });
  // ... existing state

  function handleSort(column: SortColumn): void {
    setSortState((prev) => {
      if (prev.column === column) {
        // Toggle direction if same column
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      // New column, default to ascending
      return { column, direction: 'asc' };
    });
  }

  // Compute sorted spectacles
  const sortedSpectacles = useMemo(() => {
    if (!sortState.column) return spectacles;

    return sortSpectacles(spectacles, sortState.column, sortState.direction);
  }, [spectacles, sortState]);

  return (
    <div className="space-y-4">
      {/* ... */}
      <SpectaclesTable
        spectacles={sortedSpectacles}
        sortState={sortState}
        onSort={handleSort}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={requestDelete}
      />
    </div>
  );
}
```

**Checklist** :

- [ ] Types `SortColumn`, `SortDirection`, `SortState`
- [ ] State `sortState`
- [ ] Handler `handleSort()` avec toggle logic
- [ ] `useMemo` pour computed `sortedSpectacles`
- [ ] Passer `sortState` et `onSort` à Table

---

### B. Sort Helper Function

**Fichier** : `lib/tables/spectacle-table-helpers.ts`

```typescript
type SortColumn =
  | "title"
  | "genre"
  | "status"
  | "duration_minutes"
  | "premiere"
  | "public";

type SortDirection = "asc" | "desc";

/**
 * Sorts spectacles array by specified column and direction
 * Handles nulls (placed at end), case-insensitive for strings
 *
 * @example
 * const sorted = sortSpectacles(spectacles, 'title', 'asc');
 */
export function sortSpectacles(
  spectacles: SpectacleSummary[],
  column: SortColumn,
  direction: SortDirection
): SpectacleSummary[] {
  const sortedArray = [...spectacles].sort((a, b) => {
    let aValue = a[column];
    let bValue = b[column];

    // Handle nulls (always at end)
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    // String comparison (case-insensitive)
    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue, "fr", {
        sensitivity: "base",
      });
      return direction === "asc" ? comparison : -comparison;
    }

    // Number/Boolean comparison
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return sortedArray;
}

/**
 * Returns sort indicator icon (↑ or ↓)
 */
export function getSortIcon(
  currentColumn: SortColumn | null,
  targetColumn: SortColumn,
  direction: SortDirection
): string | null {
  if (currentColumn !== targetColumn) return null;
  return direction === "asc" ? "↑" : "↓";
}
```

**Checklist** :

- [ ] Function `sortSpectacles()`
- [ ] Handle nulls (end of list)
- [ ] Case-insensitive string sort (locale 'fr')
- [ ] Number/boolean sort
- [ ] Helper `getSortIcon()` pour UI
- [ ] Tests unitaires

---

### C. Table Component - Clickable Headers

**Fichier** : `components/features/admin/spectacles/SpectaclesTable.tsx`

```typescript
import { ArrowUpDown } from "lucide-react";
import { getSortIcon } from "@/lib/tables/spectacle-table-helpers";

type SortColumn =
  | 'title'
  | 'genre'
  | 'status'
  | 'duration_minutes'
  | 'premiere'
  | 'public';

type SortDirection = 'asc' | 'desc';

interface SortState {
  column: SortColumn | null;
  direction: SortDirection;
}

interface SpectaclesTableProps {
  spectacles: SpectacleSummary[];
  sortState: SortState;
  onSort: (column: SortColumn) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function SpectaclesTable({
  spectacles,
  sortState,
  onSort,
  onView,
  onEdit,
  onDelete,
}: SpectaclesTableProps) {
  // ... existing empty state

  function SortableHeader({
    column,
    children
  }: {
    column: SortColumn;
    children: React.ReactNode;
  }) {
    const sortIcon = getSortIcon(sortState.column, column, sortState.direction);

    return (
      <TableHead>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-accent"
          onClick={() => onSort(column)}
        >
          {children}
          {sortIcon ? (
            <span className="ml-2">{sortIcon}</span>
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
          )}
        </Button>
      </TableHead>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader column="title">Titre</SortableHeader>
            <SortableHeader column="genre">Genre</SortableHeader>
            <SortableHeader column="status">Statut</SortableHeader>
            <SortableHeader column="duration_minutes">Durée</SortableHeader>
            <SortableHeader column="premiere">Première</SortableHeader>
            <SortableHeader column="public">Visibilité</SortableHeader>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* ... existing rows */}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Checklist** :

- [ ] Add props : `sortState`, `onSort`
- [ ] Component local `SortableHeader`
- [ ] Import `ArrowUpDown` icon
- [ ] Button hover state
- [ ] Visual feedback (↑ ↓ ou icon)

---

## 📝 TASK 5 : Update Schema Validation

### A. Form Schema

**Fichier** : `lib/forms/spectacle-form-helpers.ts`

```typescript
export const spectacleFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  slug: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  genre: z
    .string()
    .max(100)
    .optional()
    .transform((val) => (val ? normalizeGenre(val) : val)), // ✅ Auto-capitalize
  duration_minutes: z.coerce.number().int().positive().optional(),
  casting: z.coerce.number().int().positive().optional(),
  premiere: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  public: z.boolean().optional(),
});
```

**Checklist** :

- [ ] Transform `genre` avec `normalizeGenre()`
- [ ] Garder `status` enum existant (mapping fait dans form)

---

## 📊 Récapitulatif Ordre d'Exécution

### Phase 1 : Database & Helpers (Non-Breaking)

1. ✅ Migration normalize status
2. ✅ Helpers capitalisation (`normalizeGenre`, `normalizeStatus`)
3. ✅ Update constants (`STATUS_VARIANTS`, `STATUS_LABELS`)
4. ✅ Tests unitaires helpers

### Phase 2 : DAL & Genre Select

5. ✅ DAL `fetchDistinctGenres()`
6. ✅ Update pages (new, edit) - fetch genres
7. ✅ Update `SpectacleForm` - combobox genre
8. ✅ Schema transform genre

### Phase 3 : Tri Multi-Colonnes

9. ✅ Helper `sortSpectacles()`
10. ✅ State management container
11. ✅ Clickable headers table
12. ✅ Visual feedback (icons)

### Phase 4 : Testing & Validation

13. ✅ Test manuel all features
14. ✅ TypeScript : `pnpm tsc --noEmit`
15. ✅ ESLint : `pnpm lint`
16. ✅ Clean Code check (≤30 lines)

---

## 🎯 Success Criteria

- [ ] Status database sans underscores (`en cours`, `terminé`)
- [ ] Genres toujours capitalisés (`Tragédie`, `Comédie musicale`)
- [ ] Select genre réutilise existants + option "Créer nouveau"
- [ ] Tri fonctionne sur 6 colonnes (title, genre, status, duration, premiere, public)
- [ ] Visual feedback tri (↑ ↓)
- [ ] TypeScript 0 errors
- [ ] Clean Code compliant (≤30 lignes)
- [ ] User validation : "C'est exactement ce que je voulais !"

---

**Breaking Changes** : Migration database  
**Réversible** : Oui (rollback migration disponible)
