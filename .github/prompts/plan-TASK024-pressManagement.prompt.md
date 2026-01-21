# Plan : Implémentation CRUD Gestion Presse (TASK024)

**Status:** In Progress  
**TASK:** `memory-bank/tasks/TASK024-press-management.md`

Implémentation d'un système complet de gestion presse pour Rouge Cardinal : CRUD admin pour **communiqués de presse**, **articles presse** et **contacts presse**, avec gestion des attachements PDF (ordre d'upload), workflow draft/preview/publish, et liaisons contextuelles vers spectacles/événements. Textarea simple pour les contenus, pas de notifications email.

---

## 📊 Analyse de l'existant

### Tables DB disponibles (schema existant)

#### Table `communiques_presse`

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | bigint | PK auto-générée | Primary key |
| `title` | text | Titre du communiqué | NOT NULL |
| `slug` | text | URL-friendly identifier | UNIQUE |
| `description` | text | Contenu principal | - |
| `published_date` | date | Date de publication | NOT NULL |
| `external_image_url` | text | URL image externe | - |
| `spectacle_id` | bigint | Relation spectacle (FK) | NULLABLE |
| `evenement_id` | bigint | Relation événement (FK) | NULLABLE |
| `is_public` | boolean | Visibilité publique | Default true |
| `order_index` | integer | Ordre affichage | Default 0 |
| `file_size` | bigint | Taille fichier PDF | - |
| `created_by` | uuid | Créateur (FK auth.users) | - |

**Relations :**
- `communiques_presse_medias` — Liaison many-to-many avec `medias` (ordre via `order_index`, PDF principal = -1)
- `communiques_presse_categories` — Liaison avec `categories`
- `communiques_presse_tags` — Liaison avec `tags`

**RLS :** Lecture publique si `is_public = true` OU admin, CRUD admin complet

---

#### Table `articles_presse`

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | bigint | PK auto-générée | Primary key |
| `title` | text | Titre de l'article | NOT NULL |
| `author` | text | Auteur | - |
| `type` | text | Article/Critique/Interview/Portrait | - |
| `slug` | text | URL-friendly identifier | - |
| `chapeau` | text | Chapô/introduction | - |
| `excerpt` | text | Extrait | - |
| `source_name` | text | Nom du média | - |
| `source_url` | text | URL source | - |
| `published_at` | timestamptz | Date publication | - |
| `search_vector` | tsvector | Full-text search | - |

**Relations :**
- `articles_presse_medias` — Liaison many-to-many avec `medias`

**RLS :** Lecture publique (vue `articles_presse_public`), CRUD admin

**Vue publique :** `articles_presse_public` (SECURITY INVOKER)

---

#### Table `contacts_presse` (Admin-only)

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | bigint | PK auto-générée | Primary key |
| `nom` | text | Nom de famille | NOT NULL |
| `prenom` | text | Prénom | - |
| `fonction` | text | Ex: "Journaliste culture" | - |
| `nom_media` | text | Nom du média | NOT NULL |
| `email` | text | Email professionnel | UNIQUE, NOT NULL |
| `telephone` | text | Téléphone | - |
| `adresse` | text | Adresse postale | - |
| `ville` | text | Ville | - |
| `specialites_tags` | text[] | Tags spécialités (théâtre, danse...) | - |
| `notes` | text | Notes internes admin | - |
| `active` | boolean | Contact actif | Default true |
| `last_contact_date` | timestamptz | Dernière interaction | - |
| `created_by` | uuid | Créateur (FK auth.users) | - |

**RLS :** Admin uniquement (table privée, pas de lecture publique)

---

### DAL existant (lecture publique uniquement)

#### `lib/dal/presse.ts` - ✅ Existe

| Fonction | Description | Type retour |
|----------|-------------|-------------|
| `fetchPressReleases()` | Communiqués publics avec medias | `PressReleaseDTO[]` |
| `fetchPressArticles()` | Articles depuis vue publique | `ArticleDTO[]` |
| `fetchMediaKit()` | Items kit média | `MediaKitItemDTO[]` |

