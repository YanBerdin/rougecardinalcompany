# Plan: Drag & drop reorder pour les articles de presse (admin)

## Décisions validées avec l'utilisateur
- Le nouvel ordre (display_order) pilote AUSSI le tri public (/presse + widget "À la une" homepage), pas seulement l'admin.
- Méthode DB : batch UPDATE en parallèle depuis le DAL (pattern Partners), pas de fonction RPC.
- Backfill display_order initial : basé sur l'ordre chronologique actuel (published_at DESC, nulls last), id DESC en tie-break.

## Contexte découvert
- `articles_presse` table n'a PAS de colonne `display_order` (contrairement à `partners.display_order`).
- 3 endroits ordonnent par `published_at`:
  - `lib/dal/admin-press-articles.ts` → `fetchAllArticlesAdmin` (admin list)
  - `lib/dal/presse.ts` → `fetchMediaArticles` (page publique /presse)
  - `lib/dal/home-news.ts` → `fetchFeaturedArticles` (widget homepage)
- Vue `articles_presse_public` existe mais N'EST PAS utilisée dans lib/ ou app/ (seulement scripts/tests) → pas besoin de la modifier.
- `ArticlesView.tsx` a DEUX blocs de rendu simultanés dans le DOM (mobile `sm:hidden` + desktop `hidden sm:block`), pas conditionnels — donc il FAUT unifier en UNE seule carte sortable par article (comme `SortablePartnerCard.tsx` qui a un seul `<Card ref={setNodeRef}>` contenant les 2 blocs responsive), sinon dnd-kit aura des ids dupliqués dans le DOM.
- `ArticlesViewProps.initialArticles` a déjà `id: string` (via `Omit<ArticleDTO,"id"> & {id:string}`) donc pas besoin de `.toString()` comme pour PartnerDTO (id:number).
- `ArticlesView.tsx` a déjà `useState(initialArticles)` + `useEffect` de sync — réutilisable tel quel.
- Rôle requis pour les mutations articles : `requireMinRole("editor")` (PAS `requireAdminOnly()` comme partners).
- Codes d'erreur DAL articles existants : ERR_ARTICLE_001/002/003/010/011 → prochain libre : ERR_ARTICLE_012.

## Steps

### Phase 1 — Database (déclaratif + migration)
1. `supabase/schemas/08_table_articles_presse.sql` : ajouter colonne `display_order integer not null default 0` en fin de définition de table (après `search_vector` ou juste avant, respecter règle "append en fin"), + `comment on column`.
2. `supabase/schemas/40_indexes.sql` : ajouter `create index if not exists idx_articles_presse_display_order on public.articles_presse (display_order);` (à côté des autres index articles).
3. `supabase stop` puis `supabase db diff -f add_display_order_to_articles_presse` → génère la migration DDL (ADD COLUMN + index).
4. Créer une migration manuelle séparée (timestamp après la précédente) pour le backfill DML (non capturé par migra) :
   `update public.articles_presse set display_order = sub.rn - 1 from (select id, row_number() over (order by published_at desc nulls last, id desc) as rn from public.articles_presse) as sub where public.articles_presse.id = sub.id;`
5. Documenter les 2 migrations dans `supabase/migrations/migrations.md` (entrée datée, lien vers schéma déclaratif mis à jour) et dans `supabase/schemas/README.md`.
6. Appliquer en local (`pnpm db:reset` ou équivalent) pour valider.

*Dépend de rien. Bloque les phases 2-3 (le DAL référence la colonne).*

