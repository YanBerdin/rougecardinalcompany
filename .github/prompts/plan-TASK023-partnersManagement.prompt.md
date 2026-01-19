## Plan : Implémentation TASK023 Partners Management

Ce plan implémente le CRUD admin pour les partenaires avec gestion de logos via Media Library, drag-and-drop (`@dnd-kit/core`) pour l'ordre d'affichage, et revalidation de la homepage publique. La table `partners`, ses politiques RLS et l'index `logo_media_id` existent déjà.

### Steps

1. **Créer la migration pour le dossier média `partners`** : Ajouter une entrée dans `media_folders` via migration `YYYYMMDDHHMMSS_add_partners_media_folder.sql` avec `INSERT INTO media_folders (name, slug, description) VALUES ('Partenaires', 'partners', 'Logos des partenaires') ON CONFLICT (slug) DO NOTHING;` — pattern : [20251230120000_sync_media_folders_with_storage.sql](../../supabase/migrations/20251230120000_sync_media_folders_with_storage.sql) #L25-L36

2. **Créer le schéma Zod** dans [lib/schemas/partners.ts](../../lib/schemas/partners.ts) avec `PartnerInputSchema` (server, bigint), `PartnerFormSchema` (UI, number), `PartnerDTO`, et `ReorderPartnersSchema` — référence : [lib/schemas/spectacles.ts](lib/schemas/spectacles.ts)

3. **Créer le DAL admin** dans [lib/dal/admin-partners.ts](../../lib/dal/admin-partners.ts) avec `fetchAllPartnersAdmin()`, `fetchPartnerById()`, `createPartner()`, `updatePartner()`, `deletePartner()`, `reorderPartners()` — référence : [lib/dal/admin-spectacles.ts](../../lib/dal/admin-spectacles.ts)

4. **Créer les Server Actions** dans [app/(admin)/admin/partners/actions.ts](app/(admin)/admin/partners/actions.ts) avec validation Zod + appel DAL + `revalidatePath("/admin/partners")` + `revalidatePath("/")` — référence : [app/(admin)/admin/home/hero/home-hero-actions.ts](app/(admin)/admin/home/hero/home-hero-actions.ts)

5. **Créer la page liste admin** avec [app/(admin)/admin/partners/page.tsx](app/(admin)/admin/partners/page.tsx) (`dynamic = 'force-dynamic'`), [PartnersContainer.tsx](components/features/admin/partners/PartnersContainer.tsx), [PartnersView.tsx](components/features/admin/partners/PartnersView.tsx) (Client avec `useEffect` sync + `@dnd-kit/core` pour drag-and-drop réordonnement) — référence : [HeroSlidesView.tsx](components/features/admin/home/hero/HeroSlidesView.tsx)

6. **Créer les pages new/edit** : [app/(admin)/admin/partners/new/page.tsx](app/(admin)/admin/partners/new/page.tsx) et [app/(admin)/admin/partners/[id]/edit/page.tsx](app/(admin)/admin/partners/%5Bid%5D/edit/page.tsx) avec [PartnerForm.tsx](components/features/admin/partners/PartnerForm.tsx) utilisant `ImageUploadWithMediaLibrary` (uploadFolder: `partners`) — référence : [TeamMemberForm.tsx](components/features/admin/team/TeamMemberForm.tsx)

7. **Ajouter le lien sidebar** dans [app-sidebar.tsx](components/admin/sidebar/app-sidebar.tsx) avec icône `Handshake` pour `/admin/partners` dans la section appropriée

### Further Considerations

1. **Drag-and-drop library** : Utiliser `@dnd-kit/core` (déjà utilisé dans HeroSlidesView) pour la cohérence.

2. **Upload folder média** : Utiliser `partners` comme `uploadFolder` pour `ImageUploadWithMediaLibrary` — le dossier sera créé dans la migration step 1.

3. **Test public homepage** : Après implémentation, vérifier que [PartnersSection.tsx](components/features/public-site/home/sections/PartnersSection.tsx) affiche correctement les partenaires réordonnés via le toggle `display_toggle_home_partners`.