**⚠️ Manque :** Fonctions admin pour CRUD complet (create, update, delete, publish/unpublish)

---

### Schemas existants

#### `lib/schemas/presse.ts` - ✅ Existe partiellement

**Schemas actuels :**
- `PressReleaseDTO` — DTO lecture publique (id, title, date, description, fileUrl, fileSize)
- `ArticleDTO` — DTO lecture articles
- `MediaKitItemDTO` — DTO kit média
- `PressFilterSchema` — Filtres de recherche

**⚠️ Manque :**
- `PressReleaseInputSchema` (Server avec `bigint`)
- `PressReleaseFormSchema` (UI avec `number`)
- `ArticleInputSchema` / `ArticleFormSchema`
- `PressContactInputSchema` / `PressContactFormSchema`
- `PublishActionSchema` pour le workflow

---

### Routes & Composants admin

**⚠️ Manque complètement :**
- `app/(admin)/admin/presse/` — Aucune route admin presse existante
- `components/features/admin/presse/` — Aucun composant admin presse

---

## 🎯 Steps d'implémentation

### Phase 1 : Schemas Zod

1. **Créer `lib/schemas/press-release.ts`** avec pattern Server/UI/DTO — référence : [lib/schemas/partners.ts](../../lib/schemas/partners.ts)
   - `PressReleaseInputSchema` (Server, `bigint` pour FK)
   - `PressReleaseFormSchema` (UI, `number` pour FK)
   - `PressReleaseDTO` (return type DAL)
   - `PublishPressReleaseSchema` (action publish/unpublish)
   - Relations optionnelles : `spectacle_id`, `evenement_id`

2. **Créer `lib/schemas/press-article.ts`** avec pattern Server/UI/DTO — référence : [lib/schemas/spectacles.ts](../../lib/schemas/spectacles.ts)
   - `ArticleInputSchema` (Server)
   - `ArticleFormSchema` (UI)
   - `ArticleDTO` (return type DAL)

3. **Créer `lib/schemas/press-contact.ts`** avec pattern Server/UI/DTO — référence : [lib/schemas/team.ts](../../lib/schemas/team.ts)
   - `PressContactInputSchema` (Server)
   - `PressContactFormSchema` (UI, validation email RFC)
   - `PressContactDTO` (return type DAL)
   - Validation `specialites_tags` comme array optionnel

---

### Phase 2 : DAL Admin

4. **Créer `lib/dal/admin-press-releases.ts`** avec fonctions CRUD + publish — référence : [lib/dal/admin-partners.ts](../../lib/dal/admin-partners.ts)
   ```typescript
   // Fonctions principales
   fetchAllPressReleasesAdmin(): Promise<DALResult<PressReleaseDTO[]>>
   fetchPressReleaseById(id: bigint): Promise<DALResult<PressReleaseDTO | null>>
   createPressRelease(input: PressReleaseInput): Promise<DALResult<PressReleaseDTO>>
   updatePressRelease(id: bigint, input: Partial<PressReleaseInput>): Promise<DALResult<PressReleaseDTO>>
   deletePressRelease(id: bigint): Promise<DALResult<null>>
   
   // Workflow publication
   publishPressRelease(id: bigint): Promise<DALResult<PressReleaseDTO>>
   unpublishPressRelease(id: bigint): Promise<DALResult<PressReleaseDTO>>
   
   // Helpers pour relations
   fetchSpectaclesForSelect(): Promise<DALResult<Array<{ id: bigint; titre: string }>>>
   fetchEvenementsForSelect(): Promise<DALResult<Array<{ id: bigint; titre: string }>>>
   ```

5. **Créer `lib/dal/admin-press-articles.ts`** avec CRUD complet — référence : [lib/dal/admin-spectacles.ts](../../lib/dal/admin-spectacles.ts)
   ```typescript
   fetchAllArticlesAdmin(): Promise<DALResult<ArticleDTO[]>>
   fetchArticleById(id: bigint): Promise<DALResult<ArticleDTO | null>>
   createArticle(input: ArticleInput): Promise<DALResult<ArticleDTO>>
   updateArticle(id: bigint, input: Partial<ArticleInput>): Promise<DALResult<ArticleDTO>>
   deleteArticle(id: bigint): Promise<DALResult<null>>
   ```

