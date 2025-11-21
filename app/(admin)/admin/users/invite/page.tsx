import { Metadata } from "next";
import { InviteUserForm } from "@/components/features/admin/users/InviteUserForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inviter un utilisateur",
  description: "Envoyer une invitation pour créer un compte",
};

export default function InviteUserPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Inviter un utilisateur
        </h2>
      </div>

      <div className="max-w-2xl">
        <InviteUserForm />
      </div>
    </div>
  );
}
