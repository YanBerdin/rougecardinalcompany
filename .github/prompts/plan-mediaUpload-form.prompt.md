# Plan d'activation du téléversement d'images

## 📋 Analyse de l'existant

### ✅ Composants déjà configurés

- **SpectacleForm.tsx** : Téléversement activé avec `showUpload={true}` et `uploadFolder="spectacles"`
- **ImageFieldGroup.tsx** : Supporte déjà `showUpload` et `uploadFolder` props
- **MediaUploadDialog.tsx** : Composant d'upload générique prêt à l'emploi

### ❌ Composants à activer

1. **AboutContentForm.tsx** — Section "À propos" (home page)
2. **HeroSlideForm.tsx** — Slides carousel homepage
3. **TeamMemberForm.tsx** — Photos membres équipe

---

## 🎯 Plan d'activation par formulaire

### 1️⃣ AboutContentForm.tsx

**Fichier** : `components/features/admin/home/AboutContentForm.tsx`

**Modifications nécessaires** :

```tsx
// Ligne ~86 : Ajouter showUpload + uploadFolder
<ImageFieldGroup
    form={form}
    imageUrlField="image_url"
    imageMediaIdField="image_media_id"
    altTextField="alt_text"
    label="Section Image"
    showUpload={true}           // ✅ AJOUT
    uploadFolder="home-about"   // ✅ AJOUT
/>
```

**Justification du dossier** :

- `home-about/` — Dossier spécifique pour les images de la section "À propos"
- Séparation logique du contenu home vs autres sections

**Validation** :

- ✅ DAL déjà configuré : `lib/dal/admin-home-about.ts` supporte `image_media_id`
- ✅ Schéma validé : `AboutContentFormSchema` accepte `image_media_id` (number)

---

### 2️⃣ HeroSlideForm.tsx

**Fichier** : `components/features/admin/home/HeroSlideForm.tsx`

**Modifications nécessaires** :

```tsx
// Ligne ~91 : Ajouter showUpload + uploadFolder
<ImageFieldGroup
    form={form}
    imageUrlField="image_url"
    imageMediaIdField="image_media_id"
    altTextField="alt_text"
    label="Image"
    required
    showUpload={true}           // ✅ AJOUT
    uploadFolder="home-hero"    // ✅ AJOUT
/>
```

**Justification du dossier** :

- `home-hero/` — Dossier spécifique pour les slides du carousel principal
- Images haute résolution (typiquement 1920x1080+)

**Validation** :

- ✅ DAL déjà configuré : `lib/dal/admin-home-hero.ts` supporte `image_media_id`
- ✅ Schéma validé : `HeroSlideFormSchema` accepte `image_media_id` (number)

---

### 3️⃣ TeamMemberForm.tsx

**Fichier** : `components/features/admin/team/TeamMemberForm.tsx`

**Modifications nécessaires** :

```tsx
// Ligne ~80 : Ajouter showUpload + uploadFolder
<ImageFieldGroup
    form={form}
    imageUrlField="image_url"
    imageMediaIdField="photo_media_id"  // ⚠️ Note : nom différent
    label="Photo du membre"
    showAltText={false}
    showUpload={true}           // ✅ AJOUT
    uploadFolder="team"         // ✅ AJOUT (déjà utilisé ailleurs)
/>
```

**Particularités** :

- ⚠️ Utilise `photo_media_id` au lieu de `image_media_id` (cohérence DB)
- Le dossier `team/` est déjà utilisé dans d'autres parties de l'app

**Validation** :

- ✅ DAL déjà configuré : `lib/dal/team.ts` supporte `photo_media_id`
- ✅ Schéma validé : `TeamMemberFormSchema` accepte `photo_media_id` (number)

---

## 📁 Structure des dossiers de stockage

```bash
medias/
├── spectacles/        # ✅ Existant (SpectacleForm)
├── team/              # ✅ À activer (TeamMemberForm)
├── home-hero/         # ✅ À créer (HeroSlideForm)
├── home-about/        # ✅ À créer (AboutContentForm)
└── press/             # Existant (autre fonctionnalité)
```

---

## 🔍 Checklist de validation

### Pour chaque formulaire modifié

- [ ] **Prop `showUpload={true}`** ajoutée à `ImageFieldGroup`
- [ ] **Prop `uploadFolder="xxx"`** définie avec nom cohérent
- [ ] **Schéma Zod** valide `image_media_id` ou `photo_media_id` (number)
- [ ] **DAL** supporte le champ `*_media_id` (bigint en DB, number en form)
- [ ] **Action Server** passe le `*_media_id` au DAL sans conversion
- [ ] **Tests manuels** :
  - Téléversement d'une image → enregistre `media_id` correct
  - Médiathèque → sélection d'image existante fonctionne
  - URL externe → validation + prévisualisation OK
  - Suppression d'image → champ réinitialisé

---

## 📝 Modifications à apporter

### Fichier 1 : `components/features/admin/home/AboutContentForm.tsx`

```diff
  <ImageFieldGroup
      form={form}
      imageUrlField="image_url"
      imageMediaIdField="image_media_id"
      altTextField="alt_text"
      label="Section Image"
+     showUpload={true}
+     uploadFolder="home-about"
  />
```

### Fichier 2 : `components/features/admin/home/HeroSlideForm.tsx`

```diff
  <ImageFieldGroup
      form={form}
      imageUrlField="image_url"
      imageMediaIdField="image_media_id"
      altTextField="alt_text"
      label="Image"
      required
+     showUpload={true}
+     uploadFolder="home-hero"
  />
```

### Fichier 3 : `components/features/admin/team/TeamMemberForm.tsx`

```diff
  <ImageFieldGroup
      form={form}
      imageUrlField="image_url"
      imageMediaIdField="photo_media_id"
      label="Photo du membre"
      showAltText={false}
+     showUpload={true}
+     uploadFolder="team"
  />
```

---

## ⚠️ Points d'attention

### 1. Validation d'image obligatoire (HeroSlideForm)

```tsx
// HeroSlideForm a une contrainte : image OBLIGATOIRE
<ImageFieldGroup
    required  // ← Déjà présent
    showUpload={true}
    // ...
/>
```

✅ La prop `required` est déjà gérée correctement par `ImageFieldGroup`

### 2. Schémas Server vs UI (bigint → number)

Le pattern est déjà correct dans tous les formulaires :

- **Schéma UI** : `image_media_id: z.number()` (JSON serializable)
- **Schéma Server** : `image_media_id: z.coerce.bigint()` (DB format)
- **Conversion** : Gérée automatiquement par les Server Actions

### 3. Noms de champs différents (Team)

```tsx
// Team utilise photo_media_id (pas image_media_id)
imageMediaIdField="photo_media_id"  // ✅ Correct
```

---

## 🚀 Ordre de déploiement recommandé

1. **TeamMemberForm** (le plus simple, dossier `team/` déjà existant)
2. **AboutContentForm** (nouveau dossier `home-about/`)
3. **HeroSlideForm** (nouveau dossier `home-hero/`, validation stricte)

---

## ✅ Résultat final attendu

Après ces modifications, **tous les formulaires admin** disposeront de :

- ✅ Bouton "Téléverser" pour upload direct
- ✅ Bouton "Médiathèque" pour sélection existante
- ✅ Champ URL externe avec validation
- ✅ Prévisualisation temps réel
- ✅ Validation d'image (MIME type, taille, accessibilité)