6. **Créer `lib/dal/admin-press-contacts.ts`** avec CRUD + toggle active — référence : [lib/dal/team.ts](../../lib/dal/team.ts)
   ```typescript
   fetchAllPressContacts(): Promise<DALResult<PressContactDTO[]>>
   fetchPressContactById(id: bigint): Promise<DALResult<PressContactDTO | null>>
   createPressContact(input: PressContactInput): Promise<DALResult<PressContactDTO>>
   updatePressContact(id: bigint, input: Partial<PressContactInput>): Promise<DALResult<PressContactDTO>>
   deletePressContact(id: bigint): Promise<DALResult<null>>
   togglePressContactActive(id: bigint, active: boolean): Promise<DALResult<PressContactDTO>>
   ```

---

### Phase 3 : Support PDF Storage

7. **Migration support PDF** — Créer `supabase/migrations/YYYYMMDDHHmmss_add_pdf_support_medias_bucket.sql`
   ```sql
   -- Option A: Modifier bucket existant
   UPDATE storage.buckets
   SET allowed_mime_types = array_cat(
     allowed_mime_types,
     ARRAY['application/pdf']::text[]
   )
   WHERE id = 'medias';
   
   -- OU Option B: Créer bucket dédié
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES (
     'documents',
     'documents',
     true,
     10485760, -- 10MB
     ARRAY['application/pdf']::text[]
   );
   
   -- RLS pour bucket documents (si Option B)
   CREATE POLICY "Admin can upload documents"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'documents' AND (SELECT public.is_admin())
   );
   
   CREATE POLICY "Public can view documents"
   ON storage.objects FOR SELECT
   TO public, authenticated
   USING (bucket_id = 'documents');
   ```
   **Référence :** [supabase/schemas/02c_storage_buckets.sql](../../supabase/schemas/02c_storage_buckets.sql)

---

### Phase 4 : Routes Admin

8. **Créer la page principale avec Tabs** — `app/(admin)/admin/presse/page.tsx`
   ```typescript
   export const dynamic = 'force-dynamic';
   export const revalidate = 0;
   
   export default function PressePage() {
     return (
       <Tabs defaultValue="releases">
         <TabsList>
           <TabsTrigger value="releases">Communiqués</TabsTrigger>
           <TabsTrigger value="articles">Articles</TabsTrigger>
           <TabsTrigger value="contacts">Contacts</TabsTrigger>
         </TabsList>
         {/* Content with Suspense boundaries */}
       </Tabs>
     );
   }
   ```
   **Référence :** Pattern Tabs dans [app/(admin)/admin/analytics/page.tsx](../../app/(admin)/admin/analytics/page.tsx)

9. **Créer les routes CRUD communiqués**
   - `app/(admin)/admin/presse/communiques/new/page.tsx` — Création
   - `app/(admin)/admin/presse/communiques/[id]/edit/page.tsx` — Édition
   - `app/(admin)/admin/presse/communiques/[id]/preview/page.tsx` — Prévisualisation
   
   **Référence :** [app/(admin)/admin/partners/new/page.tsx](../../app/(admin)/admin/partners/new/page.tsx)

10. **Créer les routes CRUD articles**
    - `app/(admin)/admin/presse/articles/new/page.tsx`
    - `app/(admin)/admin/presse/articles/[id]/edit/page.tsx`

11. **Créer les routes CRUD contacts**
    - `app/(admin)/admin/presse/contacts/new/page.tsx`
    - `app/(admin)/admin/presse/contacts/[id]/edit/page.tsx`

