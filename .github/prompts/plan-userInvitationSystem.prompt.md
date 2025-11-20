# Plan Détaillé - Système de Gestion Utilisateurs avec Invitation Email

**Date**: 20 novembre 2025  
**Projet**: Rouge Cardinal Company  
**Contexte**: Implémentation interface admin pour gestion utilisateurs + système invitation par email  
**Objectif**: Éliminer les manipulations SQL manuelles pour attribution rôles admin

---

## 📋 Vue d'Ensemble

### Problématique Actuelle

Après un reset database, créer un admin nécessite :
1. Création compte via interface signup
2. Exécution manuelle SQL dans Supabase Dashboard
3. Logout/login pour rafraîchir JWT

**Solution proposée** : Interface admin complète avec :
- Liste utilisateurs avec rôles
- Modification rôles en temps réel
- Système d'invitation par email avec rôle pré-défini
- Suppression utilisateurs (RGPD compliant)

### Technologies Utilisées

- **Backend**: Next.js 15 Server Actions + Supabase Admin API
- **Frontend**: React 19 + shadcn/ui + Tailwind CSS
- **Email**: Resend + React Email (déjà configuré)
- **Validation**: Zod schemas
- **Base de données**: PostgreSQL (Supabase) avec RLS

---

## 🏗️ Architecture

### Flux de Données

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Interface                           │
│  /admin/users/page.tsx                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Server Components                               │
│  UsersManagementContainer (async)                            │
│    │                                                          │
│    ├─► listAllUsers()         [DAL]                          │
│    └─► Props → UsersManagementView                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Client Components                               │
│  UsersManagementView                                         │
│    │                                                          │
│    ├─► Select onChange → updateUserRole()                    │
│    ├─► Button onClick → deleteUser()                         │
│    └─► Button onClick → inviteUser()                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Server Actions (DAL)                            │
│  lib/dal/admin-users.ts                                      │
│    │                                                          │
│    ├─► listAllUsers()                                        │
│    │     ├─► supabase.auth.admin.listUsers()                 │
│    │     └─► supabase.from('profiles').select()              │
│    │                                                          │
│    ├─► updateUserRole()                                      │
│    │     ├─► supabase.auth.admin.updateUserById()            │
│    │     └─► supabase.from('profiles').update()              │
│    │                                                          │
│    ├─► deleteUser()                                          │
│    │     └─► supabase.auth.admin.deleteUser()                │
│    │                                                          │
│    └─► inviteUser() ⭐ NEW                                   │
│          ├─► supabase.auth.admin.inviteUserByEmail()         │
│          ├─► supabase.from('profiles').insert()              │
│          └─► sendInvitationEmail() [Resend]                  │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌──────────────┐      ┌──────────────────┐
│  Supabase    │      │  Resend API      │
│  Admin API   │      │  Email Service   │
│  + Database  │      │  React Email     │
└──────────────┘      └──────────────────┘
```

---

## 📦 Phase 0 : Configuration Supabase Admin

### Fichier : `supabase/admin.ts`

**Objectif** : Créer un client Supabase avec les droits "Service Role" pour les opérations d'administration (gestion utilisateurs, invitations).

```typescript
import { createClient } from "@supabase/supabase-js";
import "server-only";

/**
 * Crée un client Supabase avec les droits d'administration (Service Role).
 * ⚠️ À utiliser UNIQUEMENT côté serveur et dans des contextes sécurisés.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or Secret Key");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

**Checklist** :
- [ ] Créer `supabase/admin.ts`
- [ ] Vérifier présence `SUPABASE_SECRET_KEY`
- [ ] Configurer client sans persistance de session

---

## 📦 Phase 1 : Data Access Layer (DAL)

### Fichier : `lib/dal/admin-users.ts`

#### 1.1 Types et Interfaces

```typescript
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { createAdminClient } from "@/supabase/admin"; // ⭐ NEW
import { requireAdmin } from "@/lib/auth/is-admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * User avec profile enrichi
 */
interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  invited_at: string | null;
  profile: {
    role: string;
    display_name: string | null;
  } | null;
}

/**
 * Schema de validation pour mise à jour rôle
 */
const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid("UUID utilisateur invalide"),
  role: z.enum(['user', 'editor', 'admin'], {
    errorMap: () => ({ message: "Rôle invalide" })
  }),
});

type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;

/**
 * Schema de validation pour invitation
 */
const InviteUserSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(['user', 'editor', 'admin'], {
    errorMap: () => ({ message: "Rôle invalide" })
  }),
  displayName: z.string().min(2, "Nom doit contenir au moins 2 caractères").optional(),
});

type InviteUserInput = z.infer<typeof InviteUserSchema>;

/**
 * Type de retour standardisé
 */
interface DALResult<T = null> {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
}
```

**Checklist** :
- [ ] Créer fichier `lib/dal/admin-users.ts`
- [ ] Importer dépendances (Supabase, Zod, revalidatePath)
- [ ] Définir interfaces TypeScript
- [ ] Créer schemas Zod pour validation

#### 1.2 Fonction `listAllUsers()`

**Objectif** : Récupérer tous les users avec leurs profils

```typescript
/**
 * Liste tous les utilisateurs avec leurs profils
 * 
 * @returns Array d'utilisateurs avec profils enrichis
 * @throws Error si récupération échoue
 * 
 * @example
 * const users = await listAllUsers();
 * // users = [{ id: "...", email: "...", profile: { role: "admin", ... } }]
 */
