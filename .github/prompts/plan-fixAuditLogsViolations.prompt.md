# Plan : Correction des violations audit-logs

**TL;DR** : 7 corrections sur 5 fichiers, du plus critique au plus mineur. Les fixes suivent les patterns existants du projet (`MediaCard.tsx` pour l'a11y keyboard, constantes ou suppressions pour les magic numbers). Aucune nouvelle dépendance requise.

---

## Étapes

1. **Créer `lib/utils/audit-log-filters.ts` (nouveau fichier)**
   Extraire la logique de parsing de `AuditLogsContainer.tsx` dans une fonction `parseAuditLogFilters(searchParams)`. Élimine les **8 assertions de type** (6 `as string | undefined` pour action, date_from, date_to, table_name, user_id, search + 2 `as string` pour page et limit). La fonction container dépasse les 30 lignes inline. Le fichier voisin `lib/utils/press-utils.ts` sert de référence de style.

   **Approche** : réutiliser `AuditLogFilterSchema` de `lib/schemas/audit-logs.ts` qui définit déjà les defaults Zod (`page: z.coerce.number().default(1)`, `limit: ...default(50)`) et les validations d'action. La fonction construit un objet `rawParams` depuis les `searchParams` puis appelle `AuditLogFilterSchema.parse(rawParams)`. Cela élimine les assertions de type ET gère automatiquement les NaN via `z.coerce`.

   ```ts
   import { AuditLogFilterSchema, type AuditLogFilter } from "@/lib/schemas/audit-logs";

   export function parseAuditLogFilters(
       searchParams: Record<string, string | string[] | undefined>
   ): AuditLogFilter {
       const raw = {
           page: searchParams.page ?? undefined,
           limit: searchParams.limit ?? undefined,
           action: searchParams.action ?? undefined,
           table_name: searchParams.table_name ?? undefined,
           user_id: searchParams.user_id ?? undefined,
           date_from: searchParams.date_from ?? undefined,
           date_to: searchParams.date_to ?? undefined,
           search: searchParams.search ?? undefined,
       };
       return AuditLogFilterSchema.parse(raw);
   }
   ```

2. **Mettre à jour `AuditLogsContainer.tsx`**
   Remplacer le bloc de parsing inline (lignes 12–32) par `const filters = parseAuditLogFilters(searchParams)`. Le composant redescend à ~25 lignes.

3. **Corriger `AuditLogsView.tsx` — fake loading**
   Supprimer **tout ce qui concerne `isInitialLoading`** :
   - Ligne 34 : `const [isInitialLoading, setIsInitialLoading] = useState(true)`
   - Lignes 37–42 : l'`useEffect` avec le timer 800ms + commentaire `TODO`
   - Toutes les occurrences dans le JSX : `|| isInitialLoading` dans les props `isLoading`, `disabled`, et le ternaire `(isPending || isInitialLoading) ? <Skeleton...> : ...`
   - L'import `Skeleton` de `@/components/ui/skeleton` (ligne 18) devient inutilisé → **supprimer cette ligne d'import**
   - Vérifier que les imports `useState` et `useEffect` restent nécessaires : `useState` oui (pour `selectedLog`, `isExporting`, `sortState`, etc.), `useEffect` oui (pour le sync `initialLogs`). Seul `Skeleton` est à retirer.

   La page utilise déjà `<Suspense fallback={<AuditLogsSkeleton />}>` (confirmé dans `app/(admin)/admin/audit-logs/page.tsx`) — le skeleton natif Next.js suffit. `isPending` de `useTransition` gère le chargement lors des navigations.

4. **Corriger `AuditLogsView.tsx` — setTimeout injustifiés**
   **Supprimer purement et simplement** les deux `setTimeout(..., 500)` dans `handleFilterChange` et `handleRefresh`. Ces délais n'ont aucune justification technique : `startTransition` gère déjà la priorité de rendu. Pas de constante nommée — le code correct n'a pas de délai du tout.

   ```tsx
   // ✅ Après
   const handleFilterChange = (newFilters: AuditLogFilter) => {
       setFilters(newFilters);
       // ... build params ...
       startTransition(() => {
           router.push(`/admin/audit-logs?${params.toString()}`);
       });
   };

   const handleRefresh = () => {
       startTransition(() => {
           router.refresh();
       });
   };
   ```

   > Si un vrai debounce de frappe s'avère nécessaire, `lib/hooks/use-debounce.ts` est disponible.

5. **Corriger `AuditLogsTable.tsx` — a11y clavier (WCAG 2.2 SC 2.1.1)**
   **Deux endroits** à corriger :

   **5a. Vue mobile — carte `div` cliquable**
   Ajouter sur le `div` de la carte : `role="button"`, `tabIndex={0}`, `onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRowClick(log)}`, et les styles `focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`. Pattern identique à `MediaCard.tsx` lignes 102-104.

   **5b. Vue desktop — `TableRow` cliquable**
   Le `<TableRow onClick={() => onRowClick(log)}>` rend un `<tr>` qui n'est pas nativement interactif. Ajouter : `tabIndex={0}`, `onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRowClick(log)}`, `aria-label={\`Log ${log.action} sur ${log.table_name}\`}` pour le contexte lecteur d'écran, et `focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary` dans `className`.

6. **Corriger `AuditLogDetailModal.tsx` — assertions `!`**
   Deux occurrences dans les badges de comptage (~lignes 72 et 80) :
   `Object.keys(log.old_values!)` → `Object.keys(log.old_values ?? {})`
   `Object.keys(log.new_values!)` → `Object.keys(log.new_values ?? {})`
   Les variables `hasOldValues` et `hasNewValues` (lignes 19-20) garantissent déjà la non-nullité dans le contexte, les `!` sont donc inutilement dangereux.

7. **Corriger `AuditLogsSkeleton.tsx` — index comme key**
   Remplacer `key={i}` par des clés sémantiquement correctes :
   - Premier `Array.from` (5 éléments) : `key={\`skeleton-column-${i}\`}` *(colonnes, pas filtres)*
   - Second `Array.from` (10 éléments) : `key={\`skeleton-row-${i}\`}`

---

## Vérification

- `pnpm lint` : doit passer sans erreurs
- `pnpm build` : doit passer (aucune suppression de fonctionnalité)
- Test manuel : naviguer dans l'audit-log table au clavier (Tab + Entrée/Espace sur les cartes mobiles **et** les lignes desktop)
- Vérifier que le `<Suspense>` de la page affiche bien `AuditLogsSkeleton` pendant le chargement initial (remplace le fake loading)
- Vérifier que `handleFilterChange` et `handleRefresh` répondent immédiatement (sans délai 500ms perceptible)

---

## Décisions

- **Suppression vs constante nommée pour setTimeout** : suppression choisie — `startTransition` suffit. Un délai arbitraire de 500ms est un anti-pattern dans ce contexte.
- **God Component `AuditLogsView`** : pas d'extraction en custom hook dans ce plan, car le fichier (181 lignes) reste sous le seuil de 300. Noté pour future refactorisation.
- **`AuditLogsTable` double vue mobile/desktop** : pas de split en sous-composants dans ce plan (256 lignes, proche du seuil) — à surveiller.
