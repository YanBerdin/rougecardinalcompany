# Plan d'implémentation - Prévention des doublons d'images

## Objectif

Empêcher les doublons d'images lors de l'upload en utilisant un hash SHA-256.

## Options choisies

1. ✅ Afficher un message "Image déjà présente" (réutilisation automatique)
2. ✅ Option A : Laisser null les hashs des médias existants
3. ✅ Indicateur de progression pour gros fichiers

---

## Étape 1 : Migration SQL

**Créer** `supabase/migrations/20251222120000_add_media_file_hash.sql` :

```sql
-- Migration: Add file_hash column for duplicate detection
-- Date: 2025-12-22
-- Purpose: Prevent duplicate media uploads using SHA-256 hash

alter table public.medias 
add column if not exists file_hash char(64);

comment on column public.medias.file_hash is 'SHA-256 hash for duplicate detection (64 hex chars)';

create unique index if not exists idx_medias_file_hash_unique 
on public.medias (file_hash) 
where file_hash is not null;
```

---

## Étape 2 : Mettre à jour le schéma déclaratif

**Modifier** `supabase/schemas/03_table_medias.sql` :

```sql
-- Table medias - Gestion des médias/fichiers
-- Ordre: 03 - Table de base sans dépendances

drop table if exists public.medias cascade;
create table public.medias (
  id bigint generated always as identity primary key,
  storage_path text not null,
  filename text,
  mime text,
  size_bytes bigint,
  alt_text text,
  file_hash char(64),  -- SHA-256 hash for duplicate detection
  metadata jsonb default '{}'::jsonb,
  uploaded_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.medias is 'media storage metadata (paths, filenames, mime, size)';
comment on column public.medias.storage_path is 'storage provider path (bucket/key)';
comment on column public.medias.file_hash is 'SHA-256 hash for duplicate detection (64 hex chars)';

-- Unique index for duplicate prevention (partial - null allowed for legacy)
create unique index if not exists idx_medias_file_hash_unique 
on public.medias (file_hash) 
where file_hash is not null;
```

---

## Étape 3 : Utilitaire de hash côté client

**Créer** `lib/utils/file-hash.ts` :

```typescript
/**
 * @file File Hash Utilities
 * @description SHA-256 hash computation for duplicate detection
 */

export interface HashProgress {
  loaded: number;
  total: number;
  percent: number;
}

export type ProgressCallback = (progress: HashProgress) => void;

/**
 * Compute SHA-256 hash of a file with progress tracking
 * 
 * @param file - File to hash
 * @param onProgress - Optional callback for progress updates (for large files)
 * @returns SHA-256 hash as 64-character hex string
 */
export async function computeFileHash(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks for progress
  const fileSize = file.size;
  
  // Small files: hash directly (faster)
  if (fileSize <= CHUNK_SIZE) {
    const buffer = await file.arrayBuffer();
    return hashArrayBuffer(buffer);
  }

  // Large files: read in chunks with progress
  const chunks: ArrayBuffer[] = [];
  let offset = 0;

  while (offset < fileSize) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const buffer = await chunk.arrayBuffer();
    chunks.push(buffer);
    offset += CHUNK_SIZE;

    if (onProgress) {
      onProgress({
        loaded: Math.min(offset, fileSize),
        total: fileSize,
        percent: Math.round((Math.min(offset, fileSize) / fileSize) * 100),
      });
    }
  }

  // Combine chunks and hash
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let position = 0;
  
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), position);
    position += chunk.byteLength;
  }

  return hashArrayBuffer(combined.buffer);
}

async function hashArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate a SHA-256 hash string format
 */
export function isValidFileHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}
```

---

## Étape 4 : Modifier le DAL

**Modifier** `lib/dal/media.ts` — Ajouter `fileHash` et `findMediaByHash()` :