export async function listAllUsers(): Promise<UserWithProfile[]> {
  // 1. Vérifier que l'utilisateur courant est admin
  await requireAdmin();
  
  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  // 2. Récupérer tous les users depuis auth.users (Admin API)
  const { data: { users }, error: usersError } = 
    await adminClient.auth.admin.listUsers();
  
  if (usersError) {
    console.error("[DAL] Failed to fetch users:", usersError);
    throw new Error(`Failed to fetch users: ${usersError.message}`);
  }
  
  // 3. Récupérer les profils correspondants (via RLS)
  const userIds = users.map(u => u.id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, role, display_name')
    .in('user_id', userIds);
  
  if (profilesError) {
    console.error("[DAL] Failed to fetch profiles:", profilesError);
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }
  
  // 4. Mapper users + profiles
  return users.map(user => {
    const profile = profiles?.find(p => p.user_id === user.id);
    return {
      id: user.id,
      email: user.email ?? '',
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      invited_at: user.invited_at,
      profile: profile ? {
        role: profile.role ?? 'user',
        display_name: profile.display_name,
      } : null,
    };
  });
}
```

**Checklist** :
- [ ] Implémenter fonction avec JSDoc complète
- [ ] Appeler `requireAdmin()` pour protection
- [ ] Utiliser `supabase.auth.admin.listUsers()`
- [ ] Joindre avec table `profiles`
- [ ] Gérer erreurs avec logs détaillés

#### 1.3 Fonction `updateUserRole()`

**Objectif** : Mettre à jour le rôle d'un utilisateur (auth + profile)

```typescript
/**
 * Met à jour le rôle d'un utilisateur
 * 
 * IMPORTANT : Double mise à jour nécessaire
 * 1. auth.users.app_metadata (pour JWT)
 * 2. public.profiles.role (pour is_admin())
 * 
 * @param input - { userId: UUID, role: 'user'|'editor'|'admin' }
 * @returns DALResult avec succès ou erreur
 * 
 * @example
 * await updateUserRole({ 
 *   userId: "xxx-xxx-xxx", 
 *   role: "admin" 
 * });
 */
export async function updateUserRole(
  input: UpdateUserRoleInput
): Promise<DALResult> {
  // 1. Vérifier admin
  await requireAdmin();
  
  // 2. Validation Zod
  const validated = UpdateUserRoleSchema.parse(input);
  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  // 3. Mettre à jour app_metadata dans auth.users (Admin API)
  const { error: authError } = await adminClient.auth.admin.updateUserById(
    validated.userId,
    {
      app_metadata: { role: validated.role },
      user_metadata: { role: validated.role }, // Backup
    }
  );
  
  if (authError) {
    console.error("[DAL] Failed to update auth metadata:", authError);
    return {
      success: false,
      error: `Failed to update user metadata: ${authError.message}`,
    };
  }
  
  // 4. Mettre à jour le profil dans public.profiles (via RLS)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      role: validated.role,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', validated.userId);
  
  if (profileError) {
    console.error("[DAL] Failed to update profile:", profileError);
    return {
      success: false,
      error: `Failed to update profile: ${profileError.message}`,
    };
  }
  
  // 5. Revalider la page admin
  revalidatePath('/admin/users');
  
  console.log(`[DAL] Role updated: ${validated.userId} → ${validated.role}`);
  return { success: true };
}
```

**Checklist** :
- [ ] Implémenter avec validation Zod
- [ ] Double mise à jour (auth.users + profiles)
- [ ] Gestion erreurs séparée pour chaque étape
- [ ] Appeler `revalidatePath()` après succès
- [ ] Logs informatifs

#### 1.4 Fonction `deleteUser()`

**Objectif** : Supprimer un utilisateur (RGPD compliant)

```typescript
/**
 * Supprime un utilisateur de manière permanente
 * 
 * RGPD Compliance:
 * - Suppression cascade vers profiles (FK ON DELETE CASCADE)
 * - Suppression complète de auth.users
 * 
 * @param userId - UUID de l'utilisateur à supprimer
 * @returns DALResult avec succès ou erreur
 * 
 * @example
 * await deleteUser("xxx-xxx-xxx");
 */
export async function deleteUser(userId: string): Promise<DALResult> {
  // 1. Vérifier admin
  await requireAdmin();
  
  // 2. Validation UUID simple
  if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    return {
      success: false,
      error: "UUID utilisateur invalide",
    };
  }
  
  const adminClient = createAdminClient();
  
  // 3. Supprimer via Admin API (cascade automatique vers profiles)
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  
  if (error) {
    console.error("[DAL] Failed to delete user:", error);
    return {
      success: false,
      error: `Failed to delete user: ${error.message}`,
    };
  }
  
  // 4. Revalider la page
  revalidatePath('/admin/users');
  
  console.log(`[DAL] User deleted: ${userId}`);
  return { success: true };
}
```

**Checklist** :
- [ ] Implémenter avec validation UUID
- [ ] Utiliser `supabase.auth.admin.deleteUser()`
- [ ] Documenter cascade automatique (profiles)
- [ ] Revalidation path
- [ ] Log suppression

#### 1.5 Débat Technique : `type: 'invite'` vs `type: 'recovery'`

**Question** : Quel type utiliser pour `generateLink()` ?

#### Option 1 : `type: 'invite'`
- ✅ **Avantages** : L'utilisateur est automatiquement connecté après clic
- ✅ **UX Simple** : Pas besoin de saisir email/password pour la première connexion
- ✅ **Email pré-confirmé** : Le fait de recevoir l'invitation confirme l'email
- ❌ **Inconvénient** : L'utilisateur n'a pas encore défini son mot de passe

#### Option 2 : `type: 'recovery'`
- ✅ **Avantages** : Force l'utilisateur à définir un mot de passe
- ✅ **Sécurité** : Mot de passe obligatoire dès la première connexion
- ❌ **UX Plus Complexe** : Étape supplémentaire pour l'utilisateur

#### ✅ **Décision Recommandée : `type: 'invite'`**

**Justification** :
1. L'email est **implicitement confirmé** par la réception de l'invitation
2. L'utilisateur peut définir son mot de passe **après** la connexion automatique
3. UX plus fluide : clic → connexion → setup compte
4. La page `/auth/setup-account` gère la définition du mot de passe

### 1.6 Fonction `inviteUser()` ⭐ NEW

**Objectif** : Inviter un nouvel utilisateur par email avec rôle pré-défini

```typescript
/**
 * Invite un nouvel utilisateur par email avec rôle pré-défini
 * 
 * Workflow:
 * 1. Validation email + rôle
 * 2. Invitation via Supabase Admin API (génère lien magique)
 * 3. Création profile immédiate (avant même acceptation)
 * 4. Envoi email d'invitation via Resend
 * 
 * @param input - { email, role, displayName? }
 * @returns DALResult avec userId ou erreur
 * 
 * @example
 * await inviteUser({
 *   email: "new-admin@example.com",
 *   role: "admin",
 *   displayName: "Nouvel Admin"
 * });
 */
