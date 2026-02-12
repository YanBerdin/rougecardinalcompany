# Plan d'implémentation TASK047 - Extraction NewsletterSubscriptionSchema

**TASK047 :** `memory-bank/tasks/TASK047-newsletter-schema-extraction.md`

## 📋 Vue d'ensemble

**Objectif :** Extraire `NewsletterSubscriptionSchema` de `lib/schemas/contact.ts` vers un fichier dédié `lib/schemas/newsletter.ts` pour cohérence architecturale.

**Statut actuel :** Le schéma newsletter est incorrectement colocalisé avec les schémas contact.

**Impact :** Faible - Refactoring interne, pas de changement fonctionnel.

---

## 🎯 Analyse de l'existant

### Fichiers concernés

| Fichier | Action | Lignes estimées |
|---------|--------|-----------------|
| `lib/schemas/contact.ts` | Retirer schéma newsletter (lignes 65-77) | ~13 lignes |
| `lib/schemas/newsletter.ts` | **CRÉER** avec schéma | ~18 lignes |
| `lib/schemas/index.ts` | Modifier exports (lignes 133-144) | ~8 lignes |
| `lib/actions/newsletter-server.ts` | Mettre à jour import (ligne 4) | 1 ligne |

### Schéma actuel à extraire

```typescript
// lib/schemas/contact.ts (à retirer)
export const NewsletterSubscriptionSchema = z.object({
    email: z.string().email("Email invalide"),
    consent: z.boolean().optional().default(true),
    source: z.string().optional().default("website"),
});

export type NewsletterSubscription = z.infer<
    typeof NewsletterSubscriptionSchema
>;
```

### Export barrel existant

Le fichier `lib/schemas/index.ts` exporte **déjà** le schéma depuis `contact.ts` (lignes 137-143) :

```typescript
// Contact
export {
    ContactMessageSchema,
    ContactEmailSchema,
    NewsletterSubscriptionSchema,  // ← À rediriger vers newsletter.ts
    ContactReasonEnum,
    type ContactMessageInput,
    type ContactEmailInput,
    type NewsletterSubscription,   // ← À rediriger vers newsletter.ts
    type ContactReason,
} from "./contact";
```

### Fichiers consommateurs

1. ✅ **`lib/actions/newsletter-server.ts`** (ligne 4) — Seul import direct
   ```typescript
   import { NewsletterSubscriptionSchema } from "@/lib/schemas/contact";
   ```

2. ✅ **`app/api/newsletter/route.ts`** — Pas d'import direct
   - Utilise `handleNewsletterSubscription()` qui importe le schéma
   - **Aucune modification requise**

3. ✅ **`app/actions/newsletter.actions.ts`** — Pas d'import direct
   - Utilise `handleNewsletterSubscription()` 
   - **Aucune modification requise**

---

## 📝 Plan d'implémentation détaillé

### Phase 1 - Création du nouveau fichier (5 min)

**Fichier :** `lib/schemas/newsletter.ts`

```typescript
import { z } from "zod";

// =============================================================================
// Newsletter Subscription Schema
// =============================================================================

export const NewsletterSubscriptionSchema = z.object({
    email: z.string().email("Email invalide"),
    consent: z.boolean().optional().default(true),
    source: z.string().optional().default("website"),
});

export type NewsletterSubscription = z.infer<
    typeof NewsletterSubscriptionSchema
>;
```

**Checklist :**
- [ ] Créer `lib/schemas/newsletter.ts`
- [ ] Copier schéma exact depuis `contact.ts` (avec `.default()`)
- [ ] Vérifier formatage (ESLint/Prettier)

---

### Phase 2 - Mise à jour barrel exports (2 min)

**Fichier :** `lib/schemas/index.ts`

L'export existe déjà, il faut **modifier la source** de l'import (lignes 133-144) :

```typescript
// AVANT (actuel)
// Contact
export {
    ContactMessageSchema,
    ContactEmailSchema,
    NewsletterSubscriptionSchema,
    ContactReasonEnum,
    type ContactMessageInput,
    type ContactEmailInput,
    type NewsletterSubscription,
    type ContactReason,
} from "./contact";

// APRÈS
// Contact
export {
    ContactMessageSchema,
    ContactEmailSchema,
    ContactReasonEnum,
    type ContactMessageInput,
    type ContactEmailInput,
    type ContactReason,
} from "./contact";

// Newsletter (NEW)
export {
    NewsletterSubscriptionSchema,
    type NewsletterSubscription,
} from "./newsletter";
```

**Checklist :**
- [ ] Retirer `NewsletterSubscriptionSchema` et `type NewsletterSubscription` de l'export `./contact`
- [ ] Ajouter nouvel export depuis `./newsletter`
- [ ] Maintenir l'ordre alphabétique (Newsletter avant Presse)

---

### Phase 3 - Mise à jour des imports consommateurs (5 min)