12. **Créer les Server Actions** — `app/(admin)/admin/presse/actions.ts`
    ```typescript
    // Communiqués
    createPressReleaseAction(input: unknown): Promise<ActionResult>
    updatePressReleaseAction(id: string, input: unknown): Promise<ActionResult>
    deletePressReleaseAction(id: string): Promise<ActionResult>
    publishPressReleaseAction(id: string): Promise<ActionResult>
    unpublishPressReleaseAction(id: string): Promise<ActionResult>
    
    // Articles
    createArticleAction(input: unknown): Promise<ActionResult>
    updateArticleAction(id: string, input: unknown): Promise<ActionResult>
    deleteArticleAction(id: string): Promise<ActionResult>
    
    // Contacts
    createPressContactAction(input: unknown): Promise<ActionResult>
    updatePressContactAction(id: string, input: unknown): Promise<ActionResult>
    deletePressContactAction(id: string): Promise<ActionResult>
    togglePressContactActiveAction(id: string, active: boolean): Promise<ActionResult>
    ```
    **Avec revalidation :**
    ```typescript
    revalidatePath('/admin/presse');
    revalidatePath('/presse'); // Page publique
    ```
    **Référence :** [app/(admin)/admin/partners/actions.ts](../../app/(admin)/admin/partners/actions.ts)

---

### Phase 5 : Composants UI

13. **Créer les composants communiqués**
    - `components/features/admin/presse/PressReleasesContainer.tsx` (Server)
    - `components/features/admin/presse/PressReleasesView.tsx` (Client avec `useEffect` sync)
    - `components/features/admin/presse/PressReleaseForm.tsx` (React Hook Form)
    
    **Features du formulaire :**
    - `MediaLibraryPicker` pour image de couverture
    - `Select` shadcn pour liaison spectacle/événement (dropdowns optionnels)
    - Upload fichiers multiples (images + PDF) via `ImageUploadWithMediaLibrary`
    - Badge statut Draft/Publié
    - Textarea simple pour `description` (pas de rich text)
    
    **Référence :** [components/features/admin/partners/PartnerForm.tsx](../../components/features/admin/partners/PartnerForm.tsx)

14. **Créer les composants articles**
    - `components/features/admin/presse/ArticlesContainer.tsx` (Server)
    - `components/features/admin/presse/ArticlesView.tsx` (Client)
    - `components/features/admin/presse/ArticleForm.tsx`
    
    **Features :** Textarea pour `chapeau` et `excerpt`, champ `source_url` optionnel

15. **Créer les composants contacts**
    - `components/features/admin/presse/PressContactsContainer.tsx` (Server)
    - `components/features/admin/presse/PressContactsView.tsx` (Client)
    - `components/features/admin/presse/PressContactForm.tsx`
    
    **Features :** Multi-select tags pour `specialites_tags`, switch pour `active`
    
    **Référence :** [components/features/admin/team/TeamMemberForm.tsx](../../components/features/admin/team/TeamMemberForm.tsx)

16. **Créer le fichier types** — `components/features/admin/presse/types.ts`
    ```typescript
    // Props interfaces pour tous les composants presse
    export interface PressReleaseFormProps { /* ... */ }
    export interface ArticleFormProps { /* ... */ }
    export interface PressContactFormProps { /* ... */ }
    ```

---

### Phase 6 : Prévisualisation

17. **Implémenter la route preview** — `app/(admin)/admin/presse/communiques/[id]/preview/page.tsx`
    ```typescript
    export default async function PreviewPage({ params }: { params: { id: string } }) {
      const release = await fetchPressReleaseById(BigInt(params.id));
      
      return (
        <>
          <PreviewBanner>
            <p>Mode prévisualisation</p>
            {release.is_public === false && (
              <PublishButton releaseId={params.id} />
            )}
          </PreviewBanner>
          
          {/* Rendu public réutilisé */}
          <PressReleasePublicView release={release} />
        </>
      );
    }
    ```
    **Référence :** Pattern preview dans [app/(marketing)/spectacles/[slug]/page.tsx](../../app/(marketing)/spectacles/[slug]/page.tsx)

---

### Phase 7 : Navigation

