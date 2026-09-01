# Plan: Coordonnées dynamiques dans ContactInfoSidebar

## TL;DR
Récupérer les coordonnées via `fetchFooterConfig()` dans `ContactServerGate`, assembler `<ContactInfoSidebar />` entièrement côté serveur, et le passer comme slot `sidebar: React.ReactNode` à `ContactPageView`. Élimine le prop drilling de types métier dans le Client Component et corrige la violation `showNewsletter: boolean`.

## Chaîne de composants (révisée après revue composition)
```js
page.tsx (Server)
→ ContactPageContainer (Server, Suspense wrapper)
  → ContactServerGate (Server, async – POINT D'INJECTION + ASSEMBLAGE)
    → ContactPageView (Client) reçoit sidebar: React.ReactNode
      → {sidebar}  ← ContactInfoSidebar s'exécute comme Server Component
```

## Steps

### Phase 0 : Renommage dashboard

0. **`AdminSidebar.tsx`** + **`CardsDashboard.tsx`** — renommer `"Footer - Pied de page"` → `"Pied de page & Coordonnées"` et mettre à jour la description associée

### Phase 1 : Propagation des données (approche composition)

1. **`ContactInfoSidebar.tsx`** — remplacer `showNewsletter: boolean` par `children?: React.ReactNode` (règle `architecture-avoid-boolean-props`). Ajouter prop `contactInfo: FooterConfigDTO["contact"]`. Masquer la ligne téléphone si `phone` absent ou `""`. Address = chaîne simple sans `<br />` forcé.

2. **`ContactServerGate.tsx`** — fetcher `fetchFooterConfig()` en parallèle avec `fetchDisplayToggle()` via `Promise.all`. Assembler `<ContactInfoSidebar contactInfo={contact}>{showNewsletter && <NewsletterCard />}</ContactInfoSidebar>` ici. Passer le résultat comme prop `sidebar: React.ReactNode` à `ContactPageView`.

3. **`ContactPageView.tsx`** — remplacer `showNewsletter: boolean` par `sidebar: React.ReactNode`. Rendre `{sidebar}` à la place de `<ContactInfoSidebar showNewsletter={showNewsletter} />`. Ne connaît plus `FooterConfigDTO`.

## Relevant files
- `components/features/public-site/contact/ContactServerGate.tsx` — fetch + assemblage sidebar
- `components/features/public-site/contact/ContactPageView.tsx` — prop `sidebar: React.ReactNode`
- `components/features/public-site/contact/ContactInfoSidebar.tsx` — données dynamiques + children
- `components/admin/AdminSidebar.tsx` — renommage label
- `components/admin/CardsDashboard.tsx` — renommage label + description
- `lib/schemas/footer-config.ts` — type `FooterConfigDTO["contact"]`

## Verification
1. `pnpm lint` sur les 5 fichiers modifiés
2. `pnpm tsc --noEmit` (type-check) Tester la complilation TypeScript sur les 5 fichiers modifiés
3. Visuel : `/contact` → "Nos Coordonnées" affiche les valeurs DB (ou `FOOTER_DEFAULTS` en fallback)
4. Admin sidebar/dashboard → nouveau label visible

## Decisions
- Fetch dans `ContactServerGate` : pattern existant, déjà async
- Fallback silencieux : `fetchFooterConfig()` retourne `FOOTER_DEFAULTS` → la page ne casse jamais
- `showNewsletter: boolean` → `children` : corrige la violation architecture HIGH
- `ContactInfoSidebar` assemblé côté serveur → s'exécute comme vrai Server Component
- `ContactPageView` ne connaît pas `FooterConfigDTO` → découplage