### Phase 2 — Schémas Zod & DTO (peut être fait en parallèle de la phase 1, dépend juste pour tester réellement)
7. `lib/schemas/press-article.ts` :
   - Ajouter `display_order: number` à `ArticleDTO`.
   - Ajouter `ReorderArticlesSchema` + type `ReorderArticlesInput`, calqué EXACTEMENT sur `ReorderPartnersSchema` (`lib/schemas/partners.ts`) :
     ```
     z.object({ articles: z.array(z.object({ id: z.coerce.bigint(), display_order: z.number().int().min(0) })) })
     ```
   - NE PAS ajouter `display_order` à `ArticleInputSchema`/`ArticleFormSchema` (comme pour partners, l'ordre est géré automatiquement par le DAL à la création, jamais saisi dans le formulaire).
   - `components/features/admin/presse/types.ts` : aucun changement nécessaire (le `Omit<ArticleDTO,"id">` propage `display_order` automatiquement).

### Phase 3 — DAL (*dépend de la Phase 1 pour être fonctionnel, du schéma Zod de la Phase 2*)
8. `lib/dal/admin-press-articles.ts` :
   - Ajouter `display_order` aux listes `select(...)` de `fetchAllArticlesAdmin` et `fetchArticleById`, et au mapping vers `ArticleDTO`.
   - Changer le tri de `fetchAllArticlesAdmin` : `.order("published_at", {ascending:false, nullsFirst:false})` → `.order("display_order", {ascending:true})`.
   - Ajouter helper privé `getNextDisplayOrder(supabase)` calqué sur celui de `lib/dal/admin-partners.ts` (select max `display_order` + 1, fallback 0).
   - `createArticle` : appeler `getNextDisplayOrder` et insérer `display_order: nextOrder` (ignorer toute valeur d'input).
   - Ajouter fonction exportée `reorderArticles(input: ReorderArticlesInput): Promise<DALResult<void>>` :
     - `await requireMinRole("editor")` (pas `requireAdminOnly`)
     - batch `Promise.all` de `.from("articles_presse").update({display_order}).eq("id", article.id.toString())`, calqué sur `reorderPartners` dans `lib/dal/admin-partners.ts`
     - code erreur `[ERR_ARTICLE_012]`
9. `lib/dal/presse.ts` (`fetchMediaArticles`) : remplacer `.order("published_at", {ascending:false, nullsFirst:false})` par `.order("display_order", {ascending:true})` (le filtre `.not("published_at","is",null)` reste inchangé pour ne garder que les articles publiés).
10. `lib/dal/home-news.ts` (`fetchFeaturedArticles`) : idem, remplacer `.order("published_at", {ascending:false})` par `.order("display_order", {ascending:true})`.

### Phase 4 — Server Action (*dépend Phase 2 et 3*)
11. `app/(admin)/admin/presse/press-articles-actions.ts` : ajouter `reorderArticlesAction(input: unknown): Promise<ActionResult>` calqué sur `reorderPartnersAction` (`app/(admin)/admin/partners/actions.ts`) :
    - `await requireMinRole("editor")`, valider avec `ReorderArticlesSchema.parse(input)`, appeler `reorderArticles`
    - `revalidatePath("/admin/presse")`, `revalidatePath("/presse")`, `revalidatePath("/")` (widget homepage "À la une" dépend aussi de l'ordre)

### Phase 5 — Hook DnD (*dépend Phase 4, peut être fait en parallèle de la Phase 6 (composant carte)*)
12. Créer `lib/hooks/useArticlesDnd.ts`, calqué sur `lib/hooks/useHeroSlidesDnd.ts` :
    - Params : `articles` (type `ArticlesViewProps["initialArticles"]`), `setArticles`, `initialArticles`
    - `sensors` : `PointerSensor` (activationConstraint distance 8px) + `KeyboardSensor` (sortableKeyboardCoordinates)
    - `handleDragEnd` : trouver oldIndex/newIndex par `article.id === active.id` (id déjà string, pas de `.toString()`), `arrayMove`, `setArticles` optimiste, construire `orderData = reordered.map((a, index) => ({ id: a.id, display_order: index }))`, appeler `reorderArticlesAction({ articles: orderData })`, toast succès + `router.refresh()`, ou revert vers `initialArticles` + toast erreur au catch/échec.

### Phase 6 — Composant carte sortable (*dépend Phase 2 pour le type ArticleDTO enrichi, indépendant de la Phase 5*)
13. Créer `components/features/admin/presse/SortableArticleCard.tsx` :
    - Props (à ajouter dans `components/features/admin/presse/types.ts` : `SortableArticleCardProps { article: ArticlesViewProps["initialArticles"][number]; onDelete: (id: string) => void }`)
    - `useSortable({ id: article.id })` (id string), style `CSS.Transform.toString(transform)` + `transition` + opacity si dragging, calqué sur `SortablePartnerCard.tsx`
    - UN SEUL élément racine sortable (`ref={setNodeRef}`) qui contient les 2 blocs responsive actuellement inline dans `ArticlesView.tsx` (le bloc `sm:hidden` mobile-card et le bloc `hidden sm:flex`/`Card` desktop), en ajoutant une poignée de drag (`GripVertical`, `{...attributes} {...listeners}`, `aria-label="Glisser pour réorganiser"`, `cursor-grab touch-none`) au début de chaque bloc, sans changer le contenu existant (titre, badge type, auteur, source, boutons éditer/supprimer/source externe).

### Phase 7 — ArticlesView.tsx (*dépend de Phase 5 et 6*)
14. Modifier `components/features/admin/presse/ArticlesView.tsx` :
    - Importer `DndContext`, `closestCenter`, `SortableContext`, `verticalListSortingStrategy` (liste verticale pleine largeur, pas grille) et `useArticlesDnd`.
    - Appeler `const { sensors, handleDragEnd } = useArticlesDnd({ articles, setArticles, initialArticles: initialArticles })`.
    - Remplacer les deux blocs de rendu séparés (mobile `.map()` + desktop `.map()`) par UN SEUL `<DndContext id="articles-dnd-context" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>` → `<SortableContext items={articles.map(a => a.id)} strategy={verticalListSortingStrategy}>` → `<div role="list" aria-label="Liste des articles de presse" className="space-y-3">` → `.map()` rendant `<SortableArticleCard key={article.id} article={article} onDelete={requestDelete} />`.
    - Ajouter le texte d'aide "Glissez-déposez pour réorganiser l'ordre d'affichage" (comme dans `PartnersView.tsx`) au-dessus de la liste, uniquement si `articles.length > 0`.

### Phase 8
    — Appliquer migrations locale `supabase/CLI-Supabase-Local.md` et migration remote `supabase/CLI-Supabase-Remote.md`

## Fichiers concernés (récap)
- `supabase/schemas/08_table_articles_presse.sql` — ajout colonne
- `supabase/schemas/40_indexes.sql` — ajout index
- `supabase/migrations/*_add_display_order_to_articles_presse.sql` — migration DDL générée
- `supabase/migrations/*_backfill_display_order_articles_presse.sql` — migration DML manuelle
- `supabase/migrations/migrations.md` — doc
- `lib/schemas/press-article.ts` — DTO + ReorderArticlesSchema
- `lib/dal/admin-press-articles.ts` — select/order/create/reorderArticles
- `lib/dal/presse.ts` — tri fetchMediaArticles
- `lib/dal/home-news.ts` — tri fetchFeaturedArticles
- `app/(admin)/admin/presse/press-articles-actions.ts` — reorderArticlesAction
- `lib/hooks/useArticlesDnd.ts` — nouveau hook
- `components/features/admin/presse/types.ts` — SortableArticleCardProps
- `components/features/admin/presse/SortableArticleCard.tsx` — nouveau composant
- `components/features/admin/presse/ArticlesView.tsx` — intégration DnD

## Verification
1. `pnpm type-check` et `pnpm lint` doivent passer sans nouvelle erreur.
2. Après migration locale : vérifier que `select id, title, display_order from articles_presse order by display_order` reflète l'ordre chronologique initial (published_at desc).
3. Manuel `/admin/presse` : glisser une carte article, vérifier toast "Ordre mis à jour" (ou équivalent) + persistance après reload (F5) + `router.refresh()`.
4. Manuel `/presse` (public) et section "À la une" homepage `/` : vérifier que l'ordre affiché correspond au nouvel ordre display_order.
5. Vérifier accessibilité clavier : `Tab` jusqu'à la poignée de drag, `Space` puis flèches pour réordonner (KeyboardSensor), comme sur `/admin/partners`.
6. Vérifier RLS : un compte `editor` (pas admin) peut aussi réordonner (requireMinRole("editor"), pas requireAdminOnly).

## Hors scope
- Pas de modification de `ArticleForm.tsx` (l'ordre n'est jamais saisi manuellement dans le formulaire).
- Pas de modification de la vue `articles_presse_public` (non utilisée en runtime).
- Pas de fonction RPC / advisory lock (choix explicite : batch UPDATE simple).