export async function inviteUser(
  input: InviteUserInput
): Promise<DALResult<{ userId: string }>> {
  // 1. Vérifier admin
  await requireAdmin();
  
  // 2. Validation Zod
  const validated = InviteUserSchema.parse(input);
  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  // 3. Vérifier que l'email n'existe pas déjà
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  const emailExists = existingUsers?.users.some(
    u => u.email === validated.email
  );
  
  if (emailExists) {
    return {
      success: false,
      error: `Un utilisateur avec l'email ${validated.email} existe déjà`,
    };
  }
  
  // 4. Créer l'utilisateur et générer le lien d'invitation
  // Note: On utilise createUser + generateLink pour maîtriser l'envoi de l'email via Resend
  // sans déclencher l'email par défaut de Supabase (si configuré).
  
  // 4a. Créer l'utilisateur (sans mot de passe, email non confirmé)
  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email: validated.email,
    email_confirm: true, // On confirme l'email car l'invitation fait office de vérification
    user_metadata: { 
      role: validated.role,
      display_name: validated.displayName || validated.email.split('@')[0]
    }
  });

  if (createError) {
    console.error("[DAL] Failed to create user:", createError);
    return {
      success: false,
      error: `Failed to create user: ${createError.message}`,
    };
  }

  const userId = userData.user.id;

  // 4b. Générer le lien d'invitation (Magic Link / Recovery)
  // On utilise 'recovery' pour permettre à l'utilisateur de définir son mot de passe
  // Ou 'invite' si on veut juste le logger. 'recovery' est mieux pour "set password".
  // Supabase 'invite' type generates a link that logs the user in.
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/setup-account`;
  
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email: validated.email,
    options: {
      redirectTo: redirectUrl,
      data: { 
        role: validated.role,
        display_name: validated.displayName || validated.email.split('@')[0],
      }
    }
  });

  if (linkError) {
    // Rollback: supprimer l'utilisateur créé si la génération de lien échoue
    await adminClient.auth.admin.deleteUser(userId);
    console.error("[DAL] Failed to generate invite link:", linkError);
    return {
      success: false,
      error: `Failed to generate invite link: ${linkError.message}`,
    };
  }

  const invitationUrl = linkData.properties.action_link;
  
  // 5. Le profil est créé AUTOMATIQUEMENT par le trigger on_auth_user_created
  // Pas d'action manuelle nécessaire - le trigger handle_new_user() s'en charge
  
  // 6. Envoyer email d'invitation via Resend
  let emailSent = true;
  try {
    await sendInvitationEmail({
      email: validated.email,
      role: validated.role,
      displayName: validated.displayName,
      invitationUrl: invitationUrl, // Maintenant on a l'URL !
    });
  } catch (error) {
    console.error("[DAL] Failed to send invitation email:", error);
    emailSent = false;
  }
  
  // 7. Revalider la page
  revalidatePath('/admin/users');
  
  console.log(`[DAL] User invited: ${validated.email} (${validated.role})`);
  
  return { 
    success: true, 
    data: { userId },
    ...(!emailSent && { 
      warning: "User invited but email notification could not be sent" 
    }),
  };
}
```

