# Phase 4.3 - Usage Tracking

**Status**: ✅ Implémenté  
**Date**: Novembre 2025

## Objectif

Empêcher la suppression accidentelle de médias utilisés sur les pages publiques (marketing) en affichant des indicateurs visuels et des avertissements.

## Architecture

### 1. Module DAL - Media Usage Tracking

**Fichier**: `lib/dal/media-usage.ts`

#### Fonctions principales

##### `checkMediaUsagePublic(mediaId: bigint)`

Vérifie si un média est utilisé dans les pages publiques.

**Tables vérifiées** (avec filtres `published_at IS NOT NULL` et `active = true`) :

- `home_hero_slides` (image_media_id)
- `home_about_content` (image_media_id)
- `membres_equipe` (photo_media_id)
- `spectacles` (og_image_media_id)
- `articles_presse` (og_image_media_id)
- `partners` (logo_media_id)
- `compagnie_presentation_sections` (image_media_id)

**Retour** :

```typescript
{
  is_used_public: boolean;
  usage_locations: string[]; // Ex: ["home_hero_slides", "team_members"]
}
```

##### `bulkCheckMediaUsagePublic(mediaIds: bigint[])`

Version optimisée pour vérifier plusieurs médias en une seule requête.

**Stratégie** :

- Une requête parallèle par table avec `Promise.all()`
- Construit une Map pour O(1) lookup
- Minimise le nombre d'appels base de données

### 2. Schéma - Extension DTO

**Fichier**: `lib/schemas/media.ts`

Ajout de champs optionnels au `MediaItemExtendedDTOSchema` :

```typescript
export const MediaItemExtendedDTOSchema = z.object({
  // ... champs existants
  is_used_public: z.boolean().optional(),
  usage_locations: z.array(z.string()).optional(),
});
```

### 3. DAL - Integration dans listMediaItems()

**Fichier**: `lib/dal/media.ts`

La fonction `listMediaItems()` appelle maintenant `bulkCheckMediaUsagePublic()` pour enrichir les DTOs :

```typescript
const usageMap = await bulkCheckMediaUsagePublic(mediaBigintIds);

const result = mediaData.map((media) => {
  const usageInfo = usageMap.get(String(media.id));
  return {
    ...media,
    is_used_public: usageInfo?.is_used_public ?? false,
    usage_locations: usageInfo?.usage_locations ?? [],
  };
});
```

### 4. UI - Indicateur sur MediaCard

**Fichier**: `components/features/admin/media/MediaCard.tsx`

Affichage conditionnel d'un badge "Utilisé sur le site" :

```tsx
{media.is_used_public && (
  <div 
    className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"
    title={`Utilisé dans: ${media.usage_locations?.join(", ") ?? ""}`}
  >
    <Eye className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
    <span>Utilisé sur le site</span>
  </div>
)}
```

**Design** :

- Couleur : `text-emerald-600` (vert positif)
- Icône : `Eye` de lucide-react
- Tooltip : Liste des emplacements d'utilisation

### 5. UI - Avertissement dans dialogue de suppression

**Fichier**: `components/features/admin/media/MediaBulkActions.tsx`

Calcul du nombre de médias utilisés :

```typescript
const usedMediaCount = selectedMedia.filter(m => m.is_used_public).length;
const usedMediaLocations = selectedMedia
  .filter(m => m.is_used_public && m.usage_locations)
  .flatMap(m => m.usage_locations ?? []);
const uniqueLocations = Array.from(new Set(usedMediaLocations));
```

Affichage conditionnel d'un avertissement dans `AlertDialog` :

```tsx
{usedMediaCount > 0 && (
  <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-3">
    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
      <WarningIcon />
      Attention
    </p>
    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
      <strong>{usedMediaCount}</strong> média{usedMediaCount > 1 ? "s sont utilisés" : " est utilisé"} sur le site public.
    </p>
    {uniqueLocations.length > 0 && (
      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
        Emplacements : {uniqueLocations.join(", ")}
      </p>
    )}
  </div>
)}
```

**Design** :

