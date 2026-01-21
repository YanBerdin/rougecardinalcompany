# Plan : Implémentation CRUD Gestion Presse (TASK024)

**Status:** ✅ Completed  
**TASK:** `memory-bank/tasks/TASK024-press-management.md`  
**Completed:** January 21, 2026

Implémentation d'un système complet de gestion presse pour Rouge Cardinal : CRUD admin pour **communiqués de presse**, **articles presse** et **contacts presse**, avec gestion des attachements PDF (ordre d'upload), workflow draft/preview/publish, et liaisons contextuelles vers spectacles/événements. Textarea simple pour les contenus, pas de notifications email.

---

## 📊 Schéma DB réel (post-implémentation)

### Table `communiques_presse`

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | bigint | PK auto-générée | Primary key |
| `title` | text | Titre du communiqué | NOT NULL |
| `slug` | text | URL-friendly identifier | UNIQUE |
| `description` | text | Contenu principal | - |
| `date_publication` | date | Date de publication | NOT NULL |
| `image_url` | text | URL image externe | - |
| `spectacle_id` | bigint | Relation spectacle (FK) | NULLABLE |
| `evenement_id` | bigint | Relation événement (FK) | NULLABLE |
| `public` | boolean | Visibilité publique | Default false |
| `ordre_affichage` | integer | Ordre affichage | Default 0 |
| `file_size_bytes` | bigint | Taille fichier PDF | - |
| `created_by` | uuid | Créateur (FK auth.users) | - |
| `created_at` | timestamptz | Date création | - |
| `updated_at` | timestamptz | Date modification | - |

**RLS :** Lecture publique si `public = true` OU admin, CRUD admin complet

---

### Table `contacts_presse` (Admin-only)

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | bigint | PK auto-générée | Primary key |
| `nom` | text | Nom de famille | NOT NULL |
| `prenom` | text | Prénom | - |
| `fonction` | text | Ex: "Journaliste culture" | - |
| `media` | text | Nom du média | NOT NULL |
| `email` | text | Email professionnel | UNIQUE, NOT NULL |
| `telephone` | text | Téléphone | - |
| `adresse` | text | Adresse postale | - |
| `ville` | text | Ville | - |
| `specialites` | text[] | Tags spécialités (théâtre, danse...) | - |
| `notes` | text | Notes internes admin | - |
| `actif` | boolean | Contact actif | Default true |
| `derniere_interaction` | timestamptz | Dernière interaction | - |
| `created_by` | uuid | Créateur (FK auth.users) | - |
| `created_at` | timestamptz | Date création | - |
| `updated_at` | timestamptz | Date modification | - |

**RLS :** Admin uniquement (table privée, pas de lecture publique)

---

## ✅ Implémentation réalisée

### Phase 1 : Schemas Zod — ✅ Completed

| Fichier | Status | Description |
|---------|--------|-------------|
| `lib/schemas/press-release.ts` | ✅ | Server/UI/DTO schemas pour PressRelease |
| `lib/schemas/press-contact.ts` | ✅ | Server/UI/DTO schemas pour PressContact |

**PressRelease schemas:**
- `PressReleaseInputSchema` (Server, `bigint` pour FK)
- `PressReleaseFormSchema` (UI, `number` pour FK)
- `PressReleaseDTO` (return type DAL)
- `PublishPressReleaseSchema` (action publish/unpublish)
- `SelectOptionDTO` (pour dropdowns spectacles/événements)

**PressContact schemas:**
- `PressContactInputSchema` (Server)
- `PressContactFormSchema` (UI)
- `PressContactDTO` (return type DAL)
- `TogglePressContactActiveSchema` (action toggle actif)

---

### Phase 2 : DAL Admin — ✅ Completed

| Fichier | Status | Fonctions |
|---------|--------|-----------|
| `lib/dal/admin-press-releases.ts` | ✅ | CRUD + publish + helpers |
| `lib/dal/admin-press-articles.ts` | ✅ | CRUD complet |
| `lib/dal/admin-press-contacts.ts` | ✅ | CRUD + toggle active |

**Fonctions admin-press-releases.ts:**
```typescript
fetchAllPressReleasesAdmin(): Promise<DALResult<PressReleaseDTO[]>>
fetchPressReleaseById(id: bigint): Promise<DALResult<PressReleaseDTO | null>>
createPressRelease(input: PressReleaseInput): Promise<DALResult<PressReleaseDTO>>
updatePressRelease(id: bigint, input: Partial<PressReleaseInput>): Promise<DALResult<PressReleaseDTO>>
deletePressRelease(id: bigint): Promise<DALResult<null>>
publishPressRelease(id: bigint): Promise<DALResult<PressReleaseDTO>>
unpublishPressRelease(id: bigint): Promise<DALResult<PressReleaseDTO>>
fetchSpectaclesForSelect(): Promise<DALResult<SelectOptionDTO[]>>
fetchEvenementsForSelect(): Promise<DALResult<SelectOptionDTO[]>>
```