**Checklist** :
- [ ] Implémenter fonction avec validation Zod
- [ ] Vérifier email unique avant invitation
- [ ] Utiliser `supabase.auth.admin.inviteUserByEmail()`
- [ ] Créer profile immédiatement (pas d'attente trigger)
- [ ] Intégrer envoi email via Resend
- [ ] Pattern warning pour graceful degradation
- [ ] Logs détaillés à chaque étape

---

## 📧 Phase 2 : Email Template Invitation

### Fichier : `emails/invitation-email.tsx`

#### 2.1 Template React Email

```typescript
import { SITE_CONFIG, WEBSITE_URL } from "@/lib/site-config";
import { 
  Preview, 
  Text, 
  Button, 
  Section 
} from "@react-email/components";
import { EmailLayout } from "./utils/email-layout";
import { EmailSection, EmailText, EmailLink } from "./utils/components.utils";

interface InvitationEmailProps {
  email: string;
  role: string;
  displayName?: string;
  invitationUrl: string;
}

const roleLabels: Record<string, string> = {
  user: 'Utilisateur',
  editor: 'Éditeur',
  admin: 'Administrateur',
};

export default function InvitationEmail({
  email,
  role,
  displayName,
  invitationUrl,
}: InvitationEmailProps) {
  const roleName = roleLabels[role] || role;
  const greeting = displayName || email.split('@')[0];
  
  return (
    <EmailLayout>
      <Preview>
        Invitation à rejoindre {SITE_CONFIG.SEO.TITLE} en tant que {roleName}
      </Preview>
      
      <EmailSection>
        <EmailText>Bonjour {greeting},</EmailText>
        
        <EmailText>
          Vous avez été invité(e) à rejoindre <strong>{SITE_CONFIG.SEO.TITLE}</strong> 
          {' '}avec le rôle de <strong>{roleName}</strong>.
        </EmailText>
        
        <EmailText>
          Pour accepter cette invitation et créer votre compte, 
          cliquez sur le bouton ci-dessous :
        </EmailText>
      </EmailSection>
      
      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button
          href={invitationUrl}
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block',
          }}
        >
          Accepter l&apos;invitation
        </Button>
      </Section>
      
      <EmailSection>
        <EmailText>
          Ou copiez ce lien dans votre navigateur :
        </EmailText>
        <EmailLink href={invitationUrl}>
          {invitationUrl}
        </EmailLink>
      </EmailSection>
      
      <EmailSection>
        <Text style={{ fontSize: '14px', color: '#6b7280', marginTop: '32px' }}>
          <strong>Note :</strong> Ce lien d&apos;invitation est valide pendant 24 heures. 
          Si vous n&apos;avez pas demandé cette invitation, vous pouvez ignorer cet email.
        </Text>
      </EmailSection>
      
      <EmailSection>
        <EmailText>
          À bientôt,<br />
          L&apos;équipe {SITE_CONFIG.SEO.TITLE}
        </EmailText>
      </EmailSection>
    </EmailLayout>
  );
}
```

**Checklist** :
- [ ] Créer fichier `emails/invitation-email.tsx`
- [ ] Utiliser `EmailLayout` existant
- [ ] Design bouton CTA visible
- [ ] Afficher rôle en français
- [ ] Lien de secours (fallback)
- [ ] Note sécurité (validité 24h)

#### 2.2 Email Action

**Fichier** : `lib/email/actions.ts` (ajouter fonction)

```typescript
/**
 * Envoie un email d'invitation à un nouvel utilisateur
 * 
 * @param params - Informations invitation (email, role, displayName, url)
 */
export async function sendInvitationEmail(params: {
  email: string;
  role: string;
  displayName?: string;
  invitationUrl: string;
}) {
  await sendEmail({
    to: params.email,
    subject: `Invitation à rejoindre ${SITE_CONFIG.SEO.TITLE}`,
    react: InvitationEmail({
      email: params.email,
      role: params.role,
      displayName: params.displayName,
      invitationUrl: params.invitationUrl,
    }),
  });
}
```

**Checklist** :
- [ ] Ajouter fonction dans `lib/email/actions.ts`
- [ ] Importer template `InvitationEmail`
- [ ] Subject clair et informatif
- [ ] Passer tous les paramètres nécessaires

---

## 🎨 Phase 3 : Interface Admin

### 3.1 Page Admin Users

**Fichier** : `app/(admin)/admin/users/page.tsx`

```typescript
import { Suspense } from "react";
import { UsersManagementContainer } from "@/components/admin/users/UsersManagementContainer";
import { UsersManagementSkeleton } from "@/components/admin/users/UsersManagementSkeleton";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Gestion des Utilisateurs | Admin",
  description: "Gérez les utilisateurs et leurs rôles",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les rôles et permissions des utilisateurs
          </p>
        </div>
        
        <Button asChild>
          <Link href="/admin/users/invite">
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter un utilisateur
          </Link>
        </Button>
      </div>
      
      {/* Liste utilisateurs */}
      <Suspense fallback={<UsersManagementSkeleton />}>
        <UsersManagementContainer />
      </Suspense>
    </div>
  );
}
```

**Checklist** :
- [ ] Créer fichier page
- [ ] Ajouter metadata SEO
- [ ] Header avec titre + description
- [ ] Bouton CTA "Inviter utilisateur"
- [ ] Suspense avec skeleton

### 3.2 Container (Server Component)

**Fichier** : `components/admin/users/UsersManagementContainer.tsx`

```typescript
import { listAllUsers } from "@/lib/dal/admin-users";
import { UsersManagementView } from "./UsersManagementView";

/**
 * Container Server Component
 * Récupère les users et passe au composant client
 */
export async function UsersManagementContainer() {
  // Fetch users server-side
  const users = await listAllUsers();
  
  return <UsersManagementView users={users} />;
}
```

**Checklist** :
- [ ] Créer container async
- [ ] Appeler DAL `listAllUsers()`
- [ ] Passer data au View

### 3.3 View (Client Component)

**Fichier** : `components/admin/users/UsersManagementView.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Mail,
  Clock 
} from "lucide-react";
import { updateUserRole, deleteUser } from "@/lib/dal/admin-users";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types
interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  invited_at: string | null;
  profile: {
    role: string;
    display_name: string | null;
  } | null;
}

interface Props {
  users: UserWithProfile[];
}

// Labels FR
const roleLabels: Record<string, string> = {
  user: 'Utilisateur',
  editor: 'Éditeur',
  admin: 'Administrateur',
};

/**
 * View Client Component
 * Affiche la liste des users avec interactions
 */
export function UsersManagementView({ users }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  
  // Handler: Changement de rôle
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (loading) return;
    
    setLoading(userId);
    try {
      const result = await updateUserRole({ 
        userId, 
        role: newRole as 'user' | 'editor' | 'admin' 
      });
      
      if (result.success) {
        toast.success('Rôle mis à jour avec succès');
        router.refresh();
      } else {
        toast.error(result.error || 'Échec de la mise à jour');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(null);
    }
  };
  
  // Handler: Suppression utilisateur
  const handleDeleteUser = async (userId: string, email: string) => {
    if (loading) return;
    
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?\n\n` +
      'Cette action est irréversible et supprimera toutes les données associées.'
    );
    
    if (!confirmed) return;
    
    setLoading(userId);
    try {
      const result = await deleteUser(userId);
      
      if (result.success) {
        toast.success('Utilisateur supprimé avec succès');
        router.refresh();
      } else {
        toast.error(result.error || 'Échec de la suppression');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(null);
    }
  };
  
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Inscription</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              {/* Email */}
              <TableCell className="font-medium">
                {user.email}
              </TableCell>
              
              {/* Display Name */}
              <TableCell>
                {user.profile?.display_name ?? (
                  <span className="text-muted-foreground italic">
                    Non défini
                  </span>
                )}
              </TableCell>
              
              {/* Rôle (Select) */}
              <TableCell>
                <Select
                  value={user.profile?.role ?? 'user'}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                  disabled={loading === user.id}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      {roleLabels.user}
                    </SelectItem>
                    <SelectItem value="editor">
                      {roleLabels.editor}
                    </SelectItem>
                    <SelectItem value="admin">
                      {roleLabels.admin}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              
              {/* Statut (Vérifié / Invité / Non vérifié) */}
              <TableCell>
                {user.email_confirmed_at ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Vérifié
                  </Badge>
                ) : user.invited_at ? (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Invité
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Non vérifié
                  </Badge>
                )}
              </TableCell>
              
              {/* Date inscription */}
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })}
              </TableCell>
              
              {/* Dernière connexion */}
              <TableCell className="text-sm text-muted-foreground">
                {user.last_sign_in_at ? (
                  format(new Date(user.last_sign_in_at), 'dd MMM yyyy', { locale: fr })
                ) : (
                  <span className="italic">Jamais</span>
                )}
              </TableCell>
              
              {/* Actions */}
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  disabled={loading === user.id}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Empty state */}
      {users.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
          <p className="text-sm mt-2">
            Invitez votre premier utilisateur pour commencer
          </p>
        </div>
      )}
    </div>
  );
}
```

**Checklist** :
- [ ] Créer composant client
- [ ] Utiliser shadcn/ui Table
- [ ] Select pour rôle avec handleChange
- [ ] Badges pour statuts (vérifié/invité/non vérifié)
- [ ] Bouton suppression avec confirmation
- [ ] Toast notifications (sonner)
- [ ] Loading state (disabled pendant action)
- [ ] Empty state si 0 users

### 3.4 Skeleton Loading

**Fichier** : `components/admin/users/UsersManagementSkeleton.tsx`

```typescript
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Skeleton de chargement pour la liste utilisateurs
 */
