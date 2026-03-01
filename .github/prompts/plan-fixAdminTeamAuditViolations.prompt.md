## Plan : Corrections audit Admin Team

L'audit a identifié 13 violations (4 critiques, 4 majeures, 5 mineures) sur 12 fichiers. Ce plan les traite en 10 étapes ordonnées par dépendance, en commençant par les fondations (DAL, types) puis en remontant vers les composants UI. Score visé : de **~84% → ~95%**.

**Steps**

### Étape 1 — Créer [components/features/admin/team/types.ts](components/features/admin/team/types.ts) (Violation §3.8)

Extraire toutes les interfaces `Props` des 6 composants dans un fichier colocalisé `types.ts`. Inclure : `TeamManagementContainerProps`, `TeamMemberCardProps`, `TeamMemberFormProps`, `TeamMemberListProps`, etc. Chaque composant importera ses props depuis ce fichier. Le callback `onDesactivate` (faute d'orthographe) dans `TeamMemberCardProps` sera renommé `onDeactivate` à cette étape.

---

### Étape 2 — Splitter le DAL [lib/dal/team.ts](lib/dal/team.ts) (Violations §3.2, §3.3)

**2a.** Extraire `hardDeleteTeamMember` + ses 3 helpers privés (`validateTeamMemberForDeletion`, `performTeamMemberDeletion`, `handleHardDeleteError`) dans un nouveau fichier [lib/dal/team-hard-delete.ts](lib/dal/team-hard-delete.ts) (~120 lignes).

**2b.** Splitter `upsertTeamMember` en deux fonctions privées `insertTeamMember()` et `updateTeamMemberById()`, puis une fonction publique `upsertTeamMember` qui branche sur l'une ou l'autre. Chaque helper fait < 30 lignes.

**2c.** Extraire `reorderTeamMembers` + son schéma local `ReorderSchema` dans [lib/dal/team-reorder.ts](lib/dal/team-reorder.ts) (~60 lignes).

Le fichier [lib/dal/team.ts](lib/dal/team.ts) conservera : `fetchAllTeamMembers`, `fetchTeamMemberById`, `upsertTeamMember` (+ les 2 helpers privés insert/update), `setTeamMemberActive`. Cible < 280 lignes. Les nouveaux fichiers ré-exportent depuis [lib/dal/team.ts](lib/dal/team.ts) ou sont importés directement par les actions.

---

### Étape 3 — Migrer les lectures DAL vers `DALResult<T>` + `dalSuccess()`/`dalError()` (Violations §3.5, §3.6)

**3a.** `fetchAllTeamMembers` → retour `Promise<DALResult<TeamRow[]>>` au lieu de `Promise<TeamRow[]>`. Utiliser `dalSuccess(validRows)` / `dalError("[ERR_TEAM_001] ...")`.

**3b.** `fetchTeamMemberById` → retour `Promise<DALResult<TeamRow | null>>` au lieu de `Promise<TeamRow | null>`. Utiliser `dalSuccess(parsed.data)` / `dalError("[ERR_TEAM_010] ...")`.

**3c.** Migrer toutes les fonctions d'écriture pour utiliser `dalSuccess()` et `dalError()` au lieu de construire `{ success: true, data: ... }` manuellement. Chaque message d'erreur reçoit un code `[ERR_TEAM_0XX]` :

| Fonction | Codes |
|---|---|
| `fetchAllTeamMembers` | `[ERR_TEAM_001]` query, `[ERR_TEAM_002]` exception |
| `fetchTeamMemberById` | `[ERR_TEAM_010-012]` (déjà partiellement) |
| `upsertTeamMember` | `[ERR_TEAM_020]` validation, `[ERR_TEAM_021]` query, `[ERR_TEAM_022]` response invalid |
| `setTeamMemberActive` | `[ERR_TEAM_030]` invalid id, `[ERR_TEAM_031]` query |
| `reorderTeamMembers` | `[ERR_TEAM_040]` validation, `[ERR_TEAM_041]` rpc |
| `hardDeleteTeamMember` | `[ERR_TEAM_050]` not found, `[ERR_TEAM_051]` active, `[ERR_TEAM_052]` deletion |

**3d.** Adapter les appelants dans [app/(admin)/admin/team/actions.ts](app/(admin)/admin/team/actions.ts) et [app/(admin)/admin/team/page.tsx](app/(admin)/admin/team/page.tsx) pour consommer `DALResult` (« unwrap » du résultat reads).

---

### Étape 4 — Sécuriser les paramètres Server Actions en `unknown` + Zod (Violation §3.7)

Dans [app/(admin)/admin/team/actions.ts](app/(admin)/admin/team/actions.ts), migrer les signatures :

- `setTeamMemberActiveAction(teamMemberId: number, isActiveStatus: boolean)` → `setTeamMemberActiveAction(teamMemberId: unknown, isActiveStatus: unknown)` + validation Zod (`z.coerce.number().int().positive()` et `z.boolean()`).
- `hardDeleteTeamMemberAction(teamMemberId: number)` → `hardDeleteTeamMemberAction(teamMemberId: unknown)` + Zod.
- `updateTeamMember(teamMemberId: number, ...)` → `updateTeamMember(teamMemberId: unknown, ...)` + Zod.

Remplacement du helper `isValidTeamMemberId()` par un schéma Zod `TeamMemberIdSchema = z.coerce.number().int().positive()`.

---

### Étape 5 — Factoriser le check auth des pages dans un helper (Violations §3.12 + faille sécurité `user_metadata`)

Créer une fonction `requireAdminPageAccess()` dans [lib/auth/is-admin.ts](lib/auth/is-admin.ts) qui :
1. Appelle `getClaims()`
2. Vérifie `app_metadata.role === "admin"` **en priorité** (comme le fait déjà `isAdmin()`)
3. Fallback `user_metadata.role` (comme maintenant)
4. Retourne `void` ou redirige via `redirect("/auth/login")`

Remplacer le check inline dupliqué dans les 3 pages — [page.tsx](app/(admin)/admin/team/page.tsx), [new/page.tsx](app/(admin)/admin/team/new/page.tsx), [edit/page.tsx](app/(admin)/admin/team/%5Bid%5D/edit/page.tsx) — par un simple `await requireAdminPageAccess()`.

---

### Étape 6 — Renommer les state variables confuses (Violation §3.1)

Dans [TeamManagementContainer.tsx](components/features/admin/team/TeamManagementContainer.tsx), renommer :
- `deleteCandidate` / `setDeactivateTeamMember` → `deactivateCandidate` / `setDeactivateCandidate`
- `openDeleteDialog` / `setOpenDeactivateDialog` → `isDeactivateDialogOpen` / `setIsDeactivateDialogOpen`
- `showInactive` / `setShowInactiveTeamMember` → `showInactive` / `setShowInactive`

Mise à jour de tous les usages dans les handlers et le JSX.

---

### Étape 7 — Remplacer checkbox native par shadcn `Switch` + label associé (Violation §3.4)

Dans [TeamManagementContainer.tsx](components/features/admin/team/TeamManagementContainer.tsx), remplacer le bloc `<label>` + `<input type="checkbox">` par :

```tsx
<Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
<Label htmlFor="show-inactive">Afficher inactifs</Label>
```

Supprimer aussi le `<div />` vide (spacer) et utiliser `justify-end` à la place (Violation §3.11).

---

### Étape 8 — Corrections accessibilité formulaire (Violation §3.13)

Dans [TeamMemberForm.tsx](components/features/admin/team/TeamMemberForm.tsx), ajouter `aria-required="true"` sur le champ `name` (via l'attribut sur `<Input>`). Vérifier que `FormMessage` de shadcn/ui injecte bien `aria-describedby` pour les messages d'erreur ; sinon l'ajouter manuellement.

---

### Étape 9 — Corrections mineures (Violations §3.9, §3.10, nettoyage)

**9a.** Ajouter `export const metadata` dans [app/(admin)/admin/team/page.tsx](app/(admin)/admin/team/page.tsx) : `{ title: "Gestion de l'équipe | Admin" }`.

**9b.** Extraire la constante `DEFAULT_TEAM_MEMBER_AVATAR = "/logo-florian.png"` dans [components/features/admin/team/types.ts](components/features/admin/team/types.ts) ou un fichier constants, et l'importer dans [TeamMemberCard.tsx](components/features/admin/team/TeamMemberCard.tsx).

**9c.** Supprimer le code mort commenté `uploadTeamMemberPhoto` dans [actions.ts](app/(admin)/admin/team/actions.ts).

**9d.** Supprimer le `SetActiveBodySchema` vestige API Route dans [lib/schemas/team.ts](lib/schemas/team.ts).

**9e.** Supprimer les double exports (default + named) sur les 4 composants concernés, garder uniquement le named export.

---

### Étape 10 — (BONUS) Extraire un hook `useConfirmDialog` pour les 3 dialogues (§4 Composition Patterns)

Créer [lib/hooks/use-confirm-dialog.ts](lib/hooks/use-confirm-dialog.ts) qui encapsule le pattern `[candidate, isOpen, open(id), close(), confirm()]`. Refactorer les 3 dialogues de [TeamManagementContainer.tsx](components/features/admin/team/TeamManagementContainer.tsx) pour utiliser ce hook, réduisant de ~100 lignes et de 6 `useState` à 3 appels de hook. Créer aussi un composant `ConfirmDialog` générique dans [components/ui/confirm-dialog.tsx](components/ui/confirm-dialog.tsx) qui accepte `title`, `description`, `confirmLabel`, `variant`.

---

**Verification**

1. `pnpm build` — 0 erreurs TypeScript, pas de régression
2. `pnpm lint` — 0 warnings ESLint
3. Vérifier que [lib/dal/team.ts](lib/dal/team.ts) est < 300 lignes, toutes les fonctions < 30 lignes
4. `grep -r "dalSuccess\|dalError" lib/dal/team*.ts` — confirmer l'utilisation des helpers centralisés
5. `grep -r "ERR_TEAM" lib/dal/team*.ts` — confirmer que tous les codes erreur sont présents
6. Test manuel : page `/admin/team` → CRUD complet (créer, modifier, désactiver, réactiver, hard-delete, réordonner)
7. Test accessibilité : vérifier que le Switch a l'association `id`/`htmlFor`, que le champ Nom a `aria-required`
8. Test sécurité : les 3 pages utilisent `requireAdminPageAccess()` qui vérifie `app_metadata` en priorité

**Decisions**

- **Split DAL en 3 fichiers** (`team.ts`, `team-hard-delete.ts`, `team-reorder.ts`) plutôt que 2, pour rester bien sous les 300 lignes et respecter la single responsibility
- **`requireAdminPageAccess()` dans `is-admin.ts`** plutôt qu'un fichier séparé, car c'est un guard d'authentification cohérent avec `requireAdmin()`
- **Named export uniquement** (pas de default export) — aligné sur le pattern ESLint du projet
- **Le hook `useConfirmDialog` est en étape bonus** (étape 10) car il n'est pas bloquant mais améliore significativement la maintenabilité
