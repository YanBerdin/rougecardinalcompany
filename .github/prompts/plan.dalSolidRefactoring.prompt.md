# Plan : Appliquer dal-solid-principles.instructions.md

**TL;DR** : Refactoring des 17 fichiers DAL pour atteindre 90%+ de conformité SOLID. Priorité aux 4 fichiers critiques contenant des imports interdits (`revalidatePath`, email), puis uniformisation de l'interface `DALResult<T>` et des error codes sur les 13 fichiers restants.

## 📊 État Actuel (Audit SOLID)

| Fichier | Score | Violations Majeures |
|---------|-------|---------------------|
| `admin-home-about.ts` | **22/25** ✅ | Conforme |
| `admin-home-hero.ts` | **23/25** ✅ | `createHeroSlide` ~47 lignes |
| `admin-users.ts` | **12/25** ⚠️ | ❌ revalidatePath ×4, ❌ Email import |
| `agenda.ts` | **16/25** ⚠️ | ❌ Pas `"use server"`, ❌ Pas DALResult |
| `compagnie-presentation.ts` | **20/25** | ❌ Pas DALResult, Error codes |
| `compagnie.ts` | **18/25** | ❌ Pas DALResult, ❌ Pas Zod |
| `contact.ts` | **19/25** | ❌ Pas DALResult |
| `dashboard.ts` | **21/25** | ❌ Pas DALResult |
| `home-about.ts` | **17/25** | Fonction >30 lignes |
| `home-hero.ts` | **18/25** | ❌ Pas DALResult, ❌ Pas Zod |
| `home-news.ts` | **18/25** | ❌ Pas DALResult, ❌ Pas Zod |
| `home-newsletter.ts` | **21/25** | ❌ Pas DALResult |
| `home-partners.ts` | **18/25** | ❌ Pas DALResult, ❌ Pas Zod |
| `home-shows.ts` | **17/25** | Fonction >30 lignes |
| `presse.ts` | **17/25** | ❌ Pas DALResult, ❌ Pas Zod |
| `spectacles.ts` | **15/25** ⚠️ | ❌ revalidatePath ×4 |
| `team.ts` | **14/25** ⚠️ | ❌ Pas `"use server"`, ❌ revalidatePath |

**Score moyen actuel : 17.6/25 (70%)**
**Objectif : 22.5/25 (90%)**

---

## Steps

### Phase 1 : Fichiers Critiques (Règle 1 - Imports Interdits)

#### 1. Corriger `admin-users.ts` (12/25 → 22/25)

**Violations :**
- ❌ `import { revalidatePath }` (lignes 7, 209, 236, 476)
- ❌ `import("@/lib/email/actions")` (ligne 418)
- ❌ Fonctions > 30 lignes : `inviteUser`, `updateUserStatus`

**Actions :**
- [ ] Supprimer l'import `revalidatePath` du fichier
- [ ] Supprimer les appels `revalidatePath()` dans `inviteUser()`, `updateUserStatus()`, `deleteUser()`
- [ ] Extraire l'envoi d'email dans `lib/actions/admin-users-actions.ts` (Pattern Warning)
- [ ] Splitter `inviteUser()` en helpers : `checkRateLimit()`, `generateInviteLink()`, `createProfile()`
- [ ] Ajouter error codes `[ERR_USER_001]` à `[ERR_USER_007]`

**Fichier à créer :** `lib/actions/admin-users-actions.ts`

---

#### 2. Corriger `team.ts` (14/25 → 22/25)

**Violations :**
- ❌ Pas de directive `"use server"` (seulement `import "server-only"`)
- ❌ `revalidatePath()` dans `reorderTeamMembers()` (ligne 319)
- ❌ Fonctions > 30 lignes : `createMember`, `updateMember`, `reorderTeamMembers`

**Actions :**
- [ ] Ajouter `"use server"` en première ligne
- [ ] Supprimer `revalidatePath()` de `reorderTeamMembers()`
- [ ] Créer `lib/actions/team-actions.ts` avec `reorderTeamAction()`, `createMemberAction()`, `updateMemberAction()`
- [ ] Splitter fonctions longues en helpers < 30 lignes
- [ ] Ajouter error codes `[ERR_TEAM_001]` à `[ERR_TEAM_005]`

**Fichier à créer :** `lib/actions/team-actions.ts`

---

#### 3. Corriger `spectacles.ts` (15/25 → 22/25)

**Violations :**
- ❌ `revalidatePath()` utilisé 4 fois (lignes 376, 462, 463, 554)
- ❌ Fonctions > 30 lignes : `createSpectacle`, `updateSpectacle`, `duplicateSpectacle`
- ⚠️ Error codes inconsistants

**Actions :**
- [ ] Supprimer tous les appels `revalidatePath()` du fichier
- [ ] Créer `lib/actions/spectacles-actions.ts` avec CRUD Actions
- [ ] Splitter `createSpectacle()`, `updateSpectacle()` en helpers
- [ ] Uniformiser error codes `[ERR_SPECTACLE_001]` à `[ERR_SPECTACLE_010]`

**Fichier à créer :** `lib/actions/spectacles-actions.ts`

---

#### 4. Corriger `agenda.ts` (16/25 → 22/25)

**Violations :**
- ❌ Pas de directive `"use server"`
- ❌ Retourne `Event[]` au lieu de `DALResult<Event[]>`
- ❌ Pas de validation Zod
- ❌ `fetchEventsWithFilters()` ~55 lignes