export function UsersManagementSkeleton() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Inscription</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-[140px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[80px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Checklist** :
- [ ] Créer skeleton component
- [ ] 5 lignes de skeleton par défaut
- [ ] Largeurs réalistes pour chaque colonne

---

## ✉️ Phase 4 : Page Invitation

### 4.1 Page Invite User

**Fichier** : `app/(admin)/admin/users/invite/page.tsx`

```typescript
import { Suspense } from "react";
import { InviteUserForm } from "@/components/admin/users/InviteUserForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Inviter un Utilisateur | Admin",
  description: "Invitez un nouvel utilisateur avec un rôle pré-défini",
};

export default function InviteUserPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Link>
      </Button>
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Inviter un Utilisateur</h1>
        <p className="text-muted-foreground mt-2">
          L&apos;utilisateur recevra un email d&apos;invitation avec un lien 
          pour créer son compte.
        </p>
      </div>
      
      {/* Form */}
      <InviteUserForm />
    </div>
  );
}
```

**Checklist** :
- [ ] Créer page invite
- [ ] Bouton retour liste users
- [ ] Header explicatif
- [ ] Formulaire invitation

### 4.2 Formulaire Invitation

**Fichier** : `components/admin/users/InviteUserForm.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inviteUser } from "@/lib/dal/admin-users";

// Schema de validation
const InviteUserFormSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(['user', 'editor', 'admin'], {
    errorMap: () => ({ message: "Rôle invalide" })
  }),
  displayName: z.string().min(2, "Minimum 2 caractères").optional(),
});

type InviteUserFormValues = z.infer<typeof InviteUserFormSchema>;

// Labels FR
const roleLabels: Record<string, string> = {
  user: 'Utilisateur',
  editor: 'Éditeur',
  admin: 'Administrateur',
};

const roleDescriptions: Record<string, string> = {
  user: 'Accès en lecture seule, peut consulter le contenu',
  editor: 'Peut créer et modifier du contenu',
  admin: 'Accès complet à toutes les fonctionnalités',
};

/**
 * Formulaire d'invitation utilisateur
 */
export function InviteUserForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(InviteUserFormSchema),
    defaultValues: {
      email: "",
      role: "user",
      displayName: "",
    },
  });
  
  const onSubmit = async (data: InviteUserFormValues) => {
    setIsLoading(true);
    
    try {
      const result = await inviteUser(data);
      
      if (result.success) {
        toast.success(
          result.warning 
            ? `Utilisateur invité (${result.warning})`
            : 'Invitation envoyée avec succès'
        );
        
        // Rediriger vers liste users
        router.push('/admin/users');
        router.refresh();
      } else {
        toast.error(result.error || "Échec de l'invitation");
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de l&apos;invitation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="utilisateur@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    L&apos;email où sera envoyée l&apos;invitation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Rôle */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['user', 'editor', 'admin'] as const).map((role) => (
                        <SelectItem key={role} value={role}>
                          <div>
                            <div className="font-medium">{roleLabels[role]}</div>
                            <div className="text-xs text-muted-foreground">
                              {roleDescriptions[role]}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Display Name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d&apos;affichage (optionnel)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Jean Dupont"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Si non renseigné, sera extrait de l&apos;email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer l&apos;invitation
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/users')}
                disabled={isLoading}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

**Checklist** :
- [ ] Créer formulaire avec react-hook-form
- [ ] Validation Zod via zodResolver
- [ ] 3 champs : email, role, displayName
- [ ] Select rôle avec descriptions
- [ ] Loading state avec spinner
- [ ] Toast notifications
- [ ] Bouton annuler (retour liste)

---

## 🔗 Phase 5 : Page Setup Account (Post-Invitation)

### 5.1 Page Setup Account

**Fichier** : `app/(marketing)/auth/setup-account/page.tsx`

```typescript
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { SetupAccountForm } from "@/components/auth/SetupAccountForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Configurer votre compte | Rouge Cardinal Company",
  description: "Définissez votre mot de passe pour accéder à votre compte",
};

/**
 * Page de configuration de compte (après clic sur lien invitation)
 * L'utilisateur est déjà authentifié par le lien magique.
 */
export default async function SetupAccountPage() {
  const supabase = await createClient();
  
  // Vérifier si user est authentifié
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  // Récupérer le profil pour connaître le rôle (pour redirection post-setup)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  
  const userRole = profile?.role || 'user';
  
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Bienvenue !
          </CardTitle>
          <p className="text-muted-foreground">
            Veuillez définir votre mot de passe pour finaliser votre inscription.
          </p>
        </CardHeader>
        <CardContent>
          <SetupAccountForm 
            email={user.email || ''} 
            userRole={userRole}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Checklist** :
- [ ] Créer page `setup-account`
- [ ] Vérifier authentification user
- [ ] Intégrer `SetupAccountForm`

### 5.2 Formulaire Setup Account

**Fichier** : `components/auth/SetupAccountForm.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SetupAccountSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SetupAccountValues = z.infer<typeof SetupAccountSchema>;

interface SetupAccountFormProps {
  email: string;
  userRole: string;
}

export function SetupAccountForm({ email, userRole }: SetupAccountFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  
  const form = useForm<SetupAccountValues>({
    resolver: zodResolver(SetupAccountSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (data: SetupAccountValues) => {
    setIsLoading(true);
    
    try {
      // Mise à jour du mot de passe
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Compte configuré avec succès !");
      
      // Redirection basée sur le rôle
      const redirectPath = userRole === 'admin' || userRole === 'editor' 
        ? '/admin' 
        : '/';
      
      router.push(redirectPath);
      router.refresh();
      
    } catch (error) {
      console.error("Setup failed:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground mb-4">
          Compte : {email}
        </div>
      
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <Input type="password" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Configuration...
            </>
          ) : (
            "Finaliser l'inscription"
          )}
        </Button>
      </form>
    </Form>
  );
}
```

**Checklist** :
- [ ] Créer composant `SetupAccountForm`
- [ ] Validation Zod (min 8 chars, match confirmation)
- [ ] Appel `supabase.auth.updateUser`
- [ ] Redirection post-succès

---

## 🧩 Phase 6 : Navigation Admin

### 6.1 Ajouter item sidebar

**Fichier** : `components/admin/AdminSidebar.tsx` (modifier)

```typescript
// Ajouter l'import
import { UserCog, /* ...autres icons */ } from "lucide-react";

// Dans la section navItems (groupe "Général")
const navItems = [
  {
    title: "Général",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Gestion Utilisateurs", // ⭐ NEW
        url: "/admin/users",
        icon: UserCog,
      },
    ],
  },
  // ...reste des items
];
```

**Checklist** :
- [ ] Importer icône `UserCog`
- [ ] Ajouter item dans groupe "Général"
- [ ] URL `/admin/users`

---

## 🔐 Phase 7 : Sécurité & Validation

### 7.1 Vérifier RLS Policies

**Fichier** : `supabase/schemas/60_rls_profiles.sql` (déjà en place)

Les policies existantes permettent déjà :
- ✅ Lecture publique des profils
- ✅ Update par propriétaire ou admin
- ✅ Delete par propriétaire

**Pas de modification nécessaire** si les policies suivantes existent :

```sql
-- Profiles sont visibles par tous
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO anon, authenticated
USING ( true );

-- Users peuvent mettre à jour leur profil OU admins peuvent tout modifier
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ( (SELECT auth.uid()) = user_id OR (SELECT public.is_admin()) )
WITH CHECK ( (SELECT auth.uid()) = user_id OR (SELECT public.is_admin()) );
```

**Checklist** :
- [ ] Vérifier policies existantes dans schemas
- [ ] Tester que admin peut modifier tous profils
- [ ] Tester que user ne peut modifier que son profil

### 7.2 Variables d'Environnement

**Fichier** : `.env.local` (vérifier)

```bash
# Supabase (obligatoire pour Admin API)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGc...
SUPABASE_SECRET_KEY=eyJhbGc...  # ⚠️ Service role key OBLIGATOIRE

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (déjà configuré)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@votre-domaine.fr
EMAIL_CONTACT=contact@votre-domaine.fr
```

**⚠️ CRITIQUE** : `SUPABASE_SECRET_KEY` est OBLIGATOIRE pour :
- `supabase.auth.admin.listUsers()`
- `supabase.auth.admin.updateUserById()`
- `supabase.auth.admin.deleteUser()`
- `supabase.auth.admin.inviteUserByEmail()`

**Checklist** :
- [ ] Vérifier présence `SUPABASE_SECRET_KEY`
- [ ] Vérifier URL site correcte
- [ ] Vérifier clés Resend pour emails

---

## 🧪 Phase 8 : Tests

### 8.1 Script de Test Invitation

**Fichier** : `scripts/test-user-invitation.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testInvitation() {
  console.log('🧪 Testing user invitation flow (Create + Generate Link)...\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testRole = 'editor';
  
  try {
    // 1. Créer l'utilisateur
    console.log(`👤 Creating user ${testEmail}...`);
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true,
      user_metadata: { 
        role: testRole,
        display_name: 'Test User',
      }
    });

    if (createError) {
      console.error('❌ User creation failed:', createError.message);
      return;
    }
    
    const userId = userData.user.id;
    console.log(`✅ User created: ${userId}`);

    // 2. Générer le lien
    console.log('🔗 Generating invite link...');
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: testEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/setup-account`
      }
    });

    if (linkError) {
      console.error('❌ Link generation failed:', linkError.message);
      return;
    }

    console.log('✅ Link generated successfully');
    console.log(`   Action Link: ${linkData.properties.action_link}`);
    
    // 3. Créer le profil
    console.log('\n📝 Creating profile...');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        role: testRole,
        display_name: 'Test User',
      });
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      return;
    }
    
    console.log('✅ Profile created successfully');
    
    // 4. Vérifier le profil
    console.log('\n🔍 Verifying profile...');
    
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !profile) {
      console.error('❌ Profile verification failed');
      return;
    }
    
    console.log('✅ Profile verified:');
    console.log(`   Role: ${profile.role}`);
    console.log(`   Display Name: ${profile.display_name}`);
    
    // 5. Cleanup (optionnel)
    console.log('\n🧹 Cleaning up test user...');
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.warn('⚠️  Cleanup failed (non-critical):', deleteError.message);
    } else {
      console.log('✅ Test user deleted');
    }
    
    console.log('\n🎉 Invitation flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testInvitation();
```

**Checklist** :
- [ ] Créer script de test
- [ ] Test invitation via Admin API
- [ ] Test création profile
- [ ] Vérification profile
- [ ] Cleanup automatique

**Commande** :
```bash
pnpm exec tsx scripts/test-user-invitation.ts
```

### 8.2 Tests Manuels Interface

**Checklist Tests UI** :
- [ ] Accéder `/admin/users` en tant qu'admin
- [ ] Liste s'affiche avec users existants
- [ ] Cliquer "Inviter un utilisateur"
- [ ] Remplir formulaire et soumettre
- [ ] Vérifier toast "Invitation envoyée"
- [ ] Vérifier email reçu (inbox ou Resend dashboard)
- [ ] Cliquer lien invitation dans email
- [ ] Vérifier redirection vers `/auth/welcome`
- [ ] Vérifier infos affichées correctement
- [ ] Retour `/admin/users` → nouveau user dans liste
- [ ] Changer rôle via Select → vérifier mise à jour
- [ ] Supprimer user → vérifier confirmation + disparition

---

## 📝 Phase 9 : Documentation

### 9.1 Mettre à jour Memory Bank

**Fichier** : `memory-bank/procedures/admin-user-management.md` (créer)

```markdown
# Procédure de Gestion des Utilisateurs Administrateurs

**Date** : 20 novembre 2025  
**Statut** : Production-ready

## Vue d'ensemble

Interface complète pour gérer les utilisateurs et leurs rôles depuis le panneau admin, incluant un système d'invitation par email.

## Fonctionnalités

### 1. Liste des Utilisateurs

**URL** : `/admin/users`

- Affichage tableau avec colonnes :
  - Email
  - Nom d'affichage
  - Rôle (Select modifiable)
  - Statut (Vérifié / Invité / Non vérifié)
  - Date d'inscription
  - Dernière connexion
  - Actions (Supprimer)

### 2. Invitation par Email

**URL** : `/admin/users/invite`

**Workflow** :
1. Admin remplit formulaire (email, rôle, nom)
2. System envoie invitation via Supabase Admin API
3. Profil créé immédiatement avec rôle pré-défini
4. Email d'invitation envoyé via Resend
5. User reçoit lien magique (valide 24h)
6. Clique lien → Redirigé vers `/auth/welcome`
7. Compte activé automatiquement

### 3. Modification de Rôle

**Action** : Select dans tableau

- Mise à jour immédiate
- Double update (auth.users + profiles)
- Toast confirmation
- Refresh automatique de la liste

### 4. Suppression Utilisateur

**Action** : Bouton trash dans tableau

- Confirmation modale obligatoire
- Suppression complète (RGPD compliant)
- Cascade automatique vers profiles
- Toast confirmation

## Rôles Disponibles

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **user** | Utilisateur standard | Lecture seule |
| **editor** | Éditeur de contenu | Création/modification contenu |
| **admin** | Administrateur | Accès complet |

## Sécurité

- **Admin API** : Nécessite `SUPABASE_SECRET_KEY` (service_role)
- **RLS** : Policies protègent les profils
- **Double vérification** : `requireAdmin()` dans toutes les DAL functions
- **Validation** : Zod schemas sur tous les inputs

## Troubleshooting

### Erreur "Failed to invite user"

**Cause** : Email déjà existant  
**Solution** : Vérifier que l'email n'est pas déjà enregistré

### Email non reçu

**Causes possibles** :
- Clé Resend invalide
- Email dans spam
- Domaine non vérifié dans Resend

**Solution** : Vérifier dashboard Resend + logs serveur

### Profile non créé après invitation

**Cause** : Erreur lors de l'insertion profile  
**Solution** : Le trigger `on_auth_user_created` créera le profile au premier login

## Commandes Utiles

```bash
# Test invitation
pnpm exec tsx scripts/test-user-invitation.ts

# Vérifier users en DB
pnpm dlx supabase db dump --table profiles
```

## Références

- DAL : `lib/dal/admin-users.ts`
- UI : `components/admin/users/`
- Email : `emails/invitation-email.tsx`

**Checklist** :
- [ ] Créer fichier procédure complète

---

## 🔍 Notes importantes (sécurité mot de passe)

- **Transmission à Supabase** : Supabase attend le mot de passe **en clair** (via HTTPS) pour le hacher correctement. Ne jamais hacher le mot de passe avant l'envoi à l'API Supabase.
- **Bonnes pratiques Frontend** :
  - Utiliser HTTPS (obligatoire).
  - Ne pas stocker le mot de passe dans le state React (utiliser `FormData` ou `react-hook-form`).
- **Interdictions** :
  - Ne **JAMAIS** stocker de mot de passe en clair dans nos tables personnalisées.
  - Ne **JAMAIS** envoyer de mot de passe par email (pas de mot de passe temporaire).
- **Flux d'invitation** :
  - Utiliser `generateLink({ type: 'invite' })` pour obtenir un lien sécurisé.
  - Envoyer ce lien via Resend (React Email).
  - L'utilisateur arrive sur une page protégée pour définir son mot de passe (`updateUser`).
- **Alignement Supabase** :
  - Respecte [Password Security](https://supabase.com/docs/guides/auth/password-security).
  - Utilise le flux recommandé pour les emails personnalisés (sans Edge Functions complexes, via `generateLink`).

---

## ✅ Résumé des Corrections demandées

- Remplacer toutes les créations de user avec mot de passe codé en dur par `inviteUserByEmail()`.
- Ajouter la page `/auth/accept-invite` + composant `AcceptInviteForm`.
- Ajouter table `user_invitations` pour audit + rate-limiting.
- Ajouter validation domaines email et rate limits (10/jour/admin par défaut).
- Ajouter tests (script `scripts/test-user-invitation.ts`).

---

## Estimation

**Durée** : 6-8 jours de travail pour implémentation complète et sécurisée.

---

*Fin du plan*
