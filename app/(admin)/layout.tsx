import { requireAdmin } from "@/lib/auth/is-admin";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/admin/AdminSidebar";
import { BfcacheHandler } from "@/components/admin/BfcacheHandler";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: {
    default: "Dashboard Admin",
    template: "%s | Admin - Rouge Cardinal",
  },
  description: "Espace d'administration de la compagnie Rouge Cardinal",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <BfcacheHandler />
      <AppSidebar />
      <SidebarInset>
        {/* C1 — Skip link : permet aux utilisateurs clavier/lecteur d'écran de contourner la navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Aller au contenu principal
        </a>
        {/* m10 — aria-label pour distinguer ce header dans la page */}
        <header aria-label="Navigation administration" className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          {/* M2 — aria-label explicite sur le bouton hamburger */}
          <SidebarTrigger className="-ml-1" aria-label="Ouvrir / fermer la navigation" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {/* C2 — Le breadcrumb placeholder "Building Your Application > Data Fetching" a été supprimé */}
          <span className="text-sm font-medium text-muted-foreground">Administration</span>
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
        </header>
        {/* C1 — landmark <main> avec id pour le skip-link */}
        <main id="main-content" className="flex flex-1 flex-col gap-6 max-sm:p-2 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