```typescript
// Ajouter fileHash au type d'input
export interface MediaUploadInput {
  file: File;
  folder: string;
  uploadedBy: string | undefined;
  fileHash?: string;  // Optional for backward compatibility
}

// Nouvelle fonction: recherche par hash
export async function findMediaByHash(
  fileHash: string
): Promise<DALResult<MediaRecord | null>> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("medias")
    .select("id, storage_path, filename, mime, size_bytes")
    .eq("file_hash", fileHash)
    .maybeSingle();

  if (error) {
    console.error("[DAL] findMediaByHash error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// Modifier createMediaRecord pour inclure file_hash
async function createMediaRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: MediaUploadInput,
  storagePath: string
): Promise<DALResult<number>> {
  const { data, error } = await supabase
    .from("medias")
    .insert({
      storage_path: storagePath,
      filename: input.file.name,
      mime: input.file.type,
      size_bytes: input.file.size,
      file_hash: input.fileHash ?? null,  // Store hash if provided
      uploaded_by: input.uploadedBy,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[DAL] Database insert error:", error);
    return { success: false, error: "Database record creation failed" };
  }

  return { success: true, data: data.id };
}

// Ajouter helper pour récupérer l'URL publique (exposé pour Server Action)
export async function getMediaPublicUrl(storagePath: string): Promise<string> {
  const supabase = await createClient();
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);
  return publicUrl;
}
```

---

## Étape 5 : Modifier le Server Action

**Modifier** `lib/actions/media-actions.ts` :

```typescript
import { uploadMedia, deleteMedia, findMediaByHash, getMediaPublicUrl } from "@/lib/dal/media";

// Étendre le type de résultat pour indiquer un doublon
export interface MediaUploadResultData {
  mediaId: number;
  publicUrl: string;
  storagePath: string;
  isDuplicate?: boolean;  // True si fichier existait déjà
}

export type MediaUploadResult = 
  | { success: true; data: MediaUploadResultData }
  | { success: false; error: string };

export async function uploadMediaImage(
  formData: FormData,
  folder: string = BUCKET_NAME
): Promise<MediaUploadResult> {
  try {
    // 1. Validation fichier
    const validation = validateFile(formData);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    // 2. Récupérer le hash (envoyé par le client)
    const fileHash = formData.get("fileHash");
    const validHash = typeof fileHash === "string" && fileHash.length === 64 
      ? fileHash 
      : undefined;

    // 3. Anti-doublon : vérifier si le fichier existe déjà
    if (validHash) {
      const existingMedia = await findMediaByHash(validHash);
      
      if (existingMedia.success && existingMedia.data) {
        // Fichier déjà présent → retourner l'existant
        const publicUrl = await getMediaPublicUrl(existingMedia.data.storage_path);
        
        return {
          success: true,
          data: {
            mediaId: existingMedia.data.id,
            publicUrl,
            storagePath: existingMedia.data.storage_path,
            isDuplicate: true,
          },
        };
      }
    }

    // 4. Pas de doublon → upload normal
    const uploadedBy = await getCurrentUserId();
    const result = await uploadMedia({
      file: validation.file,
      folder,
      uploadedBy,
      fileHash: validHash,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // 5. Revalidation
    revalidatePath("/admin/medias");
    revalidatePath("/admin/team");
    revalidatePath("/admin/spectacles");

    return { 
      success: true, 
      data: { ...result.data, isDuplicate: false } 
    };
  } catch (error) {
    console.error("[uploadMediaImage] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
```

---

## Étape 6 : Modifier le composant MediaUploadDialog

**Modifier** `components/features/admin/media/MediaUploadDialog.tsx` :

