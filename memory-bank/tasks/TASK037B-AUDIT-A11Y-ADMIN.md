# Audit Accessibilité — Modules Admin

> **Date** : juillet 2025
> **Référentiel** : WCAG 2.2 Level AA (+ AAA ciblé pour WCAG 2.5.5 Target Size)
> **Scope** : Tous les composants dans `components/admin/` et `components/features/admin/` + `app/(admin)/layout.tsx`
> **Méthode** : Revue de code statique — ne remplace pas un test manuel avec technologies d'assistance
> **Instructions projet vérifiées** : `a11y.instructions.md`, `touch_hitbox.instructions.md`, `wcag_target_size.instructions.md`

---

## Résumé Exécutif

| Sévérité | Nombre |
| -------- | ------ |
| 🔴 Critique | 3 |
| 🟠 Majeur | 8 |
| 🟡 Mineur | 10 |
| ✅ Points Forts | 14 |

Le code admin présente une **très bonne base d'accessibilité** dans les modules récents (Media, Compagnie, Analytics, Users) avec `aria-hidden="true"` systématique sur les icônes et `aria-label` contextuels sur les boutons. Cependant, le **layout racine admin**, les **tailles de cibles interactives** (problème systémique) et les **champs de recherche sans label** sont les principaux axes d'amélioration.

---

## 🔴 Problèmes Critiques

### C1 — Pas de lien d'évitement (skip-link) dans le layout admin

**Fichier** : `app/(admin)/layout.tsx`
**WCAG** : 2.4.1 Bypass Blocks (A)

Le layout admin inclut un sidebar de navigation complet + un header avec breadcrumb, mais aucun mécanisme de bypass (skip-link) n'est implémenté. Les utilisateurs clavier ou lecteur d'écran doivent traverser toute la navigation à chaque chargement de page.

**Recommandation** :

```tsx
{/* Premier élément enfant de <SidebarInset> */}
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring">
  Aller au contenu principal
</a>
{/* ... header ... */}
<main id="main-content" className="flex-1 p-4">
  {children}
</main>
```

La balise `<main>` n'est pas présente dans le layout actuel — les `{children}` sont rendus directement dans un `<div>` sans landmark sémantique.

---

### C2 — Breadcrumb hardcodé avec texte factice

**Fichier** : `app/(admin)/layout.tsx` (lignes 52-59)
**WCAG** : 2.4.8 Location (AAA), 2.4.6 Headings and Labels (AA)

Le breadcrumb affiche "Building Your Application" > "Data Fetching" — un texte placeholder jamais mis à jour. Cela :

1. **Désinforme** les utilisateurs de lecteur d'écran sur leur position dans le site.
2. **Ne remplit pas sa fonction** de repère de navigation.

**Recommandation** : Implémenter un breadcrumb dynamique basé sur le pathname, ou supprimer le composant jusqu'à son implémentation correcte.

---

### C3 — Champs de recherche sans `<label>` ni `aria-label` (systémique)

**Fichiers** :

- `components/admin/AdminSidebar.tsx` (ligne 164) — search sidebar
- `components/features/admin/media/MediaLibraryView.tsx` (ligne 132)
- `components/features/admin/audit-logs/AuditLogFilters.tsx` (ligne 131)
- `components/features/admin/media/MediaLibraryPicker.tsx` (ligne 132)

**WCAG** : 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)

Ces `<Input>` n'ont qu'un `placeholder` ("Rechercher...") comme indication. Le placeholder disparaît à la saisie et **n'est pas reconnu comme label** par les technologies d'assistance.

**Recommandation** :

```tsx
<label htmlFor="admin-search" className="sr-only">Rechercher</label>
<Input id="admin-search" placeholder="Rechercher..." />
{/* ou */}
<Input aria-label="Rechercher dans les médias" placeholder="Rechercher..." />
```

---

## 🟠 Problèmes Majeurs

### M1 — Tailles de cibles interactives < 44×44px (systémique)

**WCAG** : 2.5.5 Target Size (AAA), 2.5.8 Target Size Minimum (AA)
**Instruction projet** : `wcag_target_size.instructions.md` — minimum 44×44px CSS