**Fonctions admin-press-contacts.ts:**
```typescript
fetchAllPressContacts(): Promise<DALResult<PressContactDTO[]>>
fetchPressContactById(id: bigint): Promise<DALResult<PressContactDTO | null>>
createPressContact(input: PressContactInput): Promise<DALResult<PressContactDTO>>
updatePressContact(id: bigint, input: Partial<PressContactInput>): Promise<DALResult<PressContactDTO>>
deletePressContact(id: bigint): Promise<DALResult<null>>
togglePressContactActive(id: bigint, actif: boolean): Promise<DALResult<PressContactDTO>>
```

---

### Phase 3 : Routes Admin — ✅ Completed

**Structure créée:**

```bash
app/(admin)/admin/presse/
├── page.tsx                              # Page principale avec Tabs
├── actions.ts                            # Server Actions
├── communiques/
│   ├── new/page.tsx                      # Création
│   └── [id]/
│       ├── edit/page.tsx                 # Édition
│       └── preview/page.tsx              # Prévisualisation
├── articles/
│   ├── new/page.tsx                      # Création
│   └── [id]/
│       └── edit/page.tsx                 # Édition
└── contacts/
    ├── new/page.tsx                      # Création
    └── [id]/
        └── edit/page.tsx                 # Édition
```

**Server Actions (actions.ts):**
```typescript
// Communiqués
createPressReleaseAction(input: unknown): Promise<ActionResult>
updatePressReleaseAction(id: string, input: unknown): Promise<ActionResult>
deletePressReleaseAction(id: string): Promise<ActionResult>
publishPressReleaseAction(id: string, isPublic: boolean): Promise<ActionResult>

// Articles
createArticleAction(input: unknown): Promise<ActionResult>
updateArticleAction(id: string, input: unknown): Promise<ActionResult>
deleteArticleAction(id: string): Promise<ActionResult>

// Contacts
createPressContactAction(input: unknown): Promise<ActionResult>
updatePressContactAction(id: string, input: unknown): Promise<ActionResult>
deletePressContactAction(id: string): Promise<ActionResult>
togglePressContactActiveAction(id: string, actif: boolean): Promise<ActionResult>
```

---

### Phase 4 : Composants UI — ✅ Completed

**Structure créée:**

```bash
components/features/admin/presse/
├── types.ts                              # Props interfaces
├── PressReleasesContainer.tsx            # Server Component
├── PressReleasesView.tsx                 # Client Component avec useEffect sync
├── PressReleaseNewForm.tsx               # Formulaire création
├── PressReleaseEditForm.tsx              # Formulaire édition
├── ArticlesContainer.tsx                 # Server Component
├── ArticlesView.tsx                      # Client Component
├── ArticleNewForm.tsx                    # Formulaire création
├── ArticleEditForm.tsx                   # Formulaire édition
├── PressContactsContainer.tsx            # Server Component
├── PressContactsView.tsx                 # Client Component
├── PressContactNewForm.tsx               # Formulaire création
└── PressContactEditForm.tsx              # Formulaire édition
```

**Patterns appliqués:**
- Smart/Dumb component pattern (Container/View)
- `useEffect` sync pour state update après `router.refresh()`
- React Hook Form + Zod resolver avec schéma UI
- Formulaires séparés New/Edit (pas de type casting)

---

### Phase 5 : Prévisualisation — ✅ Completed

**Route:** `app/(admin)/admin/presse/communiques/[id]/preview/page.tsx`

**Features:**
- Affichage complet du communiqué (title, description, date, image)
- Badges status (Publié/Brouillon)
- Badges relations (Spectacle/Événement si liés)
- Affichage du slug
- Métadonnées (ID, ordre_affichage, created_at, updated_at)
- Bouton "Modifier" vers la page d'édition
- Bouton retour vers la liste

---

## 🎯 Mapping colonnes DB ↔ Code

### PressRelease (communiques_presse)

| Colonne DB | Schema/DTO | Description |
|------------|------------|-------------|
| `title` | `title` | ✅ Nom anglais conservé |
| `slug` | `slug` | ✅ |
| `description` | `description` | ✅ Contenu principal |
| `date_publication` | `date_publication` | ✅ Format ISO date |
| `image_url` | `image_url` | ✅ URL image externe |
| `spectacle_id` | `spectacle_id` | ✅ FK optionnelle |
| `evenement_id` | `evenement_id` | ✅ FK optionnelle |
| `public` | `public` | ✅ Boolean visibilité |
| `ordre_affichage` | `ordre_affichage` | ✅ |
| `file_size_bytes` | `file_size_bytes` | ✅ |
| `created_by` | `created_by` | ✅ |
| `created_at` | `created_at` | ✅ |
| `updated_at` | `updated_at` | ✅ |

