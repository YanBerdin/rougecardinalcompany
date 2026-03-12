# Plan d'implémentation TASK073 — Audit public/presse

## Étape 1 — Nettoyage immédiat (code mort + TODO) ✦ CRITIQUE/BASSE

**Fichiers touchés** : `hooks.ts`, `PresseContainer.tsx`, `PresseView.tsx`, `types.ts`

- **Supprimer** `components/features/public-site/presse/hooks.ts` (158 lignes entièrement commentées, non importé nulle part)
- Dans `PresseContainer.tsx` : retirer le commentaire `// TODO: remove` sur le `<PresseServerGate />`
- Dans `PresseView.tsx` ligne 289 : retirer le `//TODO:` en fin de fichier
- Dans `types.ts` : supprimer la prop `loading?: boolean` de `PresseViewProps` (jamais utilisée, loading géré par Suspense)

---

## Étape 2 — DAL `presse.ts` : SOLID & helpers ✦ HAUTE

**Fichier touché** : `lib/dal/presse.ts`

### 2a — Supprimer les types locaux dupliqués

Les interfaces `PressRelease`, `MediaArticle`, `MediaKitItemDTO`, `MediaMetadata`, `SupabaseMediaRow`, `CommuniquePresseRow`, `ArticlePresseRow` (lignes 8–72) sont soit déjà dans `lib/schemas/presse.ts`, soit des types internes rawDB. Remplacer par :

```ts
import type { PressRelease, MediaArticle, MediaKitItem } from "@/lib/schemas/presse";
```

Les types `SupabaseMediaRow`, `CommuniquePresseRow`, `ArticlePresseRow` restent comme types internes inline (non exportés) car ils représentent la row brute DB.

### 2b — Utiliser `dalSuccess` / `dalError`

Ajouter dans les imports :

```ts
import { dalSuccess, dalError, getErrorMessage } from "@/lib/dal/helpers";
```

Remplacer dans les 3 fonctions tous les `return { success: true, data: ... }` par `return dalSuccess(...)` et tous les `return { success: false, error: ... }` par `return dalError(...)`.

### 2c — Utiliser `buildMediaPublicUrl` dans `mapMediaKitRow`

Ajouter l'import :

```ts
import { buildMediaPublicUrl } from "@/lib/dal/helpers";
```

Dans `mapMediaKitRow`, remplacer :

```ts
const fileUrl = externalUrl
  ? String(externalUrl)
  : `/storage/v1/object/public/${row.storage_path}`;
```

par :

```ts
const fileUrl = externalUrl
  ? String(externalUrl)
  : buildMediaPublicUrl(row.storage_path);
```

### 2d — Renommer les mappers selon la convention du projet

- `mapPressReleaseRow` → `mapToPressReleaseDTO`
- `mapMediaArticleRow` → `mapToMediaArticleDTO`
- `mapMediaKitRow` → `mapToMediaKitDTO`

---

## Étape 3 — `PresseServerGate.tsx` : magic number ✦ MOYENNE

**Fichier touché** : `PresseServerGate.tsx`

En tête du fichier (avant la fonction), ajouter :

```ts
const DEFAULT_MAX_PRESS_RELEASES = 12;
```

Remplacer les deux occurrences de `12` par `DEFAULT_MAX_PRESS_RELEASES`.

---

## Étape 4 — Page route : `dynamic` + metadata SEO ✦ MOYENNE

**Fichier touché** : `app/(marketing)/presse/page.tsx`

Ajouter :

```ts
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Espace Média | Rouge-Cardinal",
  description:
    "Ressources presse, revue de médias, communiqués officiels et kit média de la compagnie Rouge-Cardinal.",
};
```

> **Note** : Conserver `export const revalidate = 60` n'est pas compatible avec `force-dynamic`. Si le choix est ISR (performance), retirer `dynamic`. Si le choix est contenu frais à chaque requête (données SSR avec cookies Supabase), utiliser `force-dynamic` et retirer `revalidate`. — La copilot-instructions.md liste cette page comme requérant `force-dynamic`. Choisir `force-dynamic` + supprimer `revalidate = 60`.

---

## Étape 5 — Décomposition de `PresseView` en sous-composants ✦ HAUTE

**Fichiers créés** (dans `components/features/public-site/presse/`) :

| Fichier | Contenu extrait de `PresseView` |
|---|---|
| `HeroSection.tsx` | `<section className="py-16 hero-gradient">` |
| `ContactPresseSection.tsx` | `<section className="pt-24 bg-chart-7">` (Contact + Infos pratiques) |
| `RevueDePresse.tsx` | `<section className="py-24 bg-chart-7">` (articles, `mediaArticles`) |
| `CommuniquesSection.tsx` | `{pressReleases.length > 0 && <section>}` |
| `AccreditationSection.tsx` | `<section className="py-24 hero-gradient">` (accréd. + `<ul>`) |
| `MediaKitSection.tsx` | `{mediaKit.length > 0 && <section>}` |

`PresseView.tsx` devient alors < 60 lignes : imports + orchestration en `return ( <div> <HeroSection /> ... </div> )`.

---

## Étape 6 — Accessibilité ✦ MOYENNE / BASSE

### 6a — Bullets textuelles dans `AccreditationSection.tsx`

Dans le `<ul>`, remplacer les `<li>• Votre nom...` par des `<li>` purs (sans `•`), et ajouter `className="list-disc list-inside"` sur le `<ul>`.

### 6b — `aria-label` sur les boutons "Lire l'article" (dans `RevueDePresse.tsx`)

Remplacer :

```tsx
<Button variant="secondary" asChild>
  <Link href={article.source_url} target="_blank" rel="noopener noreferrer">
    <ExternalLink className="mr-2 h-4 w-4" />
    Lire l&apos;article
  </Link>
</Button>
```

par :

```tsx
<Button variant="secondary" asChild>
  <Link
    href={article.source_url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Lire l'article : ${article.title}`}
  >
    <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
    Lire l&apos;article
  </Link>
</Button>
```

### 6c — `aria-label` sur les boutons "Télécharger" (dans `CommuniquesSection.tsx` et `MediaKitSection.tsx`)

Ajouter `aria-label={`Télécharger ${release.title} (${release.fileSize})`}` sur les `<Link download>`.

### 6d — `aria-label` sur les `<section>` de chaque sous-composant créé à l'étape 5

- `<section aria-label="Revue de presse">`
- `<section aria-label="Communiqués de presse">`
- `<section aria-label="Demande d'accréditation">`
- `<section aria-label="Kit Média">`
- etc.

---

## Ordre d'exécution recommandé

| # | Étape | Priorité | Risque |
|---|---|---|---|
| 1 | Supprimer `hooks.ts` + TODO + prop `loading` | Critique/Basse | Zéro — fichier mort |
| 2 | DAL : types, `dalSuccess/dalError`, `buildMediaPublicUrl`, renommage | Haute | Faible — comportement identique |
| 3 | `PresseServerGate` : constante magic number | Moyenne | Zéro |
| 4 | Page route : `dynamic` + metadata | Moyenne | Faible — changement ISR→SSR |
| 5 | Décomposition `PresseView` → 6 sous-composants | Haute | Moyen — refacto structurel, vérifier build |
| 6 | Accessibilité : bullets, aria-labels, aria-label sections | Basse/Moyenne | Zéro |