- Couleur : Amber (warning)
- Icône : Triangle d'avertissement SVG
- Layout : Box avec bordure et fond coloré

## Performance

### Optimisations implémentées

1. **Bulk checking** : Une seule requête par table au lieu de N requêtes
2. **Promise.all()** : Requêtes parallèles sur les 7 tables
3. **Map lookup** : O(1) pour récupérer les résultats
4. **Limite 1** : Utilisation de `.limit(1)` car on a juste besoin de savoir si ça existe

### Impact estimé

- **Requêtes par média** :
  - Sans optimisation : 7 requêtes × N médias = 7N requêtes
  - Avec optimisation : 7 requêtes (parallèles) = 7 requêtes total
  
- **Temps de réponse** (estimation pour 50 médias) :
  - Sans optimisation : ~350 requêtes → ~3-5 secondes
  - Avec optimisation : 7 requêtes → ~100-200ms

## Sécurité

### Filtres appliqués

Seuls les enregistrements **publics** sont comptés :

```typescript
.not("published_at", "is", null)  // Publié
.eq("active", true)               // Actif (si applicable)
```

**Pourquoi** :

- Un média utilisé dans un brouillon non publié peut être supprimé sans risque
- Seules les pages visibles par le public comptent

### Tables exclues du tracking

Les tables suivantes ne sont PAS vérifiées car elles concernent l'admin :

- `membres_equipe_admin` (zone admin, pas public)
- `compagnie_presentation_sections_admin` (zone admin)
- `partners_admin` (zone admin)
- `profiles` (avatars utilisateurs, non publics)

## Tests manuels recommandés

### Test 1 : Indicateur sur carte

1. Créer un hero slide publié avec une image
2. Aller dans la bibliothèque média
3. ✅ L'image doit avoir le badge "Utilisé sur le site"

### Test 2 : Avertissement de suppression

1. Sélectionner plusieurs médias dont au moins 1 utilisé
2. Cliquer sur "Supprimer"
3. ✅ L'AlertDialog doit afficher l'avertissement amber

### Test 3 : Performance

1. Uploader 50+ images
2. Les utiliser dans divers contenus publics
3. ✅ Le chargement de la bibliothèque doit rester < 2s

## Améliorations futures (Phase 4.4+)

### 1. Cache des résultats

Actuellement, le tracking est re-calculé à chaque visite de `/admin/media`.

**Optimisation possible** :

- Cacher les résultats pendant 5 minutes (SWR)
- Invalider le cache lors de modifications de contenu
- Utiliser Redis pour un cache distribué

### 2. Compteur d'usages détaillé

Afficher le nombre exact d'utilisations :

```tsx
{media.usage_count > 0 && (
  <span>Utilisé {media.usage_count} fois</span>
)}
```

### 3. Lien vers les pages d'utilisation

Permettre de naviguer directement vers les pages qui utilisent le média :

```tsx
<ul>
  {media.usage_details.map(usage => (
    <li key={usage.id}>
      <Link href={usage.edit_url}>{usage.title}</Link>
    </li>
  ))}
</ul>
```

### 4. Tracking d'usage privé (admin)

Étendre le tracking aux tables admin pour éviter les suppressions problématiques :

```typescript
is_used_admin: boolean;
admin_usage_locations: string[];
```

## Checklist de déploiement

- [x] Créer `lib/dal/media-usage.ts`
- [x] Ajouter champs `is_used_public` et `usage_locations` au schéma
- [x] Intégrer `bulkCheckMediaUsagePublic()` dans `listMediaItems()`
- [x] Afficher badge sur `MediaCard`
- [x] Ajouter avertissement dans dialogue de suppression
- [x] Tester sur environnement de dev
- [ ] Tester sur staging avec données réelles
- [ ] Monitorer les performances après déploiement
- [ ] Documenter dans le guide utilisateur

## Références

- `.github/instructions/dal-solid-principles.instructions.md` - Patterns DAL
- `doc/phase4-summary.md` - Vue d'ensemble Phase 4
- `memory-bank/activeContext.md` - Contexte projet actuel
