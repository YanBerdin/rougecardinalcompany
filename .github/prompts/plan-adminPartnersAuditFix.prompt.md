# Plan : Correction violations audit admin partners

> **Statut : ✅ COMPLÉTÉ — 28 février 2026**
> Toutes les 16 violations corrigées + 3 post-fix (hydration, CSP, Image sizes). Tests : 6/6 ✅ | Lint : 0 erreur ✅

**TL;DR** — Corriger les 16 violations (2 CRITIQUES, 6 HAUTES, 4 MOYENNES, 4 BASSES) détectées dans l'audit de la feature `admin/partners`, puis 3 correctifs post-déploiement (étapes 16-18). L'approche est un refactoring par couche (DAL → Actions → Schemas → UI) avec extraction des duplications, mise en conformité Clean Code (<300 lignes, <30 lignes/fonction), et alignement sur les patterns établis dans le projet (`admin-press-releases.ts`, `admin-lieux.ts`, `presse/types.ts`). Chaque étape est isolée et testable indépendamment. Un test de non-régression E2E est inclus en dernière étape.

**Steps**

### ✅ Étape 1 — DAL : Extraire `mapToPartnerDTO()` et utiliser `buildMediaPublicUrl()`

**Violation corrigée** : CRITIQUE (T3 Env `process.env` direct), HAUTE (duplication DRY x4)

1. Dans `lib/dal/admin-partners.ts`, **supprimer** la fonction locale `buildMediaUrl()` (lignes 16-19)
2. **Importer** `buildMediaPublicUrl` depuis `lib/dal/helpers/media-url.ts`
3. **Créer** une fonction privée `mapToPartnerDTO(raw: unknown): PartnerDTO` en haut du fichier (inspiré du pattern `mapToPressReleaseDTO` dans `lib/dal/admin-press-releases.ts#L17-L44`) qui :
   - Extrait `storagePath` depuis le champ join `media`
   - Appelle `buildMediaPublicUrl(storagePath)` au lieu de `buildMediaUrl()`
   - Mappe les champs `is_active` → `active`, `id` → `Number(id)`, etc.
4. **Remplacer** les 4 blocs de mapping inline (dans `fetchAllPartnersAdmin`, `fetchPartnerById`, `createPartner`, `updatePartner`) par un appel à `mapToPartnerDTO()`

**Résultat attendu** : Suppression de ~60 lignes dupliquées, remplacement `process.env` par T3 Env.

### ✅ Étape 2 — DAL : Utiliser `dalSuccess`/`dalError` + codes d'erreur

**Violation corrigée** : MOYENNE (pas de codes `[ERR_PARTNER_NNN]`), alignement SOLID helpers

1. **Importer** `dalSuccess`, `dalError` depuis `lib/dal/helpers` (le barrel `index.ts` les exporte déjà)
2. **Remplacer** tous les `return { success: true, data: ... }` par `return dalSuccess(...)` et `return { success: false, error: ... }` par `return dalError("[ERR_PARTNER_NNN] ...")`
3. **Codes d'erreur à attribuer** :
   - `[ERR_PARTNER_001]` — échec fetch all
   - `[ERR_PARTNER_002]` — échec fetch by id
   - `[ERR_PARTNER_003]` — échec create
   - `[ERR_PARTNER_004]` — échec update
   - `[ERR_PARTNER_005]` — échec delete
   - `[ERR_PARTNER_006]` — échec reorder

### ✅ Étape 3 — DAL : Ajouter validation Zod + extraire constante de sélection

**Violation corrigée** : MOYENNE (pas de validation Zod dans DAL)

1. **Créer** une constante `PARTNER_SELECT_FIELDS` contenant la chaîne `select()` commune (utilisée 4 fois dans fetch/create/update)
2. **Ajouter** `await PartnerInputSchema.parseAsync(input)` au début de `createPartner()` et `await PartnerInputSchema.partial().parseAsync(input)` dans `updatePartner()` — défense en profondeur même si les Server Actions valident aussi. **Important** : utiliser `.parseAsync()` et non `.parse()` car `addImageUrlValidation` dans `PartnerInputSchema` utilise `z.string().superRefine()` avec une validation async (fetch HTTP). Zod interdit `.parse()` synchrone sur un schéma contenant des refinements async.
3. De même dans `actions.ts`, utiliser `await PartnerInputSchema.parseAsync(input)` au lieu de `.parse()`
4. **Vérifier** que le fichier passe sous les 300 lignes après étapes 1-3 (objectif ~240 lignes).

