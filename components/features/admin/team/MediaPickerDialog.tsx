"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (mediaId: number) => void;
}

export function MediaPickerDialog({ open, onClose, onSelect }: Props) {
  const [uploading, setUploading] = useState(false);

  // Placeholder: in real implementation
  // TODO: integrate Media Library component
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sélectionner une image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Composant Media Library non trouvé. Ceci est un placeholder.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setUploading(true);
                setTimeout(() => {
                  onSelect(Math.floor(Math.random() * 10000));
                  setUploading(false);
                  onClose();
                }, 800);
              }}
            >
              {uploading ? "Téléversement..." : "Simuler sélection"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MediaPickerDialog;
