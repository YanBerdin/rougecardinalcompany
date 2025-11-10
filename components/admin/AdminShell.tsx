"use client";
import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminAuthRow from "@/components/admin/AdminAuthRow"
import {
  Users,
  Home,
  Calendar,
  FileText,
  Image as ImageIcon,
  Settings,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react"

interface AdminShellProps {
  children: React.ReactNode;
  hasEnvVars?: boolean;
}

export default function AdminShell({
  children,
  hasEnvVars = false,
}: AdminShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Off-canvas sidebar for mobile, static for md+ */}
      <aside
        className={
          `fixed inset-y-0 left-0 z-50 w-64 bg-muted/30 pl-8 pt-8 transform transition-transform duration-200 ` +
          (open ? "translate-x-0" : "-translate-x-full") +
          " md:static md:translate-x-0"
        }
        aria-hidden={!open}
      >
        <div className="pl-4 pb-8 border-b">
          <h2 className="text-3xl font-bold text-primary">Admin</h2>
        </div>

        <div className="mb-8 pl-4 space-y-4">
          <AdminAuthRow hasEnvVars={!!hasEnvVars} />
        </div>

        <nav className="p-4 space-y-2">
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
          <NavLink href="/" icon={<ArrowLeft className="h-4 w-4" aria-hidden />}>
            Retour au site
          </NavLink>
        </nav>
      </aside>

      {/* Backdrop for mobile when open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1">
        {/* Mobile header */}
        <div className="md:hidden border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">Admin</h2>

          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Content */}
        <div className="p-20">{children}</div>
      </div>
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