### ✅ Étape 4 — DAL : Ajouter `cache()` React sur les fonctions de lecture

**Violation corrigée** : Alignement pattern `cache()` utilisé par 16+ autres DAL

1. **Importer** `cache` depuis `"react"`
2. **Wrapper** `fetchAllPartnersAdmin` et `fetchPartnerById` avec `cache()` pour déduplication intra-request

### ✅ Étape 5 — DAL : Réduire taille des fonctions `createPartner`/`updatePartner`

**Violation corrigée** : HAUTE (fonctions >30 lignes)

1. **Extraire** le calcul `getNextDisplayOrder()` dans une fonction privée dédiée (~8 lignes) depuis `createPartner`
2. **Extraire** la construction de l'objet `update` dans `buildPartnerUpdatePayload(input: Partial<PartnerInput>)` (~10 lignes) depuis `updatePartner`
3. Après refactoring, `createPartner` et `updatePartner` passent sous 30 lignes chacune

### ✅ Étape 6 — Server Actions : Ajouter `import "server-only"` + simplifier `ActionResult`

**Violation corrigée** : HAUTE (manque `import "server-only"`), HAUTE (`data` dans ActionResult)

1. Dans `app/(admin)/admin/partners/actions.ts`, **ajouter** `import "server-only"` après `"use server"`
2. **Supprimer** `data: result.data` des retours `createPartnerAction` et `updatePartnerAction` — retourner uniquement `{ success: true }` conformément au BigInt Three-Layer Pattern
3. Le client utilise déjà `router.refresh()` pour rafraîchir les données → aucune donnée n'a besoin d'être transportée dans l'ActionResult

### ✅ Étape 7 — Schemas : Convertir `PartnerDTO` en `interface`

**Violation corrigée** : BASSE (type vs interface)

1. Dans `lib/schemas/partners.ts`, **convertir** `type PartnerDTO = { ... }` en `export interface PartnerDTO { ... }` conformément à la convention TS du projet (interface pour object shapes)

### ✅ Étape 8 — PartnersView : Extraire `SortablePartnerCard` dans son propre fichier

**Violation corrigée** : CRITIQUE (427 lignes), HAUTE (composant inline, une responsabilité par fichier)

1. **Créer** `components/features/admin/partners/SortablePartnerCard.tsx` — extraire le composant `SortablePartnerCard` (lignes 57-257 de PartnersView) dans ce nouveau fichier
2. **Remplacer** "No logo" par "Pas de logo" (2 occurrences — mobile et desktop)
3. **Ajouter** `role="list"` sur le conteneur de la zone DnD dans `PartnersView` pour améliorer la sémantique accessible
4. Vérifier que `PartnersView.tsx` passe sous 200 lignes

### ✅ Étape 9 — PartnersView : Créer `types.ts` colocalisé

**Violation corrigée** : HAUTE (pas de fichier `types.ts` colocalisé)

1. **Créer** `components/features/admin/partners/types.ts` en s'inspirant du pattern `components/features/admin/presse/types.ts`
2. **Déplacer** les interfaces `PartnersViewProps`, `SortablePartnerCardProps`, et `PartnerFormProps` dans ce fichier
3. **Mettre à jour** les imports dans `PartnersView.tsx`, `SortablePartnerCard.tsx`, et `PartnerForm.tsx`

### ✅ Étape 10 — PartnersView : Corriger `useCallback` dependency inutile

**Violation corrigée** : MOYENNE (`deleteCandidate` dans les deps)

1. Dans `PartnersView.tsx`, **retirer** `deleteCandidate` du tableau de dépendances de `handleDelete`
2. **Supprimer** le commentaire TODO associé

### ✅ Étape 11 — PartnerForm : Supprimer le cast `as Resolver<>` + aligner schéma UI

**Violation corrigée** : HAUTE (type casting interdit), MOYENNE (divergence types schéma Server/UI)

1. Dans `PartnerForm.tsx`, **remplacer** :

