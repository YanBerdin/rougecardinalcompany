"use client";
import { useState } from "react";
import type {
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
  TeamMemberDb,
} from "@/lib/schemas/team";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog } from "./MediaPickerDialog";
import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";

interface Props {
  member?: TeamMemberDb | null;
  onSubmit: (
    data: CreateTeamMemberInput | UpdateTeamMemberInput
  ) => Promise<void>;
  onCancel?: () => void;
}

export function TeamMemberForm({ member, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [description, setDescription] = useState(member?.description ?? "");
  const [imageUrl, setImageUrl] = useState(member?.image_url ?? "");
  const [photoMediaId, setPhotoMediaId] = useState<number | null>(
    member?.photo_media_id ?? null
  );
  const [loading, setLoading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        role: role || null,
        description: description || null,
        image_url: imageUrl || null,
        photo_media_id: photoMediaId,
      });
    } finally {
      setLoading(false);
    }
  }

  const handlePhotoSelect = (mediaId: number, publicUrl: string) => {
    setPhotoMediaId(mediaId);
    setImageUrl(publicUrl);
  };

  const currentPhotoUrl = imageUrl || (member?.image_url ?? null);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rôle</label>
          <Input
            value={role ?? ""}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex: Acteur, Metteur en scène..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Biographie, parcours..."
            rows={4}
          />
        </div>

        {/* Photo section */}
        <div>
          <label className="block text-sm font-medium mb-2">Photo</label>

          {currentPhotoUrl ? (
            <div className="space-y-2">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                <Image
                  src={currentPhotoUrl}
                  alt={name || "Photo du membre"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMediaPicker(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Changer
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setImageUrl("");
                    setPhotoMediaId(null);
                  }}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMediaPicker(true)}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Ajouter une photo
            </Button>
          )}
        </div>

        {/* URL externe (fallback) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            URL externe (optionnel)
          </label>
          <Input
            value={imageUrl ?? ""}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Utilisé si aucune photo n&apos;est téléversée
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline-primary" type="button" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>

      <MediaPickerDialog
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handlePhotoSelect}
      />
    </>
  );
}

export default TeamMemberForm;
