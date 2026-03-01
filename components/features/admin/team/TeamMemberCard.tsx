"use client";
import Image from "next/image";
import type { TeamMemberCardProps } from "./types";
import { DEFAULT_TEAM_MEMBER_AVATAR } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export function TeamMemberCard({
  member,
  onEdit,
  onDeactivate,
  onRequestReactivate,
  onHardDelete,
}: TeamMemberCardProps) {
  const imgSrc = member.image_url || DEFAULT_TEAM_MEMBER_AVATAR;

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

        <div className="mt-4 flex flex-col md:flex-row gap-2">
          {!member.active && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onHardDelete}
              title="Supprimer"
              className="w-full sm:w-auto justify-center"
            >
              <Trash2 className="h-4 w-4 sm:mr-0" />
              <span className="sm:hidden ml-2">Supprimer</span>
            </Button>
          )}

          {member.active ? (
            <Button
              variant="destructive"
              onClick={onDeactivate}
              className="w-full sm:w-auto"
            >
              Désactiver
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onRequestReactivate}
              className="w-full sm:w-auto"
            >
              Réactiver
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onEdit}
            className="w-full sm:w-auto"
          >
            Modifier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
