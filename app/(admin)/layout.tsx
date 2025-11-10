import { requireAdmin } from "@/lib/auth/is-admin";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import "../globals.css";
import AdminShell from "@/components/admin/AdminShell";
import { hasEnvVars } from "@/lib/utils";

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
    <AdminShell hasEnvVars={!!hasEnvVars}>
      {children}
    </AdminShell>
  );
}
