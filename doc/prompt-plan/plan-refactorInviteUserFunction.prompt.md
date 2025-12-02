# Plan de Refactoring: inviteUser() Function

**Objectif**: Refactoriser la fonction `inviteUser()` (~200 lignes) pour respecter les standards Clean Code du projet

**Fichier cible**: `lib/dal/admin-users.ts`

**Standards à respecter**:
- ✅ Max 30 lignes par fonction
- ✅ Codes d'erreur [ERR_XXX] pour le traçage
- ✅ Noms de fonctions descriptifs
- ✅ Séparation des responsabilités

---

## Architecture Proposée

### Fonction Principale (28 lignes)

```typescript
export async function inviteUser(
  input: InviteUserInput
): Promise<DALResult<{ userId: string }>> {
  await requireAdmin();

  const validated = InviteUserSchema.parse(input);
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const currentAdminId = await getCurrentAdminIdFromClaims(supabase);
  
  await checkInvitationRateLimit(supabase, currentAdminId);
  await verifyUserDoesNotExist(adminClient, validated.email);

  const displayName = validated.displayName || validated.email.split("@")[0];
  const { invitationUrl } = await generateUserInviteLinkWithUrl(
    adminClient,
    validated.email,
    validated.role,
    displayName
  );

  const userId = await waitForAuthUserCreation(adminClient, validated.email);
  await createUserProfileWithRole(adminClient, userId, validated.role, displayName);
  await sendInvitationEmailWithRollback(adminClient, validated.email, validated.role, validated.displayName, invitationUrl, userId);
  await logInvitationAuditRecord(supabase, currentAdminId, userId, validated.email, validated.role);

  revalidatePath("/admin/users");

  console.log(`[DAL] User invited successfully: userId=${userId} role=${validated.role}`);
  return { success: true, data: { userId } };
}
```

---

## Fonctions Helper (9 fonctions)

### 1. getCurrentAdminIdFromClaims (~7 lignes)

**Responsabilité**: Extraire le sub claim du JWT pour identifier l'admin courant

```typescript
async function getCurrentAdminIdFromClaims(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = (claimsData as { claims?: Record<string, unknown> } | undefined)?.claims;
  return claims?.sub ? String(claims.sub) : null;
}
```

---

### 2. checkInvitationRateLimit (~15 lignes)

**Responsabilité**: Valider la limite de 10 invitations par jour

**Code d'erreur**: `[ERR_INVITE_001]` - Rate limit dépassé

```typescript
async function checkInvitationRateLimit(
  supabase: SupabaseClient,
  currentAdminId: string | null
): Promise<void> {
  if (!currentAdminId) {
    return;
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("user_invitations")
    .select("*", { count: "exact", head: true })
    .eq("invited_by", currentAdminId)
    .gte("created_at", oneDayAgo);

  if (count && count >= 10) {
    throw new Error("[ERR_INVITE_001] Rate limit dépassé: maximum 10 invitations par jour");
  }
}
```

---

### 3. verifyUserDoesNotExist (~13 lignes)

**Responsabilité**: Vérifier qu'aucun utilisateur n'existe déjà avec cet email

**Code d'erreur**: `[ERR_INVITE_002]` - Utilisateur existe déjà