**Actions :**
- [ ] Ajouter `"use server"` en première ligne
- [ ] Définir `DALResult<T>` interface
- [ ] Refactorer toutes les fonctions pour retourner `DALResult<T>`
- [ ] Créer schéma Zod `EventFilterSchema` dans `lib/schemas/agenda.ts`
- [ ] Splitter `fetchEventsWithFilters()` en helpers : `buildDateFilter()`, `buildStatusFilter()`, `executeQuery()`
- [ ] Ajouter error codes `[ERR_AGENDA_001]` à `[ERR_AGENDA_005]`

**Fichier à créer :** `lib/schemas/agenda.ts`

---

### Phase 2 : Uniformiser DALResult et Error Codes (13 fichiers)

#### 5. Fichiers à refactorer

| Fichier | DALResult | Error Codes | Zod |
|---------|-----------|-------------|-----|
| `compagnie-presentation.ts` | ❌ → ✅ | ❌ → `[ERR_PRESENTATION_NNN]` | ✅ |
| `compagnie.ts` | ❌ → ✅ | ❌ → `[ERR_COMPAGNIE_NNN]` | ❌ → ✅ |
| `contact.ts` | ❌ → ✅ | ❌ → `[ERR_CONTACT_NNN]` | ✅ |
| `dashboard.ts` | ❌ → ✅ | ⚠️ → `[ERR_DASHBOARD_NNN]` | ✅ |
| `home-about.ts` | ❌ → ✅ | ❌ → `[ERR_HOME_ABOUT_NNN]` | ❌ → ✅ |
| `home-hero.ts` | ❌ → ✅ | ❌ → `[ERR_HOME_HERO_NNN]` | ❌ → ✅ |
| `home-news.ts` | ❌ → ✅ | ❌ → `[ERR_HOME_NEWS_NNN]` | ❌ → ✅ |
| `home-newsletter.ts` | ❌ → ✅ | ❌ → `[ERR_NEWSLETTER_NNN]` | ✅ |
| `home-partners.ts` | ❌ → ✅ | ❌ → `[ERR_HOME_PARTNERS_NNN]` | ❌ → ✅ |
| `home-shows.ts` | ❌ → ✅ | ❌ → `[ERR_HOME_SHOWS_NNN]` | ❌ → ✅ |
| `presse.ts` | ❌ → ✅ | ❌ → `[ERR_PRESSE_NNN]` | ❌ → ✅ |

**Pattern à appliquer :**

```typescript
// AVANT
export async function fetchData(): Promise<Data[]> {
  const { data, error } = await supabase.from("table").select("*");
  if (error) throw error;
  return data ?? [];
}

// APRÈS
export async function fetchData(): Promise<DALResult<Data[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("table").select("*");
  
  if (error) {
    console.error("[ERR_ENTITY_001] Failed to fetch data:", error.message);
    return { success: false, error: `[ERR_ENTITY_001] ${error.message}` };
  }
  
  return { success: true, data: data ?? [] };
}
```

---

### Phase 3 : Ajouter Validation Zod Manquante

#### 6. Schémas Zod à créer

| Fichier DAL | Schéma à créer | Emplacement |
|-------------|----------------|-------------|
| `compagnie.ts` | `CompagnieValueSchema` | `lib/schemas/compagnie.ts` |
| `home-hero.ts` | `HomeHeroFilterSchema` | `lib/schemas/home-content.ts` (existant) |
| `home-news.ts` | `HomeNewsSchema` | `lib/schemas/home-content.ts` |
| `home-partners.ts` | `HomePartnerSchema` | `lib/schemas/home-content.ts` |
| `home-shows.ts` | `HomeShowFilterSchema` | `lib/schemas/home-content.ts` |
| `presse.ts` | `PresseFilterSchema` | `lib/schemas/presse.ts` |

---

## Further Considerations

### 1. Ordre d'exécution recommandé

**Priorité 1 (bloquant CI potentielle) :**
1. `admin-users.ts` — Import email critique
2. `team.ts` — Directive manquante
3. `spectacles.ts` — revalidatePath critique

**Priorité 2 (conformité) :**
4. `agenda.ts` — Structure complète
5. Phase 2 : DALResult uniformisation

**Priorité 3 (polish) :**
6. Phase 3 : Schémas Zod

### 2. Templates existants à réutiliser

- `lib/actions/home-hero-actions.ts` — Pattern Server Actions
- `lib/actions/home-about-actions.ts` — Pattern ActionResult
- `lib/dal/admin-home-hero.ts` — Pattern DALResult + Error codes
- `lib/schemas/home-content.ts` — Pattern Dual schemas (Server/UI)

### 3. Script de validation automatique

Créer `scripts/validate-dal-solid.ts` pour vérifier :
- [ ] Aucun import `next/cache` dans `lib/dal/`
- [ ] Aucun import `@/lib/email` dans `lib/dal/`
- [ ] Directive `"use server"` présente
- [ ] Fonctions < 30 lignes

```bash
# Ajouter au package.json
"test:dal-solid": "tsx scripts/validate-dal-solid.ts"
```

### 4. Estimation temps

| Phase | Fichiers | Temps estimé |
|-------|----------|--------------|
| Phase 1 | 4 fichiers critiques | 2-3h |
| Phase 2 | 11 fichiers uniformisation | 2h |
| Phase 3 | 6 schémas Zod | 1h |
| **Total** | **17 fichiers** | **5-6h** |

---

## Checklist de validation finale

- [ ] Aucun import `revalidatePath` dans `lib/dal/`
- [ ] Aucun import `@/lib/email` dans `lib/dal/`
- [ ] Toutes les fonctions < 30 lignes
- [ ] Interface `DALResult<T>` sur tous les fichiers
- [ ] Error codes `[ERR_ENTITY_NNN]` uniformisés
- [ ] Directive `"use server"` + `import "server-only"` sur tous les fichiers
- [ ] Score SOLID moyen ≥ 22.5/25 (90%)
