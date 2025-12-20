## Plan: Factoriser contact handler

Brève synthèse : extraire la logique commune de traitement du formulaire de contact dans un module serveur réutilisable, adapter la route API existante pour l'appeler, et ajouter une Server Action réutilisant la même fonction. J'ai vérifié les fichiers existants listés ci‑dessous.

### Steps
1. Créer lib/actions/contact-server.ts export `handleContactSubmission(input: unknown)` — validation Zod + appel DAL/email.  
2. Modifier `app/api/contact/route.ts` pour appeler `handleContactSubmission` et conserver réponse API.  
3. Créer app/actions/contact.actions.ts export `'use server'` `submitContactAction(formData: FormData)` → appelle `handleContactSubmission`.  
4. Mettre à jour (optionnel) `lib/hooks/useContactForm.ts` pour proposer invocation du Server Action (progressive, conserver fetch).

### Further Considerations
1. Conserver la route pour rétrocompatibilité (curl/clients externes) et migrer les clients progressivement.  
2. Ajouter rate‑limiting et journalisation côté `handleContactSubmission` pour protection et audit RGPD.  
3. Vérifier tests/scripts/doc référencés (usage de /api/contact) avant déploiement.


Files inspected / to review manually in repo:
- `app/api/contact/route.ts` — API route handler (already present)
- `lib/dal/contact.ts` — DAL insert (must stay in DAL)
- `lib/schemas/contact.ts` — Zod schema `ContactEmailSchema`
- `lib/email/actions.ts` — `sendContactNotification`
- `lib/api/helpers.ts` — `ApiResponse`, `HttpStatus`
- `lib/hooks/useContactForm.ts` — client fetch to `/api/contact`

Exports to implement (per file):
- `lib/actions/contact-server.ts`
  - Directives: `"use server"` + `import "server-only"`
  - export async function `handleContactSubmission(input: unknown): Promise<ActionResult<{ status: 'sent' }>>`
    - Validate input with `ContactEmailSchema`
    - Map `name` → `firstName`/`lastName` (use `parseFullName`)
    - Call `createContactMessage` (DAL) and `sendContactNotification`
    - Return `ActionResult` (`{ success: true, data: { status: 'sent' } }` | `{ success: false, error: string }`)

- `app/actions/contact.actions.ts`
  - export async function `submitContactAction(formData: FormData): Promise<ActionResult<{ status: 'sent' }>>` with `'use server'`
    - Read form fields from `formData`
    - Build plain object and call `handleContactSubmission`
    - Return `ActionResult` for UI consumption

- `app/api/contact/route.ts` (modify)
  - Replace internal logic with a call to `handleContactSubmission` and preserve API response shape
  - Ensure `app/api/contact/route.ts` converts `ActionResult` into `ApiResponse` using `ApiResponse.success` / `ApiResponse.error`

Potential breaking points and migration notes:
- External clients (curl, mobile, integrations) use `/api/contact` — keep it active.
- Update `memory-bank` docs and any curl examples to mention new Server Action if used internally.
- Implement rate limiting (middleware or in `handleContactSubmission`) to prevent abuse.

Constraints honored:
- Zod validation server-side retained
- DAL remains in `lib/dal/*`
- Server Action uses `'use server'` and `app/actions/` placement
- Preserve RGPD behavior (persist, no PII in responses)

Notes on server-only directive:
- `lib/actions/contact-server.ts` must include `"use server"` and live under `lib/actions/` to match project patterns.
- `app/actions/contact.actions.ts` must include `"use server"` at top.

✅ **Implémentation terminée avec succès !**

### Fichiers créés/modifiés :

| Fichier | Action |
|---------|--------|
| contact-server.ts | **Créé** — Logique partagée `handleContactSubmission()` |
| route.ts | **Modifié** — Appelle maintenant `handleContactSubmission()` |
| contact.actions.ts | **Créé** — Server Action `submitContactAction()` |

### Architecture résultante :

┌──────────────────────────────┐
│  useContactForm (fetch)      │ ── POST ──▶ /api/contact/route.ts
└──────────────────────────────┘                    │
                                                    ▼
┌──────────────────────────────┐         handleContactSubmission()
│  <form action={...}>         │ ─────────▶ lib/actions/contact-server.ts
└──────────────────────────────┘                    │
          │                                         │
          ▼                              ┌──────────┴──────────┐
  submitContactAction()                  │                     │
  app/actions/contact.actions.ts         ▼                     ▼
                              createContactMessage()  sendContactNotification()
                                    (DAL)                  (Email)

**Le build passe sans erreur** — la compatibilité descendante est préservée (curl, clients externes) et la Server Action est disponible pour le progressive enhancement futur du formulaire.

Les modifications ont été apportées.