### PressContact (contacts_presse)

| Colonne DB | Schema/DTO | Description |
|------------|------------|-------------|
| `nom` | `nom` | ✅ Nom de famille |
| `prenom` | `prenom` | ✅ Prénom |
| `fonction` | `fonction` | ✅ Titre/rôle |
| `media` | `media` | ✅ Nom du média (anciennement `nom_media`) |
| `email` | `email` | ✅ Email unique |
| `telephone` | `telephone` | ✅ |
| `adresse` | `adresse` | ✅ |
| `ville` | `ville` | ✅ |
| `specialites` | `specialites` | ✅ Array tags (anciennement `specialites_tags`) |
| `notes` | `notes` | ✅ |
| `actif` | `actif` | ✅ Boolean (anciennement `active`) |
| `derniere_interaction` | `derniere_interaction` | ✅ Date (anciennement `last_contact_date`) |
| `created_by` | `created_by` | ✅ |
| `created_at` | `created_at` | ✅ |
| `updated_at` | `updated_at` | ✅ |

---

## 🔧 Corrections appliquées (Session Jan 21, 2026)

### Corrections PressContact (noms de colonnes français)

**Fichiers modifiés:**
- `lib/dal/admin-press-contacts.ts` — 2 SELECT queries corrigées
- `app/(admin)/admin/presse/actions.ts` — togglePressContactActiveAction parameter
- `components/features/admin/presse/PressContactEditForm.tsx` — defaultValues + JSX
- `components/features/admin/presse/PressContactNewForm.tsx` — defaultValues + JSX
- `components/features/admin/presse/PressContactsView.tsx` — Badge, display, Switch

**Mapping corrections:**
| Ancien nom | Nouveau nom |
|------------|-------------|
| `nom_media` | `media` |
| `specialites_tags` | `specialites` |
| `active` | `actif` |
| `last_contact_date` | `derniere_interaction` |

### Corrections Preview Page

**Fichier:** `app/(admin)/admin/presse/communiques/[id]/preview/page.tsx`

**Mapping corrections:**
| Ancien nom | Nouveau nom |
|------------|-------------|
| `release.titre` | `release.title` |
| `release.extrait` | `release.description` |
| `release.contenu` | *(supprimé - pas dans DTO)* |
| `release.pdf_url` | *(supprimé - pas dans DTO)* |
| `release.lien_externe` | *(supprimé - pas dans DTO)* |
| `release.type` | *(remplacé par spectacle_titre/evenement_titre)* |

---

## ✅ Validation finale

### TypeScript — ✅ 0 erreurs

```bash
npx tsc --noEmit  # OK - no errors
```

### Tests fonctionnels — ✅ Validés

- [x] **Communiqués** : Créer/Éditer/Supprimer
- [x] **Communiqués** : Publier/Dépublier via bouton action
- [x] **Communiqués** : Prévisualisation avec toutes les données
- [x] **Communiqués** : Liaison optionnelle à un spectacle/événement
- [x] **Articles** : CRUD complet
- [x] **Contacts** : CRUD avec validation email
- [x] **Contacts** : Toggle actif/inactif
- [x] **Navigation** : 3 tabs (Communiqués/Articles/Contacts)

### Tests navigateur — ✅ Validés

- [x] Page `/admin/presse` avec 3 onglets fonctionnels
- [x] Page `/admin/presse/communiques/11/preview` affiche correctement les données
- [x] Formulaires de création/édition fonctionnels
- [x] Badge statut Draft/Publié visible

---

## 📚 Références projet

| Fichier | Usage |
|---------|-------|
| [lib/dal/admin-press-releases.ts](../../lib/dal/admin-press-releases.ts) | DAL admin communiqués |
| [lib/dal/admin-press-contacts.ts](../../lib/dal/admin-press-contacts.ts) | DAL admin contacts |
| [lib/dal/admin-press-articles.ts](../../lib/dal/admin-press-articles.ts) | DAL admin articles |
| [lib/schemas/press-release.ts](../../lib/schemas/press-release.ts) | Schemas PressRelease |
| [lib/schemas/press-contact.ts](../../lib/schemas/press-contact.ts) | Schemas PressContact |
| [app/(admin)/admin/presse/actions.ts](../../app/(admin)/admin/presse/actions.ts) | Server Actions |
| [app/(admin)/admin/presse/page.tsx](../../app/(admin)/admin/presse/page.tsx) | Page principale |
| [components/features/admin/presse/](../../components/features/admin/presse/) | Composants UI |
