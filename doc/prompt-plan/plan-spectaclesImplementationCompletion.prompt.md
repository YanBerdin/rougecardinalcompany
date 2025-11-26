# 📋 Plan de Complétion - Implémentation Spectacles

## 🎯 Objectif

Finaliser l'implémentation des fonctionnalités de tri et normalisation des spectacles identifiées lors de l'analyse.

**Score actuel**: 85/100  
**Score cible**: 100/100

---

## 🔴 ÉTAPE 1 : Compléter le Tri Multi-Colonnes (Priorité Haute)

### Problème Identifié

Le tri ne fonctionne que sur **4/6 colonnes**:

- ✅ Implémenté: `title`, `genre`, `status`, `premiere`
- ❌ Manquant: `duration_minutes`, `public`

### A. Mise à jour du Type SortField

**Fichier**: `lib/tables/spectacle-table-helpers.ts`

**Avant**:

```typescript
export type SortField = "title" | "status" | "genre" | "premiere";
```

**Après**:

```typescript
export type SortField = "title" | "genre" | "status" | "duration_minutes" | "premiere" | "public";
```

### B. Ajout des Cases Manquants dans sortSpectacles()

**Fichier**: `lib/tables/spectacle-table-helpers.ts`

**Location**: Dans le switch case de `sortSpectacles()`, après `case "premiere":`

**Ajout**:

```typescript
case "duration_minutes":
  aValue = a.duration_minutes || 0;
  bValue = b.duration_minutes || 0;
  break;

case "public":
  aValue = a.public ? 1 : 0;
  bValue = b.public ? 1 : 0;
  break;
```

### C. Ajout des SortableHeaders dans la Table

**Fichier**: `components/features/admin/spectacles/SpectaclesTable.tsx`

**Remplacer**:

```tsx
<TableHead>Durée</TableHead>
```

**Par**:

```tsx
<TableHead>
  <SortableHeader
    field="duration_minutes"
    label="Durée"
    currentSort={sortState}
    onSort={onSort}
  />
</TableHead>
```

**Et remplacer**:

```tsx
<TableHead>Visibilité</TableHead>
```

**Par**:

```tsx
<TableHead>
  <SortableHeader
    field="public"
    label="Visibilité"
    currentSort={sortState}
    onSort={onSort}
  />
</TableHead>
```

**Temps estimé**: 5 minutes

---

## 🔴 ÉTAPE 2 : Migration Database - Normalisation Status (Priorité Haute)

### Problème Identifié

Le seed database `20250926153000_seed_spectacles.sql` utilise des statuts avec underscores:

- `en_cours`, `en_tournee`, `nouvelle_creation` → devrait être `en cours`
- `termine` → devrait être `terminé` (avec accent)
- `annule` → devrait être `annulé` (avec accent)

### A. Créer la Migration

**Fichier**: `supabase/migrations/20251118130000_normalize_spectacles_status.sql`

**Contenu**:

```sql
-- Migration: Normalize spectacles status values
-- Date: 2025-11-18
-- Purpose: Remove underscores, add proper accents, standardize status values

-- Update existing status values to normalized format
UPDATE public.spectacles
SET status = CASE
  -- Normalize "en cours" variants
  WHEN status = 'en_cours' THEN 'en cours'
  WHEN status = 'en_tournee' THEN 'en cours'
  WHEN status = 'nouvelle_creation' THEN 'en cours'
  
  -- Normalize "terminé" (add accent)
  WHEN status = 'termine' THEN 'terminé'
  
  -- Normalize "en preparation"
  WHEN status = 'en_preparation' THEN 'en preparation'
  
  -- Normalize "a l affiche"
  WHEN status = 'a_l_affiche' THEN 'a l affiche'
  
  -- Normalize "annulé" (add accent)
  WHEN status = 'annule' THEN 'annulé'
  
  -- Keep other values as-is
  ELSE status
END
WHERE status LIKE '%_%' OR status IN ('termine', 'annule');

-- Update column comment for documentation
COMMENT ON COLUMN public.spectacles.status IS 
'Status values: draft, published, archived, en cours, terminé, projet, a l affiche, en preparation, annulé (normalized - no underscores, proper accents)';
```

