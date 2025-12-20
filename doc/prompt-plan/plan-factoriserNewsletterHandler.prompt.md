## Plan: Factoriser newsletter handler

**Status:** ✅ COMPLETED (2025-12-13)

Extraire la logique d'inscription newsletter dans un module serveur réutilisable, créer un DAL dédié, et ajouter une Server Action — même pattern que contact.

### Steps

1. ✅ **Créer `lib/dal/newsletter-subscriber.ts`** — fonction `createNewsletterSubscriber()` avec gestion idempotente des duplicats via `isUniqueViolation`.

2. ✅ **Créer `lib/actions/newsletter-server.ts`** — export `handleNewsletterSubscription(input: unknown): Promise<ActionResult<{ status: 'subscribed'; warning?: string }>>` avec validation Zod + DAL + email.

3. ✅ **Modifier `app/api/newsletter/route.ts`** — simplifier en appelant `handleNewsletterSubscription` et convertir en `ApiResponse`.

4. ✅ **Créer `app/actions/newsletter.actions.ts`** — export `subscribeNewsletterAction(formData: FormData)` pour progressive enhancement.

### Implementation Results

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `lib/dal/newsletter-subscriber.ts` | 47 | DAL avec gestion idempotente `unique_violation` |
| `lib/actions/newsletter-server.ts` | 52 | Handler partagé (validation + DAL + email) |
| `app/api/newsletter/route.ts` | 22 | Route API simplifiée (était ~75 lignes) |
| `app/actions/newsletter.actions.ts` | 21 | Server Action pour progressive enhancement |

**Réduction totale**: ~75 lignes → ~142 lignes réparties (meilleure séparation des responsabilités)

### Différences avec Contact

| Aspect | Contact | Newsletter |
|--------|---------|------------|
| Duplicats | Pas de contrainte | `unique_violation` → succès idempotent |
| Statut retour | `{ status: 'sent' }` | `{ status: 'subscribed', isNew?: boolean }` |
| Email cible | Admin | Utilisateur (confirmation) |

### Files inspected / to review manually in repo

- `app/api/newsletter/route.ts` — API route handler (already present)
- `lib/dal/home-newsletter.ts` — DAL settings only (NO subscriber insert)
- `lib/schemas/contact.ts` — Contains `NewsletterSubscriptionSchema`
- `lib/email/actions.ts` — `sendNewsletterConfirmation(email: string)`
- `lib/api/helpers.ts` — `ApiResponse`, `HttpStatus`, `isUniqueViolation`
- `lib/hooks/useNewsletterSubscribe.ts` — client fetch to `/api/newsletter`

### Exports to implement (per file)

- `lib/dal/newsletter-subscriber.ts`
  - Directives: `"use server"` + `import "server-only"`
  - export async function `createNewsletterSubscriber(input: NewsletterSubscriberInput): Promise<DALResult<{ isNew: boolean }>>`
    - Insert into `abonnes_newsletter` table
    - Handle `unique_violation` as idempotent success (user already subscribed)
    - Return `{ success: true, data: { isNew: !error } }` or `{ success: false, error: string }`

- `lib/actions/newsletter-server.ts`
  - Directives: `"use server"` + `import "server-only"`
  - export async function `handleNewsletterSubscription(input: unknown): Promise<ActionResult<{ status: 'subscribed'; warning?: string }>>`
    - Validate input with `NewsletterSubscriptionSchema`
    - Call `createNewsletterSubscriber` (DAL)
    - Call `sendNewsletterConfirmation` (email)
    - Return `ActionResult` (`{ success: true, data: { status: 'subscribed' } }` | `{ success: false, error: string }`)

- `app/actions/newsletter.actions.ts`
  - export async function `subscribeNewsletterAction(formData: FormData): Promise<ActionResult<{ status: 'subscribed' }>>` with `'use server'`
    - Read form fields from `formData`
    - Build plain object and call `handleNewsletterSubscription`
    - Return `ActionResult` for UI consumption

- `app/api/newsletter/route.ts` (modify)
  - Replace internal logic with a call to `handleNewsletterSubscription` and preserve API response shape
  - Ensure `app/api/newsletter/route.ts` converts `ActionResult` into `ApiResponse` using `ApiResponse.success` / `ApiResponse.error`

### Potential breaking points and migration notes

- External clients (curl, mobile, integrations) use `/api/newsletter` — keep it active.
- Hook `useNewsletterSubscribe.ts` continues to work unchanged (same API contract).
- Consider moving `NewsletterSubscriptionSchema` from `contact.ts` to dedicated `lib/schemas/newsletter.ts`.

### Constraints honored

- Zod validation server-side retained
- DAL remains in `lib/dal/*` with `"use server"` + `import "server-only"`
- Server Action uses `'use server'` and `app/actions/` placement
- Preserve RGPD behavior (persist without SELECT, no PII in responses)
- Email errors don't fail subscription (graceful degradation)

### Further Considerations

1. **Rate limiting**: TODO présent dans route actuelle — implémenter dans `handleNewsletterSubscription` ou middleware ?
2. **Schema location**: `NewsletterSubscriptionSchema` actuellement dans `contact.ts` — déplacer vers fichier dédié ?
3. **Hook client**: `useNewsletterSubscribe.ts` peut évoluer vers Server Action si souhaité (progressive enhancement).


End of plan.
