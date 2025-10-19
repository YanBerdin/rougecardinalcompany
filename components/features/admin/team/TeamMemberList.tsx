"use client";
import { TeamMemberDb } from "@/lib/schemas/team";
import TeamMemberCard from "./TeamMemberCard";

interface Props {
  members: TeamMemberDb[];
  onEditMember?: (id: number) => void;
  onDeactivateMember?: (id: number) => void;
  onReactivateMember?: (id: number) => void;
  onHardDeleteMember?: (id: number) => void;
}

export function TeamMemberList({
  members,
  onEditMember,
  onDeactivateMember,
  onReactivateMember,
  onHardDeleteMember,
}: Props) {
  if (!members || members.length === 0) return <div>Aucun membre</div>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <TeamMemberCard
          key={m.id}
          member={m}
          onEdit={() => onEditMember?.(m.id)}
          onDesactivate={() => onDeactivateMember?.(m.id)}
          onRequestReactivate={() => onReactivateMember?.(m.id)}
          onHardDelete={() => onHardDeleteMember?.(m.id)}
        />
      ))}
    </div>
  );
}

export default TeamMemberList;