Le composant `Button` de shadcn/ui définit les tailles suivantes :

- `size="default"` → `h-9` = **36px** ❌
- `size="sm"` → `h-8` = **32px** ❌
- `size="icon"` → `size-9` = **36×36px** ❌
- `size="icon-sm"` → `size-8` = **32×32px** ❌
- `size="lg"` → `h-10` = **40px** ❌
- `size="icon-lg"` → `size-10` = **40×40px** ❌

**Aucune taille standard du système de design n'atteint 44px.**

**Fichiers affectés** (> 40 occurrences, modules les plus impactés) :

| Module | Composant | Taille | Détail |
| -------- | ----------- | -------- | -------- |
| Agenda | `EventsTable.tsx` | h-8/h-9 | Boutons Voir/Modifier/Supprimer desktop |
| Lieux | `LieuxTable.tsx` | h-8/h-9 | Boutons Modifier/Supprimer mobile |
| Spectacles | `SpectaclesTable.tsx` | h-8/h-9 | 4 boutons d'action par ligne |
| Media | `MediaFoldersView.tsx` | h-8/h-9 | Boutons Éditer/Supprimer dossiers |
| Media | `MediaTagsView.tsx` | h-8/h-9 | Boutons Éditer/Supprimer tags |
| Media | `MediaBulkActions.tsx` | h-9 | Bouton annuler sélection |
| Media | `MediaDetailsPanel.tsx` | h-8 | Bouton fermer panel |
| Home | `HeroSlidesView.tsx` | h-9 | Boutons Supprimer/Modifier slide |
| Home | `StatsView.tsx` | size="sm" | Boutons Modifier/Supprimer stat |
| Partners | `SortablePartnerCard.tsx` | h-8/h-9 | Boutons desktop |
| Presse | `ArticlesView.tsx` | size="icon" | Boutons d'action articles |
| Presse | `PressReleasesView.tsx` | size="icon" | Boutons communiqués |
| Presse | `PressContactsView.tsx` | size="icon" | Boutons contacts |
| Users | `UserDesktopTable.tsx` | h-8/h-9 | Bouton Supprimer |
| Compagnie | `ValuesView.tsx` | size="sm" | Boutons Modifier/Supprimer |
| Compagnie | `PresentationView.tsx` | size="sm" | Bouton Modifier |
| Spectacles | `SortableGalleryCard.tsx` | h-8 | Bouton Supprimer photo |

**Recommandation globale** : Modifier les tailles dans `components/ui/button.tsx` :

```tsx
size: {
  default: "h-11 px-4 py-2 has-[>svg]:px-3",   // 44px
  sm: "h-11 rounded-md gap-1.5 px-3",            // 44px
  lg: "h-12 rounded-md px-6 has-[>svg]:px-4",    // 48px
  icon: "size-11",                                 // 44×44px
  "icon-sm": "size-11",                            // 44×44px
  "icon-lg": "size-12",                            // 48×48px
}
```

Alternativement, ajouter la technique `.touch-hitbox` per `touch_hitbox.instructions.md` avec pseudo-élément `::before` de 44×44px sur les boutons existants.

---

### M2 — `SidebarTrigger` sans `aria-label`

**Fichier** : `app/(admin)/layout.tsx` (ligne 47)
**WCAG** : 4.1.2 Name, Role, Value (A)

```tsx
<SidebarTrigger className="-ml-1" />
```

Le bouton "hamburger" ouvrant la sidebar n'a pas de nom accessible. Les lecteurs d'écran annoncent "bouton" sans contexte.

**Recommandation** :

```tsx
<SidebarTrigger className="-ml-1" aria-label="Ouvrir / fermer la navigation" />
```

---

### M3 — Conteneurs d'erreur sans `role="alert"` (systémique)

**WCAG** : 4.1.3 Status Messages (AA)

Plusieurs conteneurs affichent des erreurs avec uniquement des classes CSS, sans sémantique ARIA. Les lecteurs d'écran n'annoncent pas ces messages.

**Fichiers sans `role="alert"`** :