**Fichier 1 :** `lib/actions/newsletter-server.ts` (ligne 4)

```typescript
// AVANT
import { NewsletterSubscriptionSchema } from "@/lib/schemas/contact";

// APRÈS
import { NewsletterSubscriptionSchema } from "@/lib/schemas/newsletter";
```

**Fichier 2 :** `app/api/newsletter/route.ts`

```typescript
// Vérification : Pas d'import direct détecté
// L'API Route utilise handleNewsletterSubscription() qui importe le schéma
// → Aucune modification requise
```

**Checklist :**
- [ ] Mettre à jour import dans `newsletter-server.ts`
- [ ] Vérifier `api/newsletter/route.ts` (pas de changement attendu)

---

### Phase 4 - Nettoyage fichier contact (3 min)

**Fichier :** `lib/schemas/contact.ts`

```typescript
// Retirer ces lignes (lignes 65-77) :
// =============================================================================
// NEWSLETTER SUBSCRIPTION SCHEMA
// =============================================================================

export const NewsletterSubscriptionSchema = z.object({
    email: z.string().email("Email invalide"),
    consent: z.boolean().optional().default(true),
    source: z.string().optional().default("website"),
});

export type NewsletterSubscription = z.infer<
    typeof NewsletterSubscriptionSchema
>;
```

**Checklist :**
- [ ] Supprimer le bloc NEWSLETTER SUBSCRIPTION SCHEMA (lignes 65-77)
- [ ] Vérifier que le fichier reste valide (ContactMessageSchema, ContactEmailSchema restent)

---

## 🧪 Tests de validation

### Phase 6 - Tests build + lint (5 min)

```bash
# Vérifier TypeScript
pnpm tsc --noEmit

# Vérifier ESLint
pnpm lint

# Vérifier build Next.js
pnpm build
```

**Checklist :**
- [ ] `tsc --noEmit` → 0 erreurs
- [ ] `pnpm lint` → 0 erreurs
- [ ] `pnpm build` → Succès
- [ ] Vérifier autocomplete dans VSCode (import depuis `@/lib/schemas/newsletter`)

---

### Phase 7 - Tests fonctionnels Newsletter (10 min)

#### 7.1 Test API Newsletter (Local)

```bash
# Démarrer le serveur de développement
pnpm dev

# Test inscription newsletter via API
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test-task047@example.com","consent":true,"source":"footer"}'
```

**Résultat attendu :**
```json
{"status":"subscribed"}
```

#### 7.2 Test via script existant

```bash
# Utiliser le script de test Resend (si serveur dev actif)
node test-email-simple.js
```

#### 7.3 Test direct avec script dédié

Créer un script de test temporaire (optionnel) :

```bash
# Test rapide de validation du schéma
pnpm exec tsx -e "
import { NewsletterSubscriptionSchema } from './lib/schemas/newsletter';

// Test valid input
const valid = NewsletterSubscriptionSchema.safeParse({
  email: 'test@example.com',
  consent: true,
  source: 'footer'
});
console.log('✅ Valid input:', valid.success);

// Test defaults
const withDefaults = NewsletterSubscriptionSchema.parse({ email: 'test@example.com' });
console.log('✅ Defaults applied:', withDefaults.consent === true, withDefaults.source === 'website');

// Test invalid email
const invalid = NewsletterSubscriptionSchema.safeParse({ email: 'invalid' });
console.log('✅ Invalid email rejected:', !invalid.success);

console.log('\\n🎉 All schema tests passed!');
"
```

#### 7.4 Test intégration base de données (Local)

```bash
# Vérifier que l'inscription fonctionne en local avec Supabase
pnpm exec tsx scripts/test-newsletter-recursion-fix-direct.ts
```

**Checklist Tests :**
- [ ] Schema validation fonctionne (email valide/invalide)
- [ ] Defaults appliqués correctement (`consent: true`, `source: "website"`)
- [ ] API `/api/newsletter` répond correctement
- [ ] Inscription en base de données réussit
- [ ] Pas de régression (infinite recursion fix toujours actif)

---

## 🗄️ Commandes Migration Supabase

### Migration Locale (Docker)

Cette tâche est un **refactoring TypeScript pur** — aucune migration Supabase n'est requise.

Cependant, pour vérifier que le système newsletter fonctionne toujours :

```bash
# 1. Démarrer Supabase local (si pas déjà actif)
pnpm dlx supabase start

# 2. Vérifier le statut
pnpm dlx supabase status

# 3. Tester l'inscription newsletter en local
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"local-test@example.com","consent":true,"source":"task047-test"}'

# 4. Vérifier en base locale (via Studio)
# Ouvrir http://127.0.0.1:54323 → Table Editor → abonnes_newsletter

# 5. Nettoyer les données de test
pnpm dlx supabase db reset --yes  # ⚠️ Supprime toutes les données locales
```