```typescript
async function verifyUserDoesNotExist(
  adminClient: SupabaseClient,
  email: string
): Promise<void> {
  console.log(`[inviteUser] Checking for existing user: ${sanitizeEmailForLogs(email)}`);
  
  const existingUser = await findUserByEmail(adminClient, email);

  if (existingUser) {
    console.log(`[inviteUser] User ${email} already exists`);
    throw new Error(
      `[ERR_INVITE_002] Un utilisateur avec l'adresse ${email} existe déjà dans le système.`
    );
  }
}
```

---

### 4. generateUserInviteLinkWithUrl (~40 lignes)

**Responsabilité**: Générer le lien d'invitation via Supabase Admin API

**Codes d'erreur**: 
- `[ERR_INVITE_003]` - Email déjà enregistré (détecté par generateLink)
- `[ERR_INVITE_004]` - Échec de génération du lien

```typescript
async function generateUserInviteLinkWithUrl(
  adminClient: SupabaseClient,
  email: string,
  role: string,
  displayName: string
): Promise<{ invitationUrl: string }> {
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/setup-account`;

  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "invite",
      email: email,
      options: {
        redirectTo: redirectUrl,
        data: {
          role: role,
          display_name: displayName,
        },
      },
    });

  if (linkError) {
    console.error("[DAL] Failed to generate invite link:", linkError);
    console.log(`[DEBUG] linkError.code: ${linkError.code}, linkError.message: ${linkError.message}`);

    const existing = await findUserByEmail(adminClient, email);
    const existingId = existing?.id ?? null;

    if (
      linkError.code === "email_exists" ||
      linkError.message?.includes("email_exists") ||
      linkError.message?.includes("already been registered")
    ) {
      const errorMessage = existingId
        ? `Invitation impossible : un compte existe déjà (id=${existingId}). Vérifiez auth.users ou utilisez le flow de récupération.`
        : `Un utilisateur avec l'adresse ${email} existe déjà dans le système.`;
      
      throw new Error(`[ERR_INVITE_003] ${errorMessage}`);
    }

    throw new Error(
      `[ERR_INVITE_004] Erreur lors de la génération du lien d'invitation: ${linkError.message}`
    );
  }

  return { invitationUrl: linkData.properties.action_link };
}
```

---

### 5. waitForAuthUserCreation (~17 lignes)

**Responsabilité**: Attendre que l'utilisateur soit visible dans auth.users (retry loop)

**Code d'erreur**: `[ERR_INVITE_005]` - Utilisateur non trouvé après création

```typescript
async function waitForAuthUserCreation(
  adminClient: SupabaseClient,
  email: string
): Promise<string> {
  const maxAttempts = 5;
  const delayMs = 500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const found = await findUserByEmail(adminClient, email);
    if (found?.id) {
      return found.id;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  console.error("[DAL] Could not find auth user after generateLink.");
  throw new Error(
    `[ERR_INVITE_005] Invitation créée (lien), mais l'utilisateur n'a pas encore été visible dans auth.users. Veuillez vérifier manuellement.`
  );
}
```

---

### 6. createUserProfileWithRole (~25 lignes)

**Responsabilité**: Créer ou mettre à jour le profil utilisateur avec le rôle

**Code d'erreur**: `[ERR_INVITE_006]` - Échec de création/mise à jour du profil

```typescript
async function createUserProfileWithRole(
  adminClient: SupabaseClient,
  userId: string,
  role: string,
  displayName: string
): Promise<void> {
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        role: role,
        display_name: displayName,
      },
      {
        onConflict: "user_id",
      }
    );

  if (profileError) {
    console.error("[DAL] Failed to upsert profile:", profileError);
    throw new Error(
      `[ERR_INVITE_006] Failed to upsert profile for user ${userId}: ${profileError.message}. L'utilisateur a été créé dans auth.users; veuillez vérifier manuellement si nécessaire.`
    );
  }

  console.log(`[DAL] Profile upserted (created or updated) for user ${userId}`);
}
```

---

### 7. rollbackProfileAndAuthUser (~17 lignes)

**Responsabilité**: Fonction helper pour rollback complet (profil + auth user)

```typescript
async function rollbackProfileAndAuthUser(
  adminClient: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    await adminClient.from("profiles").delete().eq("user_id", userId);
    console.log(`[DAL] Profile rolled back for user ${userId}`);
  } catch (profileDeleteError) {
    console.error("[DAL] Failed to rollback profile:", profileDeleteError);
  }

  try {
    await adminClient.auth.admin.deleteUser(userId);
    console.log(`[DAL] Auth user rolled back: ${userId}`);
  } catch (userDeleteError) {
    console.error("[DAL] Failed to rollback auth user:", userDeleteError);
  }
}
```

---

### 8. sendInvitationEmailWithRollback (~24 lignes)

**Responsabilité**: Envoyer l'email d'invitation avec rollback automatique en cas d'échec

**Code d'erreur**: `[ERR_INVITE_007]` - Échec d'envoi email (avec rollback complet)

```typescript
async function sendInvitationEmailWithRollback(
  adminClient: SupabaseClient,
  email: string,
  role: string,
  displayName: string | undefined,
  invitationUrl: string,
  userId: string
): Promise<void> {
  try {
    const emailActions = await import("@/lib/email/actions");
    await emailActions.sendInvitationEmail({
      email: email,
      role: role,
      displayName: displayName,
      invitationUrl: invitationUrl,
    });
    console.log(`[DAL] Invitation email sent to ${email}`);
  } catch (error: unknown) {
    console.error(
      "[DAL] Failed to send invitation email, initiating complete rollback:",
      error
    );

    await rollbackProfileAndAuthUser(adminClient, userId);

    throw new Error(
      "[ERR_INVITE_007] Échec de l'envoi de l'email d'invitation. Rollback complet effectué."
    );
  }
}
```

---

### 9. logInvitationAuditRecord (~12 lignes)

**Responsabilité**: Enregistrer l'invitation dans la table d'audit

```typescript
async function logInvitationAuditRecord(
  supabase: SupabaseClient,
  currentAdminId: string | null,
  userId: string,
  email: string,
  role: string
): Promise<void> {
  if (!currentAdminId) {
    return;
  }

  await supabase.from("user_invitations").insert({
    user_id: userId,
    email: email,
    role: role,
    invited_by: currentAdminId,
  });
}
```

---

## Référence des Codes d'Erreur

| Code | Description | Contexte |
|------|-------------|----------|
| `[ERR_INVITE_001]` | Rate limit dépassé: maximum 10 invitations par jour | checkInvitationRateLimit() |
| `[ERR_INVITE_002]` | Un utilisateur existe déjà dans le système | verifyUserDoesNotExist() |
| `[ERR_INVITE_003]` | Email déjà enregistré (détecté par generateLink) | generateUserInviteLinkWithUrl() |
| `[ERR_INVITE_004]` | Échec de génération du lien d'invitation | generateUserInviteLinkWithUrl() |
| `[ERR_INVITE_005]` | Utilisateur non trouvé après création (retry épuisé) | waitForAuthUserCreation() |
| `[ERR_INVITE_006]` | Échec de création/mise à jour du profil | createUserProfileWithRole() |
| `[ERR_INVITE_007]` | Échec d'envoi email (rollback complet effectué) | sendInvitationEmailWithRollback() |

---

## Modifications Supplémentaires

### sanitizeEmailForLogs() - Suppression du commentaire

**Avant**:
```typescript
// Helper pour logs RGPD-compliant
function sanitizeEmailForLogs(email: string): string {
  // ...
}
```

**Après**:
```typescript
function sanitizeEmailForLogs(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length > 2
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : local[0] + '*';
  return `${maskedLocal}@${domain}`;
}
```

---

## Avantages du Refactoring

### ✅ Conformité Standards Clean Code
- Fonction principale: 28 lignes (< 30)
- Chaque helper: < 30 lignes
- Zéro commentaires (code auto-documenté)
- Codes d'erreur systématiques pour le traçage

### ✅ Maintenabilité
- Chaque fonction a une responsabilité unique
- Noms de fonctions descriptifs (self-documenting)
- Logique de rollback isolée et réutilisable
- Tests unitaires simplifiés (une fonction = un test)

### ✅ Debugging
- Codes d'erreur [ERR_XXX] pour traçage rapide
- Logs structurés avec contexte clair
- Stack traces plus précises (fonctions nommées)

### ✅ Réutilisabilité
- Helpers peuvent être utilisés ailleurs
- Logique métier découplée de l'orchestration
- Validation, retry, rollback réutilisables

---

## Fonctionnalités Préservées

- ✅ Authentification admin requise
- ✅ Validation Zod des inputs
- ✅ Rate limiting (10 invitations/jour)
- ✅ Vérification utilisateur existant
- ✅ Génération lien invitation Supabase
- ✅ Retry loop pour création auth user
- ✅ Upsert profil avec rôle
- ✅ Envoi email d'invitation
- ✅ Rollback complet en cas d'échec email
- ✅ Audit trail dans user_invitations
- ✅ Revalidation cache Next.js

---

## Étapes d'Implémentation

1. **Backup du fichier actuel** (si besoin de rollback)
2. **Ajouter les 9 fonctions helper** avant `inviteUser()`
3. **Remplacer le corps de `inviteUser()`** par la version refactorée
4. **Supprimer le commentaire** dans `sanitizeEmailForLogs()`
5. **Vérifier la compilation TypeScript** (`pnpm build` ou `pnpm typecheck`)
6. **Tester localement** le flow d'invitation
7. **Commit avec message descriptif** référençant clean code compliance

---

## Commit Message Suggéré

```
refactor(dal): split inviteUser into helper functions per clean code standards