| Composant | Contenu |
| ----------- | -------- |
| `UsersManagementContainer.tsx` | "Error loading users: ..." |
| `PressContactsContainer.tsx` | "Erreur lors du chargement : ..." |
| `PressReleasesContainer.tsx` | "Erreur lors du chargement : ..." |
| `ArticlesContainer.tsx` | "Erreur lors du chargement : ..." |
| `DashboardStatsContainer.tsx` | Message d'erreur stats |

**Fichiers AVEC `role="alert"` (bonne pratique)** :

- `LieuxContainer.tsx` ✅
- `PresentationContainer.tsx` ✅
- `ValuesContainer.tsx` ✅
- `StatsContainer.tsx` ✅
- `ImageFieldPreview.tsx` ✅

**Recommandation** :

```tsx
<div className="text-red-600" role="alert">
    Erreur lors du chargement : {result.error}
</div>
```

---

### M4 — `LieuxView` utilise `window.confirm()` natif pour suppression

**Fichier** : `components/features/admin/lieux/LieuxView.tsx` (ligne 41)
**WCAG** : 3.3.4 Error Prevention (AA)

```tsx
if (!confirm("Supprimer ce lieu ? Cette action est irréversible.")) {
```

Le `confirm()` natif du navigateur n'est pas personnalisable en termes d'accessibilité (pas de focus trap fiable, pas d'annonce aria-describedby, pas de styling cohérent). Tous les autres modules admin utilisent `AlertDialog` de shadcn/ui.

**Recommandation** : Remplacer par un `AlertDialog` comme dans `HeroSlidesView`, `StatsView`, `SpectacleGalleryManager`, `UserDeleteDialog`, etc.

---

### M5 — `DropdownMenuTrigger` dans `AdminAuthRow` sans nom accessible

**Fichier** : `components/admin/AdminAuthRow.tsx`
**WCAG** : 4.1.2 Name, Role, Value (A)

Le bouton dépliant du menu utilisateur (profil) n'a pas de `aria-label`. Les lecteurs d'écran annoncent seulement le contenu visible (initiales ou avatar), ce qui manque de contexte.

**Recommandation** :

```tsx
<DropdownMenuTrigger asChild>
  <Button variant="ghost" aria-label="Menu utilisateur">
    {/* avatar/initials */}
  </Button>
</DropdownMenuTrigger>
```

---

### M6 — `HeroSlideForm` : Dialog sans `DialogDescription`

**Fichier** : `components/features/admin/home/HeroSlideForm.tsx`
**WCAG** : 4.1.2 Name, Role, Value (A)

Le formulaire de slide utilise `DialogTitle` mais pas `DialogDescription`. Cela génère un avertissement d'accessibilité de Radix UI et réduit le contexte pour les utilisateurs de lecteur d'écran.

**Recommandation** : Ajouter un `DialogDescription` (éventuellement visuellement caché avec `className="sr-only"`).

---

### M7 — Messages d'erreur de formulaire sans association programmatique (Presse)

**Fichiers** :

- `PressContactNewForm.tsx` — `<p className="text-red-600">` sans `role="alert"` ni `aria-describedby`
- `PressReleaseNewForm.tsx` — `<p className="text-red-600">` idem
- `PressContactEditForm.tsx` — `<p className="text-red-600">` idem

**WCAG** : 3.3.1 Error Identification (A), 1.3.1 Info and Relationships (A)

Les messages d'erreur de validation sont affichés visuellement mais ne sont pas liés programmatiquement au champ concerné via `aria-describedby`, et n'utilisent pas `role="alert"` pour l'annonce.

**Recommandation** : Utiliser le pattern shadcn `<FormMessage>` (qui inclut `aria-describedby` automatiquement) ou ajouter manuellement :

```tsx
<Input aria-describedby={form.formState.errors.email ? "email-error" : undefined} />
{form.formState.errors.email && (
  <p id="email-error" className="text-red-600 text-sm" role="alert">
    {form.formState.errors.email.message}
  </p>
)}
```

---

### M8 — Boutons "Accéder" génériques dans `CardsDashboard`

**Fichier** : `components/admin/CardsDashboard.tsx`
**WCAG** : 2.4.4 Link Purpose (A), 2.4.9 Link Purpose (Link Only) (AAA)

Les boutons "Accéder" ne précisent pas leur destination. Un utilisateur de lecteur d'écran entendant plusieurs "Accéder" consécutifs ne peut pas les différencier.

**Recommandation** :

```tsx
<Button asChild>
  <Link href="/admin/team" aria-label="Accéder à la gestion de l'équipe">
    Accéder
  </Link>
</Button>
```

---

## 🟡 Problèmes Mineurs

### m1 — Icônes Lucide sans `aria-hidden="true"` (partiel, en voie de correction)

**WCAG** : 1.1.1 Non-text Content (A)

La plupart des modules récents ajoutent correctement `aria-hidden="true"` sur les icônes décoratives (Analytics, Compagnie, Home, Users, ImageField). Cependant, certains modules plus anciens omettent cet attribut :

**Fichiers encore affectés** :

- `AdminSidebar.tsx` — icônes du menu (Home, Calendar, Building2, etc.)
- `AdminAuthRow.tsx` — LogOut, ChevronsUpDown icônes
- `CardsDashboard.tsx` — icônes de section
- `EventsTable.tsx` — Calendar, Clock, MapPin en mobile
- `PartnersView.tsx` — GripVertical dans le texte d'instruction
- `SortablePartnerCard.tsx` — GripVertical, ExternalLink
- `HeroSlidesView.tsx` — GripVertical
- `PartnerForm.tsx` — ArrowLeft, Save dans les boutons
- `MediaLibraryView.tsx` — Search, Filter dans les inputs

**Impact** : Les lecteurs d'écran annoncent le nom par défaut de l'icône SVG ("grip vertical", "external link"), créant du bruit dans la navigation.

---

### m2 — `aria-hidden` shorthand sans `="true"`

**Fichier** : `components/admin/dashboard/DashboardStatsContainer.tsx` (lignes 31-55)

```tsx
icon={<Users className="h-4 w-4" aria-hidden />}
```

Bien que le shorthand `aria-hidden` soit valide en JSX (équivaut à `aria-hidden="true"`), le standard HTML attend `aria-hidden="true"` explicitement. Certains outils d'audit (axe, pa11y) peuvent le signaler.

**Recommandation** : Normaliser en `aria-hidden="true"` pour la cohérence.

---

### m3 — `StatsCard` : `<Link>` englobant `<Card>` sans `aria-label`

**Fichier** : `components/admin/dashboard/StatsCard.tsx`
**WCAG** : 2.4.4 Link Purpose (A)

Le `<Link>` qui enveloppe toute la carte statistique n'a pas d'`aria-label`. Le lecteur d'écran annonce le contenu texte de la carte, mais pas la destination.

---

### m4 — `TeamMemberCard` : indicateur inactif basé uniquement sur la couleur

**Fichier** : `components/features/admin/team/TeamMemberCard.tsx`
**WCAG** : 1.4.1 Use of Color (A)

L'état "inactif" d'un membre est signalé par un anneau jaune (`ring-yellow-400`) sans texte alternatif ni badge textuel.

**Recommandation** : Ajouter un Badge textuel "Inactif" ou un `<span className="sr-only">Membre inactif</span>`.

---

### m5 — Boutons Supprimer sans contexte dans certains modules

**Fichiers** :

- `HeroSlidesView.tsx` — `aria-label="Supprimer le slide"` (sans titre du slide)
- `HeroSlidesView.tsx` — `aria-label="Modifier le slide"` (idem)
- `PressReleasesView.tsx` — `aria-label="Supprimer le communiqué"` (sans titre)
- `PressContactsView.tsx` — `aria-label="Supprimer le contact"` (sans nom)
- `ArticlesView.tsx` — `aria-label="Supprimer l'article"` (sans titre)

**WCAG** : 2.4.4 Link Purpose (A)

Les aria-labels sont descriptifs mais ne distinguent pas quel élément sera supprimé quand plusieurs sont affichés.

**Bons exemples déjà en place** :

- `EventsTable.tsx` : `Supprimer ${event.spectacle_titre}` ✅
- `LieuxTable.tsx` : `Supprimer ${lieu.nom}` ✅
- `SpectaclesTable.tsx` : `Supprimer ${spectacle.title}` ✅
- `SortablePartnerCard.tsx` : `Supprimer ${partner.name}` ✅
- `ValuesView.tsx` : `Supprimer la valeur ${value.title}` ✅

---

### m6 — `MediaCard` : animation `hover:-translate-y-1` sur l'élément interactif

**Fichier** : `components/features/admin/media/MediaCard.tsx`
**Instruction projet** : `touch_hitbox.instructions.md`

L'animation `hover:-translate-y-1` est appliquée directement sur le `<div role="button">`. Selon les instructions, les effets visuels (scale, translate) doivent être appliqués sur un `<span>` enfant pour ne pas déplacer la hitbox.

**Recommandation** : Encapsuler le contenu dans un `<span>` enfant portant l'animation.

---

### m7 — `UsersManagementContainer` : message d'erreur en anglais

**Fichier** : `components/features/admin/users/UsersManagementContainer.tsx` (ligne 10)

```tsx
Error loading users: {result.error}
```

Incohérence linguistique — tous les autres conteneurs affichent "Erreur lors du chargement".

---

### m8 — `AdminAuthRow` : état de chargement sans `aria-live`

**Fichier** : `components/admin/AdminAuthRow.tsx`
**WCAG** : 4.1.3 Status Messages (AA)

L'état "Loading..." n'est pas annoncé via `aria-live`. Les utilisateurs de lecteur d'écran ne sont pas informés du chargement en cours.

---

### m9 — `MediaUploadDialog` : progression sans `aria-live`

**Fichier** : `components/features/admin/media/MediaUploadDialog.tsx`
**WCAG** : 4.1.3 Status Messages (AA)

Le progrès d'upload (fichiers traités/total) change dynamiquement mais n'est pas dans une region `aria-live`. Les utilisateurs de lecteur d'écran ne reçoivent pas de mises à jour.

---

### m10 — Balise `<header>` dans le layout admin sans `aria-label`

**Fichier** : `app/(admin)/layout.tsx` (ligne 46)
**WCAG** : 1.3.1 Info and Relationships (A)

La balise `<header>` devrait avoir un `aria-label` pour la distinguer d'autres potentiels headers sur la page (s'il y en a).