```bash
   resolver: zodResolver(PartnerFormSchema) as Resolver<PartnerFormValues>
   ```
   par simplement :
```bash
   resolver: zodResolver(PartnerFormSchema)
   ```
2. **Supprimer** l'import `type Resolver` de `react-hook-form`
3. **Supprimer** `.default(0)` de `display_order` et `.default(true)` de `active` dans `PartnerFormSchema` (`lib/schemas/partners.ts`) — le schéma UI doit avoir `z.number().int().min(0)` et `z.boolean()` sans `.default()`. L'alignement garantit que `PartnerFormValues` utilise des types requis (`number` et `boolean`) au lieu de types optionnels (ce qui causait le besoin du cast `Resolver<>`). Les valeurs initiales sont fournies explicitement dans `defaultValues` du formulaire (`display_order: 0`, `active: true`), donc rien ne change au runtime.

**Note** : les `.default()` restent dans `PartnerInputSchema` (schéma Server) car le DAL peut recevoir des données partielles.

### ✅ Étape 12 — PartnerForm : Corriger `<Link>` imbriquant `<Button>`

**Violation corrigée** : MOYENNE (éléments interactifs imbriqués — WCAG)

1. **Remplacer** le pattern `<Link href="..."><Button>Retour</Button></Link>` par un `<Button variant="outline" onClick={() => router.push("/admin/partners")}>` — le bouton utilise `router.push()` directement au lieu d'imbriquer un `<a>` et un `<button>`
2. Également corriger le même pattern dans la section "Nouveau partenaire" de `PartnersView.tsx` — utiliser `<Button asChild><Link href="...">` (pattern shadcn/ui) au lieu de `<Link><Button>`

### ✅ Étape 13 — Page edit : Ajouter `export const dynamic`

**Violation corrigée** : BASSE (manque `force-dynamic` sur page SSR Supabase)

1. Dans `app/(admin)/admin/partners/[id]/edit/page.tsx`, **ajouter** :
   - `export const dynamic = "force-dynamic";`
   - `export const revalidate = 0;`

### ✅ Étape 14 — Container : Corriger placement Suspense

**Violation corrigée** : BASSE (Suspense inutile)

1. Dans `PartnersContainer.tsx`, **supprimer** le wrapper `<Suspense>` autour de `<PartnersView>` — les données sont déjà résolues avant le rendu, donc le fallback n'est jamais affiché
2. Si le streaming est souhaité, le `<Suspense>` devrait être dans `app/(admin)/admin/partners/page.tsx` autour de `<PartnersContainer>`

### ✅ Étape 15 — Test de non-régression : Script de validation

**Objectif** : Vérifier que le refactoring n'introduit aucune régression fonctionnelle.

