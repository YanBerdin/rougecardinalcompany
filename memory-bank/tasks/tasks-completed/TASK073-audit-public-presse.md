# Audit détaillé — presse

**Périmètre** : les 5 fichiers du dossier + fichiers associés (presse.ts, presse.ts, app/(marketing)/presse/page.tsx/presse/page.tsx, presse-skeleton.tsx).

---

## 1. Architecture & Patterns généraux

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| Smart/Dumb séparation | **PASS** | `PresseContainer` (orchestration) → `PresseServerGate` (data fetch) → `PresseView` (dumb, `"use client"`) |
| Server Component first | **PASS** | Les données sont lues côté serveur via DAL, pas côté client |
| Suspense + Skeleton | **PASS** | `PresseContainer` enveloppe `PresseServerGate` dans `<Suspense fallback={<PresseSkeleton />}>` |
| Display Toggles | **PASS** | `PresseServerGate` vérifie `display_toggle_media_kit` et `display_toggle_presse_articles` avant de fetch. Conditional `Promise.all` |
| Props colocalisées types.ts | **PASS** | `PresseViewProps` défini dans types.ts avec re-export depuis le schéma centralisé |

---

### 2. Clean Code (max lignes, DRY, responsabilités)

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| Max 300 lignes/fichier | **PASS** | PresseView.tsx = 288 lignes (OK, < 300). presse.ts DAL = 291 (marginal, dans la limite) |
| Max 30 lignes/fonction | **WARN** | La fonction `PresseView` fait ~260 lignes JSX en un seul `return`. C'est un composant de rendu, mais il serait plus lisible s'il était découpé en sous-composants (voir Composition Patterns) |
| Max 5 params/fonction | **PASS** | `PresseViewProps` = 3 props + 1 optionnelle |
| 1 responsabilité/fichier | **PASS** | Chaque fichier a une seule responsabilité |
| Magic numbers | **WARN** | `maxPressReleases` fallback `12` est un magic number dans `PresseServerGate` (ligne 32-33) — devrait être une constante nommée |
| TODO en production | **FAIL** | 2 TODO non résolus : PresseContainer.tsx ligne 10 (`// TODO: remove`), PresseView.tsx ligne 288 |

---

### 3. Composition Patterns (React)

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| Pas de boolean prop proliferation | **PASS** | Pas de props booléennes de customisation |
| Compound components | **N/A** | Pas de besoin identifié ici, c'est une page de lecture |
| Composant unique trop long | **WARN** | `PresseView` (288 lignes) est un monolithe de rendu. En composition pattern, il devrait être découpé en sous-composants : `HeroSection`, `ContactSection`, `RevueDePresse`, `CommuniquesSection`, `AccreditationSection`, `MediaKitSection`. Chacun serait < 50 lignes et réutilisable |
| children over render props | **PASS** | Pas de render props |

---

### 4. DAL SOLID Principles

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| `"use server"` + `import "server-only"` | **PASS** | Présents en lignes 1-3 de presse.ts |
| `cache()` React wrapping | **PASS** | Les 3 fonctions (`fetchPressReleases`, `fetchMediaArticles`, `fetchMediaKit`) sont wrappées |
| `DALResult<T>` return type | **PASS** | Toutes les fonctions retournent `Promise<DALResult<T>>` |
| Pas de `revalidatePath` dans DAL | **PASS** | Aucun import `next/cache` |
| Pas d'import email/side-effect | **PASS** | Aucun |
| Error codes `[ERR_XXX_NNN]` | **PASS** | 6 codes : `ERR_PRESSE_001` à `ERR_PRESSE_006` |
| `dalSuccess`/`dalError` helpers | **FAIL** | Le DAL utilise `{ success: true, data }` et `{ success: false, error }` littéralement au lieu d'utiliser les helpers `dalSuccess()`/`dalError()` exportés depuis error.ts |
| Types dupliqués | **FAIL** | `PressRelease`, `MediaArticle`, `MediaKitItemDTO` sont **redéfinis localement** dans le DAL (interfaces lignes 8-39) au lieu de réutiliser les types du schéma centralisé presse.ts. **Violation DRY** — les deux divergent potentiellement |
| Mapper functions `mapToXxxDTO()` naming | **WARN** | Les mappers s'appellent `mapPressReleaseRow` / `mapMediaArticleRow` / `mapMediaKitRow` — la convention du projet est `mapToXxxDTO()` |
| `buildMediaPublicUrl` (T3 Env) | **WARN** | `mapMediaKitRow` construit l'URL avec un template string hardcodé (`/storage/v1/object/public/${row.storage_path}`) au lieu d'utiliser le helper `buildMediaPublicUrl()` de media-url.ts. Risque de désynchro si l'URL Supabase change |

---

### 5. Schemas & Types (Zod)

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| Schémas centralisés presse.ts | **PASS** | Schémas Zod bien définis |
| Re-export dans types.ts | **PASS** | types.ts re-exporte proprement depuis le schéma |
| Schemas Server vs UI | **WARN** | Pas de séparation Server/UI (pas de `bigint` → `number` nécessaire ici car les IDs sont `number`, donc acceptable) |
| Validation runtime dans DAL | **FAIL** | Le DAL ne valide PAS les données retournées par Supabase avec les Zod schemas. Les mappers font un cast manuel (`String()`, `Number()`) sans validation Zod |

---