---

## ✅ Points Forts

### F1 — Drag-and-drop avec support clavier complet

**Fichiers** : `PartnersView.tsx`, `HeroSlidesView.tsx`, `SpectacleGalleryManager.tsx`

L'implémentation `@dnd-kit` utilise correctement `PointerSensor` + `KeyboardSensor` avec `sortableKeyboardCoordinates`, permettant la réorganisation au clavier. Les handles de drag ont `role="button"`, `tabIndex={0}`, et `aria-label` descriptif.

### F2 — Aria-labels contextuels sur les boutons d'action (majorité des modules)

Les tables et cartes d'action utilisent des aria-labels incluant le nom de l'entité :

- `EventsTable.tsx` : `Voir ${event.spectacle_titre}`, `Modifier ${event.spectacle_titre}`, `Supprimer ${event.spectacle_titre}`
- `SpectaclesTable.tsx` : `Voir ${spectacle.title}`, `Gérer la galerie de ${spectacle.title}`
- `LieuxTable.tsx` : `Modifier ${lieu.nom}`, `Supprimer ${lieu.nom}`
- `SortablePartnerCard.tsx` : `Modifier ${partner.name}`, `Supprimer ${partner.name}`
- `MediaFoldersView.tsx` : `Éditer ${folder.name}`, `Supprimer ${folder.name}`
- `MediaTagsView.tsx` : `Éditer ${tag.name}`, `Supprimer ${tag.name}`
- `ValuesView.tsx` : `Modifier la valeur ${value.title}`, `Supprimer la valeur ${value.title}`
- `PresentationView.tsx` : `Modifier la section ${section.title ?? section.kind}`
- `UserMobileCard.tsx` / `UserDesktopTable.tsx` : `Supprimer ${user.email}`

