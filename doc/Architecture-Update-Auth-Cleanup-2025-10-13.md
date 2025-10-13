# 📐 Mise à Jour Architecture - Nettoyage Auth

**Date** : 13 octobre 2025  
**Version** : Post-cleanup v2.1.0  
**Documents impactés** : Architecture blueprints et system patterns

---

## 🔄 Modifications Architecturales

### Fichiers Supprimés

Les fichiers suivants ont été supprimés et **ne doivent plus apparaître dans les documents d'architecture** :

1. ❌ `lib/auth/service.ts`
2. ❌ `components/auth/protected-route.tsx`
3. ❌ `lib/hooks/useAuth.ts`
4. ❌ `app/auth/callback/route.ts`

### Configuration Nettoyée

**Dans `lib/site-config.ts`** :

```typescript
// ❌ SUPPRIMÉ
EMAIL_REDIRECT_TO: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
```

---

## 📝 Documents à Mettre à Jour

### 1. `memory-bank/architecture/Project_Folders_Structure_Blueprint_v2.md`

**Sections à modifier** :

#### Section "Custom Hooks" (ligne ~13)

```diff
-  > - ✅ **Custom Hooks** : useAuth, useNewsletterSubscribe, useContactForm
+  > - ✅ **Custom Hooks** : useNewsletterSubscribe, useContactForm
```

#### Arbre des fichiers - Auth components (ligne ~275)

```diff
├── 📁 components/
-│   ├── 📁 auth/
-│   │   └── protected-route.tsx                # Route protection wrapper
```

#### Arbre des fichiers - Hooks (ligne ~434)

```diff
├── 📁 lib/
│   ├── 📁 hooks/
-│   │   ├── useAuth.ts                         # Auth hook
│   │   ├── useNewsletterSubscribe.ts          # Newsletter subscription
│   │   └── useContactForm.ts                  # Contact form handling
```

#### Arbre des fichiers - app/auth (ligne ~263)

```diff
│   ├── 📁 auth/
-│   │   ├── 📁 callback/route.ts               # ✨ OAuth callback handler
│   │   ├── 📁 login/page.tsx
│   │   ├── 📁 sign-up/page.tsx
```

#### Section "Custom Hooks Implementation" (ligne ~612)

```diff
-// lib/hooks/useAuth.ts
-export function useAuth() {
-  // Implementation...
-}
```

#### Section "Authentication Flow" (ligne ~976)

```diff
-  useAuth()
```

#### Section "Service Layer" (ligne ~1070)

```diff
-   → lib/auth/service.ts
```

### 2. `memory-bank/architecture/Email_Service_Architecture.md`

**Ligne ~139** :

```diff
export const SITE_CONFIG = {
  AUTH: {
    REDIRECT_TO_DASHBOARD: "/protected",
    REDIRECT_TO_LOGIN: "/auth/login",
-    EMAIL_REDIRECT_TO: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  },
}
```

### 3. `memory-bank/architecture/Project_Folders_Structure_Blueprint.md`

Même modifications que Blueprint_v2 pour les sections correspondantes.

### 4. `memory-bank/architecture/File-Tree.md`

**Lignes à supprimer** :

- Ligne ~77 : `protected-route.tsx`
- Ligne ~226 : `useAuth.ts`

### 5. `memory-bank/architecture/Project_Architecture_Blueprint.md`

**Ligne ~288** :

```diff
-│  │  │ • useAuth       │              │ • Button, Input, Card           ││   │
+│  │  │                 │              │ • Button, Input, Card           ││   │
```

---

## ✨ Nouvelle Architecture Auth

### Pattern Actuel (Post-Cleanup)

```typescript
// ✅ PATTERN OFFICIEL NEXT.JS + SUPABASE
// Pas de wrapper, pas d'abstraction, appels directs

// Composants appellent Supabase directement
const supabase = createClient();
await supabase.auth.signInWithPassword({ email, password });

// Middleware gère la protection
export async function middleware(request: NextRequest) {
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && request.nextUrl.pathname.startsWith("/protected")) {
    return NextResponse.redirect("/auth/login");
  }
}

// AuthButton = Client Component réactif
"use client";
export function AuthButton() {
  const [userClaims, setUserClaims] = useState(null);
  
  useEffect(() => {
    supabase.auth.getClaims().then(/* ... */);
    supabase.auth.onAuthStateChange(/* ... */);
  }, []);
  
  return userClaims ? <UserMenu /> : <SignInButton />;
}
```