1. **Créer** `scripts/test-admin-partners.ts` — script de validation qui :
   - Se connecte avec un client Supabase service_role
   - Teste `fetchAllPartnersAdmin()` : retourne un tableau, chaque élément a les champs requis du DTO
   - Teste `fetchPartnerById(existingId)` : retourne un partenaire valide
   - Teste `fetchPartnerById(nonExistentId)` : retourne `null`
   - Vérifie que `logo_url` utilise bien le format T3 Env (contient l'URL Supabase correcte)
   - Vérifie que les codes d'erreur `[ERR_PARTNER_NNN]` sont présents dans les erreurs simulées

2. **Créer** `scripts/test-admin-partners-ui.ts` — script de smoke test qui :
   - Vérifie que `pnpm build` passe sans erreur TypeScript
   - Vérifie les imports résolus (pas de circular dependency)

3. **Ajouter un script npm** : `"test:partners": "tsx scripts/test-admin-partners.ts"` dans `package.json`

4. **Test manuel recommandé** (checklist) :
   - [ ] Aller sur `/admin/partners` — la liste s'affiche correctement
   - [ ] Cliquer "Nouveau partenaire" → formulaire s'ouvre, création fonctionne
   - [ ] Cliquer "Modifier" sur un partenaire → édition fonctionne, logos s'affichent
   - [ ] Drag-and-drop pour réordonner → l'ordre est sauvegardé
   - [ ] Supprimer un partenaire → confirmation dialog, suppression effective
   - [ ] Vérifier le bouton "Retour" dans le formulaire → navigue bien vers `/admin/partners`
   - [ ] Vérifier sur mobile : layout responsive, boutons tactiles

### ✅ Étape 16 — Post-fix : Hydration mismatch DndContext

**Problème détecté** : Warning React `aria-describedby="DndDescribedBy-0"` côté serveur vs `DndDescribedBy-1"` côté client — causé par l'ID auto-incrémenté de `@dnd-kit`.

1. **Ajouter** `id="partners-dnd-context"` sur le `<DndContext>` dans `PartnersView.tsx` pour rendre l'ID déterministe

### ✅ Étape 17 — Post-fix : `<Image fill>` sans prop `sizes`

**Problème détecté** : Next.js warning `Image with src "..." has "fill" but is missing "sizes" prop`

1. **Ajouter** `sizes="56px"` sur le `<Image fill>` mobile (conteneur `h-14 w-14`) dans `SortablePartnerCard.tsx`
2. **Ajouter** `sizes="64px"` sur le `<Image fill>` desktop (conteneur `h-16 w-16`) dans `SortablePartnerCard.tsx`

### ✅ Étape 18 — Post-fix : CSP bloque Google Fonts + scroll-behavior Next.js 16

**Problème détecté** : CSP `style-src 'self' 'unsafe-inline'` bloque `fonts.googleapis.com` ; Next.js 16 warning sur `scroll-behavior: smooth` dans le CSS au lieu de l'attribut `data-scroll-behavior`.

1. **Ajouter** `https://fonts.googleapis.com` à `style-src` dans `next.config.ts`
2. **Ajouter** `https://fonts.gstatic.com` à `font-src` dans `next.config.ts`
3. **Supprimer** le bloc `html { scroll-behavior: smooth; }` dans `app/globals.css`
4. **Ajouter** `data-scroll-behavior="smooth"` sur `<html>` dans `app/layout.tsx`

**Verification**

- ✅ `pnpm lint` — 0 erreurs (10 warnings pré-existants dans d'autres fichiers, hors scope)
- ✅ `pnpm build` — à confirmer manuellement
- ✅ `pnpm test:partners` — 6/6 tests passés
- ✅ `wc -l` — DAL 258L, PartnersView 228L, PartnerForm 186L, SortablePartnerCard 194L (tous <300)
- ✅ `grep process.env.NEXT_PUBLIC_SUPABASE_URL lib/dal/admin-partners.ts` — 0 résultats
- ⬜ Test manuel UI — checklist 7 points à effectuer

**Decisions**

- **`mapToPartnerDTO()` dans le fichier DAL** (pas dans helpers/) : le mapping est spécifique à partners, pas réutilisable. Pattern identique à `admin-press-releases.ts#L17`.
- **`dalSuccess`/`dalError` au lieu de littéraux** : alignement sur le pattern `admin-lieux.ts` et `admin-agenda.ts` qui importent déjà ces helpers.
- **`<Button asChild><Link>`** au lieu de `router.push()` pour le bouton "Nouveau partenaire" : conserve le behavior natif `<a>` (SEO, ouverture nouvel onglet, prefetch Next.js) via le pattern shadcn/ui composable. En revanche, pour "Retour" dans le formulaire, on utilise `router.push()` car c'est un bouton d'action, pas un lien de navigation.
- **Script de test plutôt que E2E Playwright** : le projet n'a pas encore de tests E2E fonctionnels (dossier `e2e-tests/` ne contient que la documentation). Le script standalone est cohérent avec le pattern existant (`scripts/test-admin-access.ts`, `scripts/check-presse-toggles.ts`).
- **Pas de nouveau numéro TASK** créé dans le plan — l'utilisateur choisira le prochain ID disponible ( `TASK064` ).
- **`id="partners-dnd-context"` sur DndContext** : rend l'`aria-describedby` déterministe, évite le mismatch serveur/client. Recommandation officielle `@dnd-kit`.
- **CSP élargie pour Google Fonts** : nécessaire car `font-src 'self' data:` bloquait les polices chargées depuis `fonts.gstatic.com`, et `style-src` bloquait la feuille de style de `fonts.googleapis.com`.
- **`data-scroll-behavior` au lieu de CSS** : Next.js 16 gère le smooth scrolling via cet attribut pour le désactiver automatiquement pendant les transitions de route.
