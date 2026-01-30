fix(admin-agenda): resolve BigInt serialization error in Server Actions

CRITICAL FIX: Clicking "Mettre à jour" on /admin/agenda/\[id]/edit without
modifying fields caused "Do not know how to serialize a BigInt" error.

## Root Cause

React Server Actions serialize their execution context to send responses to
the client. When BigInt values were created during validation (via
EventInputSchema with z.coerce.bigint()), React failed to serialize them
even if they weren't explicitly returned.

## Solution Architecture

Implemented strict type separation between UI layer (number) and server layer
(bigint) with conversion happening AFTER validation:

```bash
EventForm (Client)                Server Action              DAL
   │                                   │                      │
   │ EventFormValues (number IDs)      │                      │
   ├──────────────────────────────────►│                      │
   │                                   │                      │
   │                        1. Validate with                  │
   │                           EventFormSchema (number)       │
   │                                   │                      │
   │                        2. Convert to                     │
   │                           EventDataTransport (string)    │
   │                                   │                      │
   │                                   ├─────────────────────►│
   │                                   │                      │
   │                                   │         3. DAL converts
   │                                   │            string → bigint
   │                                   │                      │
   │                        4. Return                         │
   │                           ActionResult (no data)         │
   │◄──────────────────────────────────┤                      │
   │                                   │                      │
   5. router.refresh()                 │                      │
      to fetch updated data            │                      │
```

## Changes

**Server Actions** (app/(admin)/admin/agenda/actions.ts):

- Simplified ActionResult to never return data (only success/error primitives)
- Created EventDataTransport type (IDs as string, not bigint)
- Validate with EventFormSchema (number IDs) instead of EventInputSchema
- Convert format AFTER validation: datetime-local→ISO8601, HH:MM→HH:MM:SS
- Convert IDs to string before passing to DAL
- Removed helper function formValuesToEventInput (converted BigInt too early)

**Type Safety** (TypeScript strict mode):

- EventDataTransport = Omit<EventInput, 'spectacle_id' | 'lieu_id'> & {
    spectacle_id: string; lieu_id: string | null;
  }
- Replaced `as any` with explicit types (EventDataTransport, Partial<EventInput>)
- Safe casting: `as unknown as EventInput` instead of `as any`

**Client Component** (EventForm.tsx):

- Remove all format transformations from onSubmit
- Send raw form data (datetime-local, HH:MM formats)
- Server Action handles all conversions

**Page Component** (edit/page.tsx):

- Explicit type annotations for BigInt→Number conversions
- EventClientDTO, LieuClientDTO, SpectacleClientDTO types

## Why This Works

1. **No BigInt in Server Action scope**: Validation uses number-based schema,
   so Zod never creates BigInt values during validation errors

2. **Type conversion isolated**: String IDs passed to DAL, which converts
   internally (server-only context never serialized by React)

3. **No data return**: ActionResult doesn't include any data that could
   contain BigInt values

4. **Router refresh pattern**: Client fetches updated data via Server
   Component re-render, avoiding serialization entirely

## Impact

- ✅ Update operations work without errors
- ✅ Create operations work (same pattern)
- ✅ Type safety maintained (no `any` types)
- ✅ Clean separation UI (number) vs Server (bigint)
- ✅ Follows CRUD Server Actions pattern (.github/instructions/)

## Testing

Manual testing confirmed:

- Edit event at /admin/agenda/2/edit
- Click "Mettre à jour" without changes → Success
- Modify fields → Success
- Create new event → Success
- All operations trigger proper revalidation

## References

- Pattern: .github/instructions/crud-server-actions-pattern.instructions.md
- TypeScript rules: .github/instructions/2-typescript.instructions.md
- Architecture: memory-bank/architecture/Project_Architecture_Blueprint.md
- Related: Next.js Server Actions serialization limitations

Fixes: TASK055 Phase 1 blocking issue