### B. Appliquer la Migration

**Commandes**:

```bash
# Test en local
pnpm dlx supabase db reset

# Vérifier les données
pnpm dlx supabase db diff

# Déployer sur Cloud
pnpm dlx supabase db push
```

**Temps estimé**: 5 minutes

---

## 🟡 ÉTAPE 3 : Uniformiser Status Display (Priorité Moyenne)

### Problème Identifié

**Fichier**: `app/(admin)/admin/spectacles/[id]/page.tsx`

La fonction locale `getStatusLabel()` utilise un mapping obsolète avec underscores:

**Avant**:

```typescript
function getStatusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    projet: "Projet",
    en_cours: "En cours", // ❌ Underscore obsolète
    termine: "Terminé",   // ❌ Pas d'accent
  };
  return status ? labels[status] || status : "—";
}
```

### A. Utiliser STATUS_LABELS depuis helpers

**Remplacer la fonction par**:

```typescript
import { STATUS_LABELS } from "@/lib/tables/spectacle-table-helpers";
import { capitalizeWords } from "@/lib/forms/spectacle-form-helpers";

function getStatusLabel(status: string | null): string {
  if (!status) return "—";
  
  // Normalize status (handle old underscore format)
  const normalizedStatus = status.replace(/_/g, ' ');
  
  // Use predefined label if available, otherwise capitalize
  return STATUS_LABELS[normalizedStatus] || capitalizeWords(normalizedStatus);
}
```

**Temps estimé**: 3 minutes

---

## 🟢 ÉTAPE 4 : Refactor SpectacleForm (Priorité Basse - Optionnel)

### Problème Identifié

**Fichier**: `components/features/admin/spectacles/SpectacleForm.tsx`

- Taille actuelle: ~280 lignes
- Limite Clean Code: 300 lignes (OK mais proche)
- Limite stricte par fonction: ≤30 lignes (plusieurs violations)

### Options de Refactoring

#### Option A: Extraire Composants (Recommandé)

**Composants à créer**:

1. **`GenreSelectField.tsx`** (40 lignes)
   - Gère la logique dropdown genre
   - State `isCreatingNewGenre`
   - Conditional render Select vs Input

2. **`FormActionsButtons.tsx`** (20 lignes)
   - Boutons Annuler + Submit
   - Loading states

3. **`SpectacleFormFields.tsx`** (100 lignes)
   - Grid de champs (titre, slug, status, genre, durée, casting)
   - Description + short_description
   - Dates (première, image_url)

**Résultat**: `SpectacleForm.tsx` descendrait à ~120 lignes

#### Option B: Garder tel quel

Si vous préférez une approche pragmatique:

- ✅ Respect de la limite 300 lignes
- ✅ Logique cohérente et lisible
- ✅ TypeScript strict compliant
- ⚠️ Quelques fonctions >30 lignes (acceptable dans ce contexte)

**Temps estimé**: 30-45 minutes (si refactor choisi)

---

## 📊 Checklist de Validation

### Tests TypeScript

```bash
pnpm tsc --noEmit  # Doit passer sans erreur
```

### Tests ESLint

```bash
pnpm lint          # Doit passer sans erreur
```

### Tests Fonctionnels

#### 1. Tri Multi-Colonnes

- [ ] Cliquer sur "Titre" → tri A-Z puis Z-A
- [ ] Cliquer sur "Genre" → tri alphabétique
- [ ] Cliquer sur "Statut" → tri par ordre alphabétique
- [ ] Cliquer sur "Durée" → tri numérique (0 à la fin)
- [ ] Cliquer sur "Première" → tri chronologique
- [ ] Cliquer sur "Visibilité" → Public avant Privé

#### 2. Genre Select

- [ ] Sélection d'un genre existant fonctionne
- [ ] Option "Créer un nouveau genre" affiche l'input
- [ ] Capitalisation automatique à la saisie
- [ ] Bouton "Annuler" revient au select

#### 3. Status Display

