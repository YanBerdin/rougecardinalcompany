"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteHeroSlideAction } from "@/app/(admin)/admin/home/hero/home-hero-actions";

interface SlideToDelete {
  id: number;
  title: string;
}

interface UseHeroSlidesDeleteReturn {
  isDeleteDialogOpen: boolean;
  slideToDelete: SlideToDelete | null;
  isDeletePending: boolean;
  openDeleteDialog: (id: number, title: string) => void;
  closeDeleteDialog: () => void;
  confirmDelete: () => Promise<void>;
}

export function useHeroSlidesDelete(): UseHeroSlidesDeleteReturn {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<SlideToDelete | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const openDeleteDialog = useCallback((id: number, title: string) => {
    setSlideToDelete({ id, title });
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!slideToDelete) return;

    setIsDeletePending(true);
    setIsDeleteDialogOpen(false);

    try {
      const result = await deleteHeroSlideAction(String(slideToDelete.id));
      if (!result.success) {
        throw new Error(result.error ?? "Delete failed");
      }

      toast.success("Slide deleted successfully");
      router.refresh();
    } catch {
      toast.error("Failed to delete slide");
    } finally {
      setIsDeletePending(false);
      setSlideToDelete(null);
    }
  }, [slideToDelete, router]);

  return {
    isDeleteDialogOpen,
    slideToDelete,
    isDeletePending,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  };
}
