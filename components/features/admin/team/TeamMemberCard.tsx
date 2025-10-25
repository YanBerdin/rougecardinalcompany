"use client";
import Image from "next/image";
import { TeamMemberDb } from "@/lib/schemas/team";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  member: TeamMemberDb;
  onEdit?: () => void;
  onDesactivate?: () => void;
  onRequestReactivate?: () => void;
  onHardDelete?: () => void;
}

export function TeamMemberCard({
  member,
  onEdit,
  onDesactivate,
  onRequestReactivate,
  onHardDelete,
}: Props) {
  const imgSrc = member.image_url || "/logo-florian.png";

  return (
    <Card
      className={`shadow-sm ${member.active ? "" : "ring-2 ring-yellow-300 bg-yellow-50/40"}`}
    >
      <CardHeader>
        <CardTitle>{member.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 relative rounded-full overflow-hidden bg-muted">
            <Image src={imgSrc} alt={member.name} fill sizes="80px" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {member.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{member.role}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            Modifier
          </Button>
          {member.active ? (
            <Button variant="destructive" onClick={onDesactivate}>
              Désactiver
            </Button>
          ) : (
            <Button variant="ghost" onClick={onRequestReactivate}>
              Réactiver
            </Button>
          )}
          {!member.active && (
            <Button
              variant="destructive"
              onClick={onHardDelete}
              title="Supprimer définitivement"
            >
              Supprimer définitivement
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TeamMemberCard;