### F3 — `MediaCard` avec support clavier complet

`role="button"`, `tabIndex={0}`, `aria-label` dynamique, `aria-pressed` pour la sélection, handlers `onKeyDown` pour Space/Enter, focus ring visible via `focus-visible:ring-2`.

### F4 — `MediaBulkActions` : toolbar accessible complète

`role="toolbar"`, `aria-label="Actions de sélection multiple"`, compteur dans `aria-live="polite"`, tous les boutons avec des `aria-label` contextuels incluant le nombre de médias sélectionnés.

### F5 — `MediaCardThumbnail` : gestion des états d'image

`role="status"` + `aria-label="Chargement de l'image"` pour le spinner, `role="img"` + `aria-label` pour les états d'erreur et les types de fichier.

### F6 — `ImageFieldPreview` : erreurs de validation avec `aria-live` + `role="alert"`

Seul composant du projet à implémenter `aria-live="polite"` + `aria-atomic="true"` sur un conteneur d'erreur dynamique, avec `role="alert"` sur chaque message. Modèle à suivre pour le reste.

### F7 — `BulkTagSelector` : groupes de tags accessibles

`role="group"` + `aria-label="Sélection de tags à ajouter"` / "à retirer", `TagActionBadge` avec `role="button"` et `aria-label` contextuels.