### Migration Remote (Supabase Cloud)

**⚠️ Important :** Cette tâche ne modifie PAS le schéma base de données.

Pour déployer les changements TypeScript en production :

```bash
# 1. Vérifier que le projet est lié
pnpm dlx supabase link --project-ref <project_id>

# 2. Vérifier les migrations en attente (devrait être vide pour TASK047)
pnpm dlx supabase migration list --linked

# 3. Déployer l'application (pas de migration DB)
# Via votre CI/CD habituel (Vercel, etc.)
git push origin main

# 4. Tester en production
curl -X POST https://votre-domaine.com/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"prod-test@example.com","consent":true,"source":"task047-test"}'
```

### Rollback (si problème)

```bash
# Rollback Git uniquement (pas de DB rollback nécessaire)
git revert HEAD~3  # Revert les 3 commits TASK047

# Ou restore depuis la branche
git checkout main -- lib/schemas/contact.ts
git checkout main -- lib/schemas/index.ts
git checkout main -- lib/actions/newsletter-server.ts
rm lib/schemas/newsletter.ts
```

---

## ⚠️ Risques et mitigation

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Import circulaire | 🟡 Moyen | Vérifier avec `pnpm tsc --noEmit` |
| Oubli d'un fichier consommateur | 🟡 Moyen | Recherche globale `grep -r "NewsletterSubscriptionSchema"` |
| Barrel export cassé | 🟢 Faible | Vérifier `pnpm build` |

---

## 📦 Commits recommandés

```bash
# Commit 1 - Création fichier newsletter
git add lib/schemas/newsletter.ts
git commit -m "feat(schemas): create newsletter.ts schema file

- Extract NewsletterSubscriptionSchema from contact.ts
- Add NewsletterSubscription type export
- Prepare for TASK047 refactoring"

# Commit 2 - Mise à jour imports
git add lib/schemas/index.ts lib/actions/newsletter-server.ts
git commit -m "refactor(schemas): update newsletter schema imports

- Add barrel export in schemas/index.ts
- Update import in newsletter-server.ts
- TASK047 Phase 2-3 complete"

# Commit 3 - Nettoyage contact.ts
git add lib/schemas/contact.ts
git commit -m "refactor(schemas): remove newsletter schema from contact.ts

- Clean up contact.ts file
- Newsletter schema now in dedicated file
- TASK047 complete"
```

---

## ✅ Checklist finale

### Code

- [ ] `lib/schemas/newsletter.ts` créé avec schéma complet (avec `.default()`)
- [ ] `lib/schemas/index.ts` mis à jour (exports redirigés vers newsletter.ts)
- [ ] `lib/actions/newsletter-server.ts` import mis à jour
- [ ] `lib/schemas/contact.ts` nettoyé (bloc newsletter supprimé)

### Build & Lint

- [ ] `pnpm tsc --noEmit` → 0 erreurs
- [ ] `pnpm lint` → 0 erreurs
- [ ] `pnpm build` → Succès

### Tests

- [ ] Schema validation : email valide/invalide testé
- [ ] Defaults appliqués : `consent: true`, `source: "website"`
- [ ] API `/api/newsletter` POST → `{"status":"subscribed"}`
- [ ] Test DB local : `scripts/test-newsletter-recursion-fix-direct.ts` → PASS
- [ ] Pas de régression infinite recursion

### Déploiement

- [ ] Commits créés avec messages conventionnels
- [ ] Tests passent en local avant push
- [ ] Déploiement via CI/CD (pas de migration DB requise)

---

## 📊 Estimation temps total

| Phase | Temps estimé |
|-------|--------------|
| Phase 1 - Création fichier | 5 min |
| Phase 2 - Barrel exports | 2 min |
| Phase 3 - Mise à jour imports | 5 min |
| Phase 4 - Nettoyage contact | 3 min |
| Phase 5 - Validation build | 5 min |
| Phase 6 - Tests fonctionnels | 10 min |
| **TOTAL** | **30 min** |

---

## 🎯 Résultat attendu

**Avant :**
```bash
lib/schemas/
├── contact.ts (ContactMessage + Newsletter ❌)
├── home-content.ts
├── media.ts
└── index.ts
```

**Après :**
```bash
lib/schemas/
├── contact.ts (ContactMessage uniquement ✅)
├── newsletter.ts (Newsletter dédié ✅)
├── home-content.ts
├── media.ts
└── index.ts (exports newsletter ✅)
```

---

## 📚 Références

- **Pattern similaire** : `lib/schemas/team.ts`, `lib/schemas/spectacles.ts`
- **Barrel exports** : `lib/schemas/index.ts`
- **Consommateur principal** : `lib/actions/newsletter-server.ts`
- **Documentation** : `.github/instructions/2-typescript.instructions.md` (Zod patterns)

---