### 6. Page Route

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| `export const dynamic = 'force-dynamic'` | **FAIL** | app/(marketing)/presse/page.tsx/presse/page.tsx) utilise `export const revalidate = 60` (ISR) mais **pas** `export const dynamic = 'force-dynamic'`. Selon les instructions copilot-instructions.md, cette page est listée comme requérant `dynamic = 'force-dynamic'` car elle utilise des cookies Supabase SSR |
| Metadata | **WARN** | Pas de `metadata` export pour le SEO (title, description). Recommandé pour une page publique important pour le référencement |

---

### 7. Accessibilité (WCAG 2.2 AA)

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| Landmarks | **WARN** | Les `<section>` n'ont pas d'`aria-label` ou `aria-labelledby` pour différencier les régions aux lecteurs d'écran |
| Liste `<ul>` avec bullets textuelles | **FAIL** | Section Accréditation : `<ul>` avec `<li>• Votre nom...` utilise un bullet `•` textuel dans un `<li>`. C'est redondant — le navigateur ajoute déjà un marqueur natif pour `<li>`. Les lecteurs d'écran liront "bullet, bullet Votre nom..." |
| Lien "Lire l'article" non descriptif | **WARN** | Tous les boutons "Lire l'article" ont le même label. Pour les Voice Access users et screen readers, un `aria-label` plus descriptif serait préférable (ex: "Lire l'article : {article.title}") |
| Contrast ratio | **PASS** | Texte blanc sur gradient (hero), texte sombre sur fond clair — semble correct visuellement |
| Target size (touch) | **PASS** | Les boutons utilisent des composants shadcn/ui avec des tailles standard adéquates |
| Liens `download` | **WARN** | Les liens "Télécharger le PDF" et "Télécharger" n'ont pas d'indication du format/taille dans leur `aria-label` |

---

### 8. Sécurité

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| `noopener noreferrer` sur liens externes | **PASS** | Présent sur les liens `target="_blank"` (media articles) |
| Server-only DAL | **PASS** | `import "server-only"` empêche l'utilisation côté client |
| Pas de données sensibles exposées | **PASS** | Seules les données publiques sont retournées |
| XSS | **PASS** | Pas d'usage de `dangerouslySetInnerHTML` |

---

### 9. Fichier mort / Code legacy

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| hooks.ts — code mort | **FAIL** | 158 lignes de code commenté (hook `usePresse()` avec données mock). Le commentaire indique `[DEPRECATED MOCK]`. Ce fichier devrait être **supprimé** — il n'est importé nulle part et pollue le dossier. Violation Clean Code (no dead code) |

---

### 10. TypeScript Strict

| Critère | Statut | Détail |
| --------- | -------- | -------- |
| Pas de `any` | **PASS** | Aucun `any` trouvé |
| Types explicites | **PASS** | Toutes les props et retours sont typés |
| Erreurs TypeScript | **PASS** | 0 erreur de compilation sur tous les fichiers |
| `loading` prop inutilisée | **WARN** | `PresseViewProps` déclare `loading?: boolean` mais `PresseView` ne l'utilise pas (le loading est géré par Suspense). Prop morte |

---

### Récapitulatif

| Catégorie | Score | Remarque |
| ----------- | ------- | ---------- |
| Architecture | **9/10** | Smart/Dumb, SSR, Suspense, Display Toggles — excellent |
| Clean Code | **6/10** | TODO en prod, magic number, composant monolithique |
| Composition Patterns | **5/10** | `PresseView` devrait être décomposé en ~6 sous-composants |
| DAL SOLID | **7/10** | Types dupliqués, pas de `dalSuccess/dalError`, pas de `buildMediaPublicUrl` |
| Schemas & Validation | **7/10** | Bonne centralisation, mais pas de validation Zod en runtime dans le DAL |
| Page Route | **5/10** | Manque `dynamic = 'force-dynamic'`, pas de metadata SEO |
| Sécurité | **10/10** | Rien à signaler |
| Code mort | **3/10** | hooks.ts complet à supprimer, 2 TODO |
| TypeScript | **9/10** | Prop `loading` inutile |

> **Score global : ~6.6/10**

---

### Actions correctives recommandées (par priorité)

1. **CRITIQUE** — Supprimer hooks.ts (158 lignes de code mort)
2. **HAUTE** — Découper `PresseView` en sous-composants composables : `HeroSection`, `ContactPresseSection`, `RevueDePresse`, `CommuniquesSection`, `AccreditationSection`, `MediaKitSection`
3. **HAUTE** — Supprimer les types dupliqués dans le DAL et importer depuis presse.ts
4. **HAUTE** — Utiliser `dalSuccess()`/`dalError()` au lieu de littéraux dans le DAL
5. **HAUTE** — Utiliser `buildMediaPublicUrl()` dans `mapMediaKitRow`
6. **MOYENNE** — Ajouter `export const dynamic = 'force-dynamic'` à la page route (ou vérifier si c'est toujours nécessaire avec ISR)
7. **MOYENNE** — Ajouter des `metadata` SEO à la page
8. **MOYENNE** — Extraire `12` → `const DEFAULT_MAX_PRESS_RELEASES = 12`
9. **MOYENNE** — Supprimer les bullets `•` textuelles dans les `<li>` et utiliser des `list-disc` CSS
10. **BASSE** — Ajouter `aria-label` descriptif sur les boutons "Lire l'article" et "Télécharger"
11. **BASSE** — Supprimer la prop `loading` inutilisée de `PresseViewProps`
12. **BASSE** — Supprimer les TODO ou les résoudre