### Composants Auth Actuels

**Fichiers existants** :

- ✅ `components/auth-button.tsx` - Client Component avec getClaims()
- ✅ `components/login-form.tsx` - Formulaire de connexion
- ✅ `components/logout-button.tsx` - Bouton déconnexion
- ✅ `components/sign-up-form.tsx` - Formulaire inscription
- ✅ `components/forgot-password-form.tsx` - Reset password
- ✅ `components/update-password-form.tsx` - Mise à jour password

**Protection** :

- ✅ `supabase/middleware.ts` - Protection serveur via getClaims()
- ✅ `app/protected/layout.tsx` - Layout avec vérification auth

**Routes auth** :

- ✅ `app/auth/login/page.tsx`
- ✅ `app/auth/sign-up/page.tsx`
- ✅ `app/auth/sign-up-success/page.tsx`
- ✅ `app/auth/forgot-password/page.tsx`
- ✅ `app/auth/update-password/page.tsx`
- ✅ `app/auth/error/page.tsx`
- ✅ `app/auth/confirm/route.ts`

---

## 📊 Comparaison Avant/Après

### Structure Auth - AVANT

```bash
auth/
├── lib/auth/service.ts              (264 lignes) ❌
├── components/auth/
│   └── protected-route.tsx          (85 lignes) ❌
├── lib/hooks/
│   └── useAuth.ts                   (55 lignes) ❌
└── app/auth/callback/route.ts       (29 lignes) ❌
───────────────────────────────────────────────────
Total: 433 lignes de code redondant
```

### Structure Auth - APRÈS

```bash
auth/
├── components/
│   ├── auth-button.tsx              (Client Component optimisé) ✅
│   ├── login-form.tsx               (Template officiel) ✅
│   ├── logout-button.tsx            (Template officiel) ✅
│   ├── sign-up-form.tsx             (Template officiel) ✅
│   ├── forgot-password-form.tsx     (Template officiel) ✅
│   └── update-password-form.tsx     (Template officiel) ✅
├── supabase/middleware.ts           (Protection serveur) ✅
├── app/protected/layout.tsx         (Vérification auth) ✅
└── app/auth/*                       (Routes auth) ✅
───────────────────────────────────────────────────
Total: Code minimal, 100% template officiel
```

---

## 🎯 Directives pour Documentation Future

### ❌ Ne Plus Mentionner

- AuthService class
- Server Actions auth (signInAction, signUpAction, etc.)
- useAuth hook
- protected-route component
- app/auth/callback route
- EMAIL_REDIRECT_TO config

### ✅ Toujours Mentionner

- Appels Supabase directs dans composants
- getClaims() pour performance (~2-5ms)
- onAuthStateChange() pour réactivité
- window.location.href pour logout
- router.refresh() pour login
- Middleware pour protection serveur
- Client Component pour AuthButton

### 📝 Template de Documentation Auth

Quand vous documentez l'authentification, utilisez ce template :

```markdown
## Authentication Architecture

**Pattern**: Official Next.js + Supabase template (client-direct)

**Components**:
- `auth-button.tsx` - Client Component with getClaims() (~2-5ms)
- `login-form.tsx` - Direct Supabase auth calls
- `logout-button.tsx` - window.location.href for complete reload

**Protection**:
- `supabase/middleware.ts` - Server-side route protection with getClaims()
- `app/protected/layout.tsx` - Additional auth verification

**Performance**:
- Initial load: 2-5ms (JWT verification)
- Real-time updates: onAuthStateChange() listener
- No network calls for auth checks

**Security**:
- Server-side protection (middleware + RLS)
- Client UI for user experience only
- No security vulnerabilities from Client Components
```

---

## 🔗 Références

- [Session de nettoyage complète](./Code-Cleanup-Auth-Session-2025-10-13.md)
- [Instructions Supabase Auth 2025](.github/instructions/nextjs-supabase-auth-2025.instructions.md)
- [System Patterns mis à jour](../memory-bank/systemPatterns.md)
- [Progress mis à jour](../memory-bank/progress.md)