### F8 — Toutes les Dialogs/AlertDialogs avec `DialogTitle` + `DialogDescription`

La quasi-totalité des modales utilisent correctement `DialogTitle` et `DialogDescription` (exception : `HeroSlideForm` — voir M6). Exemples : `PartnersView`, `ArticlesView`, `PressContactsView`, `SpectaclesManagementContainer`, `StatsView`, `HeroSlidesView`, `UserDeleteDialog`, `UserRoleChangeDialog`.

### F9 — `ToggleSection` et `EventDetail` : sections avec `aria-labelledby`

Pattern `<section aria-labelledby={headingId}>` correctement implémenté pour les sections de configuration et les détails d'événement.

### F10 — `Toggle` switch accessible dans `ToggleCard`

`aria-label` dynamique incluant le nom de la section et l'état actuel. Spinner avec `aria-hidden="true"` pendant le chargement.

### F11 — `SpectaclePhotoManager` et `SortableGalleryCard` : galerie avec drag accessible

Handle de drag avec `role="button"` + `aria-label`. Bouton supprimer avec `aria-label` incluant le numéro de photo.

### F12 — Module Analytics : icônes systématiquement `aria-hidden="true"`

`AnalyticsDashboard`, `MetricCard`, `SentryErrorsCard`, `AdminActivityCard` — toutes les icônes décoratives sont masquées. `PageviewsChart` utilise `role="img"` + `aria-label` descriptif.

### F13 — Module Compagnie : accessibilité complète

`ValuesView`, `PresentationView` : listes avec `aria-label`, boutons avec `aria-label` contextuels, icônes `aria-hidden="true"`. `ContentArrayField` : textareas avec `aria-label` incluant le numéro de paragraphe. Conteneurs avec `role="alert"`.

### F14 — `ImageFieldAltText` : champs avec `aria-required` et `aria-describedby`

Pattern exemplaire avec `aria-required={required}` et `aria-describedby` pointant vers un compteur de caractères.

---

## Plan d'Action Priorisé

### Sprint 1 — Critiques (impact immédiat)

| # | Action | Fichier(s) | Effort |
| --- | -------- | ------------ | -------- |
| C1 | Ajouter skip-link + `<main id>` dans le layout admin | `app/(admin)/layout.tsx` | 15 min |
| C2 | Implémenter un breadcrumb dynamique ou supprimer le placeholder | `app/(admin)/layout.tsx` | 30 min |
| C3 | Ajouter `aria-label` ou `<label>` sr-only sur tous les champs de recherche | 4 fichiers | 15 min |

### Sprint 2 — Majeurs (systémiques)

