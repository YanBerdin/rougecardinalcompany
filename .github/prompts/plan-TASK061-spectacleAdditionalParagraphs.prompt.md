# Plan: Ajouter 2 paragraphes supplémentaires dans SpectacleDetailView

Enrichir le contenu des spectacles en ajoutant 2 champs de texte optionnels (`paragraph_2`, `paragraph_3`) sans limite de caractères. Flow visuel confirmé : Description → Photo 1 → Paragraph_2 → Photo 2 → Paragraph_3. Les champs restent optionnels même pour spectacles publics. Pattern simple avec 2 colonnes DB (pas d'array). Implémentation Database → Backend → Frontend.

## Contexte architectural

**Table cible**: `public.spectacles` (fichier schema `06_table_spectacles.sql`)  
**Pattern existant**: Similaire à `home_about_content` (intro1/intro2 séparés)  
**Page spectacle**: `app/(marketing)/spectacles/[slug]/page.tsx` (Server Component) → `SpectacleDetailView` (Client Component)  
**Photos intégrées**: TASK057 (2 fév. 2026) - 2 photos paysage déjà positionnées dans le synopsis  
**Validation**: Champs optionnels, sans limite caractères (comme `description` actuel)

## Décisions confirmées

| Décision | Choix | Justification |
|----------|-------|---------------|
| Limite caractères | ❌ Aucune | Aligné sur `description` (pas de max dans DB ni Zod) |
| Obligatoire si public | ❌ Non | Contenu enrichi facultatif, pas bloquant pour publication |
| Structure données | 2 colonnes séparées | Simple, évite gestion array, aligné pattern `home_about_content` |
| Flow visuel | Desc → Photo1 → P2 → Photo2 → P3 | Rythme lecture, entrelace texte et images |
| Ordre implémentation | DB → Backend → Frontend | Évite erreurs TypeScript pendant développement |

## ⚠️ PRÉREQUIS OBLIGATOIRE - Clean Code Compliance

**CRITIQUE** : `SpectacleForm.tsx` fait actuellement **578 lignes** (limite max : 300 lignes selon `.github/instructions/1-clean-code.instructions.md`).

Avant d'ajouter les nouveaux champs paragraph_2/paragraph_3 (~40 lignes supplémentaires), le fichier **DOIT être splitté** :

```bash
# Pattern: CRUD Server Actions - Component Split
components/features/admin/spectacles/
  SpectacleForm.tsx              # Composant principal (<300 lignes)
  SpectacleFormFields.tsx        # Champs texte (title, description, paragraph_2, etc.)
  SpectacleFormMetadata.tsx      # Métadonnées (genre, duration, casting, premiere)
  SpectacleFormImageSection.tsx  # Section image MediaLibraryPicker
```

**Ordre implémentation OBLIGATOIRE** :

1. ✅ **TASK061-PHASE0** : Refactoring SpectacleForm.tsx (split en 3-4 sous-composants)
2. ✅ **TASK061-PHASE1** : Migration database + Backend (après refactoring terminé)
3. ✅ **TASK061-PHASE2** : Ajout champs dans SpectacleFormFields.tsx (fichier déjà <300 lignes)

**Référence pattern** : `.github/instructions/crud-server-actions-pattern.instructions.md` Section "Règle Clean Code : Max 300 lignes par fichier"

---

## Étapes d'implémentation

### 0. Workflow migration (OBLIGATOIRE)

**CRITIQUE**: Respecter le workflow Declarative Schema

```bash
# 1. Modifier le fichier schema
# Éditer: supabase/schemas/06_table_spectacles.sql

# 2. ARRÊTER la DB locale (OBLIGATOIRE avant diff)
pnpm dlx supabase stop

# 3. Générer migration via diff
pnpm dlx supabase db diff -f add_spectacle_paragraphs

# 4. Vérifier migration générée
cat supabase/migrations/*_add_spectacle_paragraphs.sql

# 5. Démarrer DB et tester localement
pnpm dlx supabase start

# 6. Appliquer migration sur DB cloud (production)
pnpm dlx supabase db push --linked

# 7. Mettre à jour documentation
# Éditer: supabase/README.md (section "Mises à jour récentes")
# Éditer: supabase/migrations/migrations.md (nouvelle entrée)
```

**Format migration**: `YYYYMMDDHHmmss_add_spectacle_paragraphs.sql`  
**Exemple**: `20260202150000_add_spectacle_paragraphs.sql`

### 1. Migration base de données

**Fichier source**: `supabase/schemas/06_table_spectacles.sql` (modifier ici)  
**Fichier généré**: `supabase/migrations/YYYYMMDDHHmmss_add_spectacle_paragraphs.sql` (via diff)

**Modifications dans le schéma déclaratif**:
```sql
-- Ajouter après la ligne "description text,"
  paragraph_2 text,
  paragraph_3 text,
```

**Commentaires à ajouter**:
```sql
comment on column public.spectacles.paragraph_2 is 
'Paragraphe supplémentaire 1 - Contenu narratif additionnel affiché après Photo 1 dans SpectacleDetailView';

comment on column public.spectacles.paragraph_3 is 
'Paragraphe supplémentaire 2 - Contenu narratif additionnel affiché après Photo 2 dans SpectacleDetailView';
```

**Structure finale colonnes contenu**:
```sql
  description text,          -- Paragraphe principal (first-letter stylisé)
  paragraph_2 text,          -- Après Photo 1 (optionnel)
  paragraph_3 text,          -- Après Photo 2 (optionnel)
  short_description text,    -- Résumé pour listes (max 500 côté validation)
```

**Pas de contraintes supplémentaires**:
- ❌ Pas de `CHECK` constraint (pas de limite caractères)
- ❌ Pas de `NOT NULL` (champs optionnels)
- ❌ Pas d'index (champs texte rarement filtrés)

### 2. Étendre schémas Zod spectacles

**Fichier**: `lib/schemas/spectacles.ts`

**Modifications**:

```typescript
// SpectacleDbSchema - Ajouter après "description"
export const SpectacleDbSchema = z.object({
  // ... existing fields ...
  description: z.string().nullable(),
  paragraph_2: z.string().nullable(), // ✅ Ajout
  paragraph_3: z.string().nullable(), // ✅ Ajout
  short_description: z.string().nullable(),
  // ... rest of fields ...
});

// CreateSpectacleSchema - Ajouter après "description"
export const CreateSpectacleSchema = z.object({
  // ... existing fields ...
  description: z.string().optional(),
  paragraph_2: z.string().optional(), // ✅ Ajout (pas de .max())
  paragraph_3: z.string().optional(), // ✅ Ajout (pas de .max())
  short_description: z.string().max(500, "Short description too long").optional(),
  // ... rest of fields ...
});

// UpdateSpectacleSchema - Hérite automatiquement via .partial().extend()
// Pas de modification nécessaire
```

**Note**: Pas de limite `.max()` sur `paragraph_2` et `paragraph_3` (aligné sur `description`).

### 3. Étendre schéma formulaire

**Fichier**: `lib/forms/spectacle-form-helpers.ts`

**Modifications dans `spectacleFormSchema`**:

```typescript
export const spectacleFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  slug: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  description: z.string().optional(),
  paragraph_2: z.string().optional(), // ✅ Ajout
  paragraph_3: z.string().optional(), // ✅ Ajout
  short_description: z.string().max(500).optional(),
  // ... rest of schema ...
}).superRefine((data, ctx) => {
  // ✅ PAS de validation conditionnelle pour paragraph_2/paragraph_3
  // Ces champs restent optionnels même si public = true
  // ... existing superRefine logic unchanged ...
});
```

**Modifications dans `cleanSpectacleFormData`**:

Pas de modification nécessaire - la fonction `cleanEmptyValues` gère déjà tous les champs automatiquement via `Object.entries(data)`.

### 4. Modifier le DAL

**Fichier**: `lib/dal/spectacles.ts`

**Modifications dans `fetchSpectacleById` (ligne ~115)**:

```typescript
const { data, error } = await supabase
  .from("spectacles")
  .select(
    "id, title, slug, status, description, paragraph_2, paragraph_3, short_description, genre, duration_minutes, casting, premiere, image_url, public, awards, created_by, created_at, updated_at"
  )
  .eq("id", id)
  .single();
```

**Modifications dans `fetchSpectacleBySlug` (ligne ~168)**:

```typescript
let query = supabase
  .from("spectacles")
  .select(
    "id, title, slug, status, description, paragraph_2, paragraph_3, short_description, genre, duration_minutes, casting, premiere, image_url, public, awards, created_by, created_at, updated_at"
  );
```

**❌ NE PAS modifier `fetchAllSpectacles`**:
- Optimisation: les colonnes texte lourdes ne sont pas nécessaires pour les listes
- Le select actuel reste inchangé (pas de `paragraph_2`, `paragraph_3`)

### 5. Ajouter champs dans SpectacleForm

**⚠️ PRÉREQUIS** : Fichier SpectacleForm.tsx doit être splitté AVANT cette étape (voir section "Prérequis Obligatoire" en haut du plan).

**Fichier cible** (après refactoring) : `components/features/admin/spectacles/SpectacleFormFields.tsx`

**Fichier actuel** (si refactoring non fait) : `components/features/admin/spectacles/SpectacleForm.tsx`  
**⚠️ WARNING** : Fichier actuel = 578 lignes (limite 300). Ajout direct **VIOLE** Clean Code.

**Position**: Après le FormField `description`, avant "Duration and Casting row"

**Code à insérer**:

```tsx
{/* Paragraph 2 - Supplémentaire 1 */}
<FormField
  control={form.control}
  name="paragraph_2"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Paragraphe supplémentaire 1</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Contenu narratif additionnel (affiché après la première photo)..."
          className="resize-none min-h-32"
          {...field}
        />
      </FormControl>
      <FormDescription>
        Optionnel - Aucune limite de caractères
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

{/* Paragraph 3 - Supplémentaire 2 */}
<FormField
  control={form.control}
  name="paragraph_3"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Paragraphe supplémentaire 2</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Contenu narratif additionnel (affiché après la deuxième photo)..."
          className="resize-none min-h-32"
          {...field}
        />
      </FormControl>
      <FormDescription>
        Optionnel - Aucune limite de caractères
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Modifications defaultValues** (dans `useForm`, ligne ~85):

```typescript
const form = useForm({
  resolver: zodResolver(spectacleFormSchema),
  defaultValues: {
    // ... existing fields ...
    description: defaultValues?.description ?? "",
    paragraph_2: defaultValues?.paragraph_2 ?? "", // ✅ Ajout
    paragraph_3: defaultValues?.paragraph_3 ?? "", // ✅ Ajout
    short_description: defaultValues?.short_description ?? "",
    // ... rest of fields ...
  },
});
```

### 6. Afficher dans SpectacleDetailView

**Fichier**: `components/features/public-site/spectacles/SpectacleDetailView.tsx`

**Flow visuel actuel** (TASK057):
```yaml
short_description (italic)
  ↓
Photo 1 (landscapePhotos[0])
  ↓
description (prose, first-letter stylisé)
  ↓
Photo 2 (landscapePhotos[1])
  ↓
CTAs
```

**Flow visuel cible** (TASK061):
```yaml
short_description (italic)
  ↓
Photo 1 (landscapePhotos[0])  ← Inchangé
  ↓
description (prose, first-letter stylisé)
  ↓
paragraph_2 (prose, sans first-letter)  ← NOUVEAU
  ↓
Photo 2 (landscapePhotos[1])  ← Repositionné
  ↓
paragraph_3 (prose, sans first-letter)  ← NOUVEAU
  ↓
CTAs
```

**Modifications** (après le bloc `description`, ligne ~275):

```tsx
{/* Description principale avec first-letter stylisé */}
<div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed">
  <p className="max-sm:text-sm text-md lg:text-lg whitespace-pre-line first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left first-letter:leading-[0.8]">
    {spectacle.description || spectacle.short_description}
  </p>
</div>

{/* Paragraphe supplémentaire 1 (après description, avant Photo 2) */}
{spectacle.paragraph_2 && (
  <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed mt-6">
    <p className="max-sm:text-sm text-md lg:text-lg whitespace-pre-line">
      {spectacle.paragraph_2}
    </p>
  </div>
)}

{/* Photo 2 - repositionnée après paragraph_2 */}
{landscapePhotos[1] && (
  <LandscapePhotoCard photo={landscapePhotos[1]} />
)}

{/* Paragraphe supplémentaire 2 (après Photo 2, avant CTAs) */}
{spectacle.paragraph_3 && (
  <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed mt-6">
    <p className="max-sm:text-sm text-md lg:text-lg whitespace-pre-line">
      {spectacle.paragraph_3}
    </p>
  </div>
)}

{/* Call to Actions */}
<div className="flex flex-col gap-4 pt-4 md:pt-6">
  {/* ... existing CTA buttons ... */}
</div>
```

**Note importante**: Retirer l'affichage actuel de `landscapePhotos[1]` (ligne ~278) qui est après `description`, et le repositionner après `paragraph_2`.

## Points d'attention

### TypeScript
- ✅ Types dérivés automatiquement via `z.infer<>` (pas de modification manuelle)
- ✅ `SpectacleDb` inclura `paragraph_2` et `paragraph_3` après modification schéma
- ✅ Props `SpectacleDetailViewProps` inchangés (utilise `SpectacleDb`)

### Performance
- ✅ Pas de fetch supplémentaire (champs ajoutés aux queries existantes)
- ✅ `fetchAllSpectacles` non modifié (optimisation listes)
- ✅ Rendu conditionnel (`{spectacle.paragraph_2 && ...}`) évite DOM inutile

### UX Admin
- ✅ Champs visuellement groupés (après `description`)
- ✅ Placeholder explicite sur le placement dans la vue publique
- ✅ FormDescription confirme caractère optionnel
- ✅ Pas de validation bloquante pour publication

### Fallback
- ✅ Graceful si `paragraph_2`/`paragraph_3` null/undefined
- ✅ Layout préservé (Photo 1 → Desc → [P2] → Photo 2 → [P3])
- ✅ Pas de crash si champs absents (migration non appliquée)

## Migration & Rollback

**⚠️ IMPORTANT** : Le SQL ci-dessous est **généré automatiquement** par `supabase db diff` à partir du fichier schema déclaratif `supabase/schemas/06_table_spectacles.sql`.

**NE PAS créer cette migration manuellement** — le workflow declarative schema la génère pour vous.

**Migration forward** (ce que `supabase db diff` générera automatiquement) :
```sql
-- Ajout colonnes (safe - nullable par défaut)
ALTER TABLE public.spectacles ADD COLUMN IF NOT EXISTS paragraph_2 text;
ALTER TABLE public.spectacles ADD COLUMN IF NOT EXISTS paragraph_3 text;

-- Commentaires
COMMENT ON COLUMN public.spectacles.paragraph_2 IS 
  'Paragraphe supplémentaire 1 - Contenu narratif additionnel affiché après Photo 1';
COMMENT ON COLUMN public.spectacles.paragraph_3 IS 
  'Paragraphe supplémentaire 2 - Contenu narratif additionnel affiché après Photo 2';
```

**Rollback** (en cas de problème):
```sql
-- Suppression colonnes (attention: perte de données)
ALTER TABLE public.spectacles DROP COLUMN IF EXISTS paragraph_2;
ALTER TABLE public.spectacles DROP COLUMN IF EXISTS paragraph_3;
```

## Tests suggérés

### Clean Code Validation

- [ ] **CRITIQUE** : SpectacleForm.tsx (ou fichiers splittés) < 300 lignes chacun
- [ ] TypeScript : 0 erreurs après modifications
- [ ] ESLint : 0 warnings

### Functional Tests

- [ ] Admin peut saisir contenu dans paragraph_2 et paragraph_3
- [ ] Création spectacle fonctionne avec champs vides
- [ ] Création spectacle fonctionne avec champs remplis
- [ ] Édition spectacle préserve valeurs existantes
- [ ] Affichage public: paragraph_2 apparaît entre description et Photo 2
- [ ] Affichage public: paragraph_3 apparaît après Photo 2
- [ ] Affichage public: pas de rendu si champs vides
- [ ] Publication spectacle (`public = true`) fonctionne sans remplir paragraph_2/paragraph_3
- [ ] TypeScript: 0 erreurs après modifications

## Documentation post-déploiement

### `supabase/README.md`

Ajouter dans "Mises à jour récentes (février 2026)":

```markdown
- **FEAT: Paragraphes supplémentaires Spectacles - TASK061 (X fév. 2026)** : Ajout de 2 champs texte optionnels pour enrichir le contenu narratif des spectacles.
  - **Migration**: `YYYYMMDDHHmmss_add_spectacle_paragraphs.sql`
  - **Colonnes ajoutées**: `paragraph_2 text`, `paragraph_3 text`
  - **Flow visuel**: Description → Photo 1 → Paragraph 2 → Photo 2 → Paragraph 3
  - **Validation**: Optionnels, sans limite caractères, non bloquants pour publication
```

### `supabase/migrations/migrations.md`

Ajouter nouvelle entrée:

```bash
| YYYY-MM-DD HH:mm:ss | add_spectacle_paragraphs | Ajout paragraph_2, paragraph_3 pour contenu enrichi | ✅ Applied | Cloud + Local | Declarative schema |
```

### `memory-bank/tasks/TASK061-spectacle-additional-paragraphs.md`

Créer fichier TASK avec structure standard et mettre à jour progression.

### Fichiers modifiés (récapitulatif)

| Fichier | Modification |
|---------|--------------|
| `supabase/schemas/06_table_spectacles.sql` | +2 colonnes, +2 comments |
| `lib/schemas/spectacles.ts` | +2 champs dans SpectacleDbSchema, CreateSpectacleSchema |
| `lib/forms/spectacle-form-helpers.ts` | +2 champs dans spectacleFormSchema |
| `lib/dal/spectacles.ts` | +2 champs dans select (fetchSpectacleById, fetchSpectacleBySlug) |
| `components/features/admin/spectacles/SpectacleForm.tsx` | +2 FormField, +2 defaultValues |
| `components/features/public-site/spectacles/SpectacleDetailView.tsx` | +2 blocs conditionnel, repositionnement Photo 2 |

## Résumé technique

**Database**: 2 colonnes `text` nullable, pas de contraintes  
**Migration**: Workflow declarative schema (stop → diff → start → push --linked)  
**Schemas Zod**: Champs optionnels `.string().optional()` ou `.string().nullable()`  
**DAL**: Select étendu (fetchById, fetchBySlug), fetchAll inchangé  
**Admin UI**: 2 Textarea après description, FormDescription "Optionnel"  
**Public UI**: Rendu conditionnel, repositionnement Photo 2 entre paragraph_2 et paragraph_3  
**Validation**: Pas de limite caractères, pas de condition si public = true  
**Pattern**: Aligné sur `home_about_content` (intro1/intro2 séparés)
```
