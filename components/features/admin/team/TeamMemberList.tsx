"use client";
import type { TeamMemberListProps } from "./types";
import { TeamMemberCard } from "./TeamMemberCard";

export function TeamMemberList({
  members,
  onEditMember,
  onDeactivateMember,
  onReactivateMember,
  onHardDeleteMember,
}: TeamMemberListProps) {
  if (!members || members.length === 0) {
    return (
      <div className="py-8 sm:py-12 text-center text-muted-foreground border rounded-lg bg-card">
        <p className="text-base sm:text-lg font-medium">Aucun membre trouvé</p>
        <p className="text-xs sm:text-sm mt-2">
          Ajoutez votre premier membre d&apos;équipe pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <TeamMemberCard
          key={m.id}
          member={m}
          onEdit={() => onEditMember?.(m.id)}
          onDeactivate={() => onDeactivateMember?.(m.id)}
          onRequestReactivate={() => onReactivateMember?.(m.id)}
          onHardDelete={() => onHardDeleteMember?.(m.id)}
        />
      ))}
    </div>
  );
}