- [ ] Tous les statuts affichent labels français corrects
- [ ] Pas de underscores visibles dans l'UI
- [ ] Accents présents (Terminé, Annulé)

#### 4. Migration Database

- [ ] `supabase db reset` passe sans erreur
- [ ] Toutes les tables créées
- [ ] Données seeds appliquées
- [ ] Query test: `SELECT DISTINCT status FROM spectacles;` → Résultats normalisés

---

## 🎯 Success Criteria - Version Finale

| Critère | État Actuel | État Cible |
|---------|-------------|------------|
| Status database sans underscores | ⚠️ Schema OK, seed obsolète | ✅ Migration appliquée |
| Genres toujours capitalisés | ✅ Transform Zod | ✅ Maintenu |
| Select genre réutilisable | ✅ Dropdown fonctionnel | ✅ Maintenu |
| Tri 6 colonnes | ⚠️ 4/6 | ✅ 6/6 |
| Visual feedback tri | ✅ Icons | ✅ Maintenu |
| TypeScript 0 errors | ⚠️ À vérifier | ✅ Validé |
| Clean Code ≤30 lignes | ⚠️ SpectacleForm ~280 | 🟡 Acceptable (ou refactor) |

**Score cible**: 100/100 ✅

---

## 📝 Notes d'Implémentation

### Ordre d'Exécution Recommandé

1. **Étape 1** (Tri) → Tests TypeScript → Commit
2. **Étape 2** (Migration) → Tests Database → Commit
3. **Étape 3** (Status Display) → Tests Fonctionnels → Commit
4. **Étape 4** (Refactor optionnel) → Si souhaité

### Commits Suggérés

```bash
# Après Étape 1
git commit -m "feat(spectacles): add sorting for duration and visibility columns

- Update SortField type to include duration_minutes and public
- Add sort cases for numeric duration and boolean visibility
- Add SortableHeader components for missing columns
- Complete sorting feature implementation (6/6 columns)

Refs: plan-spectaclesSortingAndGenreRefactoring.prompt.md"

# Après Étape 2
git commit -m "fix(db): normalize spectacles status values

- Remove underscores: en_cours → en cours
- Add proper accents: termine → terminé, annule → annulé
- Update seed data to use normalized format
- Add migration 20251118130000_normalize_spectacles_status.sql

BREAKING CHANGE: Existing status values updated. May affect filters/queries."

# Après Étape 3
git commit -m "refactor(spectacles): use centralized STATUS_LABELS mapping

- Replace local getStatusLabel() with helper import
- Ensure consistent status display across all views
- Handle legacy underscore format gracefully
- Improve maintainability"
```

---

## ⚠️ Points d'Attention

### 1. Migration Idempotence

La migration utilise `WHERE status LIKE '%_%'` pour éviter de re-traiter des valeurs déjà normalisées.

### 2. Backward Compatibility

Les helpers gèrent gracieusement les anciens formats:

```typescript
const normalizedStatus = status.replace(/_/g, ' '); // Convert old format
```

### 3. Tests de Non-Régression

Après migration, vérifier:

- Liste des spectacles charge correctement
- Filtres par status fonctionnent
- Création/édition respecte nouveau format
- API retourne données cohérentes

---

## 🎉 Résultat Final Attendu

**Architecture**:

- ✅ DAL bien structuré
- ✅ Validation Zod + TypeScript strict
- ✅ Composants réutilisables
- ✅ Tri complet avec visual feedback
- ✅ Helpers de normalisation documentés

**Database**:

- ✅ Schema déclaratif à jour
- ✅ Status normalisés sans underscores
- ✅ Migration idempotente

**User Experience**:

- ✅ Tri intuitif sur toutes les colonnes
- ✅ Genre select avec suggestions
- ✅ Labels français corrects partout
- ✅ Performance optimale (useMemo, locale compare)

**Code Quality**:

- ✅ TypeScript 0 erreurs
- ✅ ESLint 0 warnings
- ✅ Clean Code compliant (ou refactor optionnel)
- ✅ Documentation inline claire

**Score Final**: 100/100 🎯
