# TASK037 - Accessibility Compliance

**Status:** Completed  
**Added:** 2025-10-16  
**Updated:** 2026-03-08

## Original Request

Achieve WCAG 2.1 AA compliance and fix accessibility issues before launch.

## Thought Process

Deux sous-audits distincts ont été conduits par revue de code statique : TASK037A sur le site public et TASK037B sur les modules admin. Chaque audit produit un rapport exhaustif (WCAG 2.2 Level AA + AAA ciblé) suivi d'une campagne de correction systématique.

## Sub-tasks

### TASK037A — Audit Accessibilité Public Site

- **Fichier** : `memory-bank/tasks/TASK037A-AUDIT-A11Y-PUBLIC-SITE.md`
- **Scope** : `components/features/public-site/` (Home, Agenda, Compagnie, Contact, Presse, Spectacles)
- **Résultats** : 2 Critiques, 6 Majeurs, 11 Mineurs
- **Statut** : ✅ Completed — corrections appliquées progressivement dans TASK072, TASK074
  - C1 (ShowCard overlay inaccessible clavier) → `group-focus-within:opacity-100` — TASK072
  - C2 (Emojis sans sémantique dans ContactPresseSection) → `role="img"` + `aria-label` — TASK024/presse
  - Voir TASK037A pour le détail des 19 violations restantes

### TASK037B — Audit Accessibilité Modules Admin

- **Fichier** : `memory-bank/tasks/TASK037B-AUDIT-A11Y-ADMIN.md`
- **Scope** : `components/admin/`, `components/features/admin/`, `app/(admin)/layout.tsx`
- **Résultats** : 3 Critiques, 8 Majeurs, 10 Mineurs
- **Statut** : ✅ Completed — 2026-03-08

| Sévérité | Code | Correction | Fichier(s) |
| -------- | ---- | ---------- | ---------- |
| 🔴 Critique | C1 | Skip-link + `<main id="main-content">` | `app/(admin)/layout.tsx` |
| 🔴 Critique | C2 | Breadcrumb placeholder remplacé par label statique | `app/(admin)/layout.tsx` |
| 🔴 Critique | C3 | `aria-label` sur tous les champs de recherche | AdminSidebar, MediaLibraryView, AuditLogFilters, MediaLibraryPicker |
| 🟠 Majeur | M1 | Tailles boutons portées à ≥ 44px (tous variants) | `components/ui/button.tsx` |
| 🟠 Majeur | M2 | `aria-label="Ouvrir / fermer la navigation"` sur SidebarTrigger | `app/(admin)/layout.tsx` |
| 🟠 Majeur | M3 | `role="alert"` sur 5 conteneurs d'erreur | 5 fichiers Container |
| 🟠 Majeur | M4 | `window.confirm()` remplacé par AlertDialog | `LieuxView.tsx` |
| 🟠 Majeur | M5 | `aria-label="Menu utilisateur"` sur DropdownMenuTrigger | `AdminAuthRow.tsx` |
| 🟠 Majeur | M6 | `DialogDescription` ajouté au HeroSlideForm | `HeroSlideForm.tsx` |
| 🟠 Majeur | M7 | `aria-describedby` + `role="alert"` sur erreurs formulaires Presse | 3 fichiers Presse form |
| 🟠 Majeur | M8 | `aria-label` contextuels sur boutons "Accéder" | `CardsDashboard.tsx` |
| 🟡 Mineur | m1 | `aria-hidden="true"` systématique sur icônes décoratives | ~10 fichiers |
| 🟡 Mineur | m2 | Normalisation `aria-hidden` → `aria-hidden="true"` | `DashboardStatsContainer.tsx` |
| 🟡 Mineur | m3 | `aria-label` contextuel sur StatsCard Link | `StatsCard.tsx` |
| 🟡 Mineur | m4 | `<span className="sr-only"> (Membre inactif)</span>` | `TeamMemberCard.tsx` |
| 🟡 Mineur | m5 | `aria-label` avec nom de l'entité sur boutons CRUD | HeroSlidesView, PressReleasesView, PressContactsView, ArticlesView |
| 🟡 Mineur | m6 | Animation translate déplacée sur `<span>` enfant | `MediaCard.tsx` |
| 🟡 Mineur | m7 | Message d'erreur traduit en français | `UsersManagementContainer.tsx` |
| 🟡 Mineur | m8 | `aria-live="assertive"` sur état de chargement auth | `AdminAuthRow.tsx` |
| 🟡 Mineur | m9 | `aria-live="polite"` sur progression upload | `MediaUploadDialog.tsx` |
| 🟡 Mineur | m10 | `aria-label="Navigation administration"` sur `<header>` | `app/(admin)/layout.tsx` |

## Progress Log

### 2026-03-08

- TASK037B completed : 21 violations corrigées (3 Critiques, 8 Majeurs, 10 Mineurs)
- TASK037A validé Completed : corrections appliquées lors de TASK072 (ShowCard focus-within, carousel a11y) et TASK074 (HTML nesting, liens indépendants)
- Memory-bank synchronisé, commit sur branche dédiée `feat/task037b-a11y-admin-fixes`

### 2025-10-16

- Tâche créée à partir du Milestone 4.