18. **Ajouter le lien sidebar** — Modifier `components/admin/sidebar/app-sidebar.tsx`
    ```typescript
    {
      title: "Presse",
      url: "/admin/presse",
      icon: Newspaper, // lucide-react icon
    }
    ```
    **Référence :** [components/admin/sidebar/app-sidebar.tsx](../../components/admin/sidebar/app-sidebar.tsx)

---

## 🎯 Decisions architecturales

| Question | Décision | Justification |
|----------|----------|---------------|
| **Rich Text Editor** | ❌ Textarea simple (MVP) | Structure DB actuelle (champs `text`), ajout Markdown preview si besoin utilisateur |
| **Workflow publication** | ✅ Draft/Publish sans dates programmées | Champ `is_public` (communiqués) et `published_at` (articles) suffisent, pas de complexité scheduling |
| **Relations spectacles/événements** | ✅ Dropdown optionnel dans formulaire | Contextualisation utile, FK déjà dans DB (`spectacle_id`, `evenement_id`) |
| **Gestion attachements** | Ordre d'upload = ordre affiché | Pas de drag-and-drop (MVP), colonne `order_index` existe pour évolution future |
| **Bucket PDF** | Option A : Modifier bucket `medias` | Moins de fragmentation, ajout `application/pdf` au bucket existant |
| **Contacts presse** | Table admin-only (RLS strict) | Données sensibles (emails pros), pas de lecture publique nécessaire |
| **Notifications email** | ❌ Hors scope MVP | Fonctionnalité avancée, structure DB (`contacts_presse.email`) le permet pour v2 |
| **Import/Export contacts CSV** | ⏳ À planifier si volume > 50 | Utile pour CRM presse, UI export à ajouter ultérieurement |

---

## ✅ Checklist de validation

### Tests fonctionnels

- [ ] **Communiqués** : Créer/Éditer/Supprimer avec upload PDF
- [ ] **Communiqués** : Publier/Dépublier via bouton action
- [ ] **Communiqués** : Prévisualisation en mode draft
- [ ] **Communiqués** : Liaison optionnelle à un spectacle/événement
- [ ] **Articles** : CRUD complet avec source externe
- [ ] **Contacts** : CRUD avec validation email unique
- [ ] **Contacts** : Toggle active/inactive

### Tests sécurité

- [ ] RLS : Utilisateur anon ne peut PAS accéder aux routes admin
- [ ] RLS : Utilisateur anon peut lire les communiqués avec `is_public = true`
- [ ] RLS : Contacts presse visibles uniquement par admin (aucune lecture publique)
- [ ] Storage : PDF uploadé dans bucket correct avec permissions appropriées

### Tests performance

- [ ] Page admin charge en < 2s avec 50+ communiqués
- [ ] Upload PDF (5MB) réussit sans timeout
- [ ] Revalidation publique (`/presse`) après publication d'un communiqué

### Tests UX

- [ ] Navigation Tabs (Communiqués/Articles/Contacts) fluide
- [ ] Badge statut Draft/Publié visible dans liste
- [ ] Formulaire affiche erreurs validation Zod claires
- [ ] Dropdowns spectacles/événements chargent < 500ms

---

## 📚 Références projet

| Fichier | Usage |
|---------|-------|
| [lib/dal/admin-partners.ts](../../lib/dal/admin-partners.ts) | Pattern DAL admin CRUD |
| [lib/schemas/partners.ts](../../lib/schemas/partners.ts) | Pattern Server/UI schemas |
| [app/(admin)/admin/partners/actions.ts](../../app/(admin)/admin/partners/actions.ts) | Pattern Server Actions |
| [components/features/admin/partners/PartnerForm.tsx](../../components/features/admin/partners/PartnerForm.tsx) | Pattern formulaire avec MediaLibrary |
| [supabase/schemas/08b_communiques_presse.sql](../../supabase/schemas/08b_communiques_presse.sql) | Schema DB communiqués |
| [lib/dal/presse.ts](../../lib/dal/presse.ts) | DAL public existant (types réutilisables) |
