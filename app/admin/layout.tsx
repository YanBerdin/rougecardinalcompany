import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Home,
  Calendar,
  FileText,
  Image as ImageIcon,
  Settings,
  Menu,
} from "lucide-react";
import AdminAuthRow from "@/components/admin/AdminAuthRow";
import { hasEnvVars } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Vérifier l'authentification et le rôle admin
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 pl-20 pt-20 hidden md:block">
        {/*
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Admin</h2>

          <p className="text-sm text-muted-foreground">
            Rouge Cardinal Company
          </p> 
        </div>
        */}
        <div className="mb-8 pl-4 space-y-4">
          {/* Admin auth row: centralized client component */}
          <div className="">
            <AdminAuthRow hasEnvVars={!!hasEnvVars} />
          </div>

          {/*          
          <div className="mt-8 pt-8 border-t">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Retour au site
            </Link>
          </div>
        */}
        </div>

        <nav className="space-y-2">
          <NavLink
            href="/admin"
            icon={<Home className="h-4 w-4" aria-hidden />}
          >
            Tableau de bord
          </NavLink>

          <NavLink
            href="/admin/team"
            icon={<Users className="h-4 w-4" aria-hidden />}
          >
            Équipe
          </NavLink>

          <NavLink
            href="/admin/shows"
            icon={<FileText className="h-4 w-4" aria-hidden />}
          >
            Spectacles
          </NavLink>

          <NavLink
            href="/admin/events"
            icon={<Calendar className="h-4 w-4" aria-hidden />}
          >
            Événements
          </NavLink>

          <NavLink
            href="/admin/press"
            icon={<FileText className="h-4 w-4" aria-hidden />}
          >
            Presse
          </NavLink>

          <NavLink
            href="/admin/media"
            icon={<ImageIcon className="h-4 w-4" aria-hidden />}
          >
            Médiathèque
          </NavLink>

          <NavLink
            href="/admin/settings"
            icon={<Settings className="h-4 w-4" aria-hidden />}
          >
            Paramètres
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Mobile header */}
        <div className="md:hidden border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Admin</h2>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        {/* Mobile-only env/auth row (visible when sidebar is hidden) */}
        <div className="md:hidden border-b px-2 py-1">
          <div className="flex">
            <AdminAuthRow hasEnvVars={!!hasEnvVars} />
          </div>
        </div>

        {/* Content */}
        <div className="p-20">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