```typescript
"use client";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { uploadMediaImage } from "@/lib/actions";
import type { MediaUploadResult } from "@/lib/actions";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import type { MediaUploadDialogProps } from "./types";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  isAllowedImageMimeType,
} from "./types";
import { computeFileHash, type HashProgress } from "@/lib/utils/file-hash";

type UploadPhase = "idle" | "hashing" | "uploading";

export function MediaUploadDialog({
  open,
  onClose,
  onSelect,
  uploadFolder = "team",
  uploadAction,
}: MediaUploadDialogProps & {
  uploadFolder?: string;
  uploadAction?: (formData: FormData) => Promise<MediaUploadResult>;
}) {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [hashProgress, setHashProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const performUpload = uploadAction || ((formData: FormData) => uploadMediaImage(formData, uploadFolder));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      toast.error("Fichier trop volumineux", {
        description: "L'image ne doit pas dépasser 5MB",
      });
      return;
    }

    if (!isAllowedImageMimeType(file.type)) {
      toast.error("Format non supporté", {
        description: "Formats acceptés : JPEG, PNG, WebP, AVIF",
      });
      return;
    }

    setSelectedFile(file);
    setHashProgress(0);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Aucun fichier sélectionné");
      return;
    }

    try {
      // Phase 1: Calcul du hash avec progression
      setPhase("hashing");
      setHashProgress(0);

      const fileHash = await computeFileHash(selectedFile, (progress: HashProgress) => {
        setHashProgress(progress.percent);
      });

      // Phase 2: Upload
      setPhase("uploading");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileHash", fileHash);

      const result = await performUpload(formData);

      if (result.success) {
        // Vérifier si c'est un doublon
        if (result.data.isDuplicate) {
          toast.info("Image déjà présente", {
            description: "Cette image existe déjà dans la médiathèque. Elle a été réutilisée.",
            icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
          });
        } else {
          toast.success("Image téléversée", {
            description: "L'image a été uploadée avec succès",
          });
        }

        onSelect({
          id: result.data.mediaId,
          url: result.data.publicUrl,
        });
        handleClose();
      } else {
        toast.error("Erreur de téléversement", {
          description: result.error || "Une erreur est survenue",
        });
      }
    } catch (error) {
      console.error("[MediaUploadDialog] Upload error:", error);
      toast.error("Erreur", {
        description: "Impossible de téléverser l'image",
      });
    } finally {
      setPhase("idle");
      setHashProgress(0);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    setPhase("idle");
    setHashProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const isProcessing = phase !== "idle";
  const acceptFormats = ALLOWED_IMAGE_MIME_TYPES.join(",");

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Téléverser une image</DialogTitle>
          <DialogDescription>
            Formats acceptés : JPEG, PNG, WebP, AVIF (max 5MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="media-upload">Sélectionner une image</Label>
            <Input
              id="media-upload"
              ref={fileInputRef}
              type="file"
              accept={acceptFormats}
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </div>

          {preview && (
            <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Progress indicator for large files */}
          {phase === "hashing" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Vérification du fichier... {hashProgress}%
              </p>
              <Progress value={hashProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
            >
              {phase === "hashing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : phase === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Téléversement...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Téléverser
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MediaUploadDialog;
```

---

## Résumé des fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `supabase/migrations/20251222120000_add_media_file_hash.sql` | **CRÉER** |
| `supabase/schemas/03_table_medias.sql` | **MODIFIER** (ajouter `file_hash`) |
| `lib/utils/file-hash.ts` | **CRÉER** |
| `lib/dal/media.ts` | **MODIFIER** (ajouter `findMediaByHash`, `getMediaPublicUrl`, `fileHash` param) |
| `lib/actions/media-actions.ts` | **MODIFIER** (logique anti-doublon + `isDuplicate` flag) |
| `components/features/admin/media/MediaUploadDialog.tsx` | **MODIFIER** (hash + progress + message doublon) |

---

## Checklist d'implémentation

- [ ] Créer migration SQL `20251222120000_add_media_file_hash.sql`
- [ ] Mettre à jour schéma déclaratif `03_table_medias.sql`
- [ ] Créer utilitaire `lib/utils/file-hash.ts`
- [ ] Modifier DAL `lib/dal/media.ts` (findMediaByHash + getMediaPublicUrl + fileHash param)
- [ ] Modifier Server Action `lib/actions/media-actions.ts` (anti-doublon + isDuplicate)
- [ ] Modifier composant `MediaUploadDialog.tsx` (hash + progress + toast doublon)
- [ ] Exécuter migration `pnpm dlx supabase db push`
- [ ] Tester upload fichier nouveau → upload normal
- [ ] Tester upload fichier existant → "Image déjà présente"
- [ ] Tester gros fichier (>2MB) → progression visible
- [ ] Valider TypeScript : `pnpm tsc --noEmit`
