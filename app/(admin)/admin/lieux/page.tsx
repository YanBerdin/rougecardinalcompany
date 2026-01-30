import { LieuxContainer } from "@/components/features/admin/lieux/LieuxContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lieux | Admin",
};

// ✅ OBLIGATOIRE : Force le re-fetch à chaque visite
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LieuxPage() {
    return <LieuxContainer />;
}
