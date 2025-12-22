"use client";

import dynamic from "next/dynamic";
import type { TeamMemberDb } from "@/lib/schemas/team";

const TeamMemberFormWrapper = dynamic(
  () => import("@/components/features/admin/team/TeamMemberFormWrapper").then(
    (mod) => ({ default: mod.TeamMemberFormWrapper })
  ),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-48 w-full animate-pulse rounded-md bg-muted" />
      </div>
    )
  }
);

interface TeamMemberFormClientProps {
  member: TeamMemberDb | null;
}

export function TeamMemberFormClient({ member }: TeamMemberFormClientProps) {
  return <TeamMemberFormWrapper member={member} />;
}