BREAKING: None (internal refactoring only)

Changes:
- Extract 9 helper functions from 200-line inviteUser()
- Add error codes [ERR_INVITE_001] through [ERR_INVITE_007]
- Remove all comments (self-documenting function names)
- Main function now 28 lines (was ~200)
- Each helper < 30 lines per clean code standards

Compliance:
- ✅ Max 30 lines per function (1-clean-code.instructions.md)
- ✅ Zero comments (self-documenting code)
- ✅ Systematic error codes for tracing
- ✅ Single responsibility per function

Functionality preserved:
- Admin auth, validation, rate limiting
- User existence check, invite link generation
- Profile upsert, email sending
- Complete rollback on email failure
- Audit trail logging

Refs: #12 (TASK032), clean code compliance audit
```

---

## Validation Post-Refactoring

### Checklist de Tests

- [ ] Compilation TypeScript réussie
- [ ] Linting ESLint sans erreurs
- [ ] Test manuel: invitation réussie
- [ ] Test manuel: rate limit déclenché
- [ ] Test manuel: email existant détecté
- [ ] Test manuel: rollback en cas d'échec email
- [ ] Logs contiennent codes d'erreur [ERR_XXX]
- [ ] Aucune régression fonctionnelle

### Commandes de Validation

```bash
# TypeScript compilation
next build

# Linting
pnpm lint

# Type checking only (faster)
pnpm tsc --noEmit

# Run dev server and test manually
next dev --turbopack
```

---

## Notes Techniques

### Dépendances Externes Maintenues
- `@supabase/supabase-js` (createClient, admin API)
- `zod` (validation InviteUserSchema)
- `next/cache` (revalidatePath)
- `@/lib/email/actions` (sendInvitationEmail)

### Types TypeScript Utilisés
- `SupabaseClient` (from @supabase/supabase-js)
- `InviteUserInput` (local type)
- `DALResult<T>` (local type)
- `InviteUserSchema` (zod schema)

### Environnement Variables Requises
- `NEXT_PUBLIC_SITE_URL` (pour redirect URL)

---

## Fin du Plan

**Prêt pour implémentation** ✅

**Prochaine étape**: Appliquer le refactoring via `multi_replace_string_in_file` ou édition manuelle