| # | Action | Fichier(s) | Effort |
| --- | -------- | ------------ | -------- |
| M1 | Augmenter tailles cibles à ≥ 44px (modifier button.tsx ou ajouter `.touch-hitbox`) | `components/ui/button.tsx` + vérification globale | 1h |
| M2 | `aria-label` sur `SidebarTrigger` | `app/(admin)/layout.tsx` | 2 min |
| M3 | Ajouter `role="alert"` sur 5 conteneurs d'erreur | 5 fichiers Container | 10 min |
| M4 | Remplacer `window.confirm` par `AlertDialog` dans `LieuxView` | `LieuxView.tsx` | 20 min |
| M5 | `aria-label` sur `DropdownMenuTrigger` | `AdminAuthRow.tsx` | 2 min |
| M6 | Ajouter `DialogDescription` à `HeroSlideForm` | `HeroSlideForm.tsx` | 2 min |
| M7 | Associer erreurs Presse forms avec `aria-describedby` | 3 fichiers Presse forms | 20 min |
| M8 | `aria-label` contextuels sur boutons "Accéder" | `CardsDashboard.tsx` | 5 min |

### Sprint 3 — Mineurs (amélioration continue)

| # | Action | Fichier(s) | Effort |
| --- | -------- | ------------ | -------- |
| m1 | Ajouter `aria-hidden="true"` sur icônes manquantes | ~10 fichiers | 20 min |
| m2 | Normaliser `aria-hidden` → `aria-hidden="true"` | `DashboardStatsContainer.tsx` | 2 min |
| m3 | `aria-label` sur `StatsCard` Link | `StatsCard.tsx` | 2 min |
| m4 | Badge textuel "Inactif" sur `TeamMemberCard` | `TeamMemberCard.tsx` | 5 min |
| m5 | Contextualiser les `aria-label` génériques (5 modules) | 5 fichiers View | 15 min |
| m6 | Déplacer animation translate sur span enfant dans `MediaCard` | `MediaCard.tsx` | 10 min |
| m7 | Traduire message d'erreur en français | `UsersManagementContainer.tsx` | 2 min |
| m8 | `aria-live="assertive"` sur état chargement auth | `AdminAuthRow.tsx` | 5 min |
| m9 | `aria-live="polite"` sur progression upload | `MediaUploadDialog.tsx` | 5 min |
| m10 | `aria-label` sur le `<header>` du layout | `app/(admin)/layout.tsx` | 2 min |

---

## Recommandations Générales

### 1. Standardiser les tailles de cibles au niveau du design system

Modifier `components/ui/button.tsx` pour que toutes les tailles atteignent 44px. C'est le changement le plus impactant car il corrige **40+ occurrences** d'un seul coup.

### 2. Créer un composant `SearchInput` accessible réutilisable

```tsx
function SearchInput({ label, ...props }: { label: string } & InputProps) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="sr-only">{label}</label>
      <Input id={id} {...props} />
    </>
  );
}
```

### 3. Standardiser le pattern d'erreur dans les conteneurs

Créer un composant partagé `ErrorAlert` :

```tsx
function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="text-destructive" role="alert">
      Erreur lors du chargement : {message}
    </div>
  );
}
```

### 4. Modèles à suivre

Les composants suivants sont des références d'accessibilité exemplaires :

- **`ImageFieldPreview.tsx`** — Pattern `aria-live` + `role="alert"` pour les messages dynamiques
- **`MediaBulkActions.tsx`** — `role="toolbar"` + `aria-live` pour les compteurs
- **`MediaCardThumbnail.tsx`** — Gestion multi-états avec `role="status"` / `role="img"`
- **`ContentArrayField.tsx`** — `aria-label` contextuel sur chaque textarea dynamique
- **`ImageFieldAltText.tsx`** — `aria-required` + `aria-describedby` sur les champs

### 5. Tests recommandés

```bash
# Axe-core sur les pages admin (serveur dev local requis)
npx @axe-core/cli http://localhost:3000/admin --exit

# Pa11y sur page admin spécifique
npx pa11y http://localhost:3000/admin/team --reporter html > a11y-admin-team.html

# Parcours clavier : vérifier que Tab traverse sidebar → header → contenu principal
# Vérifier que Escape ferme les Dialogs/AlertDialogs
# Tester la navigation au clavier dans les DnD (Partners, HeroSlides, Gallery)
```

L'audit a été réalisé avec une approche d'accessibilité en tête, mais des problèmes peuvent subsister. Un test manuel avec technologies d'assistance (NVDA, VoiceOver) et les outils Accessibility Insights est recommandé.
