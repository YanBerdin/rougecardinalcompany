# Changelog — 11 novembre 2025

Résumé des changements importants appliqués

1) refactor(layouts): implement Next.js route groups architecture with AdminShell

- Create root layout (app/layout.tsx) with html/body tags and ThemeProvider
- Implement (admin) route group with AdminShell client component for mobile menu
- Implement (marketing) route group with Header/Footer structure
- Add AdminShell component with off-canvas sidebar and mobile toggle
- Fix hydration errors by removing duplicate html/body tags from route groups
- Add admin loading skeleton (app/admin/loading.tsx)
- Remove duplicate (admin) route group files to prevent path conflicts

BREAKING CHANGE: Route structure migrated to route groups - affects all admin and marketing routes

2) feat(admin): migrate to official shadcn sidebar with collapsible icon mode

- Install shadcn sidebar via MCP (separator, sheet, tooltip, breadcrumb)
- Replace AdminShell with AppSidebar following shadcn pattern
- Move SidebarProvider/SidebarInset to admin layout
- Add company branding (RC logo, Rouge Cardinal name)
- Implement collapsible icon mode with automatic text hiding
- Add breadcrumb navigation in header
- Fix Tailwind v3 compatibility with inline CSS variable styles
- Add grouped navigation sections (Général/Contenu/Autres)
- Support keyboard shortcut (Cmd/Ctrl+B)
- Refactor AdminAuthRow with dropdown menu
- Add proper width adjustment when sidebar collapses
- Fix logo compression in collapsed mode

Components created:

- components/admin/AdminSidebar.tsx (renamed to AppSidebar)
- components/ui/sidebar.tsx
- components/ui/breadcrumb.tsx
- components/ui/separator.tsx
- components/ui/sheet.tsx
- components/ui/tooltip.tsx
- hooks/use-mobile.ts

Components modified:

Components created:

- components/admin/AdminSidebar.tsx (renamed to AppSidebar)
- components/ui/sidebar.tsx
- components/ui/breadcrumb.tsx
- components/ui/separator.tsx
- components/ui/sheet.tsx
- components/ui/tooltip.tsx
- hooks/use-mobile.ts

Components modified:

- components/admin/AdminAuthRow.tsx
- app/(admin)/layout.tsx
- app/globals.css
- components/ui/button.tsx
- components/ui/input.tsx

Components removed:

- components/admin/AdminShell.tsx (deprecated)

---

Fait le 11 novembre 2025
