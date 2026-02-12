# Plan: Remplacer PartnersView par LogoCloud

Remplacement des cartes flip 3D par un défilement infini élégant avec logos grayscale, fond blur, liens cliquables et skeleton horizontal adapté.

**Status:** ✅ Complete  
**Completed:** 2026-01-15

## Steps

### 1. Étendre LogoCloud/types.ts

Ajouter champs optionnels `id?: number`, `website?: string` au type `Partner` + nouvelle prop `linkable?: boolean` à `LogoCloudProps` pour activer les liens.

### 2. Modifier LogoCloud.tsx

- Wrapper conditionnel `<a>` ou `<div>` selon `linkable` et présence de `website`
- Ajouter fond blur sur les items : `backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-xl p-4`
- Confirmer effet grayscale → couleur déjà présent (`grayscale hover:grayscale-0 opacity-60 hover:opacity-100`)
- Ajouter transition `scale-105` au hover pour effet de focus

### 3. Refactorer PartnersView.tsx

- Supprimer composants `PartnerCard` et import `Card`/`CardContent`/`ExternalLink`
- Importer `LogoCloud` depuis `@/components/LogoCloud`
- Passer `partners`, `linkable={true}`, `speed="normal"`, `pauseOnHover={true}`
- Conserver `ThankYouMessage` en dessous du LogoCloud
- Gérer `isLoading` avec le nouveau skeleton

### 4. Créer skeleton horizontal dans partners-skeleton.tsx

Remplacer les cartes par 6-8 rectangles animés en ligne avec `animate-pulse`, fond blur, même hauteur que les logos.

### 5. Nettoyer types.ts (partners)

Simplifier l'interface `Partner` pour ne garder que les champs utilisés (`id`, `name`, `logo`, `website`) ou ré-exporter depuis LogoCloud avec extension.

## Decisions

- **Liens cliquables** : Option A (ajout prop `linkable={true}`)
- **Descriptions** : Option B (logos seuls, plus élégant)
- **Skeleton** : Option A (horizontal cohérent avec LogoCloud)
- **Opacité blur** : `bg-white/10` (équilibre subtil)
