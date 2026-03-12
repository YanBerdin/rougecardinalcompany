"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Home,
  Calendar,
  FileText,
  Image as ImageIcon,
  UserCog,
  Settings,
  Search,
  LayoutDashboard,
  Bug,
  ToggleLeft,
  ScrollText,
  BarChart3,
  Handshake,
  MapPin,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import AdminAuthRow from "@/components/admin/AdminAuthRow";
import { isRoleAtLeast } from "@/lib/auth/role-helpers";
import type { AppRole } from "@/lib/auth/role-helpers";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole: AppRole;
}

const generalItems: SidebarItem[] = [
  {
    title: "Tableau de bord",
    href: "/admin",
    icon: LayoutDashboard,
    minRole: "editor",
  },
  {
    title: "Équipe",
    href: "/admin/team",
    icon: Users,
    minRole: "admin",
  },
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: UserCog,
    minRole: "admin",
  },
];

const contentItems: SidebarItem[] = [
  {
    title: "Spectacles",
    href: "/admin/spectacles",
    icon: FileText,
    minRole: "editor",
  },
  {
    title: "Agenda",
    href: "/admin/agenda",
    icon: Calendar,
    minRole: "editor",
  },
  {
    title: "Lieux",
    href: "/admin/lieux",
    icon: MapPin,
    minRole: "editor",
  },
  {
    title: "Presse",
    href: "/admin/presse",
    icon: FileText,
    minRole: "editor",
  },
  {
    title: "Compagnie",
    href: "/admin/compagnie",
    icon: Building2,
    minRole: "editor",
  },
  {
    title: "Médiathèque",
    href: "/admin/media",
    icon: ImageIcon,
    minRole: "editor",
  },
];

const homepageItems: SidebarItem[] = [
  {
    title: "Accueil - Slides",
    href: "/admin/home/hero",
    icon: ImageIcon,
    minRole: "admin",
  },
  {
    title: "Accueil - La compagnie",
    href: "/admin/home/about",
    icon: FileText,
    minRole: "admin",
  },
  {
    title: "Partenaires",
    href: "/admin/partners",
    icon: Handshake,
    minRole: "admin",
  },
];

const otherItems: SidebarItem[] = [
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    minRole: "admin",
  },
  {
    title: "Affichage Sections",
    href: "/admin/site-config",
    icon: ToggleLeft,
    minRole: "admin",
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ScrollText,
    minRole: "admin",
  },
  {
    title: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
    minRole: "admin",
  },
  {
    title: "Debug Auth",
    href: "/admin/debug-auth",
    icon: Bug,
    minRole: "admin",
  },
  {
    title: "Retour au site publique",
    href: "/",
    icon: Home,
    minRole: "editor",
  },
];

interface AppSidebarProps {
  userRole: AppRole;
}

// https://ui.shadcn.com/docs/components/sidebar
export default function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();

  const filterByRole = (items: SidebarItem[]) =>
    items.filter((item) => isRoleAtLeast(userRole, item.minRole));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold whitespace-nowrap">RC</span>
              </div>
              <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">Rouge Cardinal</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            </div>
          </SidebarMenuItem>
          {/* SearchBar */}
          <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
            <div className="relative px-2">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Rechercher..."
                className="h-8 pl-8"
                type="search"
                aria-label="Rechercher dans la navigation"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Général</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterByRole(generalItems).map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href} title={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterByRole(contentItems).map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href} title={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filterByRole(homepageItems).length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Accueil</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterByRole(homepageItems).map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href} title={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Autres</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterByRole(otherItems).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href} title={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem title="Authentification">
            <AdminAuthRow />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
