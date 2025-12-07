"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function TeamPageToasts() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const deleted = searchParams.get("deleted");
        const error = searchParams.get("error");

        if (deleted === "true") {
            toast.info("Membre introuvable", {
                description: "Ce membre a été supprimé ou n'existe plus.",
            });
            router.replace("/admin/team", { scroll: false });
        }

        if (error === "invalid_id") {
            toast.error("ID invalide", {
                description: "L'identifiant du membre est invalide.",
            });
            router.replace("/admin/team", { scroll: false });
        }
    }, [searchParams, router]);

    return null;
}
