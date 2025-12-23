"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TeamMemberForm } from "./TeamMemberForm";
import {
  createTeamMember,
  updateTeamMember,
} from "@/app/(admin)/admin/team/actions";
import type { TeamMemberDb, TeamMemberFormValues } from "@/lib/schemas/team";

interface TeamMemberFormWrapperProps {
  member: TeamMemberDb | null;
}

export function TeamMemberFormWrapper({ member }: TeamMemberFormWrapperProps) {
  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: TeamMemberFormValues) => {
      try {
        // Clean empty strings to null for database constraints
        const cleanedData = {
          ...data,
          image_url: data.image_url === "" ? null : data.image_url,
          role: data.role === "" ? null : data.role,
          description: data.description === "" ? null : data.description,
        };

        const result = member
          ? await updateTeamMember(member.id, cleanedData)
          : await createTeamMember(cleanedData);

        if (!result.success) {
          toast.error(result.error || "Une erreur est survenue");
          return;
        }

        toast.success(member ? "Membre mis à jour" : "Membre créé avec succès");
        router.push("/admin/team");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue"
        );
      }
    },
    [member, router]
  );

  const handleCancel = useCallback(() => {
    router.push("/admin/team");
  }, [router]);

  return (
    <TeamMemberForm
      member={member}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
